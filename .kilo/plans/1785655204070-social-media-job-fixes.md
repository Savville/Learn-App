# Plan: Fix Social Media Marketing Job Posting Issues

## Context

The Social Media Marketing job posting was added to `src/data/opportunities.ts` with two tracks (Track A: Content & Posting, Track B: WhatsApp Growth). Three issues were identified:

1. **Image**: `Email Banner.png` in `public/` should be the opportunity banner
2. **Markdown rendering**: `###` headers, `**bold**`, and indented content in `fullDescription` don't render aesthetically in `renderDescription()`
3. **Track accordion not visible**: The track selection UI doesn't appear for the opportunity

---

## Issue 1: Image — Use Email Banner.png

### Root Cause
The social media marketing job has `logoUrl: "/Opportunities Kenya Logo 2.png"` (default). The user wants `Email Banner.png` as the banner.

### Fix
- Change `logoUrl` in the job data from `"/Opportunities Kenya Logo 2.png"` to `"/Email Banner.png"`
- The existing `getDynamicImageUrl()` and `logoUrl` handling already serve public folder files correctly (see `OpportunityDetails.tsx` line 458-460 and `PosterDashboard.tsx` line 487)
- No backend compression or CDN upload needed — Vite serves the `public/` folder statically at root
- The `Email Banner.png` will be accessible at `/Email Banner.png` in production

### Files to change
- `src/data/opportunities.ts` — update `logoUrl` for the social media marketing job

---

## Issue 2: Markdown Rendering — Description Formatting

### Root Cause
`renderDescription()` in `OpportunityDetails.tsx` (line 24) processes text line-by-line with simple pattern matching. It handles:
- ALL-CAPS headings → `<h3>`
- Emoji-led lines → `<p>` with bold
- Bullet points (`•`, `-`, `*`) → `<li>`
- Plain text → `<p>`

It does NOT handle:
- `###` markdown headers → rendered as plain paragraphs
- `**bold**` → asterisks stripped but not rendered as `<strong>`
- `---` horizontal rules → skipped (correct) but surrounding indented content looks broken
- Indented/nested content → no special handling, looks messy

The social media marketing job's `fullDescription` uses `###` headers and `---` dividers extensively.

### Fix Options

**Option A (Recommended): Use `react-markdown`**
- `react-markdown` is already a dependency (`"react-markdown": "^10.1.0"` in package.json)
- Replace `renderDescription()` with `<ReactMarkdown>` component
- This handles all markdown syntax properly: `###`, `**bold**`, `---`, lists, links, etc.
- Add `rehype-raw` plugin for HTML in markdown if needed

**Option B: Patch `renderDescription()`**
- Add handling for `###` headers → `<h3>`
- Add handling for `**text**` → `<strong>text</strong>`
- Add handling for `---` → `<hr>`
- Add indentation-aware rendering for nested content
- More fragile, doesn't cover all markdown edge cases

### Files to change
- `src/pages/OpportunityDetails.tsx` — replace `renderDescription()` with `ReactMarkdown` or patch the function
- `src/pages/OpportunityDetails.tsx` — add import for `ReactMarkdown`

---

## Issue 3: Track Accordion Not Visible

### Root Cause
The track accordion in `OpportunityDetails.tsx` is conditionally rendered:
```tsx
{opportunity.tracks && opportunity.tracks.length > 0 && (
```

The problem is in the data flow at line 475:
```tsx
setOpportunity(local ? { ...response.data, logoUrl: local.logoUrl } : response.data)
```

When the API (MongoDB) is running, `response.data` overwrites the local data. The MongoDB document for the social media marketing job doesn't have the `tracks` field because it was only added to the TypeScript data, not inserted into MongoDB. So `opportunity.tracks` is `undefined` and the accordion never renders.

Additionally, even when using local data (API offline), the merge at line 475 spreads `response.data` first then overrides only `logoUrl`. If `response.data` has a `tracks: undefined` or missing `tracks`, it could still override.

### Fix
1. **Ensure `tracks` is in the MongoDB document** — the job posting needs to be inserted into MongoDB with the `tracks` field, OR
2. **Fix the merge logic** to preserve `tracks` from local data when the API response doesn't have it, OR
3. **Add `tracks` to the API response** by ensuring the backend returns all fields from the database document

The simplest fix: update the merge logic at line 475 to preserve `tracks` from local data:
```tsx
setOpportunity(local ? { ...response.data, logoUrl: local.logoUrl, tracks: local.tracks || response.data.tracks } : response.data)
```

But the proper fix is to ensure the job is in MongoDB. The admin should post it via the existing admin flow, or seed it into the database.

### Files to change
- `src/pages/OpportunityDetails.tsx` line 475 — fix merge to preserve `tracks`
- `src/data/opportunities.ts` — ensure the job data has `tracks` properly structured (already done)
- Backend seed or admin post — ensure the opportunity exists in MongoDB with `tracks`

---

## Implementation Order

1. Fix `logoUrl` → `/Email Banner.png` in opportunities data
2. Fix `renderDescription()` → use `ReactMarkdown` (already a dependency)
3. Fix merge logic in `OpportunityDetails.tsx` to preserve `tracks` from local data
4. Verify the job posting exists in MongoDB (admin posts it or seed script)

## Validation

1. Start dev server, navigate to the Social Media Marketing opportunity
2. Verify `Email Banner.png` appears as the banner image
3. Verify `###` headers render as proper `<h3>` elements
4. Verify **bold** text renders as `<strong>`
5. Verify the "Choose Track(s) to Apply" section is visible with accordion panels
6. Verify Track A and Track B checkboxes work and expand/collapse properly
7. Verify milestone payout table shows for Track B
