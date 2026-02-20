# Content Validation Checklist for Learn Opportunities

**Document Version**: 1.0  
**Created**: February 20, 2026  
**Review Cycle**: Weekly maintenance + Monthly audit  
**Owner**: Learn Opportunities Content Team

---

## Purpose

Ensure all opportunities in the Learn Opportunities platform meet quality standards, are legitimate, and serve Kenya University Students effectively. This checklist is mandatory before publishing any opportunity.

---

## Section A: Pre-Upload Validation

### A1. Eligibility Criteria

- [ ] **For Kenya Students**: Opportunity explicitly states it's open to Kenya university students (or East Africa with Kenya priority)
- [ ] **Student-Focused**: Internship, fellowship, or scholarship is designed for current students, NOT entry-level professionals
- [ ] **Not Permanent Job**: Not a full-time permanent employment position
- [ ] **Not Scam**: No red flags in organization background (check LinkedIn, website, news)
- [ ] **Not Duplicate**: Not already in system (check against current 26+ opportunities)

### A2. Deadline & Date Validation

- [ ] **Future Deadline**: Application deadline is at least 2 weeks in the future
- [ ] **Not Expired**: Not accepting applications for opportunities past deadline date
- [ ] **Clear Deadline**: Specific date provided (not vague like "rolling basis")
- [ ] **ISO Format**: Deadline in YYYY-MM-DD format
- [ ] **Recent Date Added**: `dateAdded` is current or within past week

### A3. Content Completeness Check

**Core Fields**
- [ ] Title: Clear and descriptive (under 80 characters)
- [ ] Description: 50-100 words, compelling and clear
- [ ] Full Description: 150-300 words with key details
- [ ] Provider: Organization name clearly stated
- [ ] Location: Specified (Kenya/East Africa/International)
- [ ] `isKenyaBased`: Boolean correctly set (true for Kenya-specific)

**Application Details**
- [ ] Application Link: Valid, active, and tested (works in last 24 hours)
- [ ] Application Type: One of (Online Form, Email, Platform Link)
- [ ] Contact Email: Provided where available
- [ ] Application Process: Clear instructions in full description

### A4. Data Structure Validation

Verify in opportunities.ts that each entry has:
- [ ] `id`: Unique string (no duplicates)
- [ ] `title`: String
- [ ] `category`: One of 5 types (CallForPapers, Internship, Grant, Conference, Scholarship)
- [ ] `description`: String
- [ ] `fullDescription`: String
- [ ] `deadline`: ISO date string (YYYY-MM-DD)
- [ ] `location`: String (Kenya/East Africa/International/specific city)
- [ ] `isKenyaBased`: Boolean
- [ ] `eligibility.educationLevel`: One of (UnderGrad, PostGrad, Both)
- [ ] `eligibility.requirements`: Array of strings (minimum 3-4 requirements)
- [ ] `eligibility.fieldOfStudy`: Optional array of relevant fields
- [ ] `benefits`: Array of strings (minimum 4-5 benefits)
- [ ] `applicationType`: One of 3 types
- [ ] `applicationLink`: Valid URL string
- [ ] `estimatedBenefit`: String with amount/description
- [ ] `duration`: String (for internships/conferences)
- [ ] `featured`: Boolean
- [ ] `dateAdded`: ISO date string
- [ ] `logoUrl`: Valid image URL

---

## Section B: Category-Specific Validation

### B1. Internships - Must Include
- [ ] Duration clearly stated (months/weeks)
- [ ] Paid/unpaid status clearly indicated
- [ ] Work arrangement (remote/on-site/hybrid)
- [ ] Skills to be gained
- [ ] Stipend/salary range if applicable
- [ ] Start date or application timeline

### B2. Grants - Must Include
- [ ] Funding amount/range specified
- [ ] Project type expected (research/innovation/social impact)
- [ ] Maximum project duration
- [ ] Funding disbursement timeline (when paid, how)
- [ ] Deliverables/reporting requirements

