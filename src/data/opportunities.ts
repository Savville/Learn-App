export interface FormField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'url' | 'number' | 'file';
  required: boolean;
  validation?: {
    maxLength?: number;
    numberOnly?: boolean;
  };
}

export interface Milestone {
  id: string;
  label: string;
  targetValue: number;
  unit: string;
  amount: number;
}

export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  amount: number;
  paidAmount?: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'disputed' | 'paid';
  submittedUrl?: string;
  submittedAt?: string;
  completedAt?: string;
  adminNote?: string;
  disputeReason?: string;
  disputeInitiatedBy?: 'poster' | 'freelancer';
  qualityLevel?: 'satisfactory' | 'partial' | 'unsatisfactory';
}

export interface QualityRule {
  level: 'satisfactory' | 'partial' | 'unsatisfactory';
  percentage: number;
  label: string;
}

export interface PaymentCondition {
  key: string;
  value: string;
}

export interface TrackForm {
  id: string;
  label: string;
  description: string;
  amount: number;
  type: 'fixed' | 'milestone';
  fields: FormField[];
  deliverables: Deliverable[];
  milestones?: Milestone[];
  qualityRules?: QualityRule[];
  conditions?: PaymentCondition[];
}

export interface ApplicationForm {
  isEnabled: boolean;
  fields: FormField[];
  tracks?: TrackForm[];
}

export interface VerificationAudit {
  reviewedAt?: string;
  reviewedBy?: string;
  proofLinks?: string[];
}

export interface InstitutionalEndorsement {
  institutionName?: string;
  contactTitle?: string;
  evidenceUrl?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  isEscrow?: boolean;
  escrowAmount?: number;
  fundedAmount?: number;
  isEscrowFunded?: boolean;
  provider: string;
  category: string;
  description: string;
  fullDescription: string;
  deadline?: string;
  location?: string;
  eligibility: {
    educationLevel: 'UnderGrad' | 'PostGrad' | 'Both' | 'All';
    fieldOfStudy?: string[];
    requirements: string[];
  };
  benefits: string[];
  applicationType?: 'Online Form' | 'Email' | 'Platform Link';
  applicationLink?: string;
  contactEmail?: string;
  contactLink?: string;
  fundingType?: 'Fully Funded' | 'Partially Funded' | 'Paid Internship' | 'Unpaid Internship' | 'Prize' | 'N/A' | string;
  compensationType: 'Paid' | 'Stipend' | 'Unpaid' | 'Equity' | 'N/A' | string;
  upfrontCost: 'No Upfront Cost' | 'Has Upfront Cost' | string;
  duration?: string;
  featured: boolean;
  views?: number;
  dateAdded: string;
  logoUrl?: string;
  imageUrl?: string;
  postedBy?: string;
  isVerified?: boolean;
  status?: 'Unverified' | 'Verified' | 'Rejected';
  providerItems?: {
    title: string;
    deadline: string;
    prize: string;
    link: string;
  }[];
  applicationForm?: ApplicationForm;
  verificationAudit?: VerificationAudit;
  projectProposalUrl?: string;
  institutionalEndorsement?: InstitutionalEndorsement;
  funderRecognition?: string;
  thematicAreas?: { heading: string; topics: string[] }[];
  tracks?: TrackForm[];
  totalRemitted?: number;
  remainingEscrow?: number;
}

export interface TrackApplication {
  trackId: string;
  trackLabel: string;
  data: Record<string, string>;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  milestones?: {
    id: string;
    label: string;
    targetValue: number;
    achievedValue: number;
    unit: string;
    amount: number;
    status: 'pending' | 'submitted' | 'verified' | 'paid';
    evidenceUrl?: string;
  }[];
}

