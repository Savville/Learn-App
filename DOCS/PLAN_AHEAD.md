# Opportunities Kenya — Plan Ahead

> **Last Updated:** July 23, 2026
> **Stack:** React + Vite (Vercel) + Express (Render) + MongoDB Atlas + Resend + M-PESA Daraja

---

## 1. Payment Tracking System

### Current State
- **Transactions stored in MongoDB** `transactions` collection
- **Three transaction types:**
  - `escrow` — Job/Gig deposits (poster pays via STK Push)
  - `crowdfund` — Public project contributions
  - `crowdfund_payout` / `crowdfund_refund` — B2C disbursements
  - `payment` — Job doer payouts (B2C)
- **M-PESA integration:** `backend/src/services/mpesaService.js` (STK Push + B2C)
- **Webhook handlers:** `/api/public/payments/mpesa/callback`, `/b2c/result`, `/b2c/timeout`
- **Security:** Amount validation, CheckoutRequestID cross-check, status-based callback filtering

### Gap: No Admin Transaction Dashboard
There is **no endpoint** to view all transactions or search for a specific payment (e.g., the 50 KES deposit).

#### Priority: Add Transaction Viewer
```javascript
// GET /api/admin/transactions — View all transactions with filters
// GET /api/admin/transactions/:conversationId — View single transaction status
```

**Implementation:**
1. Add route in `backend/src/routes/admin.js`
2. Query `transactions` collection sorted by `createdAt DESC`
3. Filter by: `type`, `status`, `opportunityId`, `dateRange`
4. Display: checkoutRequestId, conversationId, amount, status, createdAt, type

**For the 50 KES payment:** Query directly in MongoDB:
```javascript
db.transactions.find({ amount: 50 }).sort({ createdAt: -1 }).limit(5)
```

---

## 2. UI Flow Audit & Efficiency

### Pages & Flows to Review

| Flow | Page(s) | Status | Notes |
|------|---------|--------|-------|
| **Subscribe** | Home → Newsletter modal → Email sent | ✅ Good | Has Reply CTA in email |
| **Browse Opportunities** | Home → Opportunities → Filter/Search | ✅ Good | Server-side caching via `cache.js` |
| **Apply for Job/Gig** | Opportunity detail → Application form → STK Push | ⚠️ Needs review | Escrow flow: apply → deposit → approve → release |
| **Post With Us** | Post form → AI parsing → Pending approval | ⚠️ Needs review | Gemini API call for parsing |
| **Admin Dashboard** | Login → Stats → Pending → Approve/Reject | ✅ Good | Token-based auth |
| **User Inbox** | Auth (OTP) → Messages → Conversations | ⚠️ Needs review | Real-time polling? |
| **Portfolio** | Create → Upload → View | ⚠️ Needs review | Cloudinary integration |
| **Contact** | Form → Email notification | ✅ Good | Sends to Gmail |

### Potential Ambiguity / Break Points

#### A. Escrow Flow (Job/Gig Applications)
```
1. Applicant applies → creates conversation
2. Poster approves → requests escrow release
3. Poster deposits escrow via STK Push (M-PESA)
4. Admin releases payment to job doer via B2C
```

**Risk areas:**
- Step 3 fails if STK Push times out → no automatic retry
- Step 4 is currently manual (admin initiates) → should be automated with B2C
- No notification to applicant when escrow is funded

**Fix:** Add escrow-funded notification and auto-release on B2C completion.

#### B. Post With Us AI Parsing
```
User submits → Gemini API parses → pending_opportunities collection
```

**Risk areas:**
- Gemini API rate limits (free tier: 15 RPM, 1M TPM)
- Parse failure → no fallback → user sees error with no opportunity saved
- No progress indicator during parsing (can take 5-15 seconds)

**Fix:** Add loading state, save raw text as fallback, retry logic.

#### C. Crowdfunding Flow
```
Contributor clicks donate → STK Push → M-PESA callback → transaction logged
```

**Risk areas:**
- Multiple rapid clicks → duplicate STK pushes
- No transaction limit per opportunity per user
- Anonymous contributions have no way to claim refund

**Fix:** Debounce donation button, add contribution limit tracking.

---

## 3. Scalability Assessment (Free Tiers)

### Architecture Overview

```
Frontend: Vercel Free Tier (100GB bandwidth/month, 100 build/min)
Backend:  Render Free Tier (750 hrs/month, 0.15 CPU, 512MB RAM)
Database: MongoDB Atlas Free Tier (512MB, shared cluster)
Email:   Resend Free Tier (3K emails/month, 100/day)
```

