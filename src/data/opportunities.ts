export interface Opportunity {
  id: string;
  title: string;
  provider: string;
  category: 'CallForPapers' | 'Internship' | 'Grant' | 'Conference' | 'Scholarship';
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
  fundingType?: 'Fully Funded' | 'Partially Funded' | 'Stipend' | 'Unpaid';
  duration?: string;
  featured: boolean;
  dateAdded: string;
  logoUrl: string;
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
    logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1',
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
    logoUrl: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1',
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
    logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1633158829875-e5316a358c6f?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1576091160550-112accb7ced7?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1',
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
    logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1532996122724-8916c52e1c45?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '14',
    title: 'Youth in Renewable Energy Summit',
    provider: 'African Renewable Energy Alliance',
    category: 'Conference',
    description: 'Three-day summit connecting young clean energy professionals and entrepreneurs in Nairobi.',
    fullDescription: 'The Youth in Renewable Energy Summit brings together young professionals, entrepreneurs, and students passionate about clean energy. Features panel discussions, start-up pitches, investor meetings, and hands-on workshops on solar, wind, and biomass technologies.',
    deadline: '2026-02-20',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'Both',
      requirements: [
        'Age 18-35 years',
        'Interest in renewable energy sector',
        'Student or early-career professional',
        'Application with motivation statement'
      ]
    },
    benefits: [
      'Discounted conference fee (KES 3,000 for students)',
      'Meals and refreshments provided',
      'Networking with energy leaders',
      'Access to investor panel',
      'Certificate of attendance'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://area.co.ke/youth-summit',
    duration: '3 days',
    featured: true,
    dateAdded: '2026-02-20',
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '16',
    title: 'Microsoft TEALS Mentorship Program',
    provider: 'Microsoft Kenya',
    category: 'Internship',
    description: 'Virtual mentorship in tech skills and professional development for Kenyan university students.',
    fullDescription: 'Microsoft TEALS pairs Kenyan students with tech professionals for virtual mentoring on coding, career navigation, and industry insights. Weekly sessions build practical skills and professional network while students complete their degrees.',
    deadline: '2026-02-28',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      fieldOfStudy: ['Computer Science', 'IT', 'Engineering'],
      requirements: [
        'Currently enrolled in Kenyan university',
        'First or second year student',
        'Basic programming knowledge',
        'Commitment to weekly mentorship sessions'
      ]
    },
    benefits: [
      'Free mentorship from Microsoft professionals',
      'Tech skills training',
      'Career guidance',
      'Networking opportunities',
      'Certificate of participation'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://microsoft.com/teals/apply',
    duration: '6 months',
    featured: false,
    dateAdded: '2026-02-22',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '17',
    title: 'African Innovation Scholarship - AMREF Foundation',
    provider: 'AMREF Health Foundation',
    category: 'Scholarship',
    description: 'Scholarships for health science students innovating solutions to African healthcare challenges.',
    fullDescription: 'AMREF offers scholarships to African health science students with innovative ideas. Recipients develop health solutions while studying, gain mentorship, and access laboratory facilities and funding for prototyping.',
    deadline: '2026-03-31',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      fieldOfStudy: ['Medicine', 'Nursing', 'Public Health', 'Biomedical Science'],
      requirements: [
        'Enrolled in Kenyan university health program',
        'Innovative health solution idea',
        'Strong academic performance',
        'Commitment to serve in Africa'
      ]
    },
    benefits: [
      'Annual scholarship (KES 300,000)',
      'Prototype development funding',
      'Mentorship from health leaders',
      'Laboratory access',
      'Conference travel grant'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://amref.org/kenyascholarship',
    featured: true,
    dateAdded: '2026-02-23',
    logoUrl: 'https://images.unsplash.com/photo-1576091160550-112accb7ced7?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '18',
    title: 'African Business Excellence Internship',
    provider: 'Standard Chartered Bank Kenya',
    category: 'Internship',
    description: 'Eight-week summer internship in finance, risk, or operations at Standard Chartered Kenya offices.',
    fullDescription: 'Standard Chartered\'s Summer Internship program places promising students in meaningful roles across finance, risk management, and operations. Interns work on real transactions, attend talks from banking executives, and gain insight into international banking.',
    deadline: '2026-02-15',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      fieldOfStudy: ['Finance', 'Business', 'Economics', 'Engineering'],
      requirements: [
        'Second or third-year student',
        'Strong academic performance (GPA 3.5+)',
        'Interest in financial services',
        'Excellent communication skills'
      ]
    },
    benefits: [
      'Competitive monthly stipend (KES 150,000)',
      'Professional development workshops',
      'Mentorship from bank managers',
      'Networking opportunities',
      'Potential permanent role offer'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://standardchartered.co.ke/careers',
    duration: '8 weeks',
    featured: true,
    dateAdded: '2026-02-24',
    logoUrl: 'https://images.unsplash.com/photo-1553729321-e91953dec042?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '19',
    title: 'Green Economy Grant Initiative',
    provider: 'Kenya Green Economy Trust',
    category: 'Grant',
    description: 'Grants for student-led projects in clean energy, waste management, or eco-tourism in Kenya.',
    fullDescription: 'This initiative supports innovative student projects contributing to Kenya\'s green economy. Teams receive grants to develop pilots in renewable energy, sustainable waste management, conservation, or eco-tourism. Winners get mentorship and networking opportunities.',
    deadline: '2026-04-20',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'Both',
      fieldOfStudy: ['Environmental Science', 'Engineering', 'Business', 'Conservation'],
      requirements: [
        'University of Nairobi, Kenyatta, or Moi student',
        'Team of 3-5 students',
        'Project proposal (2,000 words)',
        'Feasibility study included'
      ]
    },
    benefits: [
      'Project grant up to KES 500,000',
      'Technical mentorship',
      'Business support services',
      'Market linkages',
      'Potential for expansion funding'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://kenyageo.org/grants',
    featured: true,
    dateAdded: '2026-02-25',
    logoUrl: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '20',
    title: 'Africa Code Week - Student Competition',
    provider: 'Pearson & Coursera',
    category: 'Conference',
    description: 'Annual coding competition and learning event for African students with workshops and prizes.',
    fullDescription: 'Africa Code Week celebrates coding across Africa with workshops, training sessions, and an international competition. Kenyan students learn web and mobile development, compete for prizes, and network with tech companies.',
    deadline: '2026-02-28',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'UnderGrad',
      requirements: [
        'Age 18-25 years',
        'Basic programming knowledge',
        'Individual or team participation',
        'Registration on platform'
      ]
    },
    benefits: [
      'Free workshop attendance',
      'Training in latest tech stacks',
      'International competition opportunity',
      'Prize pool (KES 1,000,000+)',
      'Networking with tech companies',
      'Certificate of participation'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://africacode.week/register',
    duration: '1 month',
    featured: true,
    dateAdded: '2026-02-26',
    logoUrl: 'https://images.unsplash.com/photo-1538932527bfc3e72e89a2f3b598a4a2c?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '21',
    title: 'Call for Papers: Women in Tech & Innovation Africa',
    provider: 'African Women in Technology Forum',
    category: 'CallForPapers',
    description: 'Conference seeking papers on women\'s roles in technology innovation. Includes travel grant and mentorship for presenters.',
    fullDescription: 'This international conference highlights women\'s contributions to technology in Africa. Papers explore challenges, innovations, and solutions. Selected female presenters receive travel grants supporting attendance and networking opportunities.',
    deadline: '2026-03-10',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Technology', 'Business', 'Engineering', 'Development'],
      requirements: [
        'Female student or researcher',
        'Master\'s or PhD level',
        'Original research on women in tech',
        'Paper 4,000-6,000 words'
      ]
    },
    benefits: [
      'Peer review and publication',
      'Travel grant for presenters (KES 200,000)',
      'Conference accommodation covered',
      'Mentorship from senior women leaders',
      'Media exposure and networking'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://africawomenintech.org/cfp',
    featured: true,
    dateAdded: '2026-02-27',
    logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
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
    logoUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1'
  },
  {
    id: '26',
    title: 'Call for Papers + Scholarship: African Public Health Research',
    provider: 'African Public Health Association',
    category: 'CallForPapers',
    description: 'Submit public health research papers. Top 10 authors receive conference travel grants AND selected winners get postgraduate scholarships up to KES 500,000.',
    fullDescription: 'This is a unique cross-category opportunity combining academic publication with direct scholarship awards. Submit peer-reviewed public health research addressing African challenges. Top 10 accepted papers authors get travel grants. Additionally, the 5 best papers\' authors receive postgraduate scholarships for further studies.',
    deadline: '2026-03-25',
    location: 'Kenya',
    eligibility: {
      educationLevel: 'PostGrad',
      fieldOfStudy: ['Public Health', 'Medicine', 'Epidemiology', 'Health Economics'],
      requirements: [
        'Master\'s or PhD student/researcher',
        'Original research on African public health',
        'Paper 5,000-7,000 words',
        'Recent publication or presentation experience'
      ]
    },
    benefits: [
      'Peer review and publication',
      'Travel grant (KES 200,000 for top 10)',
      'Conference accommodation',
      'Postgraduate scholarship (KES 500,000 for top 5)',
      'International visibility',
      'Mentorship from health leaders'
    ],
    applicationType: 'Online Form',
    applicationLink: 'https://apha.org/cfp-scholarship',
    featured: true,
    dateAdded: '2026-02-28',
    logoUrl: 'https://images.unsplash.com/photo-1576091160550-112accb7ced7?w=400&h=400&fit=crop&auto=format&auto=compress&q=80&fm=webp&dpr=1',
    contactEmail: 'submissions@apha.org'
  }
];
