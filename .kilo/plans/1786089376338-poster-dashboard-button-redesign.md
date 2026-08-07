# PosterDashboard Button Redesign + Unpublish Feature

## Goals

1. Replace stacked full-width buttons with a single compact row of 3 actions
2. Replace "Delete" for live posts with "Unpublish" (no backend delete for live posts to avoid orphaning applications)
3. Keep "Delete Draft" for pending posts only

## Changes

### 1. Frontend: `src/components/PosterDashboard.tsx`

**Row layout** — replace the two-row button structure (lines 755–842) with a single row:

```
[View Live]  [Edit / Request Edit]  [View Applications: N]
```

- **View Live**: only shown when `post.isLive || post.status === 'Verified'`, links to `/opportunity/${toSlug(post.title)}`
- **Edit / Request Edit**: shown for both live and pending; live posts show amber "Request Edit", pending shows blue "Edit"
- **View Applications**: only shown for live posts, links to `/manage/applicants/${post.id}`, includes count badge

**Remove** the current "Delete" button block (lines 786–800).

**Keep** the escrow row (Deposit KES / Request Payout / Escrow Active) below the main action row — this is separate from the 3-button row and stays as-is.

**Pending posts**: replace the "Delete" button with a smaller "Delete Draft" that triggers the existing `handleDeletePending` flow.

### 2. Backend: `backend/src/routes/public.js`

**Add new endpoint** after the existing DELETE at line 948:

```
POST /public/me/posts/:id/unpublish
```

Logic:

- Verify token + ownership (reporter.email === req.user.email)
- Check post exists in `opportunities` collection (live post)
- Move from `opportunities` → `archived_opportunities` (preserve all data, add `archivedAt`, `archivedBy` fields)
- Return `{ success: true, message: 'Post unpublished.' }`
- If post is already in `pending_opportunities`, return 400

**Remove** the hardcoded 403 on live posts in the existing DELETE endpoint (line 939) — the unpublish endpoint handles live posts, the DELETE endpoint remains for pending only.

### 3. State management in PosterDashboard

Add state for unpublish loading/error per post:

```ts
const [unpublishingId, setUnpublishingId] = useState<string | null>(null);
```

`handleUnpublish` function:

- POST to `${API_BASE}/public/me/posts/${id}/unpublish`
- On success: remove from `livePosts`, show success toast
- On error: show error toast

### 4. UI details for the 3-button row

Use `flex flex-wrap gap-2` or `flex gap-2` with `w-auto` buttons:

- Buttons should be `h-9` (shorter than current h-11)
- Text: "View Live", "Edit", "Applications" with icon + count badge for applications
- On mobile (`sm:`): buttons stack if needed or use `flex-wrap`
- Application count shown as a small inline badge: `View Applications (3)`

## Files Changed

- `src/components/PosterDashboard.tsx`
- `backend/src/routes/public.js`

## Validation

- [ ] Live post card shows: [View Live] [Request Edit] [Applications: N] in one row
- [ ] Pending post card shows: [Edit] [Delete Draft] in one row
- [ ] Escrow buttons still appear below when applicable
- [ ] Unpublish button for live posts works, post disappears from live list
- [ ] Pending post delete still works (backend DELETE endpoint unchanged for pending)
- [ ] Mobile responsive: buttons wrap or shrink appropriately
- [ ] No disputes triggered by unpublish (no cascade on applications)