### Load Capacity Analysis

#### Scenario: 1000 Concurrent Users

| Component | Current Load | At 1000 Users | Risk Level |
|-----------|-------------|---------------|------------|
| **Vercel Frontend** | Static SPA, minimal JS bundle (760KB) | ✅ Handles 1000s of concurrent users | Low |
| **Render Backend** | Express + in-memory cache (5-min TTL) | ⚠️ 512MB RAM may fill with concurrent DB queries | **High** |
| **MongoDB Atlas** | Shared cluster, 512MB storage | ⚠️ Connection pool limited to 500 on free tier | **Medium** |
| **Resend Email** | 100 emails/day limit | ⚠️ Digest to 1000 subs exceeds daily limit | **Medium** |
| **M-PESA Daraja** | Sandbox, no rate limit | ✅ Handles unlimited | Low |
| **Gemini API** | 15 RPM free tier | ⚠️ 100 POST_WITH_US requests/min exceeds limit | **High** |

#### Bottleneck Breakdown

1. **Render Free Tier (Primary Bottleneck)**
   - 512MB RAM + 0.15 CPU
   - In-memory cache helps for `/api/opportunities` (5-min TTL)
   - But `/api/admin/*`, `/api/messages/*`, `/api/portfolio/*` hit MongoDB directly
   - At 1000 concurrent users, ~50-100 admin/dashboard requests expected → MongoDB connection spikes
   - **Recommendation:** Upgrade to Render Starter ($7/month) for 512MB dedicated + better CPU

2. **MongoDB Atlas Free Tier**
   - 512MB storage, shared cluster
   - Max 100 concurrent connections on free tier
   - Current indexes are good (`category`, `id`, `fundingType`, text search)
   - **Recommendation:** Monitor `db.currentOp()` for slow queries; add compound indexes

3. **Resend Email Limits**
   - Free: 100 emails/day, 3K/month
   - Digest broadcast to 350+ subs = OK
   - But personalized digest to 1000 subs = exceeds daily limit
   - **Recommendation:** Use batch sending (100 emails per send) + stagger across day

4. **Gemini API Rate Limits**
   - Free: 15 requests/minute
   - If 50 users submit "Post With Us" simultaneously → 35 rejected
   - **Recommendation:** Queue parsing requests server-side; use `gemini-1.5-flash` (fastest cheapest)

### Optimization Strategies (Free Tier)

#### A. Frontend (Vercel)
- ✅ Already using code splitting (React.lazy)
- ✅ PWA with service worker (offline cache)
- **Add:** Image lazy loading (already using `loading="lazy"`)
- **Add:** Skeleton loaders for opportunities list (reduces perceived load)

#### B. Backend (Render)
- ✅ In-memory cache for opportunities (5-min TTL)
- **Add:** Rate limiting on `/api/public/payments/*` (prevent STK spam)
- **Add:** Connection pooling config (`maxPoolSize: 10` already set)
- **Add:** Request timeout middleware (15s default)
- **Add:** Compressed responses (`compression` already used)

#### C. Database (MongoDB Atlas)
- ✅ Text indexes on title/description/provider
- ✅ Compound indexes on category + date
- **Add:** Index on `transactions.checkoutRequestId` (for webhook lookup)
- **Add:** Index on `transactions.conversationId` (for B2C webhook)
- **Add:** TTL index on `auth_otps` (already 10-min expiry)

#### D. Email (Resend)
- **Add:** Batch digest sending (100 per batch, 200ms间隔)
- **Add:** Fallback to queue if rate limited
- **Add:** Track sent emails to avoid duplicates

---

## 4. Roadmap — What to Touch Next

### Phase 1: Immediate (Week of July 20) ✅ COMPLETE
| Task | Priority | Effort | Impact | Status | Notes |
|------|----------|--------|--------|--------|-------|
| Add `/api/admin/transactions` viewer | 🔴 High | 2h | Track payments, debug issues | ✅ Complete | Enhanced with revenue summary + callback diagnostics |
| Add transaction indexes | 🔴 High | 30m | Faster webhook lookups | ✅ Complete | Indexes verified in `database.js` (checkoutRequestId, conversationId, opportunityId+createdAt, type+status, userId+createdAt, status+createdAt) |
| Fix Post With Us loading state | 🟡 Medium | 1h | Better UX during AI parsing | ✅ Complete | Spinner + progress percentage already implemented in PostWithUs.tsx |
| Add escrow-funded notification | 🟡 Medium | 2h | Close loop in job flow | ✅ Complete | `sendEscrowFundedEmail` exists in `public.js`, triggered on successful escrow payment |

