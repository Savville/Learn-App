# Product Requirements Document (PRD)
## Learn Opportunities - Kenya University Student Focus

**Document Version**: 1.0  
**Date**: February 20, 2026  
**Status**: In Development

---

## Executive Summary

Refocus the Learn Opportunities platform to serve **Kenya University Students** with student-specific opportunities. The platform will emphasize local Kenya projects while maintaining a curated selection of high-value academic and professional development opportunities.

---

## 1. Target Audience

- **Primary**: Kenya University Students (undergraduate & postgraduate)
- **Secondary**: Young professionals in Kenya pursuing further education
- **Focus**: Students seeking skill development, academic advancement, and career preparation

---

## 2. Opportunity Categories

### Categories to Include ✅

1. **Call for Papers & Abstracts**
   - Academic conferences and journals seeking student submissions
   - Research publication opportunities
   - Thesis and dissertation showcases
   - Student-led research exhibitions

2. **Internships**
   - Short-term (3-6 months) practical experience
   - Kenya-based organizations and international remote options
   - Paid and unpaid opportunities
   - Industry-specific placements

3. **Grants**
   - Research grants for student projects
   - Travel grants for conferences
   - Project funding for student initiatives
   - Academic research support

4. **Conferences**
   - Student-focused conferences
   - Networking events for young professionals
   - Workshops and seminars
   - Virtual and in-person events (Kenya-based priority)

5. **Scholarships**
   - Full and partial scholarships
   - Tuition support
   - Postgraduate awards
   - Living stipends

### Categories to Remove ❌

- **Jobs**: Most full-time positions are not student-oriented
- **Fellowships**: Limited relevance for primary student audience

---

## 3. Platform Features & Components

### 3.1 Core Opportunities Features

**Search & Filter**
- Filter by opportunity type (Call for Papers, Internship, Grant, Conference, Scholarship)
- Filter by location (Kenya-based, East Africa, International)
- Filter by level (Undergrad, Postgrad, All)
- Filter by deadline proximity
- Keyword search by field of study

**Opportunity Cards** (`OpportunityCard.tsx`)
- Display opportunity type with visual indicators
- Show deadline with urgency color coding (Red: <7 days, Orange: <30 days, Green: >30 days)
- Display location (priority badge for Kenya-based)
- Brief description (50-100 words)
- "Apply Now" / "Learn More" CTA button
- Quick eligibility snapshot

**Detailed View** (`OpportunityDetails.tsx`)
- Full opportunity description
- Eligibility requirements
- Application deadline with countdown
- Key benefits/awards
- Contact information
- Direct application link
- Related opportunities sidebar

### 3.2 Navigation & Categorization

**Categories Component** (`Categories.tsx`)
- **New Categories Display**:
  - 📝 Call for Papers & Abstracts
  - 💼 Internships
  - 💰 Grants
  - 📅 Conferences
  - 📚 Scholarships

