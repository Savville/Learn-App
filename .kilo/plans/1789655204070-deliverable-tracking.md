# Plan: Deliverable-Based Tracking & Per-Deliverable Escrow Release

## Context

The current system has two track types (`fixed`, `milestone`) but lacks **deliverable-based tracking** where:
- Each track consists of discrete deliverables (tasks) with individual amounts
- Freelancer submits evidence links (Google Drive, GitHub, etc.) in a deliverables panel
- Poster reviews deliverables in their panel (beside chat UI) and marks complete → triggers partial escrow release
- Payment conditions are visible to applicants before applying
- For Jobs: hybrid text/key-value terms define additional conditions including quality-based partial payment rules

### Two-Level Admin Structure

| Role | Dashboard | Scope | Deliverable Access |
|------|-----------|-------|-------------------|
| **Main Admin** (you) | `AdminDashboard.tsx` + `PosterDashboard?isAdminMode=true` | All platform posts | Can view deliverables for ALL posts ONLY in dispute context (not before) |
| **Normal Poster** | `PosterDashboard?isAdminMode=false` | Own posts only | Can manage deliverables for their own posts |

### User Confirmed Decisions

| Decision | Answer |
|----------|--------|
| Fixed track type | Deliverables table (title + amount per deliverable) |
| Milestone track type | Deliverables with progress tracking (X out of Y) |
| Job-specific conditions | Hybrid text/key-value terms + quality-based partial payment rules |
| Escrow release | Per deliverable (when marked complete) |
| Fee structure | 5% platform fee per deliverable release |
| Milestone progress input | Poster checks based on external work |
| Evidence submission | Freelancer inputs links (Google Drive, GitHub, images) in deliverables panel |
| Admin verification | Poster sees deliverable links in their panel beside chat UI |
| Some tasks (e.g. WhatsApp growth) | Easy to verify on both sides, no need for deliverable links |
| Dispute initiation | Either party can flag a deliverable as disputed |
| Dispute resolution | Main admin reviews chat evidence & deliverable links → makes final decision |
| Partial payment | Fixed percentage based on quality level (defined in payment terms at setup) |
| Resubmit | Freelancer can resubmit a deliverable if poster rejects it |

---

## Data Model Changes

### New Interfaces (`src/data/opportunities.ts`)

```typescript
// A discrete task/item within a track
export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  amount: number; // KES (full amount)
  paidAmount?: number; // actual amount paid (for partial payments)
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'disputed' | 'paid';
  submittedUrl?: string; // link submitted by freelancer
  submittedAt?: string;
  completedAt?: string;
  adminNote?: string;
  disputeReason?: string; // reason for dispute
  disputeInitiatedBy?: 'poster' | 'freelancer';
  qualityLevel?: 'satisfactory' | 'partial' | 'unsatisfactory'; // selected by poster
}

// Quality-based partial payment rule (defined at setup)
export interface QualityRule {
  level: 'satisfactory' | 'partial' | 'unsatisfactory';
  percentage: number; // e.g., 100, 70, 30
  label: string; // e.g., "Full payment", "70% - Minor issues", "30% - Major issues"
}

// For Job-type opportunities: additional payment conditions
export interface PaymentCondition {
  key: string;
  value: string;
}

// Updated TrackForm
export interface TrackForm {
  id: string;
  label: string;
  description: string;
  amount: number;
  type: 'fixed' | 'milestone';
  fields: FormField[];
  deliverables: Deliverable[]; // for fixed tracks: discrete tasks with amounts
  milestones: Milestone[]; // for milestone tracks: target + unit + amount
  qualityRules?: QualityRule[]; // for partial payment based on quality
  conditions?: PaymentCondition[]; // for Jobs: hybrid key-value terms
}
```

### Database Schema (MongoDB)

Applications collection stores:
```json
{
  "opportunityId": "social-media-marketing-kenya",
  "applicantEmail": "user@example.com",
  "tracks": [{
    "trackId": "track-a-content",
    "trackLabel": "Track A: Content & Posting",
    "data": { "experience": "..." },
    "deliverables": [
      {
        "id": "d1",
        "title": "First Substack Post",
        "amount": 200,
        "paidAmount": 140,
        "status": "paid",
        "submittedUrl": "https://...",
        "qualityLevel": "partial"
      }
    ],
    "status": "pending"
  }],
  "status": "pending"
}
```