### Phase 2: Reliability (Week of July 27) ✅ COMPLETE — All 4 Tasks Done by Us
| Task | Priority | Effort | Impact | Status | How |
|------|----------|--------|--------|--------|-----|
| Debounce donation buttons | 🟡 Medium | 1h | Prevent duplicate STK pushes | ✅ **NEW** | Added `useRef`-based `donateLoading` state in `src/pages/OpportunityDetails.tsx` — prevents double-clicks on Donate/Escrow Deposit buttons |
| Add M-PESA callback retry logging | 🟢 Low | 1h | Debug failed payments | ✅ **NEW** | Added `callbackRetryCount` to `mpesaService.js` — duplicate `CheckoutRequestID` callbacks retried up to 3x with exponential backoff; each retry logged with timestamp/payload |
| Stagger digest email batches | 🟡 Medium | 2h | Stay within Resend limits | ✅ **NEW** | Refactored `sendDigestEmail`, `sendBroadcastEmail` in `emailService.js` — parallel batches of 25 (digest) and 50 (broadcast) with configurable `batchDelayMs`; returns `{ success, failed, batches }` |
| Add admin dashboard stats for transactions | 🟢 Low | 3h | Better platform oversight | ✅ **ENHANCEMENT** | Enhanced pre-existing `GET /api/admin/transactions` with `revenue` (5% platform fee, 2% M-PESA fees, net revenue) and `callbackDiagnostics` (pending count, failed-by-type); displayed in AdminDashboard Transactions tab |

### Phase 3: AI Model Testing (Week of July 22)
| Task | Priority | Effort | Impact |
|------|----------|--------|--------|
| Test Agnes AI 2.0 Flash for parsing | 🟡 Medium | 2h | Free alternative to Gemini |
| Diff JSON output against Gemini baseline | 🟡 Medium | 1h | Quality comparison |
| Switch to Agnes AI if quality matches | 🟢 Low | 1h | Reduce API costs |

### Phase 4: Performance ✅ COMPLETE — Week of July 23
| Task | Priority | Effort | Impact | Status | Notes |
|------|----------|--------|--------|--------|-------|
| Optimize opportunities list pagination | 🟡 Medium | 3h | Handle 1000+ opportunities | ✅ Pre-existing | Already uses page/limit with max 50 per page, server-side sort by dateAdded DESC |
| Add rate limiting on payment endpoints | 🔴 High | 30m | Prevent STK spam | ✅ **NEW** | Added `paymentLimiter` (10 req/min/IP) on `/payments/deposit` and `/payments/crowdfund`; added `parseLimiter` (15 req/min/IP) on `/admin/parse-agnes` |
| Add request timeout middleware | 🟡 Medium | 30m | Protect Render free tier | ✅ **NEW** | Added 30s timeout middleware on `/api/*` routes; kills hung requests before they consume CPU/RAM |
| Add parse request queue | 🟡 Medium | 1h | Stay within Agnes AI 20 RPM | ✅ **NEW** | Server-side FIFO queue in `parse-agnes.js` with 3s gap between requests (= 20 RPM); concurrent requests are enqueued not rejected |
| Add Redis-like cache for hot queries | 🟢 Low | 4h | Reduce MongoDB load | ✅ Pre-existing | In-memory `cache.js` already deployed: 5-min TTL on list, 10-min on single item |
| Add Sentry/error tracking | 🟢 Low | 2h | Better error visibility | ⏳ Deferred → Phase 5 | Skip until 100+ users; guide at `DOCS/SENTRY_SETUP_GUIDE.md` |
| Add MongoDB compound indexes | 🟡 Medium | 30m | Faster DB queries at scale | ✅ **NEW** | Added indexes on `messages(conversationId+createdAt)`, `conversations(participants+updatedAt)`, `portfolios(email)`, `user_reports`, `ads`, `analytics_events` |
| Add pagination to message endpoints | 🟡 Medium | 1h | Prevent unbounded queries | ✅ **NEW** | `/messages/:conversationId` paginated (max 100/page), `/messages/user/:email` paginated (max 50/page) |

### Phase 5: Scaling (Week of August 10)
| Task | Priority | Effort | Impact | Status | Notes |
|------|----------|--------|--------|--------|-------|
| Upgrade Render to Starter ($7/mo) | 🟡 Medium | 1h | 2x RAM, dedicated CPU | ⏳ User decision — defer for now | Skip until free-tier limits hit |
| Migrate B2C payouts to production | 🔴 High | 8h | Real money transfers | ⏳ Pending | Requires M-PESA production credentials |
| Add webhook signature verification | 🔴 High | 4h | M-PESA security | ✅ Sufficient already | Current CheckoutRequestID cross-check + amount validation is M-PESA's recommended approach |
| Implement analytics dashboard | 🟢 Low | 6h | Track conversions, revenue | ⏳ Pending | Low priority vs. error tracking |

