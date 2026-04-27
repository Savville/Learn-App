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
  category: 'CallForPapers' | 'Internship' | 'Grant' | 'Conference' | 'Scholarship' | 'Fellowship' | 'Attachment' | 'Hackathon' | 'Event' | 'Volunteer' | 'Challenge' | 'Project' | 'Gig' | 'Job' | 'Other';
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
  compensationType: 'Paid' | 'Stipend' | 'Unpaid' | 'N/A';
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
}

export const opportunities: Opportunity[] = [
  {
    id: 'agea-startup-lab-2026',
    title: "AGEA Start-up Lab Call for Applications 2026",
    provider: "African German Entrepreneurship Academy (AGEA)",
    category: 'Project',
    description: "The 2026 edition of the AGEA Start-up Lab is officially open for submissions. Support for innovative, research-based tech start-ups and spin-offs from African HEIs.",
    fullDescription: `The 2026 edition of the AGEA Start-up Lab is now officially open for submissions of innovative start-up projects. The competition is the first arm of the three-phase programme (AGEA Start-up Lab), which aims to support innovative spin-offs, technology-oriented start-ups, and start-up projects, and to strengthen the link between academia and industry in Africa.

We invite submissions of innovative spin-offs and technology-oriented start-ups, developed from academic and scientific research activities by students (Masters and PhD), lecturers, and researchers at African universities in partner countries: Benin, Ghana, Kenya, Nigeria, Rwanda, Tunisia, and Ethiopia.

The application window for the 2026 edition officially opens on 13 April 2026 and closes on 17 May 2026.

────────────────────────────────────
 THE THREE-PHASE ACCELERATION PROGRAMME
────────────────────────────────────

Phase 1: Start-up Competition (13 April – 17 May 2026)
The foundational application and selection phase followed by evaluation and candidate interviews.

Phase 2: Start-up Class (23 September – 02 October 2026)
An intensive, highly focused training program held in-person at Leipzig University, Germany. Includes investment readiness training, dedicated coaching, and connections to early-stage investors.

Phase 3: Start-up Investment Coaching (November 2026 – 2027)
Extended, tailored support for top-performing start-ups to help secure funding and scale. Includes direct introductions to Angel Investors and specialised investor trips.`,
    deadline: '2026-05-17',
    location: 'Leipzig, Germany / Hybrid',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Any Field', 'Technology', 'Agriculture', 'Health', 'Education', 'Energy', 'IT', 'Commerce'],
      requirements: [
        'Academics (lecturers, professors, researchers)',
        'Students currently enrolled in Masters and PhD programmes',
        'Entrepreneurs, recent Masters or PhD graduates (1 – 2 years)',
        'Applicants must be affiliated with universities in Benin, Ghana, Kenya, Nigeria, Rwanda, Tunisia, or Ethiopia',
        'Minimum Viable Product (MVP) or Minimum Marketable Product (MMP) must be available',
        'Student-led teams or recent graduate founders should have a faculty mentor'
      ]
    },
    benefits: [
      'Intensive Investment Readiness Training (Start-up Class in Leipzig, Germany)',
      'Partial funding for travel and accommodation for up to two team members',
      'Investment Coaching and direct connections to Angel Investors',
      'Strategic Support for Grant Applications (including EXIST)',
      'Professional Promotional Video Development for the start-up'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://www.ageacademy.de/agea-business-idea-competition/',
    contactEmail: 'bayeboah@uni-leipzig.de',
    fundingType: 'Partially Funded',
    compensationType: 'N/A',
    upfrontCost: 'No Upfront Cost',
    duration: 'Multi-phase (April 2026 - 2027)',
    featured: true,
    dateAdded: '2026-04-24',
    logoUrl: '/images/opportunities/agea.png',
    postedBy: 'Opportunities Kenya Admin'
  },
  {
    id: 'bishops-university-admissions-2026-2027',
    title: "Bishop's University Undergraduate & Graduate Admissions 2026-2027",
    provider: "Bishop's University",
    category: 'Scholarship',
    description: "Applications are open for Fall 2026 and Winter 2027 at Bishop's University, Canada. Includes opportunities for B.A., B.Sc., B.B.A., B.Ed., M.A., M.Sc., and M.Ed. programs.",
    fullDescription: `Bishop's University welcomes applications for the 2026-2027 academic year. For anyone looking to apply to a Bachelor of Arts (B.A.), Bachelor of Science (B.Sc.), Bachelor of Business Administration (B.B.A.), Bachelor of Education (B.Ed.), Master of Arts (M.A.), Master of Science (M.Sc.), or Master of Education (M.Ed.) degree.

────────────────────────────────────
 FALL 2026 SEMESTER DEADLINES
────────────────────────────────────

• August 4, 2025: Application opens
• March 31, 2026:
  - Deadline for international students (except USA) to submit an application.
  - Deadline for all applicants to apply for Competitive Entrance Scholarships.
  - Deadline for all applicants to submit Entrance Awards and Bursaries application.
• April 15, 2026: Deadline for international students (except USA) to submit supporting documentation.
• May 1, 2026: Deadline for Canadian and USA Citizens to submit an application.
• May 15, 2026: Deadline for Canadian and USA Citizens to submit supporting documentation.

────────────────────────────────────
 WINTER 2027 SEMESTER DEADLINES
────────────────────────────────────

• Spring 2026: Admissions evaluation begins.
• September 1, 2026: Deadline for international students to submit an application.
• September 15, 2026: Deadline for international students to submit supporting documentation.
• November 1, 2026: Deadline for Canadian students to submit an application.
• November 15, 2026: Deadline for Canadian students to submit supporting documentation.

* Canadian and USA Citizens: Please check the programs dropdown list on the corresponding form to see what programs remain open for admission consideration after May 1.

** Applications to the School of Education’s Bachelor of Education programs are subject to different timelines and deadlines.

Incoming International Exchange students (one or two semesters) have separate forms for Fall 2026 and Winter 2027. Contact exchange@ubishops.ca for any questions.`,
    deadline: '2026-03-31',
    location: 'Sherbrooke, Quebec, Canada',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Arts', 'Science', 'Business Administration', 'Education'],
      requirements: [
        'Open to Undergraduate (B.A., B.Sc., B.B.A., B.Ed.) and Graduate (M.A., M.Sc., M.Ed.) applicants',
        'International students must apply by March 31 for Fall entry to be considered for scholarships',
        'Canadian and USA citizens must apply by May 1 for Fall entry',
        'International students must apply by September 1 for Winter entry',
        'Canadian students must apply by November 1 for Winter entry'
      ]
    },
    benefits: [
      'Competitive Entrance Scholarships (Apply by March 31)',
      'Entrance Awards and Bursaries (Apply by March 31)',
      'Access to a wide range of undergraduate and graduate programs',
      'International exchange opportunities',
      'Vibrant campus life in Sherbrooke, Quebec'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://www.ubishops.ca/future-students/bishops-university-online-application/',
    fundingType: 'Partially Funded',
    compensationType: 'N/A',
    upfrontCost: 'Has Upfront Cost',
    featured: true,
    dateAdded: '2026-04-07',
    logoUrl: '/images/opportunities/ubishops_canada.jpeg',
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
    logoUrl: '/images/opportunities/Scilifelab.png',
  },
  {
    id: 'aces-civexpo-2026-incubation',
    title: 'ACES CivExpo 2026: Project Participation & Incubation',
    provider: 'Association of Civil Engineering Students (ACES - KU)',
    category: 'Project',
    description: 'Official 6-month project incubation program for Civil Engineering students to bridge the gap between academia and industry. Includes Industry Skills, Tech & Automation, and Venture Studio tracks with direct paths to industry attachments.',
    fullDescription: `ACES is here to bridge the gap between Industry and Academia. We are officially starting a 6-month project programme for the ACES CivExpo 2026 — focusing on student-led action rather than just hosting events.

THE INCUBATION PROGRAMME
Are you working on a project that can transform Kenya's infrastructure? Join one of our three dedicated tracks to build, optimize, and pitch your engineering ideas to industry giants.

TRACK 1: INDUSTRY SKILLS & WORKFLOW (THE BIG THREE)
Tackle the official CivExpo challenges: The Hillside Hostel, The Zero-Day Campus, or The Last Mile Mobility corridor. Focus on mastering industry-standard tools like Revit, Civil 3D, and EPANET.
🎯 Reward: Direct paths to attachments and internships through ACES industry networks (Sika, KeNHA, Bamburi, etc.)

TRACK 2: TECH & AUTOMATION (THE FUTURE-PROOF ENGINEER)
For students using AI, Machine Learning, Rhino, Grasshopper, or Python scripts to automate and optimize engineering workflows. Show the industry how you are ahead of the curve.
🎯 Reward: Get noticed by tech-driven engineering startups and consulting firms.

TRACK 3: PROBLEM SOLVING, INNOVATION & BUSINESS (THE VENTURE STUDIO)
Turn your research into a viable business or a funded pilot. Focus on sustainable materials (recycled plastics, natural binders) or solving community challenges like Nairobi Water network leakages.
🎯 Reward: Access to project funding, professional mentorship, and the chance to pitch to VCs and Industry Giants like Sika and KeNHA.

WHY PARTICIPATE?
• ACES Advocacy: We pitch you directly to companies for personal career opportunities based on masterclass work.
• Traction: Forums and feedback sessions to keep your project moving toward the September Expo.
• Networking: High-level access to the IEK, NCA, and private sector leaders.

Registered projects will present at ACES meet-ups leading up to the CivExpo in September 2026, where a big stage will be provided for presentations to partners and interested firms.`,
    deadline: '2026-04-20',
    location: 'Kenyatta University / Nairobi, Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      fieldOfStudy: ['Civil Engineering'],
      requirements: [
        'Kenyatta University Civil Engineering student (all years including 5th years)',
        'Sign up individually or in teams (up to 4 members)',
        'Select one of the three dedicated tracks: Industry, Tech, or Business',
        'Commit to regular presentations and project milestones leading to the September Expo'
      ]
    },
    benefits: [
      'Direct paths to attachments and internships with ACES industry partners (Sika, KeNHA, Bamburi)',
      'Access to project funding and professional mentorship from industry experts',
      'Opportunity to pitch to Venture Capitalists and Industry Giants at CivExpo 2026',
      'Networking with IEK (Institution of Engineers of Kenya) and NCA leaders',
      'Portfolio-worthy project development with mastery of Revit, Civil 3D, and AI tools'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSdg83mA2Sw9gtzUYZxiEkf-N3tg9TpLzVQZsgOqHR3UBkK4aQ/viewform?usp=dialog',
    fundingType: 'Partially Funded',
    compensationType: 'N/A',
    upfrontCost: 'No Upfront Cost',
    featured: true,
    dateAdded: '2026-03-23',
    logoUrl: 'https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?auto=format&fit=crop&q=80&w=800',
    thematicAreas: [
      {
        heading: 'Industry Skills (Phase 1)',
        topics: ['Hillside Hostel Challenge', 'Zero-Day Campus Water Systems', 'Last Mile Mobility corridors', 'Mastery of Revit, Civil 3D & EPANET']
      },
      {
        heading: 'Tech & Automation (Phase 2)',
        topics: ['Python & Dynamo script automation', 'Parametric design (Rhino/Grasshopper)', 'BIM plugin development', 'AI-driven structural optimization']
      },
      {
        heading: 'Innovation & Business (Phase 3)',
        topics: ['Sustainable construction materials', 'Network leakage solutions (Nairobi Water)', 'Decentralized rainwater purification', 'Structural biofuel briquettes & business models']
      }
    ]
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
    logoUrl: '/images/opportunities/nairobi_water.png',
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
    id: 'worldquant-brain-iqc-2026',
    title: 'WorldQuant BRAIN International Quant Championship (IQC) 2026',
    provider: 'WorldQuant BRAIN',
    category: 'Hackathon',
    description: 'A three-stage, team-based global competition where participants develop and backtest Alphas — mathematical models that seek to predict future price movements of financial instruments — using WorldQuant’s proprietary BRAIN simulation platform. US$100,000 global prize pool.',
    fullDescription: `The WorldQuant BRAIN International Quant Championship (IQC) 2026 is one of the premier global competitions for students and early-career professionals in quantitative finance, mathematics, and data science. It is a perfect opportunity for students with a strong interest in machine learning and coding to apply their skills to real-world financial modeling.

THE COMPETITION
The IQC is a team-based global competition where participants develop and backtest Alphas — mathematical models that seek to predict future price movements of financial instruments — using WorldQuant’s proprietary BRAIN simulation platform.

COMPETITION TIMELINE
• Qualifier Round (Stage 1): March 17 – May 18, 2026 (Virtual/University-based)
• National/Regional Round (Stage 2): May 26 – Mid-July 2026 (Virtual & Final Presentation)
• Global Finals (Stage 3): September 2026 (In-Person in Singapore)

PRIZES & CAREER OPPORTUNITIES
Beyond the prestige, the IQC offers significant rewards:
• Cash Prizes: A total global prize pool of US$100,000.
  - Global Finals: 1st Place (US$20,000), 2nd Place (US$12,000), 3rd Place (US$8,000)
  - National Rounds: 1st Place (US$3,000), 2nd Place (US$2,000), 3rd Place (US$1,000)
• Career Growth: Top performers are regularly considered for BRAIN Research Consultant positions, internships, and full-time quantitative researcher roles at WorldQuant.
• Travel: Finalists are invited to an all-expenses-paid trip to Singapore for the Global Finals.

HOW TO PARTICIPATE
1. Sign Up: Create a free account on the WorldQuant BRAIN platform.
2. Form a Team: Compete individually or in teams of up to 4 members (must be from the same university).
3. Build Alphas: Use the BRAIN platform’s 125,000+ data fields and AI-powered analytics.
4. Accumulate Points: Scores are based on both the quality (predictive power) and quantity of the Alphas you submit.`,
    deadline: '2026-05-18',
    location: 'Singapore (Global Finals) / Virtual (Qualifier)',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Mathematics', 'Quantitative Finance', 'Computer Science', 'Data Science', 'Engineering', 'Physics', 'Economics'],
      requirements: [
        'Open to students and early-career professionals worldwide',
        'Teams of up to 4 members (must all be from the same university)',
        'Sign up for a free account on the WorldQuant BRAIN platform',
        'Must demonstrate ability to develop and backtest mathematical models (Alphas)'
      ]
    },
    benefits: [
      'US$100,000 total global prize pool',
      'All-expenses-paid trip to Singapore for Global Finals',
      'Direct pathway to Research Consultant, Intern, and Full-time roles',
      'Access to 125,000+ data fields and AI-powered simulation tools',
      'Participate in an elite global network of quants and researchers'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://worldquantbrain.com/iqc',
    fundingType: 'Fully Funded',
    compensationType: 'Paid',
    upfrontCost: 'No Upfront Cost',
    featured: true,
    dateAdded: '2026-03-23',
    logoUrl: '/images/opportunities/world_brain.png',
    thematicAreas: [
      {
        heading: 'Alpha Development',
        topics: ['Mathematical modelling of financial signals', 'Predictive factor generation', 'Algorithmic strategy design']
      },
      {
        heading: 'Simulation & Backtesting',
        topics: ['WorldQuant BRAIN platform navigation', 'Performance metric analysis (Sharpe Ratio, Returns)', 'Risk management integration']
      },
      {
        heading: 'Quant Finance Career',
        topics: ['BRAIN Research Consultant positions', 'Quantitative Researcher networking', 'Global finals in Singapore']
      }
    ]
  },
  {
    id: '29',
    title: 'ESO Science Communication Internship 2026',
    provider: 'European Southern Observatory',
    category: 'Internship',
    description: 'A fully funded science communication internship at ESO headquarters in Germany. Covers monthly living allowance, accommodation, and a return flight from your home country. Open to applicants worldwide.',
    fullDescription: 'The European Southern Observatory (ESO) Science Communication Internship offers students and recent graduates the chance to work with ESO\'s Department of Communication in Garching, Germany. Interns contribute to news articles, press releases, web content, video scripts, exhibition materials, and other public outreach products for one of the world\'s leading astronomical organisations. The internship runs for 3–6 months on a rolling basis, meaning applications are reviewed every 4–6 months year-round. ESO provides a monthly allowance for living expenses, accommodation, and covers the cost of a return ticket from the intern\'s home country, making it a genuinely fully funded opportunity.',
    deadline: 'Rolling',
    location: 'Germany',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Science Communication', 'Science Journalism', 'Natural Sciences', 'Astronomy'],
      requirements: [
        'Open to candidates from all countries',
        'Degree in Science, Science Communication, or Science Journalism preferred',
        'Proficiency in written and spoken English',
        'Experience in written science communication or journalism',
        'Understanding of astronomy and science outreach',
        'Ability to work independently and in multicultural teams',
        'Ability to work under time pressure and meet deadlines'
      ]
    },
    benefits: [
      'Monthly allowance to cover living expenses',
      'Accommodation provided',
      'Return flight from/to home country covered',
      'Work with world-renowned scientists and communicators',
      'Access to state-of-the-art astronomical facilities',
      'International and multicultural work environment',
      'Strong addition to a science communication career'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://recruitment.eso.org/',
    fundingType: 'Paid Internship',
    compensationType: 'Paid',
    upfrontCost: 'No Upfront Cost',
    duration: '3 to 6 months',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/european-union.jpg'
  },
  {
    id: '30',
    title: 'WFP Internship Program 2026',
    provider: 'World Food Programme',
    category: 'Internship',
    description: 'A paid internship with the UN World Food Programme open to students in any field. Offers a stipend of up to $1,000/month, medical insurance, and a flexible duration of 2–8 months across global WFP offices.',
    fullDescription: 'The World Food Programme (WFP) Internship Program is a short-term learning opportunity for outstanding undergraduate and graduate students from across the world. Interns work in WFP offices globally across fields such as logistics, communications, data, nutrition, and more — directly contributing to efforts to achieve zero hunger. The programme runs for 2 to 8 months depending on the position, with different openings having different deadlines. WFP provides a stipend of up to US$1,000 per month based on duty station, medical and accident insurance for interns from developing countries, certified sick leave, and potential visa support. Applicants must be enrolled in a recognised university or have graduated within the last six months.',
    deadline: 'Rolling',
    location: 'International',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Any Field'],
      requirements: [
        'Currently enrolled in a recognised university (attended classes in last 12 months) or graduated within the last 6 months',
        'Completed at least two years of an undergraduate degree',
        'Fluency in English is compulsory',
        'Knowledge of another UN language is an advantage',
        'Strong teamwork skills and willingness to take on challenges',
        'Apply only for positions relevant to your field of study'
      ]
    },
    benefits: [
      'Stipend of up to $1,000 per month (based on duty station)',
      'Medical and accident insurance for interns from developing countries',
      'Certified sick leave',
      'Visa support may be available',
      'Training and e-learning resources',
      'Exposure to international humanitarian work',
      'Real-world experience contributing to zero hunger goals'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://wd3.myworkdaysite.com/recruiting/wfp/job_openings?workerSubType=59387fe40123101e856f1834e09b0002',
    fundingType: 'Paid Internship',
    compensationType: 'Stipend',
    upfrontCost: 'Has Upfront Cost',
    duration: '2 to 8 months',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/wfp.png'
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
    logoUrl: '/images/opportunities/australia2.jpg',
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
    logoUrl: '/images/opportunities/japan.jpg',
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
    logoUrl: '/images/opportunities/german.jpg'
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
    logoUrl: '/images/opportunities/google.jpg',
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
