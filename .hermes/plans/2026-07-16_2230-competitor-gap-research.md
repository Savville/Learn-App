# Competitor Gap Research Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Research and document competitive landscape gaps for Opportunities Kenya (opportunitieskenya.live) — a platform curating internships, scholarships, grants, conferences, and calls for papers for Kenya university students.

**Architecture:** Three parallel research agents each focus on a distinct competitor segment. Each agent browses live competitor sites, analyzes features/content, and writes a detailed Markdown report to the `COMPETITOR_RESEARCH/` directory.

**Tech Stack:** Browser-based research, Markdown output, web navigation.

---

## Overview of Competitor Segments

The research is split into three segments to ensure depth:

1. **Segment A — Direct African Student Opportunity Platforms** (sites that aggregate opportunities for students in Africa/Kenya)
2. **Segment B — Global Student Opportunity Platforms** (US/Europe platforms that serve students broadly, many of whom could benefit from Kenya-specific curation)
3. **Segment C — Kenyan University & Government Portals** (official university portals, government scholarship sites, and local job boards)

---

## Task 0: Prepare Research Directories

**Objective:** Create output directories for the three research agents.

**Files:**
- Create: `COMPETITOR_RESEARCH/segment_a_direct_agents.md` (written by Agent A)
- Create: `COMPETITOR_RESEARCH/segment_b_global_agents.md` (written by Agent B)
- Create: `COMPETITOR_RESEARCH/segment_c_local_agents.md` (written by Agent C)
- Create: `COMPETITOR_RESEARCH/summary_comparison.md` (written by Agent C — cross-segment synthesis)

**Steps:**
1. Create directory: `COMPETITOR_RESEARCH/`
2. Each agent writes its segment report as a `.md` file in this directory.
3. Agent C also writes a summary comparison matrix.

---

## Agent A — Direct African Competitors

**Research Targets:**
- scholars4dev.com
- scholarship.com (global but strong African presence)
- allscholarships.org
- goenrollment.com
- studyglobe.com
- brightspotescholarships.com
- michele scholarship sites specific to East Africa

**What to Research (per competitor):**
1. **Site overview** — URL, description, target audience, launch year (if known)
2. **Opportunity categories offered** — internships, scholarships, grants, fellowships, conferences, jobs, calls for papers
3. **Geographic coverage** — Kenya-specific, East Africa, Pan-Africa, Global
4. **Feature set** — search, filters, email alerts, mobile app, user accounts, bookmarks, deadline reminders, application tracking
5. **Monetization model** — free, freemium, ads, paid listings, commission
6. **Content freshness** — last updated opportunities, volume of listings
7. **User experience** — mobile responsiveness, accessibility, design quality
8. **API/automation** — do they offer programmatic access, RSS feeds, partner integrations?

**Output file:** `COMPETITOR_RESEARCH/segment_a_direct_agents.md`

**Format:**
```markdown
# Segment A: Direct African Opportunity Platforms — Competitive Analysis

## 1. [Competitor Name]
- **URL:** https://...
- **Description:** ...
- **Target Audience:** ...
- **Launch Year:** ...
- **Categories Offered:** ...
- **Geographic Coverage:** ...
- **Features:**
  - Search: Yes/No
  - Filters: ...
  - Email Alerts: Yes/No
  - Mobile App: Yes/No
  - User Accounts: Yes/No
  - Bookmarks/Saves: Yes/No
  - Deadline Reminders: Yes/No
  - Application Tracking: Yes/No
- **Monetization:** ...
- **Content Volume:** ...
- **Content Freshness:** ...
- **UX Quality:** ...
- **Strengths:**
- **Weaknesses:**
- **Gaps vs Opportunities Kenya:**

## 2. [Next Competitor]
...

## Cross-Competitor Gap Analysis
### What Everyone Does Well
### What Nobody Does Well (Opportunities Kenya Can Win)
### Feature Gaps (missing from ALL competitors)
### Content Gaps (missing from ALL competitors)
### UX Gaps (missing from ALL competitors)
```

---

## Agent B — Global Opportunity Platforms