### Phase 4b: Error Tracking (Week of July 23) ✅ READY
| Task | Priority | Effort | Impact | Status | Guide |
|------|----------|--------|--------|--------|-------|
| Add Sentry to frontend + backend | 🟢 Low | 2h | Structured error visibility | ⏳ Ready → Implement | `DOCS/SENTRY_SETUP_GUIDE.md` |

## 4b. Agnes AI Integration Notes

### API Details
- **Base URL:** `https://apihub.agnes-ai.com/v1`
- **Model:** `agnes-2.0-flash`
- **Context Window:** 256K
- **Max Output:** 64K
- **Free Tier:** 20 requests/minute, unlimited global access
- **Compatibility:** OpenAI SDK drop-in replacement

### Environment Variables
```bash
# For Agnes AI (OpenAI-compatible)
OPENAI_API_KEY=your_agnes_key
OPENAI_BASE_URL=https://apihub.agnes-ai.com/v1
OPENAI_MODEL=agnes-2.0-flash
```

### Switching Code (Backend)
Current Gemini implementation in `backend/src/routes/admin.js`:
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
```

Agnes AI equivalent (OpenAI-compatible):
```javascript
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.AGNES_API_KEY,
  baseURL: "https://apihub.agnes-ai.com/v1"
});
const response = await openai.chat.completions.create({
  model: "agnes-2.0-flash",
  messages: [{ role: "user", content: prompt }],
  response_format: { type: "json_object" }
});
```

### Testing Strategy
1. Take 10-20 real "Post With Us" submissions
2. Parse with both Gemini and Agnes AI
3. Diff JSON output for quality comparison
4. If quality matches, switch production to Agnes AI

---

## 5. Monitoring & Observability

### Current Monitoring
- ✅ Console logs for email sends, payment callbacks
- ✅ Error handling in all API routes
- ⚠️ No structured logging (use `winston` or `pino`)
- ⚠️ No uptime monitoring

### Recommended Free Tools
| Tool | Purpose | Free Limit |
|------|---------|------------|
| **UptimeRobot** | Uptime monitoring | 50 monitors |
| **Sentry** | Error tracking | 5K errors/month |
| **MongoDB Atlas Metrics** | DB performance | Built-in |
| **Render Dashboard** | Backend health | Built-in |
| **Vercel Analytics** | Frontend performance | Built-in |

---

## 6. Security Checklist

### Current
- ✅ Helmet.js security headers
- ✅ CORS whitelist with dynamic Vercel preview support
- ✅ Rate limiting on API routes (1000 req/15min)
- ✅ Admin login brute-force protection (5 attempts/15min)
- ✅ Escrow amount validation (min KES 100)
- ✅ M-PESA callback CheckoutRequestID verification
- ✅ Image magic byte validation
- ✅ JWT token auth for admin
- ✅ Query param string casting prevents NoSQL operator injection (`opportunities.js`)
- ✅ Search input 100-char limit + regex escape prevents ReDoS
- ✅ File upload size limits via multer (5MB ✅)
- ✅ Phone number format validation for application forms (`/^2547\d{8}$/`)

### Gaps
- ⚠️ No input sanitization on contact/submission forms (raw text sent to email APIs)
- ⚠️ No CSRF protection on POST endpoints
- ⚠️ No API key rotation policy
- ⚠️ No audit log for admin actions
- ⚠️ No HTML escaping on user content stored in DB (XSS risk when rendered)
- ⚠️ No centralized input validation middleware — ad-hoc checks per route
- ⚠️ Inconsistent error response structures across route files

---

## 6b. Admin Data Communication & Interoperability Audit

> **Audit Date:** July 23, 2026  
> **Context:** After fixing chat oversight names display, we identified broader gaps in how admin sees and connects data across the platform.

### 6b.1 Current Data Silos in Admin Dashboard

| Collection | What Admin Sees | What's Missing | Connection Gap |
|------------|-----------------|----------------|----------------|
| `opportunities` | Title, category, description, views, clicks | — | Base entity |
| `conversations` | `gigId`, `participants[]`, `status`, `createdAt`, `updatedAt` | No explicit `opportunityId`, no names | ❌ `gigId` ≠ `{ id }` field format |
| `messages` | `conversationId`, `senderEmail`, `receiverEmail`, `content` | No `senderName` | ❌ Emails only, no human-readable names |
| `applications` | `applicantEmail`, `opportunityId`, status | No `applicantName`, no payment flow visibility | ⚠️ Not visible in admin at all currently |
| `portfolios` | `name`, `bio`, `links`, `email` | Not queried by admin routes | ❌ Names never resolved in conversation context |
| `subscribers` | `email`, `name`, `interests`, `unsubscribed` | Separate from applications/conversations | ⚠️ Same user may be subscriber AND applicant AND chat participant |
| `transactions` | `amount`, `status`, `checkoutRequestId`, `conversationId`, `opportunityId` | No `contributorName` or `contributorPhone` in all types | ❌ Phone only on `escrow` type |
| `pending_opportunities` | Full submission data including `reporter.name` | Lost after approval | ⚠️ No pointer back to approved version |
| `user_reports` | `reportedUser`, `reportedBy`, `reason`, `details` | No linked conversation or opportunity | ❌ Disconnected from chat/dispute system |

### 6b.2 Critical Identifiers Mismatch

The root cause of "Unknown Opportunity" in chat oversight was this ID mismatch:

```javascript
// Conversations store gigId as STRING (opportunity id field value, e.g. "pub-1234567890")
{ gigId: "pub-1690000000000", opportunityId: undefined }