**Color Scheme** (Updated)
- Call for Papers: Indigo/Purple (#6366f1)
- Internships: Teal (#14b8a6)
- Grants: Gold (#eab308)
- Conferences: Rose (#f43f5e)
- Scholarships: Green (#22c55e)

### 3.3 Data Structure

**Opportunities Data** (`src/data/opportunities.ts`)

Each opportunity object should include:
```typescript
{
  id: string;
  title: string;
  category: 'CallForPapers' | 'Internship' | 'Grant' | 'Conference' | 'Scholarship';
  description: string;
  fullDescription: string;
  location: string; // 'Kenya', 'East Africa', 'International'
  isKenyaBased: boolean;
  deadline: string; // ISO date format
  eligibility: {
    educationLevel: 'UnderGrad' | 'PostGrad' | 'Both';
    fieldOfStudy?: string[];
    requirements: string[];
  };
  benefits: string[];
  provider: string;
  applicationType: 'Online Form' | 'Email' | 'Platform Link';
  applicationLink: string;
  contactEmail?: string;
  estimatedBenefit?: string; // e.g., "KES 50,000 - 200,000"
  duration?: string; // for internships/conferences
  featured: boolean;
  dateAdded: string;
}
```

---

## 4. User Experience Enhancements

### 4.1 Home Page
- Hero section highlighting Kenya opportunities
- Feature "Trending This Week" with recently added opportunities
- Quick category selection for students
- Deadline urgency notifications

### 4.2 Opportunities Page
- Default filter: Show all student opportunities
- Sticky filter bar with active filters displayed
- "Apply Soon" deadline alerts (remaining time visible)
- Save/bookmark functionality for future reference
- Share opportunity link feature

### 4.3 Notification System
- Email newsletter for new Kenya-based opportunities
- Deadline reminders (7 days, 3 days before deadline)
- By-category subscriptions

---

## 5. Content Guidelines

### Opportunity Curation Rules
- ✅ Must be explicitly open to Kenya university students
- ✅ Verify legitimacy and organizational credentials
- ✅ Include clear deadline and application process
- ✅ Must have recent update or posted date
- ❌ Exclude expired deadlines
- ❌ Exclude scams or predatory programs
- ❌ Exclude full-time permanent positions

### Deadline Management
- Review deadlines weekly
- Archive opportunities 2 weeks post-deadline
- Flag opportunities expiring within 7 days
- Implement automated deadline reminders

---

## 6. Implementation Phases

### Phase 1: Data Structure & Core Features
- [ ] Update data model in `opportunities.ts`
- [ ] Modify `Categories.tsx` to show 5 new categories
- [ ] Update category color scheme
- [ ] Implement new filter logic

### Phase 2: UI/UX Updates
- [ ] Update `OpportunityCard.tsx` with new category badges
- [ ] Enhance `OpportunityDetails.tsx` with Kenya-specific features
- [ ] Add deadline countdown timer
- [ ] Implement urgency color coding

### Phase 3: Content Management
- [ ] Populate system with initial 20-30 Kenya-focused opportunities
- [ ] Add cross-category opportunities (especially Call for Papers + Scholarship combos)
- [ ] Create content validation checklist

### Phase 4: Additional Features
- [ ] Set up Node.js + Express backend server
- [ ] Configure MongoDB database (Atlas cloud)
- [ ] Create admin API endpoints for content management
- [ ] Implement email subscription system (Gmail/SendGrid)
- [ ] Add email notification service (new opportunities & reminders)
- [ ] Build admin dashboard for analytics
- [ ] Implement ad management system
- [ ] Integrate frontend with backend APIs
- [ ] Analytics tracking for user interactions
- [ ] Deploy backend to Railway/Render

### Phase 5: Future Enhancements (Post-MVP)
- [ ] Application tracking dashboard for users
- [ ] Success stories from students who applied
- [ ] Partner organization profiles
- [ ] Community forum for opportunity discussions
- [ ] Opportunity recommendations based on student profile
- [ ] Curriculum vitae builder tool
- [ ] Interview preparation resources

---

## 7. Phase 4: Backend Architecture Details

### Backend Technology Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (Atlas cloud)
- **Email Service**: Nodemailer + Gmail/SendGrid
- **Deployment**: Railway or Render
- **Authentication**: API Key (admin only, no user login)

### Database Schema (MongoDB Collections)

#### Opportunities Collection
```
{
  _id: ObjectId,
  id: String,
  title: String,
  category: String (CallForPapers, Internship, Grant, Conference, Scholarship),
  description: String,
  deadline: Date,
  location: String,
  isKenyaBased: Boolean,
  eligibility: { educationLevel, fieldOfStudy[], requirements[] },
  benefits: String[],
  provider: String,
  applicationLink: String,
  contactEmail: String,
  estimatedBenefit: String,
  duration: String,
  featured: Boolean,
  dateAdded: Date,
  logoUrl: String,
  views: Number,
  clicks: Number
}
```

#### Subscribers Collection
```
{
  _id: ObjectId,
  email: String (unique),
  categories: String[] (optional preferences),
  allUpdates: Boolean,
  subscribedAt: Date,
  unsubscribed: Boolean
}
```

#### Analytics Collection
```
{
  _id: ObjectId,
  opportunityId: String,
  action: String (view, click, apply),
  timestamp: Date,
  userIP: String
}
```

#### Ads Collection
```
{
  _id: ObjectId,
  title: String,
  imageUrl: String,
  link: String,
  active: Boolean,
  createdAt: Date
}
```

#### Admin Collection
```
{
  _id: ObjectId,
  apiKey: String,
  email: String,
  permissions: String[],
  createdAt: Date
}
```

### Core API Endpoints

**Public Endpoints**:
- `GET /api/opportunities` - Fetch all with filters (category, level, location)
- `GET /api/opportunities/:id` - Fetch single opportunity detail
- `POST /api/subscribe` - Email subscription (body: email, categories, preferences)
- `POST /api/analytics/track` - Track views/clicks/applies
- `GET /api/ads/random` - Get random active ad

**Admin Endpoints** (requires API key):
- `POST /api/opportunities` - Create new opportunity
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity
- `GET /api/analytics/dashboard` - View stats and metrics
- `POST /api/ads` - Create ad
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad

### Email Services

**Automated Emails** (Nodemailer):
1. **Welcome Email** - On subscription confirmation
2. **New Opportunity Notification** - When new opportunity posted
3. **7-Day Reminder** - "Apply in 7 days!"
4. **3-Day Reminder** - "Last chance! Closes in 3 days"

**Scheduled Jobs**:
- Daily check for deadlines (7-day and 3-day reminders)
- Weekly digest to all subscribers

### Frontend Integration

**Changes to Frontend**:
- Create `src/services/api.ts` for API calls (axios)
- Update `Opportunities.tsx` to fetch from `/api/opportunities`
- Add `Newsletter.tsx` component with `/api/subscribe` endpoint
- Track analytics with `POST /api/analytics/track` on card clicks
- Display ads from `/api/ads/random` in hero carousel
- Create `src/admin/AdminDashboard.tsx` for content management
- Add `.env` with `VITE_API_URL=http://localhost:5000/api`

**New Dependencies**:
- `axios` - HTTP client
- `react-query` - Data fetching/caching (optional)

### Environment Configuration

**Backend .env**:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/learn_opportunities
ADMIN_API_KEY=secure_key_here
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_app_password
SENDGRID_API_KEY=key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5000
```

**Frontend .env**:
```
VITE_API_URL=http://localhost:5000/api
```

### Deployment Plan

1. **Backend Setup**: Create `/backend` folder with Express server
2. **Database**: Set up MongoDB Atlas cluster and collections
3. **API Development**: Build all endpoints and email services
4. **Testing**: Test all APIs with Postman
5. **Backend Deployment**: Deploy to Railway/Render (get live URL)
6. **Frontend Update**: Update API URL and redeploy
7. **Email Testing**: Send test notifications
8. **Analytics Verification**: Confirm tracking is working

---

## 8. Success Metrics

- Number of active opportunities in system
- Click-through rate to applications (target: >25%)
- Average time per opportunity page (target: >2 minutes)
- Successful application completions (qualitative)
- Newsletter subscription rate
- Return visitor percentage

---

## 8. Technical Considerations

- **Performance**: Filter operations must be responsive (<200ms)
- **SEO**: Ensure opportunity pages are search-engine optimized
- **Mobile**: Ensure 100% responsive design, especially for deadline viewing
- **Accessibility**: WCAG 2.1 AA compliance for all components
- **Data Updates**: Establish weekly update schedule for opportunities

---

## 9. Future Enhancements

- Application tracking dashboard for users
- Success stories from students who applied
- Partner organization profiles
- Community forum for opportunity discussions
- Opportunity recommendations based on student profile
- Curriculum vitae builder tool
- Interview preparation resources

---

## 10. Dependencies & Resources

- **Design System**: Existing Shadcn UI component library
- **Data Source**: Manual curation + partnership integrations
- **Tech Stack**: React + TypeScript + Vite (no new dependencies required)
- **Timeline**: 2-3 weeks for MVP

---

## Appendix: Opportunity Type Definitions

### Call for Papers & Abstracts
Academic and professional events seeking student contributions. Includes research paper submissions, poster presentations, and thesis showcases.

**Examples**: IEEE PowerAfrica Conference, Academic Journals, Thesis Expos

### Internships
Structured work experience programs lasting 3-12 months. Includes skill development, mentorship, and potential compensation.

**Examples**: Corporate internships, NGO programs, Research internships

### Grants
Financial awards for student projects, research, or learning initiatives. Non-repayable funds.

**Examples**: Research grants, Project funding, Travel grants

### Conferences
Events where students can present, learn, and network. Includes virtual and in-person participation.

**Examples**: Academic conferences, Professional networking events, Student summits

### Scholarships
Financial awards to support education and living expenses. Merit and need-based options.

**Examples**: Tuition scholarships, Postgraduate awards, Living stipends

---

**Document Owner**: Learn Opportunities Team  
**Last Updated**: February 20, 2026  
**Next Review**: March 20, 2026
