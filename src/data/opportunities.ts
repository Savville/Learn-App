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

export interface ApplicationForm {
  isEnabled: boolean;
  fields: FormField[];
}

export interface Opportunity {
  id: string;
  title: string;
  isEscrow?: boolean;
  escrowAmount?: number;
  isEscrowFunded?: boolean;
  provider: string;
  category: 'CallForPapers' | 'Internship' | 'Grant' | 'Conference' | 'Scholarship' | 'Fellowship' | 'Attachment' | 'Hackathon' | 'Event' | 'Volunteer' | 'Challenge' | 'Project' | 'StudentProject' | 'ResearchCollaboration' | 'Gig' | 'Job' | 'Partnership' | 'StartupFunding' | 'Other';
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
  fundingType?: 'Fully Funded' | 'Partially Funded' | 'Paid Internship' | 'Unpaid Internship' | 'N/A';
  compensationType: 'Paid' | 'Stipend' | 'Unpaid' | 'Equity' | 'N/A';
  upfrontCost: 'No Upfront Cost' | 'Has Upfront Cost';
  duration?: string;
  featured: boolean;
  dateAdded: string;
  logoUrl: string;
  postedBy?: string;
  isVerified?: boolean;
  status?: 'Unverified' | 'Verified' | 'Rejected';
  verificationAudit?: {
    reviewedAt?: string;
    reviewedBy?: string;
    proofLinks?: string[];
    riskFlags?: string[];
  };
  thematicAreas?: { heading: string; topics: string[] }[];
  applicationForm?: ApplicationForm;
  suggestCustomForm?: boolean; // Temporary flag from AI parsing
  views?: number;
  clicks?: number;
  fundedAmount?: number;
  funderRecognition?: string;
  projectProposalUrl?: string;
  institutionalEndorsement?: {
    institutionName: string;
    contactTitle: string;
    evidenceType: 'upload' | 'link';
    evidenceUrl: string;
    adminEvidenceFile?: string;
    legacyGrandfathered?: boolean;
  };
  kycProofFilename?: string;
  slug?: string;
}

