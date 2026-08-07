# Admin Edit Requests + Detail View Redesign

## Goals

1. Store edit requests in a separate `edit_requests` collection (not in `pending_opportunities`)
2. Redesign the Manage tab with a 3-panel detail view for all sub-tabs (Pending, Edit Requests, Published)
3. Remove the "syntax appearance" (JSON/code-like display) from the pending cards

## Current Problems

- Edit requests use `POST /public/submit-opportunity` which inserts into `pending_opportunities` with an `editOf` field
- Admin's Pending tab queries `pending_opportunities` with `status: 'Unverified'` — this catches edit requests too
- Edit Requests tab queries the same collection filtering by `editOf` existence
- Result: edit requests appear in BOTH tabs
- Pending cards show raw data in a code-like syntax format (the `<details>` "View Full Intelligent Extraction" block with raw features table)

## Architecture

### Backend Changes

#### 1. New collection: `edit_requests`

Schema:
```
{
  _id: ObjectId,
  originalId: string,         // the opportunity.id being edited
  opportunity: { ... },       // the full proposed opportunity object
  reporter: { name, organization, role, email, telephone, websiteOrSocial },
  changeReason: string,
  status: 'Pending' | 'Approved' | 'Rejected',
  diff: { field: { old, new } },  // computed at insert time
  submittedAt: Date,
  reviewedAt: Date|null,
  reviewedBy: string|null
}
```

#### 2. Modify `POST /public/submit-opportunity` in `backend/src/routes/public.js`

When `opportunity.editOf` exists and is not null:
- Look up original in `opportunities` collection
- Compute diff between original fields and proposed fields
- Insert into `edit_requests` collection instead of `pending_opportunities`
- Return `{ message: 'Edit request submitted for review.', editRequestId: ... }`

When no `editOf`: keep existing behavior (insert into `pending_opportunities`)

#### 3. Update `GET /admin/pending` in `backend/src/routes/admin.js` (line 722)

No structural change needed — edit requests won't be in this collection anymore. Keep query as `{ status: 'Unverified' }`.

#### 4. Update `GET /admin/edit-requests` (line 2164)

Change query from:
```js
db.collection('pending_opportunities').find({ 'opportunity.editOf': { $exists: true, $ne: null } })
```
To:
```js
db.collection('edit_requests').find({ status: 'Pending' })
```

Each item already has `diff` pre-computed, so the enrichment loop simplifies (no need to recompute diff or look up original).

#### 5. Update `POST /admin/edit-requests/:id/approve` (line 2208)

Change lookup from `pending_opportunities` to `edit_requests`:
```js
const editDoc = await db.collection('edit_requests').findOne({ _id: new ObjectId(id) });
```

After applying changes to original opportunity, update status in `edit_requests`:
```js
await db.collection('edit_requests').updateOne(
  { _id: new ObjectId(id) },
  { $set: { status: 'Approved', reviewedAt: new Date(), reviewedBy: 'Admin' } }
);
```

#### 6. Update `POST /admin/edit-requests/:id/reject` (line 2250)

Change lookup and update to use `edit_requests` collection.

#### 7. Add `GET /admin/opportunities/:id/detail` (or reuse existing)

For the detail view, we need to fetch a single opportunity with full data. The existing `GET /admin/opportunities/:id` (PUT/DELETE routes exist, need to check for GET). If no GET exists, add one that returns the full opportunity document from `opportunities` collection.

### Frontend Changes

#### 8. Create `AdminOppDetail.tsx` component

A reusable 3-panel detail view component used inside the admin dashboard:

```
┌─────────────────────────────────────────┐
│ Top Panel: Poster Info                  │
│  Name | Organization | Email | Phone     │
├─────────────────────────────────────────┤
│ Middle Panel: Opportunity Card          │
│  (read-only OpportunityDetails render)  │
│  Image, title, category, description,   │
│  deadline, location, benefits, etc.     │
├─────────────────────────────────────────┤
│ Bottom Panel: Actions                   │
│  Pending → [Approve] [Reject]           │
│  Edit → [Approve Edit] [Reject]         │
│  Published → [Edit] [Delete]            │
└─────────────────────────────────────────┘
```

Props:
- `opportunity`: the opportunity data object
- `poster`: { name, organization, email, telephone, websiteOrSocial }
- `type`: 'pending' | 'edit' | 'published'
- `onApprove`, `onReject`, `onEdit`, `onDelete`: callback functions
- `changeReason?`: for edit requests
- `diff?`: for edit requests

The middle panel renders the opportunity using a **simplified read-only version** that mimics the `OpportunityDetails` appearance (image, title, category badge, provider, deadline, location, description, benefits, eligibility). This is NOT the full `OpportunityDetails` component (which has apply forms, tracking, etc.) — it's a read-only card replica.

#### 9. Redesign Manage tab in `AdminDashboard.tsx`

Replace the current sub-tab content with a list + detail pattern:

**List view** (shown when no item selected):
- Grid of small cards showing: thumbnail, title, category badge, date
- Clicking a card loads the detail view

**Detail view** (shown when item selected):
- Back button to return to list
- The `AdminOppDetail` component above

Apply this pattern to ALL three sub-tabs:
- Pending list → Pending detail (with approve/reject)
- Edit Requests list → Edit detail (with approve/reject, shows diff)
- Published list → Published detail (with edit/delete)

#### 10. Remove syntax appearance from pending cards

Remove or collapse the `<details>View Full Intelligent Extraction</section>` block that shows raw `extractedFeatures` table. Replace with a simple preview of title + description + deadline. Full data is visible in the new detail view.

## Files Changed

| File | Change |
|------|--------|
| `backend/src/routes/public.js` | Modify `POST /public/submit-opportunity` to route edit requests to new collection |
| `backend/src/routes/admin.js` | Update edit-requests endpoints to use `edit_requests` collection; add GET single opportunity endpoint if missing |
| `src/components/AdminOppDetail.tsx` | New — 3-panel detail view component |
| `src/pages/admin/AdminDashboard.tsx` | Redesign Manage tab with list + detail pattern; remove syntax appearance |

## Validation

- [ ] Submitting an edit request from PosterDashboard creates document in `edit_requests` (not `pending_opportunities`)
- [ ] Edit requests no longer appear in admin Pending tab
- [ ] Edit requests appear only in admin Edit Requests tab
- [ ] Approve edit request applies changes to original opportunity
- [ ] Reject edit request marks it as rejected (does not affect original)
- [ ] Clicking a pending item shows 3-panel detail view
- [ ] Clicking an edit request shows 3-panel detail with diff
- [ ] Clicking a published item shows 3-panel detail with edit/delete actions
- [ ] Back button returns to list
- [ ] No raw syntax/code appearance in pending list
- [ ] Existing pending approval/rejection still works
- [ ] Published post edit/delete still works
