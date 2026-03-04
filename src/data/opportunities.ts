export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  category: 'CallForPapers' | 'Internship' | 'Grant' | 'Conference' | 'Scholarship' | 'Fellowship' | 'Attachment' | 'Hackathon' | 'Event' | 'Volunteer' | 'Other';
  description: string;
  fullDescription: string;
  deadline: string;
  location?: string;
  eligibility: {
    educationLevel: 'UnderGrad' | 'PostGrad' | 'Both';
    fieldOfStudy?: string[];
    requirements: string[];
  };
  benefits: string[];
  applicationType: 'Online Form' | 'Email' | 'Platform Link';
  applicationLink: string;
  contactEmail?: string;
  contactLink?: string;
  fundingType?: 'Fully Funded' | 'Partially Funded' | 'Stipend' | 'Unpaid';
  duration?: string;
  featured: boolean;
  dateAdded: string;
  logoUrl: string;
  thematicAreas?: { heading: string; topics: string[] }[];
}

export const opportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Nairobi Tech Innovation Fellowship',
    provider: 'iHub Kenya',
    category: 'Internship',
    description: 'Six-month intensive fellowship for tech entrepreneurs in Nairobi with mentorship and co-working space.',
    fullDescription: 'The iHub Fellowship connects young tech entrepreneurs in Nairobi with experienced mentors, investors, and a vibrant community of innovators. You\'ll work on your startup, attend workshops, and gain access to resources needed to scale your venture.',
    deadline: '2026-03-30',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Technology', 'Entrepreneurship', 'Innovation'],
      requirements: [
        'Kenya-based or willing to relocate to Nairobi',
        'Innovative tech idea or early-stage startup',
        'Commitment to 6-month program',
        'Team or individual applicant'
      ]
    },
    benefits: [
      'Monthly stipend (KES 100,000)',
      'Dedicated co-working desk',
      'Access to mentor network',
      'Investor pitch opportunities',
      'Business support services'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://ihub.co.ke/fellowship',
    duration: '6 months',
    featured: true,
    dateAdded: '2026-02-09',
    logoUrl: '/images/opportunities/ihub.jpg',
    contactEmail: 'fellowship@ihub.co.ke'
  },
  {
    id: '2',
    title: 'Pan-African Research Grant for Climate Solutions',
    provider: 'African Climate Foundation',
    category: 'Grant',
    description: 'Research grants for university students developing climate solutions relevant to East Africa.',
    fullDescription: 'This grant program funds innovative research by African university students addressing climate change, environmental sustainability, and green technology. Projects should have direct relevance to East African countries and propose implementable solutions.',
    deadline: '2026-04-15',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Environmental Science', 'Engineering', 'Climate Studies'],
      requirements: [
        'Enrolled in East African university',
        'Active research proposal in climate/environment field',
        'Academic advisor endorsement',
        'Clear implementation plan'
      ]
    },
    benefits: [
      'Research grant up to KES 1,000,000',
      'Research supervision and support',
      'Publication support',
      'Conference presentation opportunities',
      'Network access to environmental organizations'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://africanclimate.org/grants',
    featured: true,
    dateAdded: '2026-02-10',
    logoUrl: '/images/opportunities/grant.avif',
    contactEmail: 'grants@africanclimate.org'
  },
  {
    id: '3',
    title: 'East Africa Education Conference 2026',
    provider: 'UNESCO Africa',
    category: 'Conference',
    description: 'Pan-African conference bringing together educators and students to discuss innovation in higher education.',
    fullDescription: 'The East Africa Education Conference features keynote speakers, panel discussions, and networking sessions focused on digital transformation, inclusive education, and career development. Students can present research, attend workshops, and connect with education leaders.',
    deadline: '2026-03-01',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'Both',
      requirements: [
        'Currently enrolled university student',
        'Interest in education or development',
        'Optional: Research paper for presentation track',
        'Application with motivation letter'
      ]
    },
    benefits: [
      'Free conference attendance',
      'Accommodation for 3 nights',
      'Meals during conference',
      'Certificate of participation',
      'Networking with education professionals'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://unesco.org/eastafricaconf',
    duration: '3 days',
    featured: true,
    dateAdded: '2026-02-11',
    logoUrl: '/images/opportunities/unesco.jpg'
  },
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
    logoUrl: '/images/opportunities/mastercard-scholarship.jpg'
  },
  {
    id: '5',
    title: 'AfriLabs - Tech Fellowship for Young Developers',
    provider: 'AfriLabs',
    category: 'Internship',
    description: 'One-year paid fellowship for software developers across Africa, based in Nairobi hub.',
    fullDescription: 'AfriLabs Tech Fellowship provides practical experience and mentoring for young software developers. Fellows work on real projects, receive hands-on training, and get exposure to the African tech ecosystem. The program culminates in potential job placements.',
    deadline: '2026-02-28',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      fieldOfStudy: ['Computer Science', 'Software Engineering', 'Information Technology'],
      requirements: [
        'Currently in 2nd or 3rd year of university',
        'Competent in at least one programming language',
        'Team player with good communication skills',
        'Passion for African tech solutions'
      ]
    },
    benefits: [
      'Monthly stipend (KES 80,000)',
      'Technical mentorship',
      'Hands-on project experience',
      'Networking with tech leaders',
      'Job placement support'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://afrilabs.com/fellowship',
    duration: '12 months',
    featured: true,
    dateAdded: '2026-02-12',
    logoUrl: '/images/opportunities/tech.avif'
  },
  {
    id: '6',
    title: 'Health Innovation Challenge - Kenya Medical Research Institute',
    provider: 'KEMRI',
    category: 'Grant',
    description: 'Funding for innovative health technology and biomedical research solutions addressing Kenyan healthcare challenges.',
    fullDescription: 'KEMRI\'s Health Innovation Challenge funds promising research and solutions that tackle critical health issues in Kenya. Projects ranging from diagnostic tools to treatment innovations are welcome. Successful teams receive funding, lab access, and expert mentorship.',
    deadline: '2026-03-31',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Medicine', 'Biomedical Science', 'Public Health', 'Engineering'],
      requirements: [
        'Team of university students or young researchers',
        'Clear project proposal addressing Kenyan health problem',
        'Preliminary feasibility assessment',
        'At least one experienced mentor'
      ]
    },
    benefits: [
      'Grant funding up to KES 2,000,000',
      'Laboratory facilities access',
      'Expert mentorship and supervision',
      'Publication support',
      'Networking with health organizations'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://kemri.go.ke/innovation',
    featured: true,
    dateAdded: '2026-02-13',
    logoUrl: '/images/opportunities/kemri.png'
  },
  {
    id: '7',
    title: 'African Leadership Academy Summer Program',
    provider: 'African Leadership Academy',
    category: 'Conference',
    description: 'Two-week summer program bringing together promising African students for leadership development and mentorship.',
    fullDescription: 'The ALA Summer Program hosts carefully selected young leaders from across Africa for an intensive experience. Participants engage in keynote sessions with prominent African leaders, attend skill-building workshops, and form lasting networks.',
    deadline: '2026-02-15',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      requirements: [
        'Age 18-22 years',
        'Exceptional academic record',
        'Demonstrated leadership experience',
        'Commitment to giving back to community'
      ]
    },
    benefits: [
      'Fully covered program expenses',
      'Accommodation and meals',
      'Access to Africa\'s top leaders',
      'Leadership training modules',
      'Alumni network membership'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://africaleadership.org/summer',
    duration: '2 weeks',
    featured: true,
    dateAdded: '2026-02-14',
    logoUrl: '/images/opportunities/conference.jpeg'
  },
  {
    id: '8',
    title: 'Call for Papers: African Technology & Innovation Conference',
    provider: 'African Tech Association',
    category: 'CallForPapers',
    description: 'Submit research papers on African tech innovation addressing social challenges. Includes scholarship component for selected presenters.',
    fullDescription: 'The African Technology & Innovation Conference seeks original research on how technology solves African challenges. This is a hybrid opportunity: papers are peer-reviewed for publication, and selected presenters receive travel grants and mentorship. Strong papers may lead to partnership opportunities.',
    deadline: '2026-02-28',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Computer Science', 'Engineering', 'Business', 'Development Studies'],
      requirements: [
        'Master\'s or PhD student or young researcher',
        'Original research on African tech innovation',
        'Paper submission (3,000-5,000 words)',
        'At least one co-author/advisor'
      ]
    },
    benefits: [
      'Publication in conference proceedings',
      'Travel grant for accepted presenters (KES 150,000)',
      'Mentorship from industry experts',
      'Networking with tech leaders',
      'Visibility for research'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://africantechconf.org/cfp',
    featured: true,
    dateAdded: '2026-02-15',
    logoUrl: '/images/opportunities/call-for-papers.png',
    contactEmail: 'submissions@africantechconf.org'
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
    logoUrl: '/images/opportunities/uk.jpg'
  },
  {
    id: '10',
    title: 'Google Career Internship Program - Kenya',
    provider: 'Google (East Africa)',
    category: 'Internship',
    description: 'Three to six month internship opportunity at Google Kenya offices in Nairobi for engineering and product students.',
    fullDescription: 'Join Google\'s Kenya office and work on products impacting millions of users in Africa. Interns collaborate with full-time engineers, attend talks from Google leaders, and contribute to real projects. This is an excellent opportunity to learn from tech leaders while gaining professional experience.',
    deadline: '2026-02-28',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      fieldOfStudy: ['Computer Science', 'Software Engineering', 'Information Technology'],
      requirements: [
        'Pursuing Bachelor\'s in Computer Science or related field',
        'Strong programming skills (Python, Java, C++)',
        'Problem-solving abilities',
        'Excellent communication skills'
      ]
    },
    benefits: [
      'Competitive monthly stipend (KES 200,000+)',
      'Mentorship from Google engineers',
      'Free meals and office amenities',
      'Learning opportunities on Google projects',
      'Potential for full-time conversion'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://careers.google.com/internships',
    duration: '3-6 months',
    featured: true,
    dateAdded: '2026-02-16',
    logoUrl: '/images/opportunities/tech.avif'
  },
  {
    id: '11',
    title: 'International Water Excellence Scholarship',
    provider: 'Water for All Foundation',
    category: 'Scholarship',
    description: 'Scholarships for African students pursuing studies in water engineering and environmental sustainability.',
    fullDescription: 'This scholarship supports African students committed to solving water scarcity and sanitation challenges. Recipients study at partner universities globally and return to implement solutions in their home countries. Strong focus on East African students.',
    deadline: '2026-03-15',
    location: 'International',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Civil Engineering', 'Environmental Science', 'Water Resources Management'],
      requirements: [
        'East African citizen',
        'Strong academic record (B+ or higher)',
        'Interest in water sustainability',
        'Commitment to work in Africa post-graduation'
      ]
    },
    benefits: [
      'Partial or full scholarship coverage',
      'Study abroad at partner universities',
      'Summer internship placement',
      'Mentorship from water engineers',
      'Job placement support in East Africa'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://waterforall.org/scholarships',
    featured: false,
    dateAdded: '2026-02-17',
    logoUrl: '/images/opportunities/scholarship.jpeg'
  },
  {
    id: '12',
    title: 'Digital Skills Bootcamp - Safaricom',
    provider: 'Safaricom Kenya',
    category: 'Internship',
    description: 'Intensive three-month digital skills bootcamp offered by Safaricom for unemployed graduates.',
    fullDescription: 'Safaricom\'s Digital Skills Bootcamp provides intensive training in programming, data analysis, and digital marketing. The bootcamp includes classroom learning, hands-on projects, and internship placement. Many graduates secure employment with Safaricom or partner organizations.',
    deadline: '2026-03-10',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      requirements: [
        'Recent graduate (within 2 years)',
        'Kenyan citizen',
        'Bachelor\'s degree in any field',
        'Basic computer literacy'
      ]
    },
    benefits: [
      'Free training (value KES 300,000)',
      'Daily lunch and transport allowance',
      'Internship placement (3 months)',
      'Potential job offer',
      'Professional certification'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://safaricom.co.ke/bootcamp',
    duration: '3 months',
    featured: true,
    dateAdded: '2026-02-18',
    logoUrl: '/images/opportunities/internship.avif'
  },
  {
    id: '13',
    title: 'TWAS Research Fellowships for Africa',
    provider: 'The World Academy of Sciences',
    category: 'Grant',
    description: 'Research fellowships for African scientists and engineers to conduct research in East Africa.',
    fullDescription: 'TWAS offers research fellowships enabling African scientists to conduct cutting-edge research at host institutions in developing countries. This program strengthens scientific capacity in Africa and builds research networks.',
    deadline: '2026-04-30',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Physics', 'Chemistry', 'Biology', 'Engineering', 'Mathematics'],
      requirements: [
        'PhD in science or engineering',
        'African national',
        'Research proposal with local host institution',
        'Demonstrated research excellence'
      ]
    },
    benefits: [
      'Monthly research allowance',
      'Travel costs covered',
      'Access to research facilities',
      'Mentorship from international researchers',
      'Publication support'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://twas.org/fellowships',
    duration: '12 months',
    featured: false,
    dateAdded: '2026-02-19',
    logoUrl: '/images/opportunities/grant.avif'
  },
  {
    id: '15',
    title: 'Call for Papers: Sustainable Development in East Africa',
    provider: 'Journal of East African Development',
    category: 'CallForPapers',
    description: 'Academic journal seeking papers on sustainable development, economics, and policy in East Africa. Authors can opt for paid publication option with research grant.',
    fullDescription: 'This special issue of the Journal of East African Development focuses on innovative approaches to sustainable development in Kenya and the region. Peer-reviewed papers are published online and in print. Selected authors also receive research grants for future work.',
    deadline: '2026-03-20',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Development Studies', 'Economics', 'Environmental Studies', 'Public Policy'],
      requirements: [
        'Master\'s or PhD student/researcher',
        'Original research on East African development',
        'Paper 5,000-8,000 words',
        'Institutional affiliation'
      ]
    },
    benefits: [
      'Publication in peer-reviewed journal',
      'Research grant for top 5 papers (KES 100,000)',
      'Presentation opportunity at symposium',
      'Mentorship for paper revisions',
      'Global visibility for research'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://jeadev.org/call-for-papers',
    featured: true,
    dateAdded: '2026-02-21',
    logoUrl: '/images/opportunities/call-for-papers.png'
  },
  {
    id: '22',
    title: 'Post-Doctoral Research Fellowship - University of Nairobi',
    provider: 'University of Nairobi Research Office',
    category: 'Grant',
    description: 'Research fellowships for recent PhD graduates continuing research in Kenya.',
    fullDescription: 'University of Nairobi offers post-doctoral fellowships supporting early-career researchers continuing academic work. Fellows conduct research, mentor students, and contribute to academic publications.',
    deadline: '2026-04-30',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Any academic discipline'],
      requirements: [
        'PhD completed within past 3 years',
        'Research proposal aligned with UoN strengths',
        'Demonstrated research publications',
        'Commitment to 12-month fellowship minimum'
      ]
    },
    benefits: [
      'Monthly fellowship allowance (KES 120,000)',
      'Research budget (KES 500,000)',
      'Office and lab space',
      'Mentorship from senior faculty',
      'Publication support'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://uonbi.ac.ke/research/fellowships',
    duration: '12 months',
    featured: false,
    dateAdded: '2026-02-28',
    logoUrl: '/images/opportunities/grant.avif'
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
    id: '24',
    title: 'Pan-African Agricultural Innovation Summit',
    provider: 'African Union - NEPAD',
    category: 'Conference',
    description: 'Summit on agricultural technology, climate adaptation, and food security across Africa held in Kenya.',
    fullDescription: 'This summit brings together agricultural researchers, young farmers, entrepreneurs, and policymakers to drive innovation in African agriculture. Keynotes, workshops, and networking sessions focus on tech-enabled solutions to climate and food challenges.',
    deadline: '2026-03-05',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Agriculture', 'Environmental Science', 'Technology', 'Economics'],
      requirements: [
        'University student or young professional',
        'Interest in agricultural innovation',
        'Application with motivation letter'
      ]
    },
    benefits: [
      'Discounted registration (KES 5,000 students)',
      'Accommodation support available',
      'Meals during summit',
      'Networking with agricultural leaders',
      'Certificate of participation',
      'Pitch opportunity for agri-tech ideas'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://nepad.org/ag-summit',
    duration: '4 days',
    featured: true,
    dateAdded: '2026-02-19',
    logoUrl: '/images/opportunities/pan-africanism.png'
  },
  {
    id: '25',
    title: 'British Council Scholarship - East Africa',
    provider: 'British Council',
    category: 'Scholarship',
    description: 'Scholarships for African students to study in Commonwealth universities with priority for Kenya.',
    fullDescription: 'British Council offers scholarships enabling talented African students to study in UK, Australia, and Canada. First priority given to students from Kenya and East Africa. Recipients join a global network of British Council scholars.',
    deadline: '2026-02-20',
    location: 'International',
    eligibility: {
      educationLevel: 'Both',
      requirements: [
        'East African citizen',
        'Strong academic record (A- or higher)',
        'English language proficiency',
        'Leadership experience and community involvement'
      ]
    },
    benefits: [
      'Partial or full tuition scholarship',
      'Study abroad at top universities',
      'Visa support',
      'Pre-departure training',
      'Alumni network access',
      'Career support after graduation'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://britishcouncil.org/scholarships',
    featured: true,
    dateAdded: '2026-02-02',
    logoUrl: '/images/opportunities/uk.jpg'
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
    fundingType: 'Stipend',
    duration: 'Summer 2026 (35 hrs/week)',
    featured: false,
    dateAdded: '2026-02-27',
    logoUrl: '/images/opportunities/internship.avif'
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
    fundingType: 'Fully Funded',
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
    fundingType: 'Stipend',
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
      educationLevel: 'Both',
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
    logoUrl: '/images/opportunities/fellowship.avif'
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
  }
];
