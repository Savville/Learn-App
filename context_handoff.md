# Context Handoff: Learn Opportunities Platform

**Purpose:** This document provides full context for another AI agent to pick up development seamlessly.

## 1. Tech Stack & Architecture
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, `shadcn/ui` components.
- **Backend:** Node.js, Express, MongoDB (native driver, no Mongoose).
- **Environment:** Windows OS. Running local dev servers via `npm run dev` (Frontend on port 5173/3000, Backend on port 5000).

## 2. Recently Implemented Features (Current Session)

We successfully architected and implemented a **Manual Payout Verification System** for crowdfunded projects and student initiatives to replace automated Daraja B2C payouts for creators.

### A. Creator Workflow (Poster Dashboard)
- **File Modified:** `src/components/PosterDashboard.tsx`
- **Feature:** Creators can submit structured expense claims for their funded projects.
- **Data Captured:** Expense Type (vendor/contingency), Vendor Name, Reason, Amount, Paybill/Account Number, and Receipt Evidence (uploaded as Base64).
- **Urgent UI Banner:** Added an "Urgent Payment" warning instructing creators to call the admin directly for time-sensitive vendor payments, but only *after* submitting the formal request for audit purposes.
- **Types:** Updated the `Post` interface to include `payoutRequests?: any[]`.

### B. Admin Ledger (Admin Dashboard)
- **File Modified:** `src/pages/admin/AdminDashboard.tsx`
- **Feature:** A "Crowdfund Ledger" tab allows the admin to view all pending payout requests submitted by creators.
- **Workflow:** The admin reviews the receipt, manually disperses the funds via M-PESA, and clicks a "Mark as Paid" button to reconcile the UI.

### C. Backend API Endpoints
- **Public Routes (`backend/src/routes/public.js`):** 
  - `POST /api/public/me/posts/:id/payout-request` -> Validates ownership and pushes the request into the opportunity's `payoutRequests` array.
- **Admin Routes (`backend/src/routes/admin.js`):**
  - `PUT /api/admin/crowdfund/payout-requests/:postId/:requestId/mark-paid` -> Allows admins to mark specific requests as completed.
  - `GET /api/admin/crowdfund/ledger` -> Fetches all opportunities with pending payout requests.

## 3. Current System State & Known Issues

### The "Admin Ownership" Issue
- The user created three new crowdfund projects (UHPC, AGRO, etc.) using the **Admin Dashboard** rather than the Poster Dashboard. 
- Because they were created "AS ADMIN", they lack a standard `reporter.email` mapping to a user account, meaning the user cannot view them in their standard Poster Dashboard (to view applicants or submit payout requests).
- **Attempted Fix:** We attempted to write a direct MongoDB script (`backend/update_ownership_direct.js`) to reassign these projects to `ochiwilliampotieno@gmail.com`.
- **Blocker:** The direct script failed with a `MongoServerSelectionError` (ETIMEDOUT) because the user's current dynamic IP is not whitelisted in MongoDB Atlas. The existing backend server (running for 3+ hours) still has an active connection and works perfectly, but *new* external Node processes are blocked by the firewall.

### The Temporary Workaround Implemented
- To bypass the Atlas firewall, a temporary route `GET /api/public/fix-ownership` was injected directly into `backend/src/routes/public.js` (Lines 1431-1456).
- **Next Step Required:** The backend `nodemon` process did not auto-restart to pick up this new route. The next AI/User needs to **restart the backend server** (Ctrl+C, then `npm run dev`) and make a GET request to `http://localhost:5000/api/public/fix-ownership` to execute the database update using the already-whitelisted backend environment.

## 4. Next Priorities for the Next AI
1. **Execute Ownership Transfer:** Instruct the user to restart their backend terminal and hit the `/fix-ownership` route to transfer the 3 projects to their email.
2. **Remove Temporary Route:** Once successful, remove the `/fix-ownership` route from `public.js`.
3. **Receipt Storage Refactor:** Currently, receipts are handled as Base64 strings. This needs to be migrated to AWS S3 or Cloudinary to prevent MongoDB document size limits (16MB) from being exceeded if a creator uploads many large receipts.
4. **Admin Notifications:** Implement an email notification to the Admin (via Resend) whenever a creator submits a new Payout Request, reducing the need for constant manual dashboard polling.