---

## UI Changes

### 1. PostWithUs.tsx — Deliverable Builder

**For Fixed tracks:**
- Replace the simple "Amount" input with a deliverable table
- Each row: Deliverable title, Amount (KES)
- "Add Deliverable" button adds new row
- Total track amount = sum of deliverable amounts (auto-calculated)

**For Milestone tracks:**
- Keep existing milestone configuration (target + unit + amount)

**For Job categories only:**
- Add "Payment Conditions" section below tracks (key-value pairs)
- Add "Quality Rules" section with percentage levels:
  - Satisfactory: 100%
  - Partial: custom % (e.g., 70%)
  - Unsatisfactory: custom % (e.g., 30%)
- Both sections visible to applicants before applying

### 2. OpportunityDetails.tsx — Display

**Track accordion shows:**
- Track label + type + total amount
- Description
- Payment Conditions table (key-value pairs)
- Quality Rules (percentage levels)
- Deliverable list (title + amount)
- Milestone progress (target + current)
- Track-specific fields

### 3. Tracker.tsx (Freelancer View) — Deliverable Submission

**For each active application with deliverables:**
- Deliverable list with status badges
- "Submit Link" button per deliverable (opens modal for URL input)
- Status flow: pending → submitted → approved/rejected → paid
- If rejected: "Resubmit" button appears
- "Dispute" button per deliverable (opens modal for reason input)
- Progress: "X/Y complete (KES paid of total)"

### 4. PosterDashboard.tsx (Poster View) — Deliverable Review

**For each applicant (own posts only):**
- Deliverable list beside chat/profile
- Each deliverable: title, status, submitted link (clickable)
- **"Mark Complete"** button → opens modal with:
  - Quality level selector (Satisfactory/Partial/Unsatisfactory)
  - Shows calculated payout based on quality rule
  - Optional note field
- **"Reject"** button → opens modal with reason input
- **"Dispute"** button → opens modal for dispute initiation
- Progress: "X/Y complete (KES paid of total)"

### 5. AdminDashboard.tsx / PosterDashboard (Main Admin View)

**For dispute mediation only:**
- Read-only view of deliverables for ANY post (when dispute exists)
- View submitted links, chat evidence, dispute reason
- Resolution actions: "Pay Full", "Pay Partial (%)", "Reject"
- Cannot access deliverables for non-disputed posts

---

## Backend Changes

### New Endpoint: `POST /api/public/me/posts/:opportunityId/release-deliverable`

```javascript
// Request body: { applicationId, trackId, deliverableId, qualityLevel }
// 1. Verify poster owns the job
// 2. Verify escrow is funded
// 3. Find the specific deliverable
// 4. Calculate payout based on qualityLevel:
//    - Get qualityRules from opportunity's track definition
//    - Find percentage for selected qualityLevel
//    - payout = deliverable.amount * (percentage / 100)
// 5. Deduct fees: 5% platform fee + 2% M-PESA B2C fee
// 6. Call Daraja B2C API for payout to applicant's M-PESA
// 7. Update deliverable: status='paid', paidAmount=payout, qualityLevel
// 8. Log transaction
// 9. Notify applicant via email
```

### New Endpoint: `PUT /api/public/me/applications/:applicationId/submit-deliverable`

```javascript
// Request body: { trackId, deliverableId, submittedUrl }
// 1. Verify applicant owns the application
// 2. Update deliverable: submittedUrl, status='submitted', submittedAt
// 3. Notify poster via email
```

### New Endpoint: `PUT /api/public/me/applications/:applicationId/dispute-deliverable`

```javascript
// Request body: { trackId, deliverableId, reason, initiatedBy }
// 1. Verify caller owns the application or is the poster
// 2. Update deliverable: status='disputed', disputeReason, disputeInitiatedBy
// 3. Notify main admin + other party via email
```

### New Endpoint: `PUT /api/admin/resolve-dispute`