**Research Targets:**
- idealist.org (nonprofit/internship focus, US/global)
- handshake.com (college career platform)
- prosple.com (global internships)
- pathways.org (formerly Pathways to Paid Employment)
- internsglobal.com
- studentbeans.com/opportunities
- chegg.com/internships
- glassdoor.com/jobs/internship
- linkedin.com/jobs (student section)
- europeana.eu (European opportunities)

**What to Research (per competitor):**
1. Same dimensions as Agent A
2. **Bonus:** How well do they serve African/Kenyan students specifically?
3. **Bonus:** Do they have geo-fencing or regional filtering?
4. **Bonus:** What's their approach to verifying opportunity legitimacy?
5. **Bonus:** Do they offer career development resources beyond listing opportunities?

**Output file:** `COMPETITOR_RESEARCH/segment_b_global_agents.md`

**Format:**
```markdown
# Segment B: Global Opportunity Platforms — Competitive Analysis

## 1. [Competitor Name]
- **URL:** https://...
- **Description:** ...
- **Target Audience:** ...
- **Categories Offered:** ...
- **Kenya/Africa Coverage:** ...
- **Geo-filtering:** ...
- **Verification Process:** ...
- **Career Development Resources:** ...
- **Features:** (same table as Agent A)
- **Monetization:** ...
- **Content Volume:** ...
- **UX Quality:** ...
- **Strengths:**
- **Weaknesses for Kenyan Students:**
- **Gaps vs Opportunities Kenya:**

## 2. [Next Competitor]
...

## Cross-Competitor Gap Analysis
### What Global Platforms Get Wrong for African Students
### Feature Gaps Unique to Global Platforms
### Localization Gaps (language, currency, cultural fit)
### Verification Gaps (scam prevalence, legitimacy checks)
```

---

## Agent C — Kenyan & Local Platforms + Synthesis

**Research Targets:**
- Higher Education Loans Board (HELB) — helb.co.ke
- Kenya Universities & Employers Connect (KUEC)
- Faida Plus — faidaplus.com
- Brighter Monday Kenya — brightermoney.co.ke
- Fuzu Kenya — fuzu.com
- MyJobMag Kenya — myjobmag.com/kenya
- Jobweb Kenya — jobwebkenya.com
- University of Nairobi Careers Portal
- Strathmore University Careers
- JKIA (Juja) Careers
- Twaweza East Africa — twaweza.org
- Youth Enterprise Fund Kenya — youthfund.or.ke
- Uwezo Fund Kenya — uwezofund.or.ke