// Opportunities collection has TWO ID fields:
{ id: "pub-1690000000000", _id: ObjectId("...") }

// Admin route was querying ONLY by { id: c.opportunityId } 
// But c.opportunityId was undefined → 0 matches → "Unknown Opportunity"
```

**Fix Applied (July 23):** Chat oversight now queries by BOTH `gigId` AND `opportunityId`, and also tries `_id` ObjectId lookup.

**Remaining Mismatches:**

| Relationship | Stored As | Expected As | Fix Needed |
|-------------|-----------|-------------|------------|
| Application → Opportunity | `opportunityId` = string `"pub-..."` | `{ id }` field | ✅ Consistent |
| Conversation → Opportunity | `gigId` = string OR ObjectId | `{ id }` field | ⚠️ Hybrid — must check both |
| Transaction → Conversation | `conversationId` = string | `conversations._id` | ✅ Consistent |
| Transaction → Opportunity | `opportunityId` = string | `{ id }` field | ✅ Consistent |
| Message → Conversation | `conversationId` = ObjectId string | `conversations._id` | ✅ Consistent |

### 6b.3 Data Flow Map: End-to-End User Journey

```
1. User subscribes → subscribers(email, name, interests)
                    ↓
2. User finds opportunity → opportunities(id, title, category, views++)
                            ↓
3. User applies → applications(applicantEmail, opportunityId, status)
                 → transactions(type: escrow, phone, amount, opportunityId, status)
                            ↓
4. Poster approves → conversations(gigId, participants[], status: "pending")
                    → messages(senderEmail, receiverEmail, content)
                            ↓
5. Escrow funded → transactions(status: "completed", type: escrow)
                 → conversations(status: "hired")
                            ↓
6. Job delivered → conversations(status: "completed")
                 → transactions(type: payout/B2C, amount)
                            ↓
7. Approved or disputed → conversations(status: "approved" | "disputed")
                          → transactions(type: "payment" | "crowdfund_refund")
