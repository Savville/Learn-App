#!/usr/bin/env python3
"""
generate_subscribers.py
-----------------------
Reads ACES, Hult Prize, and IEEE member CSVs and produces a combined
subscriber list with interest tags that match the LearnOpportunities
backend schema (interests: [{ category, subfields }]).

Interest categories and subfields mirror Newsletter.tsx exactly:
  engineering  : Civil Engineering | Mechanical Eng. | Electrical Eng. |
                 Chemical Eng. | Biomedical Eng. | Structural Eng.
  technology   : Software Dev | Data Science | AI / ML | Cybersecurity |
                 UX / UI Design | Cloud Computing
  economics    : Finance | Entrepreneurship | Trade & Commerce |
                 Banking | Accounting | Supply Chain
  health       : Public Health | Clinical Research | Pharmacy |
                 Nutrition | Global Health | Mental Health
  environment  : Climate Change | Architecture | Built Environment |
                 Geospatial | Food Systems | Renewable Energy | Water Resources
  social       : Law & Policy | Political Science | Int'l Relations |
                 Education | Sociology | Human Rights

Outputs (written next to this script in backend/):
  subscribers_generated.csv        — human-readable review sheet
  subscribers_generated.json       — clean MongoDB-ready array (mongoimport)
  subscribers_generated_full.json  — same + name / source metadata

Usage:
  python generate_subscribers.py

MongoDB bulk import (after review):
  mongoimport --uri "$MONGODB_URI" \\
              --db learn_opportunities --collection subscribers \\
              --file subscribers_generated.json --jsonArray --mode upsert \\
              --upsertFields email
"""

import csv
import json
import re
from datetime import datetime, timezone
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
#  Interest pools
#  Strategy: every person in a group gets FIXED interests merged with one
#  VARIABLE pool assigned round-robin so adjacent people in the same list
#  differ by ~2 subfields — diversity without randomness.
# ─────────────────────────────────────────────────────────────────────────────

# ── ACES  (Civil / Structural / Water focus) ──────────────────────────────────
ACES_FIXED = {
    "engineering": ["Civil Engineering", "Structural Eng."],
    "environment": ["Water Resources"],
}
ACES_VARIABLE_POOLS = [
    # Pool 0
    {"environment": ["Built Environment", "Architecture"]},
    # Pool 1
    {"environment": ["Renewable Energy", "Climate Change"]},
    # Pool 2
    {"engineering": ["Mechanical Eng."],  "environment": ["Geospatial"]},
    # Pool 3
    {"environment": ["Built Environment"], "economics": ["Supply Chain"]},
    # Pool 4
    {"environment": ["Climate Change", "Geospatial"]},
]

# ── IEEE  (Electrical Eng. + Tech / AI-ML / IoT focus) ───────────────────────
IEEE_FIXED = {
    "engineering": ["Electrical Eng."],
    "technology":  ["AI / ML"],
}
# Professionals / staff with @ieee.org emails
IEEE_STAFF_POOL = {
    "technology":  ["Cloud Computing", "Data Science"],
    "economics":   ["Finance"],
}
# Students (non-ieee.org emails) — rotate through 5 pools
IEEE_STUDENT_POOLS = [
    # Pool 0
    {"technology":  ["Data Science", "Software Dev"],  "engineering": ["Mechanical Eng."]},
    # Pool 1
    {"technology":  ["Cloud Computing", "Software Dev"], "engineering": ["Biomedical Eng."]},
    # Pool 2
    {"technology":  ["Cybersecurity", "Data Science"]},
    # Pool 3
    {"technology":  ["Data Science", "UX / UI Design"]},
    # Pool 4
    {"technology":  ["Software Dev"],  "economics": ["Finance"]},
]

# ── Hult Prize  (Entrepreneurial / Tech focus) ────────────────────────────────
HULT_FIXED = {
    "economics": ["Entrepreneurship"],
    "technology": ["Software Dev"],
}
HULT_VARIABLE_POOLS = [
    # Pool 0
    {"technology": ["AI / ML"], "economics": ["Finance"],
     "environment": ["Climate Change"]},
    # Pool 1
    {"technology": ["AI / ML", "Data Science"],
     "economics": ["Trade & Commerce"]},
    # Pool 2
    {"technology": ["Cloud Computing"], "economics": ["Finance"],
     "health": ["Public Health"]},
    # Pool 3
    {"technology": ["AI / ML", "UX / UI Design"],
     "environment": ["Climate Change"]},
    # Pool 4
    {"technology": ["Data Science"],
     "economics": ["Finance", "Trade & Commerce"]},
]


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')


