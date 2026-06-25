# Opportunity Operating Models

This document outlines the operational models for the different categories of opportunities available on the platform, specifically detailing how payments, communication, and security are handled for each.

## Platform Categories Overview

Our platform currently supports 7 primary categories of opportunities, paired with 4 types of compensation (`Paid`, `Equity`, `Stipend`, `N/A`). Because each category has different legal and financial requirements, the platform automatically adjusts the user interface and security rules based on the opportunity type.

### Operating Models Summary Table

| Category / Type | Compensation | Payment Model | Escrow Required? | Chat Auto-Censor | Workflow & Operations |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Gigs & Paid Jobs** | `Paid` | **In-Platform Escrow** | ✅ Yes | 🔒 Active | Employer funds escrow (M-Pesa). Freelancer delivers job. Employer approves to release funds. Strict auto-censor prevents sharing personal contacts to avoid off-platform scams. |
| **Partnerships** | `Equity` / `N/A` | **Off-Platform Agreement** | ❌ No | 🔓 Disabled | Direct communication allowed. Escrow button is hidden. Auto-censor is disabled to allow founders/partners to share emails and schedule meetings freely. |
| **Internships** | `Stipend` / `Paid` | **External Payroll** | ❌ No | 🔒 Active | Standard job application model. Communication happens on-platform, but payment is handled directly by the company's payroll system. |
| **Grants** | `N/A` | **External Disbursement** | ❌ No | 🔓 Disabled | Institutional funding. Applications usually redirected to the funding organization's external portal. |
| **Scholarships** | `N/A` | **Institutional** | ❌ No | 🔓 Disabled | Academic funding. Applications and payments are managed entirely by the academic institution. |
| **Challenges** | `Award` / `Paid` | **Direct Payout** | ❌ No | 🔒 Active | Hackathons or competitions. Organizers handle prize distribution externally. |
| **Call For Papers** | `N/A` | **Academic Credit** | ❌ No | 🔓 Disabled | Purely academic submissions. No financial transactions take place. |

---

## Detailed Workflows

### 1. The Escrow Model (Gigs & Paid Jobs)
This is the platform's primary monetization engine designed to protect both the freelancer and the employer.
*   **Stage 1 (Pending):** Applicant submits a pitch. The conversation is locked.
*   **Stage 2 (Active):** Employer unlocks the chat to interview the applicant.
*   **Stage 3 (Hired):** Employer clicks **"Fund Escrow & Hire"**. Money is securely locked in the platform's account.
*   **Stage 4 (Completed):** Freelancer clicks **"Deliver Job"** when the work is done.
*   **Stage 5 (Approved):** Employer clicks **"Approve & Release"**. Funds are disbursed to the freelancer's wallet.
*   **Security:** To prevent revenue leakage, the chat uses an aggressive auto-censor (Regex) to redact phone numbers, emails, and phrases like "pay me via M-Pesa".

### 2. The Equity / Partnership Model
When an opportunity is flagged as a `Partnership` or has `Equity` compensation, the platform fundamentally changes how the chat works:
*   **Escrow is Disabled:** The "Fund Escrow" button is completely hidden from the UI.
*   **Unrestricted Communication:** The auto-censor is completely turned off. We recognize that business partners and co-founders *need* to exchange phone numbers, emails, and external links to sign NDAs or arrange in-person meetings.

### 3. The Institutional Model (Scholarships, Grants, CallForPapers)
These models act primarily as a **Discovery Engine**.
*   The platform serves as an aggregator to bring traffic and visibility.
*   Users discover the opportunity on our site but the actual application and financial disbursement happen on the host institution's infrastructure.