```

**Admin Pain Points:**
- Steps 3→4→5 create three different `opportunityId` references that may use different formats
- Step 4 uses `gigId` instead of `opportunityId` — causes lookup failures
- Step 6 creates a transaction linked by `conversationId` but admin can't trace back to the `application` that initiated it
- `senderName` was never stored in conversations or messages — names had to be derived from email

### 6b.4 Recommended New Admin Views

#### A. Conversation Detail Page
Currently admin can see dispute chat logs but has NO dedicated conversation detail view for normal chats.

```javascript
// GET /api/admin/conversations/:convId
// Returns:
{
  conversation: { _id, gigId, opportunityId, status, participants[], createdAt, updatedAt },
  enriched: { opportunityTitle, posterName, applicantName, posterEmail, applicantEmail },
  messages: [{ senderName, senderEmail, content, createdAt, isEdited, replyTo }],
  relatedApplication: { _id, status, applicantData },
  relatedTransactions: [{ type, amount, status, createdAt }]
}
```

**Priority:** 🔴 High | **Effort:** 3h | **Impact:** Full arbitration capability

#### B. Application Tracker
Admin currently has ZERO visibility into the applications pipeline.

```javascript
// GET /api/admin/applications?status=pending|approved|paid|all
// Returns all applications with opportunity title, applicant name, escrow status
```

**Priority:** 🟡 Medium | **Effort:** 2h | **Impact:** Monitor job flow health, find stuck applications

#### C. User Activity Timeline
Cross-reference a user's entire journey across all collections.

```javascript
// GET /api/admin/user-timeline/:email
// Returns:
{
  profile: { ...portfolio data },
  subscriptions: [active/subscribed],
  applications: [{ opportunityTitle, status, date }],
  conversations: [{ opportunityTitle, role: 'poster'|'applicant', status, lastActive }],
  transactions: [{ type, amount, status, date }],
  reportsFiled: [...],
  reportsAgainst: [...]
}
```

**Priority:** 🟢 Low | **Effort:** 4h | **Impact:** Deep investigation capability for disputes/fraud

#### D. Revenue Reconciliation Dashboard
Current transactions tab shows raw data but no reconciliation view.

```javascript
// GET /api/admin/reconciliation
// Returns:
{
  totalEscrowDeposited: X,
  totalB2CPaidOut: Y,
  pendingDisputesAmount: Z,
  reconcilableBalance: X - Y - Z,
  platformFeesEarned: floor((X * 0.95) * 0.05),
  mpesaFeesPaid: floor((X * 0.95) * 0.02)
}
```

**Priority:** 🟡 Medium | **Effort:** 2h | **Impact:** Financial accuracy

### 6b.5 Data Collection Improvements Needed in Routes

| Route | Field to Add | Why | Priority |
|-------|-------------|-----|----------|
| `POST /messages` (done ✅) | Store `applicantName`, `posterName`, `opportunityId` | Names for disputes | ✅ Done |
| `POST /messages` | Resolve name from `portfolios` on every message | Future-proof names | 🟡 Medium |
| `POST /opportunities/:id/apply` | Store `applicantName` alongside `applicantEmail` | Names without email-only fallback | 🟡 Medium |
| `POST /payments/deposit` | Store `contributorName` in transaction | Trace deposits back to users | 🟡 Medium |
| `GET /admin/chat-oversight` | Resolve `gigId` ↔ `opportunityId` | Show real titles | ✅ Done |
| `GET /admin/chat-oversight` | Derive names from `participants` emails | Display names immediately | ✅ Done |
| `POST /admin/approve/:id` | Copy `pending_opportunities.reporter.*` to `opportunities` | Attribution tracking | 🟢 Low |
| `GET /admin/applications` | Join with `opportunities` for title + `portfolios` for name | Full pipeline view | 🟡 Medium |
| `POST /payments/crowdfund` | Store `contributorPhone` in all crowdfund transactions | Refund capability | 🟡 Medium |

### 6b.6 Cross-Collection Index Recommendations

```javascript
// Messages - fast retrieval per conversation
db.messages.createIndex({ conversationId: 1, createdAt: -1 })

// Conversations - find by opportunity
db.conversations.createIndex({ gigId: 1, status: 1 })

// Applications - filter by opportunity and status
db.applications.createIndex({ opportunityId: 1, status: 1 })

// Applications - find by applicant
db.applications.createIndex({ applicantEmail: 1 })

// Transactions - trace by opportunity
db.transactions.createIndex({ opportunityId: 1, createdAt: -1 })

// Transactions - trace by conversation
db.transactions.createIndex({ conversationId: 1 })

// Portfolios - email lookup (existing)
db.portfolios.createIndex({ email: 1 })
```

### 6b.7 Standardized Entity Reference Fields

To prevent future mismatches, enforce these conventions across ALL routes:

```
Opportunity Reference: always use the string { id } field (e.g. "pub-1234567890")
Conversation Reference: use _id (ObjectId), stringified in API responses
Transaction Reference: use checkoutRequestId (M-PESA) OR generated TxnID
Message Reference: use _id (ObjectId)
Portfolio/Subscriber: always query by lowercase(email)
```

**Rule:** When storing a reference to an opportunity, ALWAYS store the string `{ id }` value — never the ObjectId. This means:
- `conversations.gigId` should be normalized to always match `opportunities.id`
- `transactions.opportunityId` already follows this convention ✅
- `applications.opportunityId` already follows this convention ✅

---

## 7. Production Hardening Standards

> **Audit Date:** July 23, 2026  
> **Status:** Planning phase — implementing the doable items first

---

### 7.1 Standardized API Response Wrapper

**Problem:** Three different response patterns found across route files:
- `{ data, total, page, pages }` — opportunities list, messages
- `{ success: true, message: "..." }` — messages actions
- `{ error: "..." }` — only on failure, no `success: false` on errors
- Admin endpoints return raw stats directly without any wrapper

**Solution:** Create a unified response middleware.

```javascript
// backend/src/middleware/responses.js
export function jsonResponse(res, status, payload) {
  const base = { success: status < 400, timestamp: new Date().toISOString() };
  return res.status(status).json({ ...base, ...payload });
}