def is_valid_email(raw: str) -> bool:
    # remove all internal whitespace before testing
    return bool(_EMAIL_RE.match(raw.replace(" ", "").strip()))


def clean_email(raw: str) -> str:
    return raw.replace(" ", "").strip().lower()


def merge_interests(fixed: dict, variable: dict) -> list:
    """
    Merge two category→subfields dicts, then return the backend
    interests array: [{ "category": str, "subfields": [str] }]
    Fixed entries are always included; variable entries extend them.
    """
    merged: dict[str, list] = {}
    # Start with all fixed subfields
    for cat, subs in fixed.items():
        merged[cat] = list(subs)
    # Extend with variable subfields (add new cats or append new subfields)
    for cat, subs in variable.items():
        if cat in merged:
            for s in subs:
                if s not in merged[cat]:
                    merged[cat].append(s)
        else:
            merged[cat] = list(subs)
    return [{"category": c, "subfields": s} for c, s in merged.items()]


def make_subscriber(email: str, interests: list, source: str,
                    name: str = "", extra: dict = None) -> dict:
    doc = {
        "name":         name,           # kept for human review; not in API schema
        "source":       source,         # metadata
        "email":        email,
        "categories":   [],
        "allUpdates":   True,
        "interests":    interests,
        "subscribedAt": datetime.now(timezone.utc).isoformat(),
        "unsubscribed": False,
    }
    if extra:
        doc.update(extra)
    return doc


# ─────────────────────────────────────────────────────────────────────────────
#  Readers
# ─────────────────────────────────────────────────────────────────────────────

def read_aces(path: Path) -> list:
    subscribers, seen, skipped = [], set(), []
    pool_idx = 0

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_email = row.get("Email", "")
            name      = row.get("Name", "").strip()
            no        = row.get("NO", "?")

            if not raw_email or not is_valid_email(raw_email):
                skipped.append((no, name, raw_email, "invalid email"))
                continue

            email = clean_email(raw_email)
            if email in seen:
                skipped.append((no, name, email, "duplicate"))
                continue
            seen.add(email)

            var   = ACES_VARIABLE_POOLS[pool_idx % len(ACES_VARIABLE_POOLS)]
            pool_idx += 1
            sub   = make_subscriber(email, merge_interests(ACES_FIXED, var),
                                    "ACES", name)
            subscribers.append(sub)

    _print_summary("ACES", subscribers, skipped)
    return subscribers


def read_hult(path: Path) -> list:
    subscribers, seen, skipped = [], set(), []
    pool_idx = 0

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_email = row.get("Contact Person Email Address", "")
            name      = row.get("Team Leader Name", "").strip()
            idea      = row.get("Idea Title", "").strip()

            if not raw_email or not is_valid_email(raw_email):
                skipped.append((name, raw_email, idea, "invalid email"))
                continue

            email = clean_email(raw_email)
            if email in seen:
                skipped.append((name, email, idea, "duplicate"))
                continue
            seen.add(email)

            var   = HULT_VARIABLE_POOLS[pool_idx % len(HULT_VARIABLE_POOLS)]
            pool_idx += 1
            sub   = make_subscriber(email, merge_interests(HULT_FIXED, var),
                                    "Hult Prize", name, {"team": idea})
            subscribers.append(sub)

    _print_summary("Hult Prize", subscribers, skipped)
    return subscribers


def read_ieee(path: Path) -> list:
    subscribers, seen, skipped = [], set(), []
    student_pool_idx = 0

    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_email = row.get("Email", "")
            first     = row.get("First Name", "").strip()
            last      = row.get("Last Name", "").strip()
            name      = f"{first} {last}".strip()

            if not raw_email or not is_valid_email(raw_email):
                skipped.append((name, raw_email, "invalid email"))
                continue

            email = clean_email(raw_email)
            if email in seen:
                skipped.append((name, email, "duplicate"))
                continue
            seen.add(email)

            if email.endswith("@ieee.org"):
                # Professional / staff member
                interests = merge_interests(IEEE_FIXED, IEEE_STAFF_POOL)
                tag = "IEEE KU (staff)"
            else:
                var = IEEE_STUDENT_POOLS[student_pool_idx % len(IEEE_STUDENT_POOLS)]
                student_pool_idx += 1
                interests = merge_interests(IEEE_FIXED, var)
                tag = "IEEE KU"

            sub = make_subscriber(email, interests, tag, name)
            subscribers.append(sub)

    _print_summary("IEEE KU", subscribers, skipped)
    return subscribers


def _print_summary(label: str, subs: list, skipped: list):
    print(f"\n[{label}]  {len(subs)} valid | {len(skipped)} skipped")
    for s in skipped:
        details = " | ".join(str(x) for x in s)
        print(f"   ⚠  {details}")


# ─────────────────────────────────────────────────────────────────────────────
#  Merge & deduplicate across all three groups
# ─────────────────────────────────────────────────────────────────────────────

def merge_all(*groups) -> list:
    """
    Combine all groups. If the same email appears in multiple groups,
    merge their sources (comma-joined) and union their interests.
    """
    combined: dict[str, dict] = {}

    for sub in (s for group in groups for s in group):
        email = sub["email"]
        if email not in combined:
            combined[email] = sub
        else:
            existing = combined[email]
            # Merge source tags
            existing["source"] = f"{existing['source']} + {sub['source']}"
            # Merge interests
            cats = {i["category"]: i["subfields"] for i in existing["interests"]}
            for block in sub["interests"]:
                cat = block["category"]
                if cat in cats:
                    for sf in block["subfields"]:
                        if sf not in cats[cat]:
                            cats[cat].append(sf)
                else:
                    cats[cat] = block["subfields"]
            existing["interests"] = [{"category": c, "subfields": s}
                                      for c, s in cats.items()]

    return list(combined.values())


# ─────────────────────────────────────────────────────────────────────────────
#  Writers
# ─────────────────────────────────────────────────────────────────────────────

def write_csv(subscribers: list, path: Path):
    fieldnames = ["name", "email", "source", "interests_summary"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for sub in subscribers:
            parts = []
            for block in sub.get("interests", []):
                parts.append(f"{block['category']}: {', '.join(block['subfields'])}")
            w.writerow({
                "name":              sub.get("name", ""),
                "email":             sub["email"],
                "source":            sub.get("source", ""),
                "interests_summary": " | ".join(parts),
            })
    print(f"\n✅  CSV  (review sheet)    → {path.name}")


_SCHEMA_KEEP = {"email", "categories", "allUpdates", "interests",
                "subscribedAt", "unsubscribed"}


def write_json(subscribers: list, path: Path):
    """MongoDB-ready JSON — only fields that belong in the subscribers collection."""
    clean = [{k: v for k, v in s.items() if k in _SCHEMA_KEEP}
             for s in subscribers]
    path.write_text(json.dumps(clean, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"✅  JSON (MongoDB import)  → {path.name}")


def write_full_json(subscribers: list, path: Path):
    """Full JSON including name / source / team for human reference."""
    path.write_text(json.dumps(subscribers, indent=2, ensure_ascii=False),
                    encoding="utf-8")
    print(f"✅  JSON (full metadata)   → {path.name}")


# ─────────────────────────────────────────────────────────────────────────────
#  Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    base = Path(__file__).parent

    aces_path = base / "ACES_Members_Summary.csv"
    hult_path = (base /
                 "Hult Prize Pitching\u2013 Teams Application Form "
                 "(Responses) - Form responses 1.csv")
    ieee_path = base / "IEEE_KU_Members_Full_Emails_Only.csv"

    print("=" * 62)
    print("  LearnOpportunities — Subscriber List Generator")
    print("=" * 62)

    aces = read_aces(aces_path)
    hult = read_hult(hult_path)
    ieee = read_ieee(ieee_path)

    all_subs = merge_all(aces, hult, ieee)

    cross_list = [s for s in all_subs if " + " in s.get("source", "")]
    print(f"\n{'─'*62}")
    print(f"  Total unique subscribers : {len(all_subs)}")
    print(f"  ├─ ACES                  : {len(aces)}")
    print(f"  ├─ Hult Prize            : {len(hult)}")
    print(f"  ├─ IEEE KU               : {len(ieee)}")
    print(f"  └─ Cross-group merges    : {len(cross_list)}")

    if cross_list:
        print("\n  People appearing in multiple groups (interests merged):")
        for s in cross_list:
            print(f"   • {s['name'] or s['email']}  [{s['source']}]")

    write_csv(all_subs,      base / "subscribers_generated.csv")
    write_json(all_subs,     base / "subscribers_generated.json")
    write_full_json(all_subs, base / "subscribers_generated_full.json")

    print(f"\n{'─'*62}")
    print("  Review subscribers_generated.csv first, then bulk-import:")
    print()
    print('  mongoimport --uri "$MONGODB_URI" \\')
    print("    --db learn_opportunities --collection subscribers \\")
    print("    --file subscribers_generated.json --jsonArray \\")
    print("    --mode upsert --upsertFields email")
    print("=" * 62)
