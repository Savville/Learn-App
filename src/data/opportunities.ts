export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  category: 'CallForPapers' | 'Internship' | 'Grant' | 'Conference' | 'Scholarship' | 'Fellowship' | 'Attachment' | 'Hackathon' | 'Event' | 'Volunteer' | 'Challenge' | 'Project' | 'Other';
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
  fundingType?: 'Fully Funded' | 'Partially Funded' | 'Paid Internship' | 'Unpaid Internship';
  duration?: string;
  featured: boolean;
  dateAdded: string;
  logoUrl: string;
  postedBy?: string;
  thematicAreas?: { heading: string; topics: string[] }[];
}

export const opportunities: Opportunity[] = [
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
    fundingType: 'Fully Funded',
    featured: true,
    dateAdded: '2026-02-01',
    logoUrl: '/images/opportunities/mastercard-scholarship.jpg'
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
    fundingType: 'Fully Funded',
    featured: true,
    dateAdded: '2026-01-15',
    logoUrl: '/images/opportunities/uk.jpg'
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
    logoUrl: '/images/opportunities/internship.avif'
  },
  {
    id: '28',
    title: 'City of Boston Summer Internship Program 2026',
    provider: 'City of Boston',
    category: 'Internship',
    description: 'A paid summer internship with the City of Boston at $20/hr, 35 hours per week, working across city departments on real projects in public service, communications, data, and community engagement.',
    fullDescription: 'The City of Boston Summer Internship Program offers undergraduate and graduate students a structured, full-time paid internship across a wide range of municipal departments. Interns contribute to real projects including drafting reports, designing social media content, analysing data, supporting community events, and assisting constituents directly. The programme runs at 35 hours per week at $20.00 per hour, providing valuable professional development in public administration and civic leadership. Applicants must demonstrate strong communication skills, an ability to work with diverse teams, and a genuine interest in community service.',
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
      'Tangible impact within Boston\'s neighbourhoods and communities'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://city-boston.icims.com/jobs/31599/2026-summer-intern/job?mode=view',
    fundingType: 'Paid Internship',
    duration: 'Summer 2026 (35 hrs/week)',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/boston.jpg'
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
    duration: '2 to 8 months',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/wfp.png'
  },
  {
    id: '31',
    title: 'AFRIKA KOMMT! Fellowship Programme 2026/2028',
    provider: 'AFRIKA KOMMT!',
    category: 'Fellowship',
    description: 'One-year career and life transformational fellowship placing visionary young African professionals at leading German companies including SAP, Bosch, Merck, BioNTech and more.',
    fullDescription: 'AFRIKA KOMMT! brings together the most visionary young leaders from Africa and leading German companies. The African fellows dive deep into German corporate culture, business spirit, and gain an unparalleled one-year career experience. Companies benefit from the expertise, local network and unique African perspective of the young professionals. Available positions span AI, engineering, business, HR, finance, sustainability, and more across 7 top German companies: BioNTech SE, B. Braun SE, Boehringer Ingelheim, Merck KGaA, ODDO BHF, Robert Bosch GmbH, and SAP SE.',
    deadline: '2026-03-22',
    location: 'Germany',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Business', 'Engineering', 'Technology', 'Finance', 'Human Resources', 'Science', 'Management'],
      requirements: [
        'Citizen of any African country',
        'University degree in a relevant subject',
        'Postgraduate degree (e.g. MBA) is an advantage',
        '2 to 5 years of work experience',
        'Excellent English language skills',
        'Basic knowledge of German is an advantage',
        'Not older than 35 years at time of application'
      ]
    },
    benefits: [
      'One year career experience at a leading German company',
      'Leadership and management competency development',
      'Access to networks and career acceleration opportunities',
      'Intercultural competence and global perspective',
      'Positions available at SAP, Bosch, Merck, BioNTech, Boehringer Ingelheim, B. Braun and ODDO BHF',
      'Exposure to German corporate culture and innovation',
      'Personal and professional growth'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://afrika-kommt.de/15th-apply/',
    duration: '1 year',
    featured: true,
    dateAdded: '2026-03-03',
    logoUrl: '/images/opportunities/afrika_kommt.png'
  },
  {
    id: '32',
    title: 'IEEE Africa Entrepreneurship Summit Hackathon 2026',
    provider: 'IEEE Africa & IEEE YESIST12',
    category: 'Hackathon',
    description: 'A collaborative Hackathon empowering students and young innovators to develop scalable, technology-driven solutions addressing Africa\'s most pressing challenges. Top teams win fully funded travel to present at IEEE YESIST12 2026 in Indonesia.',
    fullDescription: 'This Hackathon is organized as a collaboration between the IEEE Africa Entrepreneurship Summit and IEEE YESIST12, aligned with YESIST12\'s Innovation and Sustainable Impact tracks. It empowers students and young innovators to develop scalable, technology-driven solutions addressing Africa\'s most pressing social, economic, and environmental challenges. Selected top teams will receive fully funded travel grants — covering transport, accommodation, and all costs — to represent their solutions at IEEE YESIST12 2026 in Indonesia.\n\nThematic Areas:\n• Climate & Sustainable Agriculture\n• Clean Energy & Sustainable Infrastructure\n• HealthTech & Well-being\n• Education & Digital Inclusion\n• Economic Empowerment & Smart Communities',
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
    logoUrl: '/images/opportunities/ieee_yesist.jpeg'
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
      {
        heading: 'Renewable Energy & Low-Carbon Technologies',
        topics: [
          'Renewable generation modeling & forecasting',
          'Inverter-based and grid-forming technologies',
          'Hybrid and low-carbon power systems',
          'Power electronics for renewable integration'
        ]
      },
      {
        heading: 'Power System Resilience & Infrastructure',
        topics: [
          'Power system planning and optimization',
          'Grid resilience and climate adaptation',
          'Protection, stability, and control',
          'Transmission and distribution infrastructure'
        ]
      },
      {
        heading: 'Digitalization, AI & Cyber-Physical Systems',
        topics: [
          'AI and machine learning in power systems',
          'Digital twins and advanced analytics',
          'Smart grids and automation',
          'Cybersecurity and cyber-physical resilience'
        ]
      },
      {
        heading: 'Power Systems & Energy Storage',
        topics: [
          'Power generation, transmission & distribution',
          'Power system stability & failure analysis',
          'Security in smart grid networks',
          'Energy storage for renewables integration'
        ]
      },
      {
        heading: 'Distributed Energy & Microgrids',
        topics: [
          'EV systems, battery tech & management',
          'Grid-to-Vehicle (G2V) and Vehicle-to-Grid (V2G)',
          'V2I, IoT and communication technologies',
          'Control systems, drives & charging stations'
        ]
      },
      {
        heading: 'Industrial Electrification & Decarbonization',
        topics: [
          'Industrial electrification pathways',
          'Electric mobility and EV socio-economic impacts',
          'Sustainable transport safety',
          'Decarbonization business models & policy'
        ]
      },
      {
        heading: 'Energy Markets, Policy & Regulation',
        topics: [
          'Energy market design and regulation',
          'Cross-sector integration frameworks',
          'Policy for resilient low-carbon systems',
          'Africa-specific energy transition strategies'
        ]
      },
      {
        heading: 'Short Papers & Emerging Ideas',
        topics: [
          'Emerging ideas and early-stage research',
          'Case studies from African energy projects',
          'Work-in-progress and pilot studies',
          'Student and early-career researcher papers'
        ]
      }
    ]
  },
  {
    id: '34',
    title: 'Canadian Government Study in Canada Scholarships 2026\u20132027',
    provider: 'Global Affairs Canada (EduCanada)',
    category: 'Scholarship',
    description: 'Fully funded short-term exchange scholarships for international students from 20 eligible countries \u2014 including Kenya \u2014 to study or research at Canadian universities. Worth up to $14,000 USD. Applied through your home institution, not directly.',
    fullDescription: `The Study in Canada Scholarships (SICS) are funded by Global Affairs Canada through the Academic Relations program. They offer students from 20 eligible countries a short-term exchange at a Canadian post-secondary institution for study or research. Kenya is on the eligible countries list.

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
HOW IT WORKS \u2014 CRITICAL TO UNDERSTAND
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

You cannot apply directly as a student. Only Canadian post-secondary institutions submit applications on students\u2019 behalf. The process works like this:

\u2022 Your home university must have an existing exchange agreement with a Canadian Designated Learning Institution (DLI)
\u2022 The Canadian institution identifies and selects you
\u2022 They submit your Privacy Notice Statement (PNS) \u2014 signed and dated within the last 6 months \u2014 through the My EduCanada portal
\u2022 They email a Management and Accountability Framework (MAF) to Scholarships-Info-Bourses@international.gc.ca
\u2022 If selected, the Canadian institution receives the funds and disburses them directly to you

\ud83d\udccc Your first step: Contact your university\u2019s international office and ask if they have an active exchange partnership with a Canadian DLI.

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
SCHOLARSHIP VALUE & DURATION
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

\ud83d\udcb0 $10,200 USD \u2014 College or Undergraduate level, 4 months (one academic term)
\ud83d\udcb0 $10,200 USD \u2014 Graduate (Masters/PhD), 4 months of study or research
\ud83d\udcb0 $14,000 USD \u2014 Graduate (Masters/PhD), 5 to 6 months of study or research
\ud83d\udcb0 $500 USD \u2014 Additional per scholarship paid to the Canadian institution for administrative costs

Tuition is fully waived by the Canadian host institution. Scholarship funds cover:
\u2022 Airfare (most economical route)
\u2022 Health insurance
\u2022 Accommodation and food
\u2022 Books and other research requirements

Note: Computers and equipment are NOT covered.

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
ELIGIBLE COUNTRIES
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

\ud83c\udf0f Asia: Bangladesh, Nepal, Taiwan
\ud83c\udf0d Europe: T\u00fcrkiye, Ukraine
\ud83c\udf0d Middle East & North Africa: Algeria, Egypt, Jordan, Morocco, Tunisia
\ud83c\udf0d Sub-Saharan Africa: Burkina Faso, Ethiopia, Ghana, Ivory Coast, Kenya \u2705, Nigeria, Rwanda, Senegal, Tanzania, Uganda

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
KEY RESTRICTIONS
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

\u2022 No clinical training or direct patient care allowed
\u2022 Cannot hold Canadian citizenship or permanent residency (or have a pending application)
\u2022 Cannot already be enrolled in a degree program at a Canadian institution
\u2022 Cannot hold another Global Affairs Canada (GAC/DFATD) grant simultaneously \u2014 all sources must be declared
\u2022 Must return to your home institution after completing the scholarship
\u2022 All project activities must be completed by September 30, 2027

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
KEY DATES
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

\ud83d\udcc5 Application deadline (Canadian institutions): March 31, 2026 at 11:59 PM EDT
\ud83d\udcc5 Notification of results to institutions: May 2026
\ud83d\udcc5 All activities must be completed by: September 30, 2027`,
    deadline: '2026-03-31',
    location: 'Canada',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['All Academic Fields'],
      requirements: [
        'Citizen of one of the 20 eligible countries \u2014 Kenya is eligible',
        'Enrolled full-time at a post-secondary institution in your home country',
        'Currently paying tuition fees to your home institution',
        'Your home institution must have an exchange agreement with a Canadian DLI',
        'Must complete all program activities by September 30, 2027',
        'No Canadian citizenship, permanent residency, or pending application',
        'Not already enrolled in a degree program at a Canadian institution',
        'No other active Global Affairs Canada (GAC/DFATD) funding \u2014 all sources must be declared',
        'Must return to home institution after the exchange',
        'No clinical training or direct patient care involvement'
      ]
    },
    benefits: [
      '$10,200 USD for 4-month undergraduate or graduate exchange',
      '$14,000 USD for 5\u20136 month graduate (Masters/PhD) exchange',
      'Full tuition waiver at the Canadian host institution',
      'Airfare covered (most economical route)',
      'Health insurance fully covered',
      'Living costs covered \u2014 accommodation, food, books',
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
    logoUrl: '/images/opportunities/canada.jpg'
  },
  {
    id: '35',
    title: 'EEML Summer School 2026',
    provider: 'Eastern European Machine Learning (EEML)',
    category: 'Conference',
    description: 'A fully funded 6-day intensive summer school in Cetinje, Montenegro covering Artificial Intelligence and Machine Learning — including Deep Learning and Reinforcement Learning. Open to all countries, all academic levels, ages 18+.',
    fullDescription: `The Eastern European Machine Learning (EEML) Summer School 2026 is a fully funded intensive programme held in Cetinje, Montenegro from 27 July to 1 August 2026. The school focuses on high-level training in Artificial Intelligence and Machine Learning, with sessions covering fundamental and advanced topics including Deep Learning and Reinforcement Learning.

The EEML Summer School was established to strengthen Machine Learning education across Eastern Europe while welcoming international participants from all regions. It offers a concentrated, research-oriented environment where participants engage in lectures, discussions, poster sessions, and social events alongside peers, researchers, and experts from across the world.

────────────────────────────────────
 WHAT IS COVERED (FULLY FUNDED)
────────────────────────────────────

✈️ Travel costs for selected participants
🏨 Accommodation for the duration of the programme
🎟️ Registration fees fully waived
🍽️ Meals during the programme
📜 Certificate of participation upon completion

────────────────────────────────────
 PROGRAMME CONTENT
────────────────────────────────────

• Deep Learning theory and practice
• Reinforcement Learning
• Advanced Machine Learning concepts
• Research presentations and poster sessions
• Direct interaction with leading AI/ML researchers
• Social events and networking opportunities

────────────────────────────────────
 KEY DETAILS
────────────────────────────────────

📍 Location: Cetinje, Montenegro
📅 Dates: 27 July – 1 August 2026 (6 days)
📅 Application deadline: 31 March 2026
🌍 Open to: All countries worldwide
🎓 Levels: High school, Undergraduate, Master's, PhD, Postdoctoral

────────────────────────────────────
 HOW TO APPLY
────────────────────────────────────

Submit your application via the official Google Form before the March 31 deadline. You will need to provide a CV and motivation details. Selections are competitive and based on academic background and interest in ML/AI.

For full programme details visit: https://www.eeml.eu/`,
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
    logoUrl: '/images/opportunities/montenegro.jpg'
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
    logoUrl: '/images/opportunities/australia2.jpg',
    thematicAreas: [
      {
        heading: 'General',
        topics: ['All academic fields (excluding aviation, nuclear technology, and military training)']
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
    ]  },
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
    id: '39',
    title: 'World Bank Group Youth Summit 2026',
    provider: 'World Bank Group',
    category: 'Conference',
    description: 'Fully funded global youth summit in Washington D.C. for young innovators aged 18–35. Theme: "Future Works: Designing Jobs for the Digital Age." Includes delegate and pitch competition tracks.',
    fullDescription: `The World Bank Group Youth Summit 2026 is one of the largest annual international youth gatherings organised by the World Bank Group. The summit will take place on June 11–12, 2026 in Washington, D.C., USA, in a hybrid format — participants may attend in person or virtually from anywhere in the world.

THEME: FUTURE WORKS — DESIGNING JOBS FOR THE DIGITAL AGE
The summit will bring together young innovators, leaders, and changemakers from around the world to discuss development challenges and explore innovative solutions for the future workforce. Focus areas include:
• Education and skills for the digital economy
• Entrepreneurship and job creation
• Agriculture and food systems innovation

TWO PARTICIPATION TRACKS

📋 Delegate Track
Participate in keynote speeches, panel discussions, workshops, and networking sessions with global experts, policymakers, and world leaders. Join the Young Changemaker Network and build lasting international connections.

🏆 Pitch Competition Track
Present a creative idea to solve pressing global challenges. Submit a project idea, pitch deck, and video pitch. Finalists present live at the summit and receive expert feedback, mentorship, and global exposure.

ELIGIBILITY
• Open to citizens of World Bank Group member countries
• Aged 18–35 at the time of the event
• Any academic or professional background welcome
• No GPA requirement
• Demonstrated interest in technology, development policy, entrepreneurship, or economic growth
• Proficiency in English required

APPLICATION DEADLINE: 11 March 2026

Apply via the official Google Form. Select your track (Delegate or Pitch Competition) and submit all required materials before the deadline.`,
    deadline: '2026-03-11',
    location: 'Washington D.C., USA',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: [],
      requirements: [
        'Citizen of a World Bank Group member country',
        'Aged 18–35 at the time of the event (June 2026)',
        'Any academic or professional background accepted',
        'Demonstrated interest in technology, development policy, entrepreneurship, or economic growth',
        'Proficiency in English (all activities conducted in English)',
        'Pitch Competition applicants must submit a project idea, pitch deck, and video pitch'
      ]
    },
    benefits: [
      'Round-trip airfare support for selected in-person participants',
      'Accommodation in Washington D.C. during the summit',
      'Stipend to cover living expenses',
      'Access to keynote sessions and panel discussions with global experts and policymakers',
      'Interactive workshops and hands-on learning sessions',
      'Live Q&A with speakers and finalists',
      'Networking with young leaders and global professionals',
      'Membership in the Young Changemaker Network',
      'Expert feedback and mentorship for Pitch Competition finalists'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://docs.google.com/forms/d/e/1FAIpQLScPHBBaYX8plrcX3pjR-BiLdmJt8OO8U5x1VQj511Tqs9_Jxw/viewform',
    fundingType: 'Fully Funded',
    duration: '2 days (June 11–12, 2026)',
    featured: true,
    dateAdded: '2026-03-09',
    logoUrl: '/images/opportunities/world_bank.png',
    thematicAreas: [
      {
        heading: 'Education & Digital Skills',
        topics: ['Reskilling for the digital economy', 'Access to quality education', 'Youth employability programmes']
      },
      {
        heading: 'Entrepreneurship & Jobs',
        topics: ['Youth-led job creation', 'Inclusive economic growth', 'Startup ecosystems in emerging markets']
      },
      {
        heading: 'Agriculture & Food Systems',
        topics: ['Agri-tech innovation', 'Climate-resilient farming', 'Food security and supply chains']
      },
      {
        heading: 'Pitch Competition',
        topics: ['Innovative solutions to global challenges', 'Live pitching to global experts', 'Mentorship and expert feedback']
      }
    ]  },
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
    featured: true,
    dateAdded: '2026-03-13',
    logoUrl: '/images/opportunities/german.jpg'
  },
  {
    id: '41',
    title: 'EEP Africa Call for Proposals 2026',
    provider: 'EEP Africa',
    category: 'Grant',
    description: 'Grant and repayable grant financing from EUR 200,000–500,000 to support early-stage, innovative clean energy projects in sub-Saharan Africa.',
    fullDescription: 'EEP Africa invites private companies, start-ups, and social enterprises from around the world to submit early-stage, innovative clean energy projects in partner countries across sub-Saharan Africa. The programme provides grant and repayable grant financing from EUR 200,000–500,000 to support feasibility studies, pilot projects, and scale-up initiatives.\n\nFunding ranges from EUR 200,000–500,000 with a co-financing requirement of 10%–50% depending on the project type and company maturity. The application process involves a 2-stage mechanism, beginning with an Expression of Interest and then moving to a Full Proposal for shortlisted candidates.\n\nProject Phases Supported include Feasibility Studies, Pilot Projects by Early-Stage Companies, and Scale-up & Replication Projects. Focus technologies include Residential Electricity Access, Productive Uses of Energy, Mini Grids, Power Generation, Clean Cooking, Electric Mobility, and Energy Efficiency. \n\nKey Dates:\n- Call Opens: 16 February 2026\n- EoI Deadline: 16 March 2026 (2 PM EAT)\n- Longlist Pitch Interviews: May 2026\n- Full Proposal Deadline: 27 July 2026 (2 PM EAT)\n- Final Decision: End of September 2026 (Final Investment Committee decision ends the evaluation process)\n- Deployment: October 2026 onwards.',
    deadline: '2026-03-16',
    location: 'Sub-Saharan and Southern Africa',
    eligibility: {
      educationLevel: 'All',
      fieldOfStudy: ['Clean Energy', 'Renewable Energy', 'Entrepreneurship'],
      requirements: [
        'Must be a private company, start-up, or social enterprise with commercial revenue model',
        'Registered as a legal entity for at least 6 months prior to EoI deadline',
        'Must have strong local presence in target country, be locally led, or have strong local partnerships',
        'NGOs, charities, research institutions, and government bodies can only serve as partners'
      ]
    },
    benefits: [
      'EUR 200,000–500,000 in grant or repayable grant financing',
      'Supports feasibility studies and pre-development (30% co-financing)',
      'Supports pilot and demonstration activities (10% cash + 20% in-kind co-financing for early stage)',
      'Supports scale-up equipment and installation (30%–50% co-financing for mature companies)',
      'Access to EEP Africa network and support'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://eepafrica.org/financing/2026-call-for-proposals',
    fundingType: 'Partially Funded',
    featured: true,
    dateAdded: '2026-03-15',
    logoUrl: '/images/opportunities/EEP.png'
  },
  {
    id: 'kpa-internship-2026',
    title: 'Kenya Ports Authority (KPA) Internship Program 2026',
    provider: 'Kenya Ports Authority (KPA)',
    category: 'Internship',
    description: '194 paid internship and apprenticeship vacancies across various departments for a one-year program designed to provide young professionals with hands-on experience in a leading maritime organization.',
    fullDescription: 'The Kenya Ports Authority (KPA) invites applications for 194 paid internship/apprenticeship roles for a one-year period starting April 2026. This program aims to provide young adults with hands-on experience and exposure to the real workplace environment within one of the region\'s leading maritime organizations, which is responsible for managing all scheduled seaports and inland waterways in Kenya.',
    deadline: '2026-03-27',
    location: 'Various locations including Mombasa, Lamu, Kisumu, Nairobi, and Naivasha',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Maritime Studies', 'Engineering (Electrical, Mechanical, Civil, Marine)', 'IT & Technology', 'Health & Safety', 'Supply Chain & Logistics', 'Human Resources', 'Finance & Risk Management', 'Communications & Marketing', 'Security', 'Legal', 'Administration'],
      requirements: [
        'Must be a Kenyan citizen, not more than 27 years old',
        'Must have graduated with a Degree, Diploma, or Certificate between Jan 2023 and Dec 2025',
        'Must not have undertaken a prior internship',
        'Not a retiree or having exited formal employment'
      ]
    },
    benefits: [
      'Gain hands-on experience in a leading maritime organization',
      'Exposure to the real workplace environment',
      'Work across various departments including operations, engineering, ICT, and administration',
      'Receive a monthly stipend (amount not specified)'
    ],
    applicationType: 'Platform Link',
    applicationLink: 'https://www.kpa.co.ke/Vacancies/Details/13',
    fundingType: 'Paid Internship',
    duration: '12 months',
    featured: true,
    dateAdded: '2026-03-15',
    logoUrl: '/images/opportunities/KPA.png'
  }
];