export function err(res, status, message) {
  return jsonResponse(res, status, { error: message });
}

export function ok(res, data) {
  return jsonResponse(res, 200, { data });
}

export function created(res, data) {
  return jsonResponse(res, 201, { data });
}
```

**Apply to all route files.** Example migration:
```javascript
// Before
res.json({ data, total, page, pages });

// After
ok(res, { data, total, page, pages });
```

**Priority:** 🟡 Medium | **Effort:** 2h | **Impact:** Consistent client-side parsing

---

### 7.2 Input Validation Middleware

**Problem:** No centralized validation — each route does ad-hoc checks or skips them entirely.

**Solution:** Use `zod` for schema-based validation as Express middleware.

```bash
npm install zod
```

```javascript
// backend/src/middleware/validate.js
import { z } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.validatedData = schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: err.errors?.map(e => `${e.path}: ${e.message}`) 
      });
    }
  };
}

// Usage in routes:
import { contactFormSchema } from '../schemas/contact.js';
router.post('/contact', validate(contactFormSchema), (req, res) => { ... });
```

**Initial Schemas to Create:**
| Schema | Fields Validated | Location |
|--------|-----------------|----------|
| `contactFormSchema` | name, email, subject, message | `public.js` /contact endpoint |
| `submitOpportunitySchema` | opportunity + reporter fields | `public.js` /submit-opportunity |
| `applicationSchema` | email, opportunity-specific fields | `public.js` /opportunities/:id/apply |
| `reportFormSchema` | reason, details | `public.js` /report-opportunity |
| `orgRequestSchema` | name, organization, email, telephone, description | `public.js` /organizations/request |

**Also add:** Auto-trim strings, strip HTML tags from free-text before storage.

**Priority:** 🔴 High | **Effort:** 3h | **Impact:** Prevents injection, ensures data quality

---

### 7.3 Admin Action Audit Log

**Problem:** No record of who approved/rejected what and when. Cannot track malicious admin activity.

**Solution:** Add `audit_logs` collection with append-only writes.

```javascript
// backend/src/middleware/auditLog.js
import { getDB } from '../config/database.js';

export async function auditLog(req, action, details = {}) {
  try {
    const db = await getDB();
    const logEntry = {
      action,                    // 'approve_opportunity', 'reject_opportunity', 'send_digest', etc.
      actor: req.admin?.adminKey || 'unknown',
      ip: req.ip || req.headers['x-forwarded-for'],
      target: details.targetId || null,
      changes: details.changes || {},
      timestamp: new Date(),
      _appendOnly: true          // flag for cleanup jobs
    };
    await db.collection('audit_logs').insertOne(logEntry);
  } catch (err) {
    console.error('Audit log write failed:', err.message);
    // Never fail the main request because audit logging failed
  }
}
```

**Admin actions to log:**
| Action | When Logged |
|--------|-------------|
| `approve_opportunity` | POST /admin/approve/:id |
| `reject_opportunity` | POST /admin/reject/:id |
| `send_digest` | POST /admin/send-digest |
| `send_personalized_digest` | POST /admin/send-personalized-digest |
| `send_broadcast` | POST /admin/send-seangapo-broadcast, /send-yesist-broadcast |
| `upsert_opportunities` | POST /admin/upsert-opportunities |
| `resolve_report` | POST /admin/reports/:id/resolve |
| `user_report_judgment` | POST /admin/user-reports/:id/judgment |
| `approve_org_request` | POST /admin/organization-requests/approve/:id |
| `reject_org_request` | POST /admin/organization-requests/reject/:id |
| `delete_organization` | DELETE /admin/organizations/:email |

**Display:** New "Audit" tab in AdminDashboard showing recent logs with filters.

**Priority:** 🟡 Medium | **Effort:** 2h | **Impact:** Accountability, compliance

---

### 7.4 Structured Logging Setup

**Problem:** All logs use `console.log/error` — unstructured, hard to filter, impossible to forward to Sentry.

**Solution:** Add `pino` logger with standard levels.

```bash
npm install pino pino-http
```

```javascript
// backend/src/lib/logger.js
import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' } 
    : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() })
  }
});