**What to Research (per competitor):**
1. Same dimensions as Agent A
2. **Bonus:** Do they cover academic opportunities (conferences, calls for papers)?
3. **Bonus:** Do they have a microgig/platform model (like Opportunities Kenya's escrow)?
4. **Bonus:** How do they handle community engagement?
5. **Bonus:** What's their social media presence like?

**Output file:** `COMPETITOR_RESEARCH/segment_c_local_agents.md`

**Format:**
```markdown
# Segment C: Kenyan & Local Platforms — Competitive Analysis

## 1. [Competitor Name]
- **URL:** https://...
- **Description:** ...
- **Target Audience:** ...
- **Categories Offered:** ...
- **Academic Opportunities Coverage:** ...
- **Microgig/Platform Model:** ...
- **Community Engagement:** ...
- **Social Media Presence:** ...
- **Features:** (same table as Agent A)
- **Monetization:** ...
- **Content Volume:** ...
- **UX Quality:** ...
- **Strengths:**
- **Weaknesses:**
- **Gaps vs Opportunities Kenya:**

## 2. [Next Competitor]
...

## Cross-Competitor Gap Analysis
### What Local Kenyan Platforms Miss
### Academic Opportunity Gaps (conferences, CfP, research grants)
### Community & Engagement Gaps
### Platform Model Gaps (escrow, microgigs)
```

---

## Agent C Bonus: Cross-Segment Synthesis

**After completing the local competitor research, Agent C writes a final synthesis file.**

**Output file:** `COMPETITOR_RESEARCH/summary_comparison.md`

**Format:**
```markdown
# Opportunities Kenya — Competitive Landscape Summary

## Market Position Map
| Platform Type | Key Players | Opportunities Kenya Differentiator |
|---|---|---|
| Direct African | ... | Kenya-university-specific curation |
| Global | ... | Localized, verified, student-first |
| Local Kenyan | ... | Escrow microgig platform + academic focus |

## Top 10 Feature Gaps Across All Competitors
1. [Gap] — Why it matters for Kenyan students
2. [Gap] — ...
...

## Top 10 Content Gaps Across All Competitors
1. [Gap] — ...
2. [Gap] — ...
...

## Recommended Priorities for Opportunities Kenya
### Must-Have (differentiates from everyone)
### Nice-to-Have (beats some competitors)
### Moonshot (no one offers this — first mover)

## SWOT Analysis
### Strengths
### Weaknesses
### Opportunities
### Threats

## Actionable Recommendations
1. [Specific recommendation with rationale]
2. [Specific recommendation with rationale]
...
```

---

## Shared Research Methodology (All Agents)

### Step 1: Site Discovery
- Navigate to each competitor's homepage
- Note the tagline, value proposition, and hero messaging
- Identify opportunity categories prominently displayed

### Step 2: Feature Analysis
- Check for: search, filters, categories, user accounts, bookmarks
- Check for: email alerts, push notifications, deadline reminders
- Check for: mobile app availability
- Check for: social sharing, referral programs
- Check for: API access, RSS feeds, partner integrations

### Step 3: Content Audit
- Browse 3-5 recent listings per category
- Note: Are listings fresh? (date posted, deadline proximity)
- Note: Are descriptions detailed or sparse?
- Note: Is there verification/badge system?
- Note: Geographic diversity of opportunities

### Step 4: UX Assessment
- Is the site mobile-responsive?
- Loading speed (approximate)
- Visual design quality
- Navigation clarity
- Accessibility considerations

### Step 5: Business Model
- Free, freemium, paid?
- Revenue sources (ads, paid listings, commissions, subscriptions)
- Target customers (students, employers, institutions)

### Step 6: Gap Identification
- For each competitor, identify what they're missing that Opportunities Kenya offers
- Note features/content that NO competitor has (blue ocean opportunities)

---

## Output Specifications

Each agent writes:
1. **One segment report** (Markdown file in `COMPETITOR_RESEARCH/`)
2. **Agent C additionally writes** a cross-segment summary (`COMPETITOR_RESEARCH/summary_comparison.md`)
3. **All reports must include:**
   - At least 5-8 competitors analyzed per segment
   - Structured data in tables where possible
   - Specific, actionable gap identification
   - Screenshots or references to specific pages visited (optional but helpful)
   - Timestamp of research (date completed)

---

## Verification Steps

After all agents complete:
1. Confirm all 4 files exist in `COMPETITOR_RESEARCH/`
2. Each file should be at least 2000 words
3. Each competitor section should have structured data (not just prose)
4. Gap analysis sections should list specific, numbered gaps
5. Summary should include a cross-segment comparison table

---

## Risks & Tradeoffs

- **Risk:** Some competitor sites may be down or blocked by bot detection. **Mitigation:** Agents should note accessibility issues and fall back to cached/archive versions or second-hand research.
- **Risk:** Agents may not have full access to premium features. **Mitigation:** Note what's behind paywalls and research those features through reviews/forums.
- **Tradeoff:** Depth vs breadth — each agent covers fewer competitors but with more detail. This is intentional; shallow research is less actionable.
- **Tradeoff:** Some competitors may have changed since last research. **Mitigation:** Agents should note the research date and flag any time-sensitive observations.

---

## Open Questions

1. Should agents also research non-digital competitors (university career centers, WhatsApp groups, Telegram channels)?
2. Are there specific Kenyan universities whose internal portals should be included?
3. Should agents look at social media presence of competitors (Twitter/X, LinkedIn, Instagram)?
4. Is there a budget constraint for competitor tool subscriptions (SimilarWeb, Semrush) that agents should use?

---

**Plan Date:** 2026-07-16
**Planned By:** Hermes Agent
**Status:** Ready for delegation