### B3. Call for Papers - Must Include
- [ ] Conference/journal name and date
- [ ] Paper/abstract format (length, format, language)
- [ ] Maximum word count/page limits
- [ ] Presentation format (poster/oral/virtual)
- [ ] Publication plan (journal/proceedings/website)
- [ ] Travel/accommodation support details

### B4. Scholarships - Must Include
- [ ] Scholarship amount/coverage type (tuition/living/both)
- [ ] Academic level (full degree/partial/specific year)
- [ ] Selection criteria (merit/need/other)
- [ ] Number of awards available
- [ ] Renewal conditions if multi-year
- [ ] Sponsor obligations (work requirement, service, etc.)

### B5. Conferences - Must Include
- [ ] Event dates clearly stated
- [ ] Location (venue name, city, or "virtual")
- [ ] Registration cost (free or amount in KES/USD)
- [ ] Whether accommodation/meals included
- [ ] Key topics/tracks/learning outcomes
- [ ] Confirmation it's student-accessible

---

## Section C: Content Quality Check

### C1. Writing & Clarity
- [ ] No spelling or grammatical errors (use spell-check)
- [ ] Language is professional and clear
- [ ] Jargon explained or avoided
- [ ] Content organized in logical sections
- [ ] Call-to-action is clear ("Apply Now", "Submit", "Register")

### C2. Accuracy Verification
- [ ] All dates cross-checked with source organization
- [ ] Application link tested and confirmed active
- [ ] Contact information verified (email/phone)
- [ ] Eligibility criteria match official requirements
- [ ] Benefits/compensation match official description
- [ ] No contradictions between description and fullDescription

### C3. Kenya-Specific Validation
- [ ] If `isKenyaBased: true`, must be explicitly for Kenya
- [ ] If International with Kenya students, clearly states Kenya are eligible
- [ ] Kenya context noted where relevant (timezone, language, visa requirements)
- [ ] No location bias against Kenyans (if fair opportunity)

---

## Section D: Organization Verification

### D1. Legitimacy Assessment
- [ ] Organization has legitimate website
- [ ] Website is professional and regularly updated
- [ ] Contact email/phone available on website
- [ ] Organization NOT on any global scam watchlist
- [ ] LinkedIn company page exists with followers
- [ ] Google search returns credible results

### D2. Track Record (if available)
- [ ] Previous opportunities from org exist in system (good sign)
- [ ] No complaints in news articles about this organization
- [ ] Student reviews online are positive (if program is established)
- [ ] Testimonials or case studies available

### D3. Application Safety Check
- [ ] Application link goes to official organization domain
- [ ] No suspicious redirects through 3rd-party sites
- [ ] HTTPS connection (secure, verified by browser)
- [ ] Does NOT ask for upfront payment (unless explicitly paid program fee)
- [ ] Does NOT ask for banking details in initial application
- [ ] No requests for unnecessary personal information

---

## Section E: Brand & Visual Assets