```javascript
// Request body: { applicationId, trackId, deliverableId, resolution, amount }
// 1. Verify main admin token
// 2. resolution: 'pay_full', 'pay_partial', 'reject'
// 3. If pay_partial: amount specified by admin
// 4. Update deliverable status accordingly
// 5. If pay: trigger B2C payout
// 6. Log transaction + notify both parties
```

### Updated Endpoint: `POST /api/public/opportunities/:id/apply`

Store deliverables from track definition:
```javascript
tracks: [{
  trackId: track.trackId,
  trackLabel: track.trackLabel,
  data: track.data || {},
  deliverables: track.deliverables || [],
  status: 'pending',
}]
```

---

## Escrow Flow

### Poster Creates Opportunity:
1. Defines tracks with deliverables/conditions/quality rules
2. Total escrow = sum of all deliverable amounts
3. Deposits escrow via existing STK push flow

### Applicant Applies:
1. Views payment conditions + quality rules + deliverable breakdown
2. Selects track(s), fills fields, submits
3. Application stores deliverable list

### Freelancer Submits Deliverable:
1. Completes the task/deliverable
2. Inputs link (Google Drive, GitHub, images) in Tracker
3. Status: pending → submitted

### Poster Reviews & Releases:
1. Sees submitted link in PosterDashboard (beside chat)
2. Reviews work externally (opens link)
3. Clicks "Mark Complete" → selects quality level → system calculates payout
4. Or clicks "Reject" with reason → freelancer can resubmit
5. Each release triggers partial B2C payout (minus fees)

### Dispute Flow (Either Party):
1. Either party clicks "Dispute" on a deliverable
2. Reason captured → Main admin notified
3. Main admin reviews evidence (chat + links)
4. Resolves: Pay Full / Pay Partial (%) / Reject
5. If pay: triggers B2C payout; if reject: freelancer can resubmit

### Partial Payment Calculation:
- Quality rules defined at setup (e.g., Satisfactory=100%, Partial=70%, Unsatisfactory=30%)
- Poster selects quality level when marking complete
- Payout = deliverable.amount × (qualityPercentage / 100)
- Fees calculated on the partial amount

---

## Implementation Order

### Phase 1: Data Model + Backend
1. Update `src/data/opportunities.ts` interfaces (Deliverable, QualityRule, PaymentCondition)
2. Create `release-deliverable` endpoint with quality-based calculation
3. Create `submit-deliverable` endpoint
4. Create `dispute-deliverable` endpoint
5. Create `resolve-dispute` endpoint (admin)
6. Update `apply` endpoint to store deliverables

### Phase 2: PostWithUs — Deliverable Builder
1. Deliverable table for fixed tracks (auto-sum)
2. Payment conditions builder (key-value)
3. Quality rules builder (percentage levels)
4. All sections visible in track accordion

### Phase 3: OpportunityDetails — Display
1. Payment conditions + quality rules + deliverables in track accordion
2. Track-specific fields

### Phase 4: Tracker (Freelancer) — Deliverable Submission
1. Deliverable list with status badges
2. "Submit Link" modal
3. "Resubmit" on rejected deliverables
4. "Dispute" button + modal
5. Progress indicator

### Phase 5: PosterDashboard (Poster) — Deliverable Review
1. Deliverable list beside chat
2. "Mark Complete" modal with quality selector
3. "Reject" modal with reason
4. "Dispute" button
5. Progress indicator

### Phase 6: AdminDashboard (Main Admin) — Dispute Resolution
1. Read-only deliverable view for disputed posts
2. Resolution actions (Pay Full/Partial/Reject)
3. B2C payout trigger on resolution

---

## Validation

1. **Poster creates deliverable-based job** → sets deliverables + quality rules + conditions
2. **Applicant views opportunity** → sees all terms + deliverable breakdown
3. **Applicant applies** → selects track, fills fields, submits
4. **Freelancer submits deliverable** → inputs link in Tracker
5. **Poster reviews** → sees link, selects quality level, marks complete
6. **Partial payout** → B2C payout triggered based on quality percentage
7. **Freelancer disputes** → Main admin reviews → resolves
8. **All deliverables complete** → full escrow released (minus any partials)

---

## Open Questions

None — all decisions resolved.