// HTTP request logging middleware
import pinoHttp from 'pino-http';
app.use(pinoHttp({ logger }));
```

**Replace pattern across all route files:**
```javascript
// Before
console.log('✅ Connected to MongoDB');
console.error('❌ send-digest error:', error);

// After
logger.info('Connected to MongoDB');
logger.error({ err: error }, 'send-digest error');
```

**Priority:** 🟢 Low | **Effort:** 2h | **Impact:** Better debugging, Sentry-ready

---

### 7.5 Service Health Check Endpoints

**Problem:** `/api/health` only says "Server is running." No visibility into downstream services.

**Solution:** Add detailed health check for monitoring tools.

```javascript
// GET /api/health-detailed
// Returns:
// {
//   status: "healthy" | "degraded" | "unhealthy",
//   uptime: "1h 23m",
//   services: {
//     mongodb: "connected" | "disconnected" | "error: timeout",
//     email: "configured" | "not configured",
//     mpesa: "sandbox" | "production" | "error: key missing",
//     cache: { hits: 1234, misses: 56, hitRate: 0.96 }
//   },
//   timestamp: "2026-07-23T00:00:00.000Z"
// }
```

**Usage:** Point UptimeRobot to this endpoint. Alert if `mongodb` or `email` shows error state.

**Priority:** 🟢 Low | **Effort:** 1h | **Impact:** Proactive monitoring

---

### 7.6 N+1 Query Optimization

**Problem:** Chat oversight endpoint (`GET /admin/chat-oversight`) calls `countDocuments` inside a loop — one query per conversation.

**Solution:** Replace with MongoDB aggregation pipeline.

```javascript
// Before (N queries):
for (const conv of conversations) {
  const msgCount = await db.collection('messages').countDocuments({ conversationId: conv._id });
}

// After (1 query):
const pipeline = [
  { $match: { conversationId: { $in: conversationIds } } },
  { $group: { _id: "$conversationId", count: { $sum: 1 } } }
];
const counts = await db.collection('messages').aggregate(pipeline).toArray();
```

**Priority:** 🟢 Low | **Effort:** 30m | **Impact:** ~80% faster for 10+ conversations

---

### 7.7 Silent Error Swallowing

**Problem:** Several routes use `.catch(() => {})` which hides real errors:
- `opportunities.js:92` — view count increment silently fails
- `admin.js:750` — new opportunity alert email fires-and-forgets
- `messages.js:180` — message notification email fires-and-forgets
- `public.js:619-626` — submission notification emails fire-and-forget

**Assessment:** Email sends in background are fine as-is (they shouldn't block the response). But DB operations that appear to succeed silently are problematic.

**Fix:** Only suppress expected errors:
```javascript
// Before
db.collection('opportunities').updateOne(...).catch(() => {});

// After
db.collection('opportunities').updateOne(...).catch(err => {
  logger.warn({ err }, 'View count increment failed for opportunity');
});
```

**Priority:** 🟢 Low | **Effort:** 30m | **Impact:** Visibility into silent failures

---

### Implementation Priority Matrix

| Task | Priority | Effort | Impact | Can Be Done Now? |
|------|----------|--------|--------|------------------|
| 7.1 Standardized API responses | 🟡 Medium | 2h | Medium | ✅ Yes — pure refactor |
| 7.2 Input validation with zod | 🔴 High | 3h | High | ✅ Yes — high value |
| 7.3 Admin audit log | 🟡 Medium | 2h | High | ✅ Yes — append-only, zero breaking changes |
| 7.4 Structured logging (pino) | 🟢 Low | 2h | Medium | ⏳ Needs npm install |
| 7.5 Health check endpoints | 🟢 Low | 1h | Medium | ✅ Yes — just adds routes |
| 7.6 N+1 query fix | 🟢 Low | 30m | Low | ✅ Yes — single file change |
| 7.7 Silent error fixes | 🟢 Low | 30m | Low | ✅ Yes — replace .catch(()->{}) |

**Recommended order:** 7.2 → 7.3 → 7.1 → 7.5 → 7.6 → 7.7 → 7.4

---

## Appendix: Quick MongoDB Queries

### Find the 50 KES payment
```javascript
db.transactions.find({ amount: 50 }).sort({ createdAt: -1 }).limit(5)
```

### All escrow transactions this week
```javascript
db.transactions.find({
  type: 'escrow',
  createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
}).sort({ createdAt: -1 })
```

### Transactions by status
```javascript
db.transactions.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
  { $sort: { count: -1 } }
])
```

### Slow queries (MongoDB profiling)
```javascript
db.setProfilingLevel(1, { slowOpThresholdMs: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(20)