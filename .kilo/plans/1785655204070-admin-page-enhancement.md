# Admin Page Enhancement — Clean Model

## Core Principle
**Where you log in determines what you are:**
- Log in at **Admin Dashboard** (`/admin/dashboard`) → you are THE admin (one OTP for `ochiwilliamotieno@gmail.com`)
- Post from **any other page** (`/post-with-us`) → you are a normal user, even if you're `ochiwilliamotieno@gmail.com`

## Current State & Problems

### What exists:
- **AdminDashboard** (`/admin/dashboard`): Password-based login → `adminToken` JWT → 16 tabs
- **My Posts tab**: Embeds `PosterDashboard isAdminMode={true}` with hardcoded email, shows ALL posts via `filterMode=admin`
- **Poster edit flow**: "Edit" button → navigates to `/post-with-us` → submits with `editOf` flag → goes to Inbox with "📝 Edit Request" badge (no diff view)
- **PosterDashboard**: Has escrow deposit, deliverable release/reject/dispute, payout requests

### What's wrong:
1. My Posts tab shows ALL platform posts — should show only admin's own posts
2. No dedicated "Request Edit" UI for posters on their live posts
3. Edit requests in Inbox have no diff view or comparison
4. Manage tab shows only basic fields — no description, images, features, interactions
5. No applicant accordion in Manage tab
6. Master Sheet lacks views/clicks/CTR and edit request status
7. Two login systems (password for admin, OTP for users) — should be ONE

---

## Implementation Plan

### Phase 1: Admin Dashboard — Single OTP Login

**Modify**: `src/pages/admin/AdminLogin.tsx`

Replace password login with OTP login:
- Reuse existing `OTPLoginForm` component
- Only `ochiwilliamotieno@gmail.com` is allowed (show error for other emails)
- On success: store `adminToken` (JWT) + redirect to `/admin/dashboard`

**Modify**: `src/middleware/auth.js` (backend)

Add OTP-based admin token generation:
```
POST /api/admin/otp-login — verify OTP for ochiwilliamotieno@gmail.com → return adminToken
```

Or simpler: Frontend uses existing user OTP flow → if email matches → call backend to upgrade to admin token.