### E1. Logo/Image Validation
- [ ] Image is high quality (minimum 200x200px for web)
- [ ] Logo is current (not outdated design)
- [ ] Image displays correctly without errors
- [ ] File format optimized (JPEG, PNG, WebP)
- [ ] URL is persistent (won't break in future)
- [ ] No watermarks or promotional text on image

### E2. Image Sourcing
- [ ] Image is rights-free (Unsplash, Pexels OK)
- [ ] OR organization permission obtained
- [ ] OR official logo from organization used

---

## Section F: Final Approval Checklist

### Before Publishing to Production

- [ ] **All A-E sections completed and marked ✅**
- [ ] Reviewed by at least one team member (not original submitter)
- [ ] Data entry correct in opportunities.ts file
- [ ] Preview page displays correctly on website
- [ ] Links tested from live site
- [ ] Mobile view displays properly
- [ ] Filters work correctly (type, level, location, funding)
- [ ] Search finds opportunity by keywords
- [ ] Urgency badge displays correctly based on deadline
- [ ] Kenya badge shows for Kenya-based opportunities

### After Publishing (Post-Launch Verification)

- [ ] Opportunity visible in correct category filter
- [ ] Appears in search results
- [ ] Deadline urgency indicator shows correct status
- [ ] Related opportunities section works (if applicable)
- [ ] All links clickable and functional
- [ ] Monitor for broken links daily (first week)

---

## Section G: Weekly Maintenance Checks

**Every Monday - 15 minute review:**
- [ ] Check all opportunities with < 7 days deadline (mark urgent)
- [ ] Archive opportunities 2+ weeks past deadline
- [ ] Update featured opportunities (rotate promotions)
- [ ] Verify 5 random links remain active
- [ ] Check for any removed opportunities (check system vs. original list)

**Monthly Full Audit (1st of month):**
- [ ] Complete content audit of all 26+ opportunities
- [ ] Remove scams/illegitimate programs discovered
- [ ] Update outdated information
- [ ] Refresh featured opportunities for seasonality
- [ ] Generate content quality report
- [ ] Update `dateAdded` for refreshed listings

---

## Section H: Rejection Reasons

If rejecting an opportunity submission, mark the reason:

- [ ] **Expired Deadline** - Application closing date has passed
- [ ] **Invalid Link** - Application link broken or inactive
- [ ] **Not Student-Focused** - Designed for experienced professionals only
- [ ] **Permanent Position** - Full-time job, not student opportunity
- [ ] **Suspected Scam** - Organization verification failed
- [ ] **Duplicate** - Already in system with same opportunity
- [ ] **Incomplete Info** - Critical details missing
- [ ] **Location Mismatch** - Not open to Kenya students
- [ ] **Out of Scope** - Outside Learn Opportunities focus
- [ ] **Org Unverifiable** - Cannot confirm organization legitimacy

**Action**: Notify submitter with specific reason and request for resubmission if fixable.

---

## Section I: Validator Sign-Off

**Before Publishing: Complete this section**

| Field | Value |
|-------|-------|
| Opportunity ID | _____________ |
| Title | _____________ |
| Content Reviewer | _____________ |
| Date Reviewed | __/__/2026 |
| Review Status | ☐ Pass ☐ Reject |
| Rejection Reason (if applicable) | _____________ |
| Validator Signature | _____________ |
| Publisher Name | _____________ |
| Publish Date | __/__/2026 |

---

## Section J: Common Issues & Solutions

### Issue: Link works offline but breaks online
**Solution**: Test with multiple browsers and devices. Some links may have IP restrictions.

### Issue: Organization website is outdated
**Solution**: Contact organization directly. If no response in 2 days, mark for review.

### Issue: Deadline in past but opportunity still relevant
**Solution**: Confirm with organization if accepting rolling applications. If yes, update deadline to future date with note.

### Issue: Benefit amount seems too high/low
**Solution**: Verify against official source (job posting, official page). Trust official documentation.

### Issue: Multiple people have same opportunity
**Solution**: Check dates. Newer entry is correct. Archive or merge the older duplicate.

---

## Section K: Tips for Validators

✅ **DO:**
- Verify everything with official source
- Think critically about organization legitimacy
- Update outdated information
- Test all links before publishing
- Keep Kenya students' interests first

❌ **DON'T:**
- Publish unverified opportunities
- Trust organization just because they have website
- Assume rolling deadline if not stated
- Publish expired opportunities
- Ignore spelling/grammar errors

---

## Appendix: Verification Resources

**Organization Verification:**
- Google: Organization name + "scam" or "review"
- LinkedIn: Search company profile
- Better Business Bureau (BBB) - for international orgs
- News search: Recent news about organization

**Link Testing:**
- Copy link into browser address bar
- Check for HTTPS (secure connection)
- Does application form load?
- Can you start application without errors?

**Contact Verification:**
- Call or email organization directly
- Ask about opportunity
- Confirm deadline and requirements match our listing

---

**Document Version**: 1.0  
**Last Updated**: February 20, 2026  
**Next Review**: March 20, 2026  
**Contact**: Learn Opportunities Content Team