export const opportunities: Opportunity[] = [
  {
    "id": "social-media-marketing-kenya",
    "title": "Social Media Marketing — Opportunities Kenya",
    "provider": "Opportunities Kenya",
    "category": "Job",
    "description": "Help us grow the Opportunities Kenya platform! We need a creative social media marketer to source opportunities, create content, and grow our WhatsApp community. Choose Track A (content & posting), Track B (WhatsApp growth), or both.",
    "fullDescription": "### Social Media Marketing — Opportunities Kenya\n\nWe are hiring a creative, self-driven Social Media Marketer to join the Opportunities Kenya team remotely.\n\nThis role has TWO independent tracks. Apply for one or both.\n\n---\n\n## Track A: Content & Social Media Posting\n\nPayment: KES 1,000/month (fixed)\n\nYou will create and post content across our platforms:\n\n- Substack — 3 stories per week\n- WhatsApp Channel — 5 updates per week (hackathons, expos, events for students)\n- Facebook — 5 posts per week (same opportunities)\n- LinkedIn — 5 posts per week (our pages)\n\nYou will also source new opportunities from the web and update existing website posts.\n\nThis is purely output-based. No interaction metrics. Just consistent posting.\n\n---\n\n## Track B: WhatsApp Community Growth\n\nPayment: Up to KES 1,000/month (milestone-based)\n\nGrow our WhatsApp channel to 500 members.\n\n- 100 members → KES 200\n- 250 members → KES 500\n- 400 members → KES 800\n- 500 members → KES 1,000\n\nVerification: Manual (admin checks member count). Payout is proportional to achievement.\n\n---\n\n## What You Need\n\n- Track A: Strong writing skills, ability to source opportunities, consistent output\n- Track B: Experience growing communities, understanding of WhatsApp engagement\n- Both tracks: Self-motivated, reliable, communicates weekly",
    "deadline": "Rolling",
    "location": "Remote",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Track A: Strong writing skills, social media experience",
        "Track B: Community growth experience, WhatsApp savvy",
        "Reliable internet connection",
        "Self-motivated and able to work independently"
      ]
    },
    "benefits": [
      "Flexible remote work",
      "Work directly with platform founders",
      "Build your portfolio with real content",
      "Escrow-protected payments"
    ],
    "applicationType": "Online Form",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "duration": "Monthly (renewable)",
    "featured": true,
    "views": 0,
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-08-02T12:00:00.000Z",
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke",
    "logoUrl": "/Opportunities Kenya Banner.png",
    "isEscrow": true,
    "escrowAmount": 2000,
    "isEscrowFunded": false,
    "applicationForm": {
      "isEnabled": true,
      "fields": [
        {
          "id": "common-email",
          "key": "email",
          "label": "Email Address",
          "type": "email",
          "required": true
        },
        {
          "id": "common-name",
          "key": "full_name",
          "label": "Full Name",
          "type": "text",
          "required": true
        },
        {
          "id": "common-mpesa",
          "key": "mpesa_number",
          "label": "M-PESA Number (2547XXXXXXXX)",
          "type": "text",
          "required": true
        }
      ],
      "tracks": [
        {
          "id": "track-a-content",
          "label": "Track A: Content & Social Media Posting",
          "description": "Create and post content across Substack, WhatsApp, Facebook, and LinkedIn. Fixed KES 1,000/month for consistent output.",
          "amount": 1000,
          "type": "fixed",
          "deliverables": [
            { "id": "d1", "title": "Week 1: 3 Substack stories + 5 WhatsApp updates + 5 Facebook posts + 5 LinkedIn posts", "amount": 250, "status": "pending" },
            { "id": "d2", "title": "Week 2: 3 Substack stories + 5 WhatsApp updates + 5 Facebook posts + 5 LinkedIn posts", "amount": 250, "status": "pending" },
            { "id": "d3", "title": "Week 3: 3 Substack stories + 5 WhatsApp updates + 5 Facebook posts + 5 LinkedIn posts", "amount": 250, "status": "pending" },
            { "id": "d4", "title": "Week 4: 3 Substack stories + 5 WhatsApp updates + 5 Facebook posts + 5 LinkedIn posts", "amount": 250, "status": "pending" }
          ],
          "fields": [
            {
              "id": "ta-experience",
              "key": "experience",
              "label": "Social Media Experience",
              "type": "textarea",
              "required": true,
              "validation": { "maxLength": 500 }
            },
            {
              "id": "ta-sample",
              "key": "sample_post",
              "label": "Sample Post or Portfolio Link",
              "type": "url",
              "required": false
            },
            {
              "id": "ta-availability",
              "key": "availability",
              "label": "Hours per Week Available",
              "type": "text",
              "required": true
            }
          ]
        },
        {
          "id": "track-b-growth",
          "label": "Track B: WhatsApp Community Growth",
          "description": "Grow our WhatsApp channel to 500 members. Proportional payout based on milestone achievement.",
          "amount": 1000,
          "type": "milestone",
          "deliverables": [
            { "id": "m1", "title": "Reach 100 WhatsApp members", "amount": 200, "status": "pending" },
            { "id": "m2", "title": "Reach 250 WhatsApp members", "amount": 500, "status": "pending" },
            { "id": "m3", "title": "Reach 400 WhatsApp members", "amount": 800, "status": "pending" },
            { "id": "m4", "title": "Reach 500 WhatsApp members", "amount": 1000, "status": "pending" }
          ],
          "milestones": [
            { "id": "m1", "label": "100 members", "targetValue": 100, "unit": "members", "amount": 200 },
            { "id": "m2", "label": "250 members", "targetValue": 250, "unit": "members", "amount": 500 },
            { "id": "m3", "label": "400 members", "targetValue": 400, "unit": "members", "amount": 800 },
            { "id": "m4", "label": "500 members", "targetValue": 500, "unit": "members", "amount": 1000 }
          ],
          "fields": [
            {
              "id": "tb-experience",
              "key": "growth_experience",
              "label": "Community Growth Experience",
              "type": "textarea",
              "required": true,
              "validation": { "maxLength": 500 }
            },
            {
              "id": "tb-strategy",
              "key": "growth_strategy",
              "label": "Your Growth Strategy",
              "type": "textarea",
              "required": true,
              "validation": { "maxLength": 500 }
            },
            {
              "id": "tb-current-groups",
              "key": "current_groups",
              "label": "Current Groups You Admin",
              "type": "text",
              "required": false
            }
          ]
        }
      ]
    }
  },
  {
    "title": "Zindi Hackathons & Competitions",
    "provider": "Zindi Africa",
    "category": "Provider",
    "description": "Participate in Africa's premier data science competitions and hackathons to solve real-world problems.",
    "fullDescription": "### Zindi Competitions\n\nThe following are the latest data science competitions from Zindi Africa.",
    "providerItems": [
      { "title": "Google WAXAL ASR Challenge", "deadline": "Aug 3, 2026", "prize": "$10 000 USD", "link": "https://zindi.africa/competitions/google-waxal-asr-challenge" },
      { "title": "GeoAI Aquaculture Pond Identification Challenge", "deadline": "Aug 17, 2026", "prize": "1000 CHF", "link": "https://zindi.africa/competitions/geoai-aquaculture-pond-identification-challenge" },
      { "title": "A Step Ahead of Drought: Forecasting Global Water Storage Challenge", "deadline": "Sep 14, 2026", "prize": "€2 000 EUR", "link": "https://zindi.africa/competitions/one-step-ahead-of-drought-forecasting-global-water-storage-challenge" },
      { "title": "R.O.A.D. Barbados Historic Handwriting Challenge", "deadline": "Oct 5, 2026", "prize": "$25 000 USD", "link": "https://zindi.africa/competitions/road-barbados-historic-handwriting-challenge" },
      { "title": "Bias Bounty Mapping Equity Challenge", "deadline": "Nov 1, 2026", "prize": "$10 000 USD", "link": "https://zindi.africa/competitions/bias-bounty-mapping-equity-challenge" },
      { "title": "University Hackathon by USIU-A: African Credit Scoring Challenge", "deadline": "Jul 25, 2026", "prize": "500 Points", "link": "https://zindi.africa/competitions/african-credit-scoring-challenge1" },
      { "title": "Bootcamp Challenge by Ngao Labs : Recommendation Engine Creation Challenge", "deadline": "Jul 27, 2026", "prize": "500 Points", "link": "https://zindi.africa/competitions/bootcamp-challenge-by-ngao-labs-recommendation-engine-creation-challenge" },
      { "title": "Cassava AI Root Cause Detective Hackathon", "deadline": "Aug 2, 2026", "prize": "$2 000 USD", "link": "https://zindi.africa/competitions/cassava-ai-root-cause-detective-hackathon" },
      { "title": "July Study Jam Series: African Credit Scoring Challenge", "deadline": "Aug 9, 2026", "prize": "500 Points", "link": "https://zindi.africa/competitions/july-study-jam-series-african-credit-scoring-challenge" },
      { "title": "Multilingual Health Question Answering in Low-Resource African Languages Challenge", "deadline": "Jun 22, 2026", "prize": "$5 000 USD", "link": "https://zindi.africa/competitions/multilingual-health-question-answering-in-low-resource-african-languages-challenge" }
    ],
    "deadline": "Ongoing",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Data Scientists",
        "Machine Learning Engineers",
        "Anyone interested in AI"
      ]
    },
    "benefits": [
      "Cash Prizes",
      "Zindi Points",
      "Skill Building"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://zindi.africa/competitions",
    "fundingType": "Prize",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://zindi.africa/competitions",
    "logoUrl": "/images/zindi_image.png",
    "id": "zindi-competitions-aggregator",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-25T12:00:00Z",
    "featured": true,
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke"
  },
  {
    "title": "MEST AI Startup Program 2027",
    "provider": "MEST",
    "category": "StartupFunding",
    "description": "Fully-funded 12-month program giving African AI founders the chance to pitch for up to $100,000 in pre-seed investment.",
    "fullDescription": "7-month residential training in Accra Ghana. 4-month incubation for top ventures. Mentorship from global AI experts at Google, Meta and OpenAI. Zero cost to participate. Fully sponsored.",
    "deadline": "July 20, 2026",
    "location": "Accra, Ghana (Residential)",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Founders aged 21-35",
        "Must be in Ghana, Nigeria, Senegal, or Kenya"
      ]
    },
    "benefits": [
      "Fully sponsored",
      "Up to $100K pre-seed investment",
      "Mentorship"
    ],
    "applicationType": "Online Form",
    "applicationLink": "http://mestaistartupprogram.smapply.us",
    "fundingType": "Fully Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "http://mestaistartupprogram.smapply.us",
    "id": "mest-ai-startup-program-2027",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.535Z",
    "featured": false,
    "postedBy": "Kevin",
    "contactEmail": "kevin@opportunities.ke"
  },
  {
    "title": "Casper Agentic Buildathon 2026",
    "provider": "Casper / DoraHacks",
    "category": "Hackathon",
    "description": "Participate in the Casper Agentic Buildathon 2026 with a $150K prize pool.",
    "fullDescription": "Developer Hackathon Opportunity. Build agentic applications on Casper with a prize pool of $150K.",
    "deadline": "Not specified",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "$150K prize pool"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://dorahacks.io/hackathon/casper-agentic-buildathon/detail",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://dorahacks.io/hackathon/casper-agentic-buildathon/detail",
    "imageUrl": "https://cdn.dorahacks.io/static/files/19e83da516afc1f3ac55fc742abb8f50.png",
    "id": "casper-agentic-buildathon-2026",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Tracy",
    "contactEmail": "tracy@opportunities.ke"
  },
  {
    "title": "APAC Stellar Hackathon 2026",
    "provider": "Stellar / RiseIn",
    "category": "Hackathon",
    "description": "APAC Stellar Hackathon 2026 with up to $60K in prizes.",
    "fullDescription": "Developer Hackathon Opportunity to build on the Stellar network.",
    "deadline": "Not specified",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "Up to $60K prize"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://risein.com/programs/apac-stellar-hackathon",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://risein.com/programs/apac-stellar-hackathon",
    "imageUrl": "https://files.risein.com/programs/co8um-cohort-1778746738617png",
    "id": "apac-stellar-hackathon-2026",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Victor",
    "contactEmail": "victor@opportunities.ke"
  },
  {
    "title": "UNON Internship Programme 2026",
    "provider": "United Nations (UNON)",
    "category": "Internship",
    "description": "Official internship program at the United Nations Office at Nairobi.",
    "fullDescription": "Gain firsthand experience of the day-to-day working environment of the United Nations. Interns work closely with UN professionals in Gigiri, Nairobi.",
    "deadline": "Rolling",
    "location": "Nairobi, Kenya (Gigiri)",
    "eligibility": {
      "educationLevel": "Both",
      "requirements": [
        "Currently enrolled in a degree program or recently graduated"
      ]
    },
    "benefits": [
      "UN working experience",
      "Multicultural environment"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://www.unon.org/content/internship-programme",
    "fundingType": "Unpaid Internship",
    "compensationType": "Unpaid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.unon.org/content/internship-programme",
    "id": "unon-internship-programme-2026",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Hillary",
    "contactEmail": "hillary@opportunities.ke"
  },
  {
    "title": "Tony Elumelu Foundation",
    "provider": "Tony Elumelu Foundation",
    "category": "StartupFunding",
    "description": "$5,000 seed capital plus training",
    "fullDescription": "Tony Elumelu Foundation: $5,000 seed capital plus training. This is a major funding opportunity tailored for women startup founders in Africa.",
    "deadline": "Rolling",
    "location": "Africa",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Women startup founders",
        "Based in Africa"
      ]
    },
    "benefits": [
      "$5,000 seed capital plus training"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/d6vAxmWd",
    "fundingType": "Partially Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/d6vAxmWd",
    "id": "tony-elumelu-foundation",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke"
  },
  {
    "title": "She Leads Africa Accelerator",
    "provider": "She Leads Africa Accelerator",
    "category": "StartupFunding",
    "description": "Business support for women-led startups",
    "fullDescription": "She Leads Africa Accelerator: Business support for women-led startups. This is a major funding opportunity tailored for women startup founders in Africa.",
    "deadline": "Rolling",
    "location": "Africa",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Women startup founders",
        "Based in Africa"
      ]
    },
    "benefits": [
      "Business support for women-led startups"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dHFVUBW8",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dHFVUBW8",
    "id": "she-leads-africa-accelerator",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Kevin",
    "contactEmail": "kevin@opportunities.ke"
  },
  {
    "id": "ku-area-rental-scout-project-2026",
    "title": "KU Area Rental Scout â€” Earn by Gathering Hostel & Rental Vacancy Info",
    "provider": "L-earn Opportunities",
    "category": "Gig",
    "description": "Get paid to scout rental vacancies near Kenyatta University. Visit hostels, collect details, photos and contacts â€” then earn a commission each time your info helps a student find a place.",
    "fullDescription": "HOW IT WORKS\n\nWe are building a live, verified database of rental rooms and hostels near Kenyatta University (Ruiru/Thika Road area) so students can find affordable housing without being scammed or wasting time.\n\nYOUR ROLE AS A SCOUT\n\nYou will:\n• Visit hostels and rental properties in your area\n• Record room types, rent prices, deposit terms, water and electricity details\n• Get the caretaker's contact and the property's M-Pesa paybill or payment method\n• Note current vacancies and take clear photos of the room and compound\n• Submit everything through our verified listing form\n\nOnce we verify your submission (within 48 hours), your listing goes live and starts earning for you.\n\nHOW YOU GET PAID\n\nWhen a student finds your listing and pays for one of our services, you earn 50% of what we collect:\n\n• Info Package — Student pays KES 500 to receive full hostel details (exact contacts, room sizes, directions, payment method). You earn KES 250.\n• Full Booking Support — Student pays KES 1,000. We coordinate the booking on their behalf, confirm availability, and handle the process with the caretaker using the info you provided. You earn KES 500.\n• Guided Visit — Student pays KES 1,500 for you to physically accompany them to the property, show them the room, and assist with the process on-ground. You earn KES 750.\n\nAll payments go through the L-earn platform (M-Pesa). You are paid to your M-Pesa after each successful transaction is confirmed.\n\nWHY VERIFIABLE INFO MATTERS\n\nWe require scouts to submit the property's actual payment details (M-Pesa paybill, bank paybill, or Equity account) along with their listing. This is how we protect students:\n• A real listing has a traceable payment method — scammers cannot fake this\n• Students who choose Full Booking can have rent paid directly through the verified paybill — they never send money to an unknown person\n• If your info is wrong or outdated, your scout rating drops and your future earnings are affected\n\nWHY THIS MODEL PROTECTS EVERYONE\n\n• The student pays the platform — not you or the caretaker directly — eliminating the most common hostel scam\n• We verify each listing before publishing it\n• You get paid only on successful transactions — your incentive is to provide accurate, up-to-date info\n• For bookings, we disburse rent directly to the landlord's verified paybill after the student is confirmed on-ground\n• You never handle rent money — your role is scouting and (for Guided Visits) on-ground support only\n\nWHAT MAKES A GOOD SCOUT\n\n• Lives near or regularly around the KU/Thika Road/Ruiru area\n• Can visit properties, talk to caretakers and photograph the room\n• Gets the payment method details (paybill number, bank, etc.) — this is mandatory\n• Honest — inaccurate info reduces your rating and future earnings\n• Responsive — students paying for visits need timely coordination\n\nGETTING STARTED\n\n1. Apply below with your name, phone number and the area you operate in\n2. We onboard you via WhatsApp and share the submission checklist\n3. You submit your first verified property listing — we review within 48 hours\n4. Once live, you earn from every student it helps\n\nThis is flexible and ongoing — no fixed hours, no upfront cost. The more accurate listings you submit, the more you earn.",
    "deadline": "Ongoing",
    "location": "Kenyatta University Vicinity (Ruiru / Thika Road Area)",
    "eligibility": {
      "educationLevel": "All",
      "fieldOfStudy": [],
      "requirements": [
        "Lives near or operates in the KU/Ruiru/Thika Road area",
        "Has a smartphone with a working camera",
        "Has an active M-Pesa account for receiving payments",
        "Honest and reliable â€” inaccurate data will reduce your rating"
      ]
    },
    "benefits": [
      "KES 250â€“750 per successful student placement",
      "50% commission on all platform transactions from your listings",
      "Flexible â€” work at your own pace, no fixed hours",
      "No upfront cost to participate",
      "Ongoing earning opportunity as long as vacancies are active"
    ],
    "applicationType": "Online Form",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "duration": "Ongoing",
    "featured": true,
    "views": 40,
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-14T07:00:00.000Z",
    "postedBy": "Williams",
    "contactEmail": "admin@l-earn.co",
    "logoUrl": "/images/hostels.jpg",
    "applicationLink": "https://docs.google.com/forms/d/e/1FAIpQLScvj_x3TnMj2BxaZLfnU5IN2ldWQfy00-0poDF6UD-xflzXCQ/viewform?usp=dialog"
  },
  {
    "id": "hydro-guard-concrete",
    "title": "Hydro-Guard: Localized High-Performance Hydrophobic Concrete Admixtures",
    "provider": "MTRD / University Laboratories",
    "category": "StudentProject",
    "description": "Developing localized hydrophobic concrete admixtures to reduce water infiltration and lower lifecycle maintenance costs by 40%.",
    "fullDescription": "Traditional surface-applied concrete waterproofing is expensive, often imported, and degrades over time, leaving foundations and retaining walls vulnerable to water damage in aggressive soils.\n\nWe are developing a locally manufactured, self-waterproofing concrete admixture by integrating crystalline and hydrophobic mineral composites directly into the concrete matrix during mixing.\n\nRESOURCE BREAKDOWN\n• KES 4,500 — 30 kg of raw bentonite & silica base (KES 150/kg)\n• KES 7,500 — 5 Liters of specialized silane-siloxane composites (KES 1,500/L)\n• KES 6,000 — Local field transit for sample collection over 4 weeks (KES 1,500/week)\n• KES 4,000 — Consumables: specialized curing molds and fine sieves\nNote: Core mixing, curing, and capillary water absorption testing are provided entirely FREE by our institutional lab partners.\n\nELIGIBILITY\nOpen to undergraduate and postgraduate students. We are seeking an industrial attachment or senior mentorship to help guide the foundational research.\n\nBENEFITS & REWARDS\n• Monthly progress reports\n• Formal acknowledgment in any published research papers\n• Early access to the admixture formulation framework",
    "deadline": "2027-01-01T23:59:59.000Z",
    "location": "Nairobi, Kenya",
    "eligibility": {
      "educationLevel": "Both",
      "requirements": [
        "Undergraduate or postgraduate students welcome",
        "Interest in sustainable construction materials",
        "Willing to support testing logistics (KES 22,000 funding goal)"
      ]
    },
    "benefits": [
      "Monthly progress reports from the research team",
      "Formal acknowledgment in published research papers",
      "Early access to the admixture formulation framework"
    ],
    "fundingType": "N/A",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "featured": true,
    "views": 26,
    "dateAdded": "2026-07-14T08:00:00.000Z",
    "logoUrl": "/images/hydrophobic_concrete_demo.png",
    "isVerified": true,
    "status": "Verified",
    "postedBy": "Williams Ochieng",
    "contactEmail": "admin@l-earn.co",
    "isEscrow": true,
    "escrowAmount": 22000,
    "fundedAmount": 4000
  },
  {
    "id": "alkali-activated-binders",
    "title": "Geo-Bind: Naturally Activating Geopolymer Matrix (Eco-Friendly Masonry Blocks)",
    "provider": "MTRD / University Laboratories",
    "category": "StudentProject",
    "description": "Creating a 100% locally sourced, naturally activating geopolymer masonry block using Rift Valley volcanic tuffs — eliminating expensive imported chemical activators. Funding goal: KES 27,000.",
    "fullDescription": "Standard geopolymer concrete relies on highly corrosive and expensive imported chemical activators (like Sodium Hydroxide), making sustainable, \"no-cement\" masonry blocks financially unviable in East Africa.\n\nWe are creating a naturally activating geopolymer matrix using locally sourced Rift Valley volcanic tuffs (Menengai/Longonot) and agricultural by-products to establish a 100% locally sourced masonry block.\n\n────────────────────────────────────\n RESOURCE BREAKDOWN\n────────────────────────────────────\n\n• KES 12,500 — 1-ton pickup hire to Rift Valley (KES 8,000/day + Fuel: 150km @ KES 30/km)\n• KES 2,000 — 2 local laborers for tuff excavation (KES 1,000/day each)\n• KES 9,000 — External XRD/XRF phase testing at advanced physics labs (2 samples @ KES 4,500/sample)\n• KES 3,500 — Heavy-duty respirators and safety gear for ash handling\n\nNote: Standard rock crushing and structural compression testing are subsidized for free.\n\n────────────────────────────────────\n ELIGIBILITY\n────────────────────────────────────\n\nOpen to undergraduate and postgraduate students. Looking for academic supervision regarding geopolymer activation methodologies.\n\n────────────────────────────────────",
    "deadline": "2027-01-01T23:59:59.000Z",
    "location": "Nairobi, Kenya",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Interested in sustainable construction",
        "Willing to fund testing logistics"
      ]
    },
    "benefits": [
      "Access to comprehensive testing data",
      "Co-authorship on final research publications",
      "First right of refusal for commercial licensing"
    ],
    "fundingType": "N/A",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "featured": true,
    "views": 30,
    "dateAdded": "2026-07-14T08:00:00.000Z",
    "logoUrl": "/images/geopolymer.jpg",
    "isVerified": true,
    "status": "Verified",
    "postedBy": "Williams Ochieng",
    "contactEmail": "admin@l-earn.co",
    "isEscrow": true,
    "escrowAmount": 27000,
    "fundedAmount": 5320
  },
  {
    "id": "smart-commerce-infrastructure-challenge",
    "title": "The Smart Commerce Infrastructure Challenge",
    "provider": "Polygon / Ignyte SOC",
    "category": "Challenge",
    "description": "Build the payment solutions that bridge traditional finance and blockchain—powered by Polygon, launched from DIFC, and scaled globally.",
    "fullDescription": "The UAE processes over USD 50 billion in annual remittances, has a 30% crypto adoption rate, and stablecoins already account for 51.3% of all crypto activity in the country. The world’s first comprehensive stablecoin regulation is live. The infrastructure is ready. The market is waiting.\n\nWe’re backing builders who can turn the UAE’s regulatory clarity and market demand into real, deployed stablecoin and payment products.\n\nProblems Worth Solving\n1. SME Trade Finance Is Broken\nThe Problem: Over USD 2 trillion in global trade finance goes unfilled. 40% of SME applications are rejected. Letters of credit take 7–10 days of manual processing. Jebel Ali Port processes 15M+ TEUs annually—the opportunity is massive.\nWhat you need to build: Tokenized receivables, smart contract-based letters of credit, and on-chain trade credit scoring solutions on Polygon that dramatically reduce friction and unlock capital for SMEs.\n\n2. Merchant Payments Need a Blockchain-Native Layer\nThe Problem: The UAE targets 90% cashless transactions. The USD 10.8 billion e-commerce market is growing. The CBUAE’s PTSR regulation now requires compliant stablecoin acceptance systems—but merchants lack integration tools.\nWhat you need to build: POS integration for AED stablecoins, tourist-friendly crypto wallets, and loyalty program tokenization built on Polygon’s infrastructure.\n\nWhat You’ll Receive\nPrize Pool: 25,000 USDC (15K / 7.5K / 5K for 1st, 2nd, 3rd place)\nFull DevRel Support for deployment and maintenance on Polygon\nAdditional Rewards Incentives up for grabs\nGas Fee Coverage during development\nPOL Incentives to scale user base post-launch\nEcosystem Introductions to investors, DIFC’s 5,000+ VCs, 289 banking institutions\n\nDemo Day in Dubai (Mid–Late September 2026)",
    "deadline": "2026-07-13T23:59:59.000Z",
    "location": "Dubai, UAE / Remote",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Team background and technical credentials",
        "Technical architecture and approach on Polygon",
        "MVP / Prototype required"
      ]
    },
    "benefits": [
      "Prize Pool: 25,000 USDC (15K / 7.5K / 5K)",
      "Full DevRel Support for deployment",
      "Ecosystem Introductions to VCs and banks"
    ],
    "fundingType": "Prize",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "featured": false,
    "views": 3284,
    "dateAdded": "2026-04-08T00:00:00.000Z",
    "logoUrl": "/images/tech.avif",
    "isVerified": true,
    "status": "Verified",
    "postedBy": "Ignyte SOC",
    "contactEmail": "admin@l-earn.co"
  }
];