**Decision**: Use existing OTP verification → backend checks email → if `ochiwilliamotieno@gmail.com` → return admin JWT token. Otherwise return normal user token (which won't access admin routes).

### Phase 2: My Posts Tab — Admin's Own Posts Only

**Modify**: `src/pages/admin/AdminDashboard.tsx`

Change `my-posts` tab:
```tsx
// BEFORE:
<PosterDashboard isAdminMode={true} />

// AFTER:
<PosterDashboard adminDashboardMode={true} />
```

**Modify**: `src/components/PosterDashboard.tsx`

Add prop `adminDashboardMode?: boolean`:
- Uses `adminToken` for API calls
- `filterMode=normal` (shows only admin's own posts, not ALL posts)
- Header shows "Opportunities Kenya Admin"
- Posts submitted with `isAdminPost=true, autoApprove=true`
- Can track deliverables, approve/reject, handle escrow for own posts

### Phase 3: Backend — Auto-Approve Admin Posts

**Modify**: `backend/src/routes/public.js` — submit endpoint (~line 600)

```js
const ADMIN_EMAIL = 'ochiwilliamotieno@gmail.com';
const isAdminAutoApprove = req.body.isAdminPost === true &&
                           req.body.autoApprove === true &&
                           normalizedReporter.email === ADMIN_EMAIL;

if (isAdminAutoApprove) {
  await db.collection('opportunities').insertOne({
    ...opportunity,
    status: 'Verified',
    isVerified: true,
    postedBy: 'Opportunities Kenya Admin',
    dateAdded: new Date().toISOString().split('T')[0],
    verificationAudit: {
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'System (Admin Auto-Post)',
      proofLinks: [],
      riskFlags: [],
    },
  });
  return res.json({ message: 'Published as Admin.', url: `/opportunity/${opportunity.id}` });
}
// ... existing pending flow follows
```

### Phase 4: Poster "Request Edit" UI

**Modify**: `src/components/PosterDashboard.tsx`

On each live post card, add **"Request Edit"** button:
- Opens inline modal (not navigation away)
- Editable fields: title, description, full description, deadline, location, application link
- Change reason textarea (required)
- Shows diff preview of changes
- Submit → pending queue with `editOf` flag + `changeReason`

**Submit payload**:
```json
{
  "editOf": "<original-opportunity-id>",
  "changeReason": "Extended deadline and updated description",
  "opportunity": { ...updated fields... }
}
```

### Phase 5: Manage Tab — Full Detail + Edit Requests + Applicant Accordion

**Modify**: `src/pages/admin/AdminDashboard.tsx`

Restructure `manage` tab:

#### 5a. Edit Requests Section (top)
- Fetches pending items where `editOf` is set
- Diff view: original vs proposed changes (field-by-field, highlighted)
- Shows change reason from poster
- Actions: "Approve Edit" / "Reject"
- On approve: updates original opportunity, marks pending as Verified
- On reject: marks pending as Rejected

#### 5b. All Published Posts Section
- Each post card: title, provider, category, poster email, status badges, cover image thumbnail
- **Expandable accordion** showing:
  - Full description, benefits, eligibility, thematic areas
  - Extracted features, cover image (full size)
  - Application form summary (tracks, deliverables, quality rules)
  - Views/Clicks/CTR stats
  - **Nested applicant accordion**: emails grouped by status (pending, shortlisted, approved, hired, rejected)
  - Quick actions: View Live, Edit, Delete

### Phase 6: Backend — Edit Request Endpoints + Enhanced Master Sheet

**Modify**: `backend/src/routes/admin.js`

#### New endpoints:
```
GET  /api/admin/edit-requests — pending items with editOf + original opportunity data + diff
POST /api/admin/edit-requests/:id/approve — apply changes to original opportunity
POST /api/admin/edit-requests/:id/reject — mark pending as rejected
GET  /api/admin/opportunities/:id/detail — full opportunity detail with analytics + applicants
```

#### Enhance existing `GET /api/admin/master-sheet`:
Add per-row: `views`, `clicks`, `ctr`, `hasEditRequest`

### Phase 7: Sample Content for Testing

```
Content Creation Job — Opportunities Kenya

We are hiring a creative Content Creator to produce engaging social media content for Opportunities Kenya.

Track A: Social Media Content (KES 800/month)
Deliverables:
- 4 Instagram posts per week (KES 200/week)
- 3 Twitter threads per week (KES 150/week)
- 2 LinkedIn articles per week (KES 150/week)
- 1 YouTube short per week (KES 100/week)

Track B: Newsletter Writing (KES 500/month)
Deliverables:
- 2 Substack articles per week (KES 125/week)

Quality Standards:
- Satisfactory: Full payment
- Partial: 60% payment
- Unsatisfactory: Resubmit required

Requirements:
- Strong writing skills
- Experience with Canva or similar design tools
- Ability to research and source opportunities
- Self-motivated and deadline-driven

Payment: Bi-weekly via M-PESA upon deliverable approval
```

---

## Files to Modify

| File | Description |
|------|-------------|
| `src/pages/admin/AdminLogin.tsx` | Replace password with OTP login (admin only) |
| `src/pages/admin/AdminDashboard.tsx` | My Posts tab fix, Manage tab restructure (edit requests + detail accordion + applicant accordion) |
| `src/components/PosterDashboard.tsx` | Add `adminDashboardMode` prop, "Request Edit" modal UI |
| `backend/src/routes/public.js` | Auto-approve admin posts |
| `backend/src/routes/admin.js` | Edit-requests endpoints, opportunity detail endpoint, enhance master-sheet |
| `backend/src/middleware/auth.js` | OTP-based admin token generation |

## Data Flow Summary

```
ADMIN:
  /admin/dashboard → OTP login (ochiwilliamotieno@gmail.com) → adminToken
  → My Posts tab: post as Admin → auto-approved → Live
  → Manage tab: view all posts, handle edit requests, view applicants
  → Disputes tabs: resolve escrow & deliverable disputes

SAME EMAIL, OTHER PAGES:
  /post-with-us → normal user flow → pending queue → admin approves in Inbox
  → "Request Edit" on live posts → admin reviews diff in Manage → approve/reject

OTHER USERS:
  /post-with-us → normal flow → pending queue → admin approves
  → /manage → PosterDashboard (OTP) → see own posts, request edits
```

## Validation Plan

1. **Admin OTP Login**: Login as `ochiwilliamotieno@gmail.com` at `/admin/dashboard` → verify admin access
2. **Admin Auto-Post**: From My Posts tab → post a job → verify auto-approved and Live
3. **Same Email Normal Post**: From `/post-with-us` → verify goes to pending queue
4. **Edit Request**: Poster clicks "Request Edit" → changes fields → admin sees diff in Manage → approve → original updated
5. **Manage Detail View**: Expand post → verify description, image, features, stats → expand applicants → verify grouped by status
6. **Master Sheet**: Verify views/clicks/CTR columns → verify edit request indicator
7. **Deliverable Flow**: Post job with tracks → apply → submit deliverable → approve → payment
8. **Dispute Flow**: Raise deliverable dispute → appears in Deliverable Disputes tab → resolve → payment