export const opportunities: Opportunity[] = [
  {
    "id": "startup-qatar-investment-program-2026",
    "slug": "startup-qatar-investment-program",
    "title": "Startup Qatar Investment Program",
    "provider": "Qatar Development Bank (QDB) / Invest Qatar",
    "category": "StartupFunding",
    "description": "QDB program attracting tech startups to launch or expand in Qatar. Offers up to $1.1M (START) or $5.5M (GROW), plus visas, co-working, R&D grants, mentoring, and relocation support.",
    "fullDescription": "The Startup Qatar Investment Program, provided by Qatar Development Bank (QDB) and Invest Qatar, aims to attract high-growth tech startups to establish or expand operations in Qatar.\n\nThe program offers milestone-based funding for seed and growth-stage companies, alongside incentives and support services aligned with Startup Qatar subsidies.\n\n────────────────────────────────────\n WHO IT IS FOR\n────────────────────────────────────\n\n1. START — Startups launching in Qatar\nFor entrepreneurs with a Proof of Concept (PoC) or Minimum Viable Product (MVP) seeking funding to establish operations in the Qatari market.\nFunding: up to $1.1 million.\n\n2. GROW — Established startups expanding to Qatar\nFor already established startups seeking funding to expand operations into Qatar.\nFunding: up to $5.5 million.\n\nNote: Funding is trenched based on mutually agreed milestones.\n\n────────────────────────────────────\n PROGRAM BENEFITS\n────────────────────────────────────\n\n• Registration and license renewal cost waivers\n• Flexible work and entrepreneur visa issuance\n• Subsidized co-working spaces\n• Talent and internship support\n• Access to innovation and R&D grants\n• Adoption of tech solutions by respective industries\n• Skilling, training, and mentoring support\n• Exhibition and product showcase opportunities\n• Subsidized housing / relocation support\n\n────────────────────────────────────\n RELATED QATAR ECOSYSTEM\n────────────────────────────────────\n\n• Qatar Financial Centre (QFC) — streamlined business registration\n• Venture capital network via Invest Qatar Gateway (15+ active VC funds)\n• Jusour residency program for entrepreneurs and executives\n• Startup Qatar AI Compute Credits for AI-driven startups\n• Invest Qatar Gateway — partnerships, opportunities, and setup support\n\nOfficial portal: https://startupqatar.qa/en",
    "deadline": "Rolling",
    "location": "Qatar",
    "eligibility": {
      "educationLevel": "All",
      "fieldOfStudy": [
        "Climate Tech",
        "AgriTech",
        "B2B SaaS",
        "Energy Tech",
        "HealthTech",
        "FinTech",
        "Marketplaces",
        "EduTech",
        "SportsTech",
        "Supply Chain Tech",
        "Cybersecurity",
        "AI & Machine Learning",
        "IoT & Big Data",
        "PropTech",
        "Robotics & Drones"
      ],
      "requirements": [
        "Tech startup with a high-growth, innovative, knowledge-based business model.",
        "START track: PoC or MVP and plan to launch operations in Qatar.",
        "GROW track: established startup seeking to expand into the Qatari market.",
        "Open to all innovative and disruptive startups; priority sectors listed are not exhaustive.",
        "Funding released in tranches against mutually agreed milestones."
      ]
    },
    "benefits": [
      "START: up to $1.1M for startups launching in Qatar",
      "GROW: up to $5.5M for established startups expanding to Qatar",
      "Registration and licensing cost waivers",
      "Entrepreneur and flexible work visa support",
      "Subsidized co-working and housing / relocation support",
      "R&D grants, mentoring, and talent/internship support",
      "Market access through industry adoption of tech solutions",
      "Exhibition and showcase opportunities for products and technologies"
    ],
    "thematicAreas": [
      {
        "heading": "Priority sectors",
        "topics": [
          "Climate Tech",
          "AgriTech",
          "B2B SaaS",
          "Energy Tech",
          "HealthTech",
          "FinTech",
          "Marketplaces",
          "EduTech",
          "SportsTech",
          "Supply Chain Tech",
          "Cybersecurity",
          "AI & ML",
          "IoT & Big Data",
          "PropTech",
          "Robotics & Drones"
        ]
      },
      {
        "heading": "Funding tracks",
        "topics": [
          "START — up to $1.1M (launch in Qatar)",
          "GROW — up to $5.5M (expand to Qatar)"
        ]
      }
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://www.f6s.com/sqinvestmentprogram/apply",
    "contactLink": "https://startupqatar.qa/en",
    "fundingType": "Fully Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "featured": true,
    "dateAdded": "2026-06-27",
    "logoUrl": "/images/startup_qatar.png",
    "postedBy": "Opportunities Kenya Admin",
    "isVerified": true,
    "status": "Verified",
    "verificationAudit": {
      "reviewedAt": "2026-06-27T00:00:00.000Z",
      "reviewedBy": "Opportunities Kenya Admin",
      "proofLinks": [
        "https://startupqatar.qa/en",
        "https://www.f6s.com/sqinvestmentprogram/apply"
      ],
      "riskFlags": []
    }
  },
  {
  "id": "boston-university-presidential-scholarship-2026",
  "title": "Boston University Presidential Scholarship 2026",
  "provider": "Boston University",
  "category": "Scholarship",
  "description": "A prestigious $25,000/year scholarship for high-achieving international students to pursue their undergraduate degree in the USA.",
  "fullDescription": "Are you looking for a high-value undergraduate scholarship in the USA? The Boston University Presidential Scholarship 2026 is an excellent opportunity for international students who want to study at one of the most prestigious universities in the United States. This funded scholarship in USA helps talented students from all over the world pursue their undergraduate degree at Boston University. The scholarship focuses on academic excellence, leadership potential, and active participation in extracurricular activities. It also supports cultural exchange by bringing students from different countries into one diverse academic environment.",
  "deadline": "2026-12-01",
  "location": "Boston, USA",
  "eligibility": {
    "educationLevel": "UnderGrad",
    "fieldOfStudy": [
      "Health & Rehabilitation Sciences",
      "Communication",
      "Arts & Sciences",
      "Engineering",
      "Fine Arts",
      "Business",
      "General Studies",
      "Global Studies",
      "Administration",
      "Education & Human Development"
    ],
    "requirements": [
      "Must be an international student applying for an undergraduate degree program at Boston University.",
      "Must demonstrate outstanding academic performance in high school and rank in the top 5% of graduating class.",
      "Candidates with strong SAT scores (above 1500) or ACT scores (above 33) have a better chance.",
      "Should have excellent extracurricular achievements and leadership experience.",
      "Must fulfill English language proficiency requirements such as TOEFL or IELTS."
    ]
  },
  "benefits": [
    "$25,000 per academic year.",
    "Reduces the overall cost of undergraduate studies.",
    "Study at a top-ranked university in the USA.",
    "Access to a diverse and international student community.",
    "Enhances academic and professional development."
  ],
  "applicationType": "Platform Link",
  "applicationLink": "https://www.bu.edu/admissions/apply/",
  "fundingType": "Partially Funded",
  "compensationType": "N/A",
  "upfrontCost": "No Upfront Cost",
  "featured": true,
  "dateAdded": "2026-06-25",
  "logoUrl": "/images/boston_university.png",
  "isVerified": true,
  "status": "Verified",
  "postedBy": "Opportunities Kenya Admin"
  },
  {
    id: 'engineering-automation-developer-2026',
    title: 'Software Developer for Engineering Automation (Equity Opportunity)',
    provider: 'Detailing Automation Project',
    category: 'Partnership',
    description: 'Finish the development of a fully automated CAD structural detailing system, aimed at commercial sale to civil engineering drafting companies.',
    fullDescription: 'We are seeking a talented programming student to finalize the creation of core automation scripts and build out the full system architecture for a structural detailing tool. The system will fully automate tedious drafting tasks, including drawing generation, annotation, dimensioning, and customized detailing. The final product is intended to be sold as a premium tool to civil engineering drafting companies, contractors, and design offices.\n\nWe have already started building the foundation. We will provide all the necessary civil engineering logic, workflows, and CAD usage details. Interested candidates should pitch for this gig below for specific details on the existing codebase and required tech stack. We are offering a unique opportunity where the developer will have stakes/equity in the product upon an agreed plan, making you a partner in the product\'s success.',
    deadline: '2026-08-31',
    location: 'Remote',
    eligibility: {
      educationLevel: 'All',
      fieldOfStudy: ['Computer Science', 'Software Engineering', 'Civil/Structural Engineering', 'Any Field'],
      requirements: [
        'Strong general programming skills and the ability to adapt to specific CAD scripting environments.',
        'Ability to design and implement full system architectures for software tools.',
        'Capacity to translate provided engineering rules into automated logic.',
        'Self-driven with a strong interest in building commercially viable automation products.',
        'Open to an equity/profit-sharing partnership agreement.'
      ]
    },
    benefits: [
      'Equity/Stakes in the final product based on agreed development milestones.',
      'Flexible, fully remote working arrangement.',
      'Opportunity to co-create a commercial software product targeting a lucrative niche (Civil Engineering).',
      'Real-world experience in software architecture and industry-specific automation.'
    ],
    contactEmail: 'ochiwilliamotieno@gmail.com',
    fundingType: 'N/A',
    compensationType: 'Equity',
    upfrontCost: 'No Upfront Cost',
    duration: 'Project-Based (with long-term partnership potential)',
    featured: true,
    dateAdded: '2026-06-03',
    logoUrl: '/images/autocad_automation.jpeg',
    postedBy: 'Williams Savville',
    isVerified: true,
    status: 'Verified'
  },
  {
    id: 'safal-sbs-sales-agent',
    title: 'Safal Building Systems (SBS) Independent Sales Agent',
    provider: 'Safal Building Systems Limited',
    category: 'Gig',
    description: 'Holiday Gig Alert: Earn massive commissions by connecting real estate developers with Safal Building Systems\' premium steel and solar solutions.',
    fullDescription: `Are you a university student looking to make serious money during the long holiday? Safal Building Systems Limited (SBS), a proud member of the Safal Group (the makers of Mabati Rolling Mills - MRM), is looking for aggressive, independent sales agents to drive their revolutionary building solutions across Kenya.

As an independent sales agent, your primary job is to look for customers, generate leads, and forward them to the SBS Division Sales Personnel. You don't need an office or inventory—you just need to connect buyers with the best building technology in the country.

You will be selling four main premium solutions:
1. ULTRASPAN®: Pre-engineered light gauge steel roof trusses.
2. SAFBUILD®: Complete pre-engineered steel buildings and warehouses.
3. SAFCOOL®: Insulated panels and cold room solutions.
4. SAFSOLAR®: Advanced solar energy and water heating systems.

Your Earnings:
Real estate and construction deal values are massive. There is highly competitive remuneration for successful referrals, which will be agreed upon individually when you sign your contract. Because you are dealing with high-value construction materials, just one or two successful referrals a month can translate into life-changing income.

What You Get From SBS:
- Full training programs to give you the exact product knowledge you need.
- Authorized marketing and technical support materials to share with your clients.`,
    deadline: '2026-12-31',
    location: 'Nationwide (Kenya)',
    eligibility: {
      educationLevel: 'All',
      fieldOfStudy: ['Any Field', 'Business', 'Marketing', 'Engineering'],
      requirements: [
        'Open to all university students (Business, Engineering, Marketing, or any other field).',
        'Must operate as an independent contractor.',
        'Must utilize only marketing materials generated and authorized by SBS.',
        'Commitment to a 1-year renewable term.'
      ]
    },
    benefits: [
      'Highly competitive commission-based earnings on high-value real estate deals.',
      'Flexible working hours perfect for students on holiday.',
      'Free technical and marketing training directly from a top corporate brand.',
      'No upfront capital or inventory required.'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://docs.google.com/forms/d/1Qj3l69tihyCa9msliS7RqVRLKplfdI_jNfvwxXdNvhE/viewform',
    fundingType: 'N/A',
    compensationType: 'Paid',
    upfrontCost: 'No Upfront Cost',
    duration: '1 Year (Renewable)',
    featured: true,
    dateAdded: '2026-06-03',
    logoUrl: '/images/safbuild.png',
    isVerified: true,
    status: 'Verified'
  },

  {
    id: 'science-scilifelab-prize-for-young-scientists-2026',
    title: 'Science & SciLifeLab Prize for Young Scientists 2026',

    provider: 'Science, SciLifeLab, and AAAS',
    category: 'Grant',
    description: 'An international award recognizing excellence amongst young researchers worldwide. Win up to $30,000 and get your thesis essay published in Science.',
    fullDescription: `The SciLifeLab Prize for Young Scientists was established in 2013 and is a global prize aimed to reward scientists at an early stage of their career. Science, SciLifeLab, and the American Association for the Advancement of Science (AAAS) have collaborated to create this international award.

The prize provides a strong platform for young scientists to showcase their research on a global level and gain recognition from leading scientific organizations. The award will be provided to outstanding life science researchers based on their doctoral degree earned in the previous two years.

CATEGORIES:
1. Cell and Molecular Biology
2. Genomics, Proteomics, and Systems Biology Approaches
3. Ecology & Environment
4. Molecular Medicine

PRIZES:
The grand winner will get a prize money of $30,000 USD, and the other three category winners will get $10,000 USD each. The grand prize-winning essay will be published in Science, while category winners will be published online. The award ceremony will take place in Stockholm in December.`,
    deadline: '2026-07-15',
    location: 'Stockholm, Sweden / Online',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Cell and Molecular Biology', 'Genomics', 'Proteomics', 'Systems Biology', 'Ecology', 'Environment', 'Molecular Medicine'],
      requirements: [
        'Must have received a Ph.D. between January 1, 2024, and December 31, 2025.',
        'Submit a 1,000-word essay describing your thesis work.',
        'Submit a one-page reference letter from an advisor or thesis committee member.',
        'Provide a thesis abstract (max four pages) and a list of citations and awards.',
        'No AI allowed for essay generation (minor editing tools like Grammarly require declaration).'
      ]
    },
    benefits: [
      '$30,000 USD for the Grand Winner',
      '$10,000 USD for three Category Winners',
      'Publication in Science magazine (Grand Winner)',
      'Trip to Stockholm for the award ceremony in December',
      'Global recognition and visibility in the scientific community'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://www.science.org/content/page/how-enter-science-scilifelab-prize-young-scientists',
    contactEmail: 'SciLifeLabPrize@aaas.org',
    fundingType: 'Fully Funded',
    compensationType: 'Paid',
    upfrontCost: 'No Upfront Cost',
    featured: true,
    dateAdded: '2026-03-29',
    logoUrl: '/images/Scilifelab.png',
  },

  {
    id: '37',
    title: 'Non-Revenue Water Crisis — Can You Help Nairobi Fix It?',
    provider: 'Opportunities Kenya',
    category: 'Challenge',
    description: 'Nairobi City Water & Sewerage Company loses 44–48% of all treated water to leaks, illegal connections, and billing failures. An open industry challenge brief for students to explore, research, and build solutions.',
    fullDescription: `The Nairobi City Water and Sewerage Company (NCWSC) is the sole provider of water and sewerage services for over 4 million Nairobi residents. Like many urban utilities across sub-Saharan Africa, NCWSC faces a severe operational crisis rooted in Non-Revenue Water (NRW) — treated, pressurised water that is produced and distributed but never billed or paid for.

This is not a formal call for applications. This is a curated industry challenge brief from LearnOpportunities Kenya — highlighting a real national problem where student talent, research, and innovation can make a meaningful difference.

────────────────────────────────────
 THE CORE PROBLEM
────────────────────────────────────

NCWSC currently loses approximately 44–48% of all treated water to NRW. That means nearly half of every litre pumped, treated, and pressurised never reaches a paying customer.

💧 At the national level, Kenya loses an estimated Ksh 11.9 billion annually — equivalent to 203 million cubic metres of treated water disappearing from the system every year.

The problem has three interconnected roots:

🔴 Physical Losses — An ageing distribution network with pipes dating back decades. Hidden underground leaks that go undetected for months. Pipe bursts from pressure fluctuations and poor maintenance.

🔴 Commercial Losses — Widespread illegal water connections in informal settlements including Kibagare, Kitusuru, and Mathare. Meter tampering, bypassing, and diversion of water. Over 8,000 broken meters recording zero consumption.

🔴 Revenue Collection Failures — Ksh 344 million billed in 2024 to 23,384 accounts with zero payments and no disconnections enforced, according to a Senate Public Investments Committee audit.

────────────────────────────────────
 IMPACT ON NAIROBI RESIDENTS
────────────────────────────────────

• Only about 40% of connected households receive water continuously — the rest rely on rationing schedules
• Residents of informal settlements pay up to 10× more per litre from water vendors than connected households
• Low-pressure pipes and broken mains allow contamination ingress, increasing waterborne disease risk
• Excessive abstraction from Thika Dam and Sasumua Dam to compensate for losses accelerates resource depletion
────────────────────────────────────
 WHAT NCWSC IS CURRENTLY DOING
────────────────────────────────────

NCWSC has deployed acoustic leak detection vans, launched a Rapid Results Initiative (RRI) targeting a 7.8% NRW reduction and Ksh 105.7 million/month increase in collections, and is conducting GIS mapping to grow its customer base by 37,000 accounts.

Their technology roadmap includes:
📡 Smart meters
📡 Real-time monitoring of leaks and sewer flows
🤖 AI-assisted asset management
♻️ Potential reuse of treated wastewater
🔬 Advanced water treatment technology

Yet these initiatives remain under-resourced, manually intensive, and largely reactive rather than preventive.

────────────────────────────────────
 THE POTENTIAL IMPACT OF YOUR SOLUTION
────────────────────────────────────

A solution that reduces NCWSC's NRW by just 10 percentage points (from 48% to 38%) could:

• Recover an estimated Ksh 1+ billion in annual revenue
• Extend water access to an additional 300,000+ Nairobi residents
• Reduce daily water abstraction load, easing pressure on Thika and Sasumua Dams
• Serve as a replicable model for water utilities across sub-Saharan Africa

────────────────────────────────────
 HOW TO USE THIS
────────────────────────────────────

Use this challenge as inspiration for your:
🎓 Final year project or capstone
📚 Research paper or thesis
💻 Class assignment or design sprint
🌱 Community innovation initiative

No formal application is needed — explore NCWSC's website, dig into the data, and start building.`,
    location: 'Nairobi, Kenya',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Engineering', 'Computer Science', 'Data Science', 'Environmental Science', 'Urban Planning', 'Business', 'Design', 'Any Field'],
      requirements: [
        'Open to undergraduate and postgraduate students',
        'Multidisciplinary teams strongly encouraged',
        'Students based in Kenya or with knowledge of Nairobi\'s urban water context preferred',
        'No formal application — use this as inspiration for academic projects, capstone work, or research'
      ]
    },
    benefits: [
      'Real-world problem context for capstone, thesis, or final year project',
      'Deep insight into Kenya\'s water infrastructure and governance challenges',
      'Application domains: IoT sensors, GIS mapping, AI anomaly detection, predictive analytics',
      'Portfolio-worthy project aligned with NCWSC\'s active technology roadmap',
      'Potential for real-world impact affecting 4+ million Nairobi residents'
    ],
    contactLink: 'https://nairobiwater.co.ke',
    featured: true,
    compensationType: 'N/A',
    upfrontCost: 'No Upfront Cost',
    dateAdded: '2026-03-06',
    logoUrl: '/images/nairobi_water.png',
    thematicAreas: [
      {
        heading: 'Leak Detection',
        topics: ['Low-cost acoustic or pressure sensors', 'Community-based leak reporting systems', 'Underground pipe network monitoring']
      },
      {
        heading: 'Illegal Connection Mapping',
        topics: ['GIS-based network analysis', 'AI anomaly detection in consumption data', 'Satellite or drone imagery analysis']
      },
      {
        heading: 'Smart Metering',
        topics: ['Affordable IoT meter design', 'Prepaid water systems for informal settlements', 'Remote meter reading infrastructure']
      },
      {
        heading: 'Billing & Collections',
        topics: ['Predictive default modelling', 'Behavioural nudge interventions', 'Mobile payment integration (M-Pesa)']
      },
      {
        heading: 'Water Quality Monitoring',
        topics: ['Real-time contamination sensors', 'Low-pressure zone risk mapping', 'Waterborne disease early warning systems']
      },
      {
        heading: 'Wastewater Reuse',
        topics: ['Treated wastewater for urban irrigation', 'Industrial grey water reuse systems', 'Urban aquifer recharge strategies']
      }
    ]
  },

  {
    id: '36',
    title: 'Australia Awards Scholarships 2027',
    provider: 'Australian Government (DFAT)',
    category: 'Scholarship',
    description: 'Fully funded Australian government scholarship for Kenyan students to pursue Bachelor, Masters, or PhD studies at top Australian universities.',
    fullDescription: `The Australia Awards Scholarships 2027 is a prestigious fully funded scholarship program offered by the Australian Government, aimed at students from developing countries — including Kenya — to study at leading Australian universities.

────────────────────────────────────
 OVERVIEW
────────────────────────────────────

The program promotes leadership, academic excellence, and people-to-people ties between Australia and its partner countries. Recipients gain access to world-class education while developing the skills needed to drive positive change in their home countries.

Open to all academic fields (except aviation, nuclear technology, and military training).

────────────────────────────────────
 DURATION
────────────────────────────────────

🎓 Bachelor's Degree: 4 years
🎓 Master's Degree: 2–3 years
🎓 PhD: 4–5 years

────────────────────────────────────
 WHAT IS COVERED (FULLY FUNDED)
────────────────────────────────────

✅ Full tuition fees
✈️ Return economy-class airfare to and from Australia
🏠 One-time establishment grant (accommodation, textbooks, study materials)
💰 Fortnightly living allowance
🩺 Overseas Student Health Cover (OSHC) for the full award period
📚 Introductory Academic Program before formal studies begin
🌐 Pre-Course English (PCE) fees if required
📖 Supplemental academic support
🔬 Fieldwork support for eligible research students

────────────────────────────────────
 REQUIRED DOCUMENTS
────────────────────────────────────

📄 CV / Resume
🎓 Degree certificate
🪪 Proof of citizenship
📊 Academic transcripts
📝 Referee report
📬 Unconditional letter of offer from an Australian university
🗣️ English proficiency test score

────────────────────────────────────
 HOW TO APPLY
────────────────────────────────────

Apply online through the official Australia Awards portal. Ensure all documents are uploaded accurately — incomplete applications will not be considered.

For full details visit: https://www.dfat.gov.au/people-to-people/australia-awards`,
    deadline: '2026-04-30',
    location: 'Australia',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['All Fields'],
      requirements: [
        'Kenyan citizens are eligible to apply',
        'Must be residing in Kenya and applying from Kenya',
        'Must not be an Australian citizen or permanent resident',
        'Must not be married or engaged to an Australian or New Zealand citizen/permanent resident',
        'Must not be currently serving military personnel',
        'Must meet the admission requirements of the chosen Australian university',
        'Previous long-term Australian Award recipients must have resided outside Australia for twice the duration of their previous award before reapplying',
        'Must be able to meet Australian visa requirements'
      ]
    },
    benefits: [
      'Full tuition fees covered',
      'Return economy-class airfare to and from Australia',
      'One-time establishment grant for accommodation, textbooks, and study materials',
      'Fortnightly living allowance',
      'Overseas Student Health Cover (OSHC) for the full award duration',
      'Introductory Academic Program prior to studies',
      'Pre-Course English (PCE) fees if required',
      'Supplemental academic support throughout the program',
      'Fieldwork support for eligible research students'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://www.dfat.gov.au/people-to-people/australia-awards/how-to-apply-for-an-australia-awards-scholarship',
    contactLink: 'https://www.dfat.gov.au/contact-us',
    fundingType: 'Fully Funded',
    compensationType: 'Stipend',
    upfrontCost: 'No Upfront Cost',
    duration: 'Bachelor: 4 years | Masters: 2–3 years | PhD: 4–5 years',
    featured: true,
    dateAdded: '2026-03-05',
    logoUrl: '/images/australia2.jpg',
    thematicAreas: [
      {
        heading: 'General',
        topics: ['All academic fields (excluding aviation, nuclear technology, and military training)']
      }
    ]
  },
  {
    id: '38',
    title: "HENNGE's Global Internship Program 2026",
    provider: 'HENNGE',
    category: 'Internship',
    description: 'Fully funded 4–6 week tech internship at HENNGE headquarters in Tokyo, Japan. Open to international students in Front-End or Full-Stack Software Engineering. No Japanese required.',
    fullDescription: `HENNGE's Global Internship Program (GIP) 2026 is a fully funded international tech internship based at HENNGE's Shibuya headquarters in Tokyo, Japan. The program is open to international students and recent graduates worldwide pursuing a degree in Computer Science or a related field.

THE OPPORTUNITY
GIP offers two distinct engineering tracks:
• Full Stack Software Engineering — Python or Go, AWS, Terraform, server-side development
• Front-End Software Engineering — React or Vue in TypeScript, UI/UX, modern web interfaces

The program runs for 4–6 weeks and is conducted entirely in English — no Japanese language skills required.

PATHWAY DATES
• Batch 4: 3 August – 11 September 2026 (Full-Stack Pathway)
• Batch 5: 16 November – 18 December 2026 (Front-End Pathway)

Positions are filled on a first-come, first-serve basis — apply early to secure your slot.

ELIGIBILITY
• Currently pursuing a Bachelor's (3rd year or above), Master's, or Doctoral degree — OR a recent graduate
• Degree or equivalent experience in Computer Science or a related technical field
• Fluent in English
• Knowledge of Linux, MacOS, or Unix-like systems
• Interested in open source and tech community activities
• For Full-Stack: experience in Python or Go
• For Front-End: experience in React or Vue with TypeScript
• Familiarity with AWS and Terraform is a plus
• Basic understanding of server-side programming (for Front-End applicants)

APPLICATION PROCESS
1. Visit the official website and select your internship track
2. Register and complete the online coding challenge
3. Submit your CV, cover letter, and completed challenge
4. Shortlisted applicants will be contacted for phone screening and online interview

No Japanese language skills required. All interns with outstanding performance may receive a full-time job offer at HENNGE.`,
    location: 'Tokyo, Japan',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Computer Science', 'Software Engineering', 'Information Technology', 'Related Technical Field'],
      requirements: [
        'Pursuing a Bachelor\'s degree (3rd year+), Master\'s, or Doctoral degree — or recent graduate',
        'Degree or equivalent experience in Computer Science or related technical field',
        'Fluent in English (Japanese not required)',
        'Knowledge of Linux, MacOS, or Unix-like systems',
        'Full-Stack track: experience with Python or Go',
        'Front-End track: experience with React or Vue in TypeScript',
        'Basic understanding of server-side programming (Front-End applicants)',
        'Familiarity with AWS and Terraform tools',
        'Interested in building a career in Japan'
      ]
    },
    benefits: [
      'Monthly subsidy (living stipend)',
      'Round-trip airfare covered',
      'Medical insurance for non-Japan residents',
      'Japanese mobile phone with data',
      'Pre-arrival support and passport/visa guidance',
      'Access to networking luncheons and monthly technical sessions',
      'Office facilities, refreshments, and staff parties',
      'Access to Japanese cultural events',
      'Potential full-time job offer for outstanding interns'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://recruit.hennge.com/en/gip/',
    fundingType: 'Paid Internship',
    compensationType: 'Stipend',
    upfrontCost: 'No Upfront Cost',
    duration: '4–6 weeks',
    featured: false,
    dateAdded: '2026-03-09',
    logoUrl: '/images/japan.jpg',
    thematicAreas: [
      {
        heading: 'Full-Stack Software Engineering',
        topics: ['Python & Go backend development', 'Amazon Web Services (AWS)', 'Terraform infrastructure as code', 'Server-side application architecture']
      },
      {
        heading: 'Front-End Software Engineering',
        topics: ['React & Vue in TypeScript', 'Modern UI/UX development', 'Component-driven architecture', 'Web performance optimisation']
      }
    ]
  },
  {
    id: '40',
    title: 'DAAD MIDE Scholarship 2026 in Germany',
    provider: 'German Academic Exchange Service (DAAD)',
    category: 'Scholarship',
    description: 'Fully funded master\'s scholarship at HTW Berlin for international students from developing countries to pursue the Master of International and Development Economics (MIDE).',
    fullDescription: 'The DAAD MIDE Scholarship 2026 at HTW Berlin University of Applied Sciences is a life-changing opportunity for international students to study a master\'s degree in international and development economics. MIDE stands for the Master of International and Development Economics, and it gives students the tools they need to address global economic issues and support sustainable development, with a particular emphasis on economic development and policy analysis.\n\nHTW Berlin University of Applied Sciences is renowned for its excellent academic standards and practical approach. The university offers a thorough educational experience thanks to its dynamic campus culture, cutting-edge facilities, and knowledgeable faculty. Furthermore, HTW Berlin has a vibrant culture that provides students with a wealth of networking and internship opportunities. This scholarship will help with both education and professional careers; it will improve chances of landing a job in the international market in the field of economics.\n\nThe DAAD MIDE Scholarship is fully funded. The master\'s scholarship will cover the service fees for the program (€2,500), living expenses, study and research subsidy, travel expenses, health insurance, and other related expenses. For students from developing and newly industrialized nations, the German Academic Exchange Service provides a limited number of scholarships. This is a competitive scholarship program. Scholars will get an opportunity to join a diverse group of students from all over the world, where they will gain valuable insights and perspectives that will enhance their academic and professional development.',
    deadline: '2026-08-31',
    location: 'Germany',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Economics', 'International Development', 'Development Studies'],
      requirements: [
        'Applicants must come from a developing or newly industrialized country',
        'Must have at least two years of professional experience after graduation at the time of application',
        'Must have completed their previous degree within the last six years',
        'Must meet all MIDE program admission requirements',
        'Must hold a recognized undergraduate degree with 180 ECTS (or equivalent)',
        'Must have completed at least 15 ECTS in Economics',
        'Must meet the English language proficiency requirements'
      ]
    },
    benefits: [
      'Full service fee coverage for the MIDE program (€2,500)',
      'Monthly stipend of €934 for living expenses',
      'Study and research subsidies throughout the academic period',
      'Travel allowance to Germany and return home after completing the program',
      'Health, accident, and personal liability insurance coverage',
      'Monthly rent subsidy and family allowance under certain circumstances',
      'Preparatory German Language Course (February/March)',
      'Excellent opportunity to study a master\'s in Europe for free'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://mide.htw-berlin.de/applying/#c17445',
    fundingType: 'Fully Funded',
    compensationType: 'Stipend',
    upfrontCost: 'No Upfront Cost',
    featured: true,
    dateAdded: '2026-03-13',
    logoUrl: '/images/german.jpg'
  },
  {
    id: 'google-student-researcher-internship-2026',
    title: 'Google Student Researcher Internship 2026',
    provider: 'Google',
    category: 'Internship',
    description: 'Paid student researcher position for B.S. and M.S. students to work on research projects across Google Teams including DeepMind, Research, and Cloud.',
    fullDescription: 'The Student Researcher Program fosters academic collaborations by hiring students onto research projects aligned to company priorities in scientific advancement. Researchers across Google are working to advance the state of the art in computing and build the next generation of intelligent systems for all Google products.\n\nCOMPENSATION:\nThe US base salary range for this full-time position is $98,000-$131,000. Within the range, individual pay is determined by role, level, and location.\n\nFLEXIBILITY:\nStudent Researcher opportunities are flexible in time commitment, length of opportunity, and onsite/remote nature, depending on the specific project and host needs.',
    deadline: '2026-07-17',
    location: 'Various Locations, USA',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Computer Science', 'Linguistics', 'Statistics', 'Biostatistics', 'Applied Math', 'Economics', 'Natural Sciences'],
      requirements: [
        'Currently enrolled in a Bachelor\'s or Master’s degree program',
        'Experience in one area of computer science (AI, ML, HCI, etc.)',
        'Returning to the program after completion of internship',
        'English proficiency is a requirement',
        'Must be located in the United States for the duration'
      ]
    },
    benefits: [
      'Base salary range $98,000-$131,000 equivalent',
      'Potential housing stipend and relocation bonus',
      'Work with Google DeepMind and Google Research scientists',
      'Flexible onshore/remote options based on project'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://www.google.com/about/careers/applications/jobs/results/140245524367188678-student-researcher-bsms-wintersummer-2026?target_level=INTERN_AND_APPRENTICE',
    fundingType: 'Paid Internship',
    compensationType: 'Paid',
    upfrontCost: 'Has Upfront Cost',
    featured: true,
    dateAdded: '2026-03-22',
    logoUrl: '/images/google.jpg',
    thematicAreas: [
      {
        heading: 'AI & Research',
        topics: ['Deep Learning', 'Natural Language Understanding', 'Quantum Information Science']
      },
      {
        heading: 'Software Engineering',
        topics: ['Algorithmic Foundations', 'Infrastructure Engineering', 'Performance Optimization']
      }
    ]
  }
];

// Refurbished
