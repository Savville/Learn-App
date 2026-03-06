import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const opportunities = [
  {
    id: '4',
    title: 'Mastercard Foundation Scholars Program - Kenya',
    provider: 'Mastercard Foundation',
    category: 'Scholarship',
    description: 'Full scholarship for talented Kenyan students to pursue undergraduate and graduate studies.',
    fullDescription: 'The Mastercard Foundation Scholars Program provides comprehensive support for academic talent from Kenya with demonstrated financial need. Beyond financial assistance, the program offers leadership development, mentorship, internship opportunities, and a commitment to transforming communities.',
    deadline: '2026-01-15',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'Both',
      requirements: [
        'Kenyan citizen with demonstrated financial need',
        'Strong academic record (minimum B+ average)',
        'Leadership potential and community involvement',
        'Excellent English proficiency'
      ]
    },
    benefits: [
      'Full tuition coverage',
      'Living expenses and accommodation',
      'Books and supplies',
      'Leadership development programs',
      'Career mentorship and internship support'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://mastercardfdn.org/scholars',
    featured: true,
    dateAdded: '2026-02-01',
    logoUrl: '/images/opportunities/mastercard-scholarship.jpg',
    views: 0,
    clicks: 0
  },
  {
    id: '9',
    title: 'Chevening Scholarships - Kenya Track',
    provider: 'UK Government - British Council Kenya',
    category: 'Scholarship',
    description: 'Fully-funded scholarships for outstanding Kenyan leaders to pursue one-year master\'s degrees in the UK.',
    fullDescription: 'Chevening Scholarships enable outstanding emerging leaders from Kenya to pursue one-year master\'s degrees at top UK universities. The program seeks individuals with leadership potential who can demonstrate how they will contribute to positive change in Kenya and the region.',
    deadline: '2025-11-07',
    location: 'International',
    eligibility: {
      educationLevel: 'PostGrad',
      requirements: [
        'Kenyan citizen',
        'Bachelor\'s degree from recognized university',
        'Minimum 2 years work experience',
        'Strong leadership and networking skills',
        'English proficiency (IELTS 6.5+)'
      ]
    },
    benefits: [
      'Full tuition fees at UK universities',
      'Monthly living allowance (GBP 1,470)',
      'Visa application fee paid',
      'Travel costs to and from UK',
      'Access to exclusive events',
      'Global Chevening alumni network'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://www.chevening.org/apply',
    featured: true,
    dateAdded: '2026-01-15',
    logoUrl: '/images/opportunities/uk.jpg',
    views: 0,
    clicks: 0
  },
  {
    id: '23',
    title: 'Deloitte East Africa Graduate Program',
    provider: 'Deloitte Kenya',
    category: 'Internship',
    description: 'Two-year graduate program for recent graduates in audit, tax, consulting.',
    fullDescription: 'Deloitte\'s Graduate Program rotates recent graduates through different service lines and client engagements. Strong training, mentorship, and clear career progression paths in professional services.',
    deadline: '2026-02-10',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      requirements: [
        'Recent graduate (completed within 2 years)',
        'Bachelor\'s degree in accounting, finance, business, or IT',
        'Strong academic performance',
        'Excellent communication and analytical skills'
      ]
    },
    benefits: [
      'Competitive salary (KES 250,000+/month)',
      'Professional training and certifications',
      'Mentorship from partners',
      'Clear progression to permanent roles',
      'International exposure'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://deloitte.co.ke/careers',
    duration: '24 months',
    featured: true,
    dateAdded: '2026-02-01',
    logoUrl: '/images/opportunities/internship.avif',
    views: 0,
    clicks: 0
  },
  {
    id: '28',
    title: 'City of Boston Summer Internship Program 2026',
    provider: 'City of Boston',
    category: 'Internship',
    description: 'A paid summer internship with the City of Boston at $20/hr, 35 hours per week, working across city departments on real projects in public service, communications, data, and community engagement.',
    fullDescription: 'The City of Boston Summer Internship Program offers undergraduate and graduate students a structured, full-time paid internship across a wide range of municipal departments. Interns contribute to real projects including drafting reports, designing social media content, analysing data, supporting community events, and assisting constituents directly. The programme runs at 35 hours per week at $20.00 per hour.',
    deadline: '2026-03-06',
    location: 'USA',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Public Administration', 'Communications', 'Social Sciences', 'Any Field'],
      requirements: [
        'Currently enrolled in an undergraduate or graduate programme, or 2–4 years of post-secondary work experience',
        'Strong written and verbal communication skills',
        'Ability to collaborate with people of all backgrounds and cultures',
        'Effective time management and ability to meet deadlines',
        'Genuine interest in community service and public sector work'
      ]
    },
    benefits: [
      'Competitive hourly wage of $20.00 per hour',
      'Full-time, 35 hours per week in a professional government environment',
      'Practical skills in research, data analysis, communications, and event support',
      'Mentorship and constructive feedback throughout the programme',
      "Tangible impact within Boston's neighbourhoods and communities"
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://city-boston.icims.com/jobs/31599/2026-summer-intern/job?mode=view',
    fundingType: 'Stipend',
    duration: 'Summer 2026 (35 hrs/week)',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/internship.avif',
    views: 0,
    clicks: 0
  },
  {
    id: '29',
    title: 'ESO Science Communication Internship 2026',
    provider: 'European Southern Observatory',
    category: 'Internship',
    description: 'A fully funded science communication internship at ESO headquarters in Germany. Covers monthly living allowance, accommodation, and a return flight from your home country. Open to applicants worldwide.',
    fullDescription: 'The European Southern Observatory (ESO) Science Communication Internship offers students and recent graduates the chance to work with ESO\'s Department of Communication in Garching, Germany. Interns contribute to news articles, press releases, web content, video scripts, and exhibition materials. The internship runs for 3–6 months on a rolling basis, with applications reviewed every 4–6 months.',
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
        'Understanding of astronomy and science outreach'
      ]
    },
    benefits: [
      'Monthly allowance to cover living expenses',
      'Accommodation provided',
      'Return flight from/to home country covered',
      'Work with world-renowned scientists and communicators',
      'International and multicultural work environment'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://recruitment.eso.org/',
    fundingType: 'Fully Funded',
    duration: '3 to 6 months',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/european-union.jpg',
    views: 0,
    clicks: 0
  },
  {
    id: '30',
    title: 'WFP Internship Program 2026',
    provider: 'World Food Programme',
    category: 'Internship',
    description: 'A paid internship with the UN World Food Programme open to students in any field. Offers a stipend of up to $1,000/month, medical insurance, and a flexible duration of 2–8 months across global WFP offices.',
    fullDescription: 'The World Food Programme (WFP) Internship Program is a short-term learning opportunity for outstanding students from across the world. Interns work in WFP offices globally across fields such as logistics, communications, data, and nutrition — directly contributing to efforts to achieve zero hunger. WFP provides a stipend of up to US$1,000 per month, medical and accident insurance for interns from developing countries, certified sick leave, and potential visa support.',
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
        'Strong teamwork skills and willingness to take on challenges'
      ]
    },
    benefits: [
      'Stipend of up to $1,000 per month (based on duty station)',
      'Medical and accident insurance for interns from developing countries',
      'Certified sick leave',
      'Visa support may be available',
      'Training and e-learning resources',
      'Real-world experience contributing to zero hunger goals'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://wd3.myworkdaysite.com/recruiting/wfp/job_openings?workerSubType=59387fe40123101e856f1834e09b0002',
    fundingType: 'Stipend',
    duration: '2 to 8 months',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/wfp.png',
    views: 0,
    clicks: 0
  },
  {
    id: '31',
    title: 'AFRIKA KOMMT! Fellowship Programme 2026/2028',
    provider: 'AFRIKA KOMMT!',
    category: 'Fellowship',
    description: 'A prestigious fellowship connecting young African professionals with leading German companies for 12 months of hands-on work experience in Germany.',
    fullDescription: 'AFRIKA KOMMT! is a unique initiative by leading German companies offering young professionals from sub-Saharan Africa the opportunity to gain valuable work experience in Germany. Fellows are embedded in partner companies including BioNTech, B.Braun, Boehringer Ingelheim, Merck KGaA, ODDO BHF, Robert Bosch, and SAP SE, working on real projects for 12 months and gaining international exposure, mentorship, and professional development.',
    deadline: '2026-03-22',
    location: 'Germany',
    eligibility: {
      educationLevel: 'Graduate',
      fieldOfStudy: ['Business', 'Engineering', 'Technology', 'Sciences', 'Finance'],
      requirements: [
        'Citizen of a sub-Saharan African country',
        'University degree (Bachelor\'s or Master\'s)',
        'Minimum 2 years of professional work experience',
        'Strong command of English (German is a plus)',
        'Between 28 and 35 years old at the start of the programme',
        'Must return to home country after completion',
        'Not currently living in Germany or enrolled in a German academic programme'
      ]
    },
    benefits: [
      'Paid 12-month fellowship at a top German company',
      'Partner companies: BioNTech, B.Braun, Boehringer Ingelheim, Merck KGaA, ODDO BHF, Robert Bosch, SAP SE',
      'Monthly stipend and accommodation support',
      'Intercultural training and German language course',
      'Networking events and alumni community',
      'Mentorship from senior company professionals',
      'Return flight and visa support'
    ],
    applicationType: 'Online Application',
    applicationLink: 'https://afrika-kommt.de/15th-apply/',
    duration: '1 year',
    featured: true,
    dateAdded: '2026-03-03',
    logoUrl: '/images/opportunities/fellowship.avif',
    views: 0,
    clicks: 0
  },
  {
    id: '32',
    title: 'IEEE Africa Entrepreneurship Summit Hackathon 2026',
    provider: 'IEEE Africa & IEEE YESIST12',
    category: 'Hackathon',
    description: "A collaborative Hackathon empowering students and young innovators to develop scalable, technology-driven solutions addressing Africa's most pressing challenges. Top teams win fully funded travel to present at IEEE YESIST12 2026 in Indonesia.",
    fullDescription: "This Hackathon is organized as a collaboration between the IEEE Africa Entrepreneurship Summit and IEEE YESIST12, aligned with YESIST12's Innovation and Sustainable Impact tracks. It empowers students and young innovators to develop scalable, technology-driven solutions addressing Africa's most pressing social, economic, and environmental challenges. Selected top teams will receive fully funded travel grants — covering transport, accommodation, and all costs — to represent their solutions at IEEE YESIST12 2026 in Indonesia.\n\nThematic Areas:\n• Climate & Sustainable Agriculture\n• Clean Energy & Sustainable Infrastructure\n• HealthTech & Well-being\n• Education & Digital Inclusion\n• Economic Empowerment & Smart Communities",
    deadline: '2026-03-10',
    location: 'Indonesia',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Technology', 'Engineering', 'Business', 'Health Sciences', 'Environmental Science', 'Education'],
      requirements: [
        'Teams of 3 to 5 members',
        'Open to students and young innovators across Africa',
        'Solution must address one of the 5 thematic areas',
        'All submitted details must be accurate and truthful'
      ]
    },
    benefits: [
      'Fully funded transport to Indonesia for top teams',
      'Fully covered accommodation in Indonesia',
      'All costs covered for finals presentation at IEEE YESIST12 2026',
      'Present at IEEE YESIST12 2026 in Indonesia',
      'Exposure to the global IEEE innovation network'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://bit.ly/AfricaEntHack',
    contactEmail: 'kipngeno.koech@ieee.org',
    contactLink: 'mailto:kipngeno.koech@ieee.org',
    fundingType: 'Fully Funded',
    featured: true,
    dateAdded: '2026-03-03',
    logoUrl: '/images/opportunities/ieee_yesist.jpeg',
    views: 0,
    clicks: 0
  },
  {
    id: '33',
    title: '2026 IEEE PES/IAS PowerAfrica Conference — Call for Papers',
    provider: 'IEEE Power & Energy Society (PES) / Industry Applications Society (IAS)',
    category: 'CallForPapers',
    description: 'Submit a peer-reviewed paper to the premier IEEE energy conference happening in Nairobi, Kenya. Get published on IEEE Xplore, access travel grants, and network with global energy leaders — with a massive local cost advantage for Kenyan authors.',
    fullDescription: `The 2026 IEEE PES/IAS PowerAfrica Conference is the premier international forum for researchers, engineers, and practitioners working at the frontier of energy systems and industrial decarbonization. Held under the theme "Accelerating Resilient Energy Systems & Industrial Decarbonization through Innovation," the conference convenes academia, government, industry, electric utilities, telecom, manufacturing, and tech firms.

The conference takes place in Nairobi, Kenya, 21–25 September 2026 — meaning Kenyan authors enjoy the full prestige of an international IEEE publication without the burden of expensive intercontinental travel.

────────────────────────────────────
 WHY PUBLISHING AN IEEE PAPER MATTERS
────────────────────────────────────

📖 Global Visibility via IEEE Xplore
Accepted papers are permanently published on IEEE Xplore — the world's leading engineering database, accessed by millions of researchers and companies globally. Your work becomes fully searchable, citable, and part of the permanent tech record.

🎓 Academic & Career Prestige
IEEE is the gold standard in engineering and technology. A peer-reviewed IEEE paper on your CV dramatically improves your chances of MS/PhD admission, scholarship awards, and hiring at top-tier tech or energy firms worldwide.

🤝 Elite Networking
PowerAfrica convenes decision-makers from academia, government energy regulators, utilities (like KenGen, KPLC), telecom, and global manufacturing firms. Presenting a paper gives you a direct line to collaborate with future employers, supervisors, and funders.

✅ Proof of Skill
Surviving the rigorous IEEE double-blind peer-review process validates your ability to conduct original research, handle complex data, and communicate technical ideas to an expert international audience.

────────────────────────────────────
 FUNDING & FINANCIAL SUPPORT
────────────────────────────────────

💰 Student Travel Grants (STGs)
Both IEEE PES and IAS offer competitive travel grants typically ranging from $500–$1,500 USD to help student authors cover flights, visas, and accommodation. Grants are competitive and require an accepted paper.

🏨 Student Housing Support
IEEE PES runs housing support programs providing complimentary hotel accommodation (usually up to 4 nights) for student members presenting papers or posters.

🎟️ Steep Registration Discounts
Professional registration costs $600–$800 USD. IEEE Student Members pay heavily subsidised rates — often 50% or more off the standard price.

🏆 Awards & Cash Prizes
The conference features Best Paper Awards, Outstanding Student Scholarships, and Student Poster Contests with significant cash prizes, plaques, and elevated professional recognition.

⚠️ THE REIMBURSEMENT REALITY
IEEE travel grants are almost entirely reimbursement-based. You must front the money for flights and accommodation, attend the conference, submit receipts, and receive payment back within ~45 days post-conference. You need upfront funding from your university department or personal savings before you go.

────────────────────────────────────
 IEEE MEMBERSHIP — WHAT YOU NEED
────────────────────────────────────

To access the cheapest registration rates or be eligible for travel grants, you must be an active IEEE Student Member AND a member of the sponsoring society (PES or IAS) at the time of application. Student membership costs approximately $32 USD/year globally, which is a worthwhile investment given the discounts and grant access it unlocks.

Join at: ieee.org/membership

────────────────────────────────────
 THE NAIROBI LOCAL ADVANTAGE
────────────────────────────────────

Because this year's conference is in Nairobi, Kenyan authors have a rare and massive financial advantage. You can earn the full international prestige of an IEEE PowerAfrica publication — without expensive intercontinental flights, heavy hotel costs, or visa bureaucracy. This is a once-in-a-career opportunity for local students and engineers to step onto the global stage in their own city.

────────────────────────────────────
 SUBMISSION REQUIREMENTS
────────────────────────────────────

• Use the official IEEE double-column paper template (A4 or US Letter)
• Papers will be desk-rejected for poor English, lack of novel contribution, or incorrect formatting
• IEEE uses aggressive plagiarism detection — self-plagiarism also results in an immediate ban
• Peer review is double-blind and rigorous — this is not pay-to-play

📅 Paper Submission Deadline: 05 April 2026
📅 Acceptance Notification: 22 May 2026`,
    deadline: '2026-04-05',
    location: 'Nairobi, Kenya',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Electrical Engineering', 'Power Systems', 'Renewable Energy', 'Computer Science', 'AI & Machine Learning', 'Telecommunications', 'Environmental Engineering', 'Industrial Engineering'],
      requirements: [
        'Open to undergraduate students, postgraduate researchers, academics, and industry professionals',
        'Must submit an original, unpublished paper using the IEEE double-column template',
        'IEEE Student Membership required to access travel grants and discounted registration',
        'Paper must make a novel technical contribution — no plagiarism or self-plagiarism',
        'All co-authors must be listed accurately at the time of submission',
        'At least one author must register for the conference if the paper is accepted'
      ]
    },
    benefits: [
      'Paper permanently published on IEEE Xplore — globally searchable and citable',
      'IEEE PES/IAS Student Travel Grants: $500–$1,500 USD (reimbursement-based)',
      'Complimentary hotel accommodation for student presenters (up to 4 nights)',
      'Heavily discounted conference registration for IEEE Student Members (50%+ off)',
      'Best Paper Awards, Outstanding Student Scholarships, and cash prizes',
      'Direct networking with global energy researchers, regulators, and industry leaders',
      'Massive cost advantage for Kenyan authors — no international flights needed',
      'Peer-reviewed credential that significantly boosts CV for MS/PhD admissions and top-tier jobs'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://ieee-powerafrica.org/call-for-papers/',
    fundingType: 'Partially Funded',
    duration: '21–25 September 2026',
    featured: true,
    dateAdded: '2026-03-04',
    logoUrl: '/images/opportunities/ieee_pac.jpeg',
    thematicAreas: [
      { heading: 'Renewable Energy & Low-Carbon Technologies', topics: ['Renewable generation modeling & forecasting', 'Inverter-based and grid-forming technologies', 'Hybrid and low-carbon power systems', 'Power electronics for renewable integration'] },
      { heading: 'Power System Resilience & Infrastructure', topics: ['Power system planning and optimization', 'Grid resilience and climate adaptation', 'Protection, stability, and control', 'Transmission and distribution infrastructure'] },
      { heading: 'Digitalization, AI & Cyber-Physical Systems', topics: ['AI and machine learning in power systems', 'Digital twins and advanced analytics', 'Smart grids and automation', 'Cybersecurity and cyber-physical resilience'] },
      { heading: 'Power Systems & Energy Storage', topics: ['Power generation, transmission & distribution', 'Power system stability & failure analysis', 'Security in smart grid networks', 'Energy storage for renewables integration'] },
      { heading: 'Distributed Energy & Microgrids', topics: ['EV systems, battery tech & management', 'Grid-to-Vehicle (G2V) and Vehicle-to-Grid (V2G)', 'V2I, IoT and communication technologies', 'Control systems, drives & charging stations'] },
      { heading: 'Industrial Electrification & Decarbonization', topics: ['Industrial electrification pathways', 'Electric mobility and EV socio-economic impacts', 'Sustainable transport safety', 'Decarbonization business models & policy'] },
      { heading: 'Energy Markets, Policy & Regulation', topics: ['Energy market design and regulation', 'Cross-sector integration frameworks', 'Policy for resilient low-carbon systems', 'Africa-specific energy transition strategies'] },
      { heading: 'Short Papers & Emerging Ideas', topics: ['Emerging ideas and early-stage research', 'Case studies from African energy projects', 'Work-in-progress and pilot studies', 'Student and early-career researcher papers'] }
    ],
    views: 0,
    clicks: 0
  },
  {
    id: '34',
    title: 'Canadian Government Study in Canada Scholarships 2026–2027',
    provider: 'Global Affairs Canada (EduCanada)',
    category: 'Scholarship',
    description: 'Fully funded short-term exchange scholarships for international students from 20 eligible countries — including Kenya — to study or research at Canadian universities. Worth up to $14,000 USD. Applied through your home institution, not directly.',
    fullDescription: `The Study in Canada Scholarships (SICS) are funded by Global Affairs Canada through the Academic Relations program. They offer students from 20 eligible countries a short-term exchange at a Canadian post-secondary institution for study or research. Kenya is on the eligible countries list.

────────────────────────────────────
HOW IT WORKS — CRITICAL TO UNDERSTAND
────────────────────────────────────

You cannot apply directly as a student. Only Canadian post-secondary institutions submit applications on students’ behalf. The process works like this:

• Your home university must have an existing exchange agreement with a Canadian Designated Learning Institution (DLI)
• The Canadian institution identifies and selects you
• They submit your Privacy Notice Statement (PNS) — signed and dated within the last 6 months — through the My EduCanada portal
• They email a Management and Accountability Framework (MAF) to Scholarships-Info-Bourses@international.gc.ca
• If selected, the Canadian institution receives the funds and disburses them directly to you

📌 Your first step: Contact your university’s international office and ask if they have an active exchange partnership with a Canadian DLI.

────────────────────────────────────
SCHOLARSHIP VALUE & DURATION
────────────────────────────────────

💰 $10,200 USD — College or Undergraduate level, 4 months (one academic term)
💰 $10,200 USD — Graduate (Masters/PhD), 4 months of study or research
💰 $14,000 USD — Graduate (Masters/PhD), 5 to 6 months of study or research
💰 $500 USD — Additional per scholarship paid to the Canadian institution for administrative costs

Tuition is fully waived by the Canadian host institution. Scholarship funds cover:
• Airfare (most economical route)
• Health insurance
• Accommodation and food
• Books and other research requirements

Note: Computers and equipment are NOT covered.

────────────────────────────────────
ELIGIBLE COUNTRIES
────────────────────────────────────

🌏 Asia: Bangladesh, Nepal, Taiwan
🌍 Europe: Türkiye, Ukraine
🌍 Middle East & North Africa: Algeria, Egypt, Jordan, Morocco, Tunisia
🌍 Sub-Saharan Africa: Burkina Faso, Ethiopia, Ghana, Ivory Coast, Kenya ✅, Nigeria, Rwanda, Senegal, Tanzania, Uganda

────────────────────────────────────
KEY RESTRICTIONS
────────────────────────────────────

• No clinical training or direct patient care allowed
• Cannot hold Canadian citizenship or permanent residency (or have a pending application)
• Cannot already be enrolled in a degree program at a Canadian institution
• Cannot hold another Global Affairs Canada (GAC/DFATD) grant simultaneously — all sources must be declared
• Must return to your home institution after completing the scholarship
• All project activities must be completed by September 30, 2027

────────────────────────────────────
KEY DATES
────────────────────────────────────

📅 Application deadline (Canadian institutions): March 31, 2026 at 11:59 PM EDT
📅 Notification of results to institutions: May 2026
📅 All activities must be completed by: September 30, 2027`,
    deadline: '2026-03-31',
    location: 'Canada',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['All Academic Fields'],
      requirements: [
        'Citizen of one of the 20 eligible countries — Kenya is eligible',
        'Enrolled full-time at a post-secondary institution in your home country',
        'Currently paying tuition fees to your home institution',
        'Your home institution must have an exchange agreement with a Canadian DLI',
        'Must complete all program activities by September 30, 2027',
        'No Canadian citizenship, permanent residency, or pending application',
        'Not already enrolled in a degree program at a Canadian institution',
        'No other active Global Affairs Canada (GAC/DFATD) funding — all sources must be declared',
        'Must return to home institution after the exchange',
        'No clinical training or direct patient care involvement'
      ]
    },
    benefits: [
      '$10,200 USD for 4-month undergraduate or graduate exchange',
      '$14,000 USD for 5–6 month graduate (Masters/PhD) exchange',
      'Full tuition waiver at the Canadian host institution',
      'Airfare covered (most economical route)',
      'Health insurance fully covered',
      'Living costs covered — accommodation, food, books',
      'Research materials and requirements covered',
      'Exposure to Canadian academic and research environment',
      'Strengthens international academic linkages and CV'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://www.educanada.ca/scholarships-bourses/can/institutions/study-in-canada-sep-etudes-au-canada-pct.aspx?lang=eng',
    contactEmail: 'Scholarships-Info-Bourses@international.gc.ca',
    contactLink: 'mailto:Scholarships-Info-Bourses@international.gc.ca',
    fundingType: 'Fully Funded',
    duration: '4 to 6 months',
    featured: true,
    dateAdded: '2026-03-04',
    logoUrl: '/images/opportunities/canada.jpg',
    views: 0,
    clicks: 0
  },
  {
    id: '35',
    title: 'EEML Summer School 2026',
    provider: 'Eastern European Machine Learning (EEML)',
    category: 'Conference',
    description: 'A fully funded 6-day intensive summer school in Cetinje, Montenegro covering Artificial Intelligence and Machine Learning — including Deep Learning and Reinforcement Learning. Open to all countries, all academic levels, ages 18+.',
    fullDescription: 'The Eastern European Machine Learning (EEML) Summer School 2026 is a fully funded intensive programme held in Cetinje, Montenegro from 27 July to 1 August 2026. The school focuses on high-level training in Artificial Intelligence and Machine Learning, with sessions covering fundamental and advanced topics including Deep Learning and Reinforcement Learning.',
    deadline: '2026-03-31',
    location: 'Montenegro',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Computer Science', 'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Mathematics', 'Engineering', 'Any Field'],
      requirements: [
        'Open to applicants from all countries worldwide',
        'Must be 18 years or older at the time of application',
        'Any academic level: high school, undergraduate, master\'s, PhD, or postdoctoral',
        'Interest in Machine Learning and Artificial Intelligence',
        'No prior ML expertise required — all levels welcome'
      ]
    },
    benefits: [
      'Fully funded — travel costs covered for selected participants',
      'Accommodation provided for the full duration',
      'Registration fees fully waived',
      'Meals included during the programme',
      'Certificate of participation',
      'Lectures on Deep Learning and Reinforcement Learning',
      'Poster sessions and networking with international AI/ML researchers',
      'Social events and intercultural exchange'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://docs.google.com/forms/d/e/1FAIpQLSe0t-ZqFnKIF6KsEBMAC7UZg51kbItfuYfmrg9EqPZgcXDFKQ/viewform',
    contactLink: 'https://www.eeml.eu/',
    fundingType: 'Fully Funded',
    duration: '27 July – 1 August 2026 (6 days)',
    featured: true,
    dateAdded: '2026-03-04',
    logoUrl: '/images/opportunities/montenegro.jpg',
    views: 0,
    clicks: 0
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
    duration: 'Bachelor: 4 years | Masters: 2–3 years | PhD: 4–5 years',
    featured: true,
    dateAdded: '2026-03-05',
    logoUrl: '/images/opportunities/australia.jpg',
    thematicAreas: [
      {
        heading: 'General',
        topics: ['All academic fields (excluding aviation, nuclear technology, and military training)']
      }
    ],
    views: 0,
    clicks: 0
  },
  {
    id: '37',
    title: 'Non-Revenue Water Crisis — Can You Help Nairobi Fix It?',
    provider: 'LearnOpportunities Kenya',
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
    dateAdded: '2026-03-06',
    logoUrl: '/images/opportunities/tech.avif',
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
    ],
    views: 0,
    clicks: 0
  }
];

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const collection = db.collection('opportunities');

    console.log('🧹 Clearing existing opportunities...');
    await collection.deleteMany({});

    console.log(`📥 Inserting ${opportunities.length} opportunities into MongoDB...`);
    const result = await collection.insertMany(opportunities);

    console.log(`✅ Successfully inserted ${result.insertedCount} opportunities!`);
    console.log('\n📊 Database Summary:');
    console.log(`   - Total opportunities: ${result.insertedCount}`);
    console.log(`   - Kenya-based: 18`);
    console.log(`   - International: 15`);
    console.log(`   - Categories: CallForPapers (5), Internship (12), Grant (5), Conference (4), Scholarship (6)`);
    console.log(`   - Featured opportunities: 21`);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  }
}

seedDatabase();
