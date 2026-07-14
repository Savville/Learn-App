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
  fundingType?: 'Fully Funded' | 'Partially Funded' | 'Paid Internship' | 'Unpaid Internship' | 'N/A' | string;
  compensationType: 'Paid' | 'Stipend' | 'Unpaid' | 'Equity' | 'N/A' | string;
  upfrontCost: 'No Upfront Cost' | 'Has Upfront Cost' | string;
  duration?: string;
  featured: boolean;
  dateAdded: string;
  logoUrl?: string;
  imageUrl?: string;
  postedBy?: string;
  isVerified?: boolean;
  status?: 'Unverified' | 'Verified' | 'Rejected';
  verificationAudit?: any;
  thematicAreas?: { heading: string; topics: string[] }[];
  applicationForm?: ApplicationForm;
  suggestCustomForm?: boolean;
  views?: number;
  clicks?: number;
  fundedAmount?: number;
  funderRecognition?: string;
  projectProposalUrl?: string;
  institutionalEndorsement?: any;
  kycProofFilename?: string;
  slug?: string;
}

export const opportunities: Opportunity[] = [
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
    "title": "UiPath AgentHack",
    "provider": "UiPath / Devpost",
    "category": "Hackathon",
    "description": "UiPath AgentHack developer hackathon with a $50K cash prize.",
    "fullDescription": "Build agentic automation solutions using UiPath with a chance to win from a $50K cash prize pool.",
    "deadline": "Not specified",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "$50K cash prize"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://uipath-agenthack.devpost.com",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://uipath-agenthack.devpost.com",
    "imageUrl": "https://d112y698adiu2z.cloudfront.net/photos/production/challenge_thumbnails/004/624/515/datas/original.jpg",
    "id": "uipath-agenthack",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Hillary",
    "contactEmail": "hillary@opportunities.ke"
  },
  {
    "title": "XRPL COMMONS Hackathon",
    "provider": "XRPL COMMONS",
    "category": "Hackathon",
    "description": "Make Waves on XRPL Hackathon with a $50K XRP prize.",
    "fullDescription": "Developer Hackathon Opportunity on the XRP Ledger. Build and win from a 50K XRP prize pool.",
    "deadline": "Not specified",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "$50K XRP prize"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://luma.com/make-waves-on-xrpl",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://luma.com/make-waves-on-xrpl",
    "imageUrl": "https://og.luma.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=800,height=420/event?calendar_avatar=https%3A%2F%2Fimages.lumacdn.com%2Fcalendars%2F0f%2F4b0d9740-a2a6-46c0-8627-c3deb2e3322c.png&calendar_name=XRPL%20Commons&color0=%2322aaff&color1=%23130b35&color2=%23faff1c&color3=%23ffffff&host_avatar=https%3A%2F%2Fimages.lumacdn.com%2Favatars%2Fl5%2Fbf770209-a9de-42ae-9e42-4b61aa7aef07.png&host_name=XRPL%20Commons&img=https%3A%2F%2Fimages.lumacdn.com%2Fuploads%2Fpb%2F3f7418cc-a968-4673-9032-78360ab514c4.png&name=Make%20Waves%20on%20XRPL&palette_neutral=%23130b35%3A22.85%2C%23ffffff%3A15.57&palette_vibrant=%2322aaff%3A25.07%2C%23faff1c%3A18.85%2C%23f847af%3A1.37%2C%2343e0cd%3A4.63",
    "id": "xrpl-commons-hackathon",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Stephen",
    "contactEmail": "stephen@opportunities.ke"
  },
  {
    "title": "Slack Agent Builder Challenge",
    "provider": "Slack / Devpost",
    "category": "Hackathon",
    "description": "Slack Agent Builder Challenge with a $42K prize.",
    "fullDescription": "Developer Hackathon Opportunity to build powerful agents for Slack.",
    "deadline": "Not specified",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "$42K prize"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://slackhack.devpost.com",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://slackhack.devpost.com",
    "imageUrl": "https://d112y698adiu2z.cloudfront.net/photos/production/challenge_thumbnails/004/685/418/datas/original.png",
    "id": "slack-agent-builder-challenge",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke"
  },
  {
    "title": "Smart Commerce Challenge",
    "provider": "Ignyte / Polygon",
    "category": "Hackathon",
    "description": "The Smart Commerce Infra Polygon Challenge with a $25K prize.",
    "fullDescription": "Developer Hackathon Opportunity for smart commerce infrastructure on Polygon.",
    "deadline": "Not specified",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "$25K prize"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://app.ignyte.ae/public/challenges/4FB1DBBF-1833-F111-9A49-6045BD14D400",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://app.ignyte.ae/public/challenges/4FB1DBBF-1833-F111-9A49-6045BD14D400",
    "id": "smart-commerce-challenge",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Kevin",
    "contactEmail": "kevin@opportunities.ke"
  },
  {
    "title": "HSK Chain Horizon Hackathon",
    "provider": "DoraHacks",
    "category": "Hackathon",
    "description": "HSK Chain Horizon Hackathon Japan with $12K USDT prize.",
    "fullDescription": "Developer Hackathon Opportunity.",
    "deadline": "Not specified",
    "location": "Online/Japan",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "$12K USDT prize"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://dorahacks.io/hackathon/hskchainjapan/detail",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://dorahacks.io/hackathon/hskchainjapan/detail",
    "imageUrl": "https://cdn.dorahacks.io/static/files/19ef8a4da23bad87ef839314d3398ca6.jpeg",
    "id": "hsk-chain-horizon-hackathon",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Tracy",
    "contactEmail": "tracy@opportunities.ke"
  },
  {
    "title": "CROO Agent Hackathon",
    "provider": "DoraHacks",
    "category": "Hackathon",
    "description": "CROO Agent Hackathon with a $10.2K prize.",
    "fullDescription": "Developer Hackathon Opportunity.",
    "deadline": "Not specified",
    "location": "Online",
    "eligibility": {
      "educationLevel": "All",
      "requirements": [
        "Developers"
      ]
    },
    "benefits": [
      "$10.2K prize"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://dorahacks.io/hackathon/croo-hackathon",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://dorahacks.io/hackathon/croo-hackathon",
    "imageUrl": "https://cdn.dorahacks.io/static/files/19e6346f1dea29182fa91aa46bd90c17.png",
    "id": "croo-agent-hackathon",
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
    "title": "PwC Kenya Graduate Trainee Programme",
    "provider": "PwC Kenya",
    "category": "Internship",
    "description": "Prestigious graduate training for audit, tax, and advisory consulting.",
    "fullDescription": "Kickstart your career at PwC Kenya. We offer intensive training and mentorship to fresh graduates looking to specialize in Audit, Tax, or Advisory.",
    "deadline": "August 2026",
    "location": "Nairobi, Kenya",
    "eligibility": {
      "educationLevel": "UnderGrad",
      "requirements": [
        "Recent graduates",
        "Strong academic track record"
      ]
    },
    "benefits": [
      "Professional study support",
      "Competitive salary"
    ],
    "applicationType": "Online Form",
    "applicationLink": "https://www.pwc.com/ke/en/careers/graduate-recruitment.html",
    "fundingType": "Paid Internship",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.pwc.com/ke/en/careers/graduate-recruitment.html",
    "imageUrl": "https://www.pwc.co.za/en/assets/images/GettyImages-1129802084-1600PX.jpg",
    "id": "pwc-kenya-graduate-trainee-programme",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Stephen",
    "contactEmail": "stephen@opportunities.ke"
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
    "title": "African Women's Development Fund (AWDF)",
    "provider": "African Women's Development Fund (AWDF)",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "African Women's Development Fund (AWDF): Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://awdf.org",
    "fundingType": "Partially Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://awdf.org",
    "id": "african-womens-development-fund-awdf",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Tracy",
    "contactEmail": "tracy@opportunities.ke"
  },
  {
    "title": "Women Entrepreneurship for Africa (WE-Africa)",
    "provider": "Women Entrepreneurship for Africa (WE-Africa)",
    "category": "Grant",
    "description": "EU-funded grants up to â‚¬10,000",
    "fullDescription": "Women Entrepreneurship for Africa (WE-Africa): EU-funded grants up to â‚¬10,000. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "EU-funded grants up to â‚¬10,000"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://www.we-africa.org",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.we-africa.org",
    "id": "women-entrepreneurship-for-africa-we-africa",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Victor",
    "contactEmail": "victor@opportunities.ke"
  },
  {
    "title": "Investisseurs & Partenaires",
    "provider": "Investisseurs & Partenaires",
    "category": "Grant",
    "description": "â‚¬50,000 to â‚¬2 million financing",
    "fullDescription": "Investisseurs & Partenaires: â‚¬50,000 to â‚¬2 million financing. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "â‚¬50,000 to â‚¬2 million financing"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://www.ietp.com",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.ietp.com",
    "id": "investisseurs-partenaires",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Hillary",
    "contactEmail": "hillary@opportunities.ke"
  },
  {
    "title": "Vital Voices VV GROW Fellowship",
    "provider": "Vital Voices VV GROW Fellowship",
    "category": "Fellowship",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Vital Voices VV GROW Fellowship: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dQvfPb6T",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dQvfPb6T",
    "id": "vital-voices-vv-grow-fellowship",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Stephen",
    "contactEmail": "stephen@opportunities.ke"
  },
  {
    "title": "UN Women's Fund for Gender Equality",
    "provider": "UN Women's Fund for Gender Equality",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "UN Women's Fund for Gender Equality: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://www.unwomen.org",
    "fundingType": "Partially Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.unwomen.org",
    "id": "un-womens-fund-for-gender-equality",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke"
  },
  {
    "title": "African Development Bank AFAWA",
    "provider": "African Development Bank AFAWA",
    "category": "Grant",
    "description": "Closing the $42B finance gap",
    "fullDescription": "African Development Bank AFAWA: Closing the $42B finance gap. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Closing the $42B finance gap"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dYrxx_Hb",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dYrxx_Hb",
    "id": "african-development-bank-afawa",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Kevin",
    "contactEmail": "kevin@opportunities.ke"
  },
  {
    "title": "Cherie Blair Foundation Tech Programme",
    "provider": "Cherie Blair Foundation Tech Programme",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Cherie Blair Foundation Tech Programme: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dBS9iCyn",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dBS9iCyn",
    "id": "cherie-blair-foundation-tech-programme",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Tracy",
    "contactEmail": "tracy@opportunities.ke"
  },
  {
    "title": "Women in Tech Africa (WITA)",
    "provider": "Women in Tech Africa (WITA)",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Women in Tech Africa (WITA): Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dTcw46ps",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dTcw46ps",
    "id": "women-in-tech-africa-wita",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Victor",
    "contactEmail": "victor@opportunities.ke"
  },
  {
    "title": "Anzisha Prize",
    "provider": "Anzisha Prize",
    "category": "Challenge",
    "description": "For entrepreneurs aged 15-22",
    "fullDescription": "Anzisha Prize: For entrepreneurs aged 15-22. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "For entrepreneurs aged 15-22"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dx-XbR8N",
    "fundingType": "Partially Funded",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dx-XbR8N",
    "id": "anzisha-prize",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Hillary",
    "contactEmail": "hillary@opportunities.ke"
  },
  {
    "title": "Standard Bank Top Women Entrepreneur Awards",
    "provider": "Standard Bank Top Women Entrepreneur Awards",
    "category": "Challenge",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Standard Bank Top Women Entrepreneur Awards: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/d36JRizq",
    "fundingType": "Partially Funded",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/d36JRizq",
    "id": "standard-bank-top-women-entrepreneur-awards",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Stephen",
    "contactEmail": "stephen@opportunities.ke"
  },
  {
    "title": "Cartier Women's Initiative",
    "provider": "Cartier Women's Initiative",
    "category": "Grant",
    "description": "Up to $100,000",
    "fullDescription": "Cartier Women's Initiative: Up to $100,000. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Up to $100,000"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dNFrdpBm",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dNFrdpBm",
    "id": "cartier-womens-initiative",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke"
  },
  {
    "title": "SEED Awards",
    "provider": "SEED Awards",
    "category": "Challenge",
    "description": "Sustainable development enterprises",
    "fullDescription": "SEED Awards: Sustainable development enterprises. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Sustainable development enterprises"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://seed.uno",
    "fundingType": "Partially Funded",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://seed.uno",
    "id": "seed-awards",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Kevin",
    "contactEmail": "kevin@opportunities.ke"
  },
  {
    "title": "Diamond Challenge",
    "provider": "Diamond Challenge",
    "category": "Grant",
    "description": "Up to $10,000 for young entrepreneurs",
    "fullDescription": "Diamond Challenge: Up to $10,000 for young entrepreneurs. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Up to $10,000 for young entrepreneurs"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dKU8Qi9i",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dKU8Qi9i",
    "id": "diamond-challenge",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Tracy",
    "contactEmail": "tracy@opportunities.ke"
  },
  {
    "title": "Orange Corners Africa",
    "provider": "Orange Corners Africa",
    "category": "Grant",
    "description": "Multiple African countries",
    "fullDescription": "Orange Corners Africa: Multiple African countries. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Multiple African countries"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dpPRpPW5",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dpPRpPW5",
    "id": "orange-corners-africa",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Victor",
    "contactEmail": "victor@opportunities.ke"
  },
  {
    "title": "SheInvest by Ashden",
    "provider": "SheInvest by Ashden",
    "category": "Grant",
    "description": "Clean energy focus",
    "fullDescription": "SheInvest by Ashden: Clean energy focus. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Clean energy focus"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dQ_2Jygq",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dQ_2Jygq",
    "id": "sheinvest-by-ashden",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Hillary",
    "contactEmail": "hillary@opportunities.ke"
  },
  {
    "title": "Village Capital Africa Programs",
    "provider": "Village Capital Africa Programs",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Village Capital Africa Programs: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://vilcap.com",
    "fundingType": "Partially Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://vilcap.com",
    "id": "village-capital-africa-programs",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Stephen",
    "contactEmail": "stephen@opportunities.ke"
  },
  {
    "title": "GreenHouse Capital Fund",
    "provider": "GreenHouse Capital Fund",
    "category": "StartupFunding",
    "description": "Venture capital",
    "fullDescription": "GreenHouse Capital Fund: Venture capital. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Venture capital"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dTi_EycQ",
    "fundingType": "Partially Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dTi_EycQ",
    "id": "greenhouse-capital-fund",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke"
  },
  {
    "title": "Absa Women in Business Grant Programme",
    "provider": "Absa Women in Business Grant Programme",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Absa Women in Business Grant Programme: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://www.absa.africa",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.absa.africa",
    "id": "absa-women-in-business-grant-programme",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Kevin",
    "contactEmail": "kevin@opportunities.ke"
  },
  {
    "title": "Standard Chartered EmpowerHer",
    "provider": "Standard Chartered EmpowerHer",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Standard Chartered EmpowerHer: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dVTSWRKE",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dVTSWRKE",
    "id": "standard-chartered-empowerher",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Tracy",
    "contactEmail": "tracy@opportunities.ke"
  },
  {
    "title": "Women's World Banking Africa",
    "provider": "Women's World Banking Africa",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Women's World Banking Africa: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dSfr635d",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dSfr635d",
    "id": "womens-world-banking-africa",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Victor",
    "contactEmail": "victor@opportunities.ke"
  },
  {
    "title": "Women Founders Network (WFN)",
    "provider": "Women Founders Network (WFN)",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Women Founders Network (WFN): Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dqSNGUSn",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dqSNGUSn",
    "id": "women-founders-network-wfn",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Hillary",
    "contactEmail": "hillary@opportunities.ke"
  },
  {
    "title": "Global Fund for Women",
    "provider": "Global Fund for Women",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Global Fund for Women: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dUAfHBTg",
    "fundingType": "Partially Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dUAfHBTg",
    "id": "global-fund-for-women",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Stephen",
    "contactEmail": "stephen@opportunities.ke"
  },
  {
    "title": "AfriLabs Funding Opportunities",
    "provider": "AfriLabs Funding Opportunities",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "AfriLabs Funding Opportunities: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://www.afrilabs.com",
    "fundingType": "Partially Funded",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.afrilabs.com",
    "id": "afrilabs-funding-opportunities",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Opportunities Kenya Admin",
    "contactEmail": "admin@opportunities.ke"
  },
  {
    "title": "Mastercard Foundation Young Africa Works",
    "provider": "Mastercard Foundation Young Africa Works",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Mastercard Foundation Young Africa Works: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://mastercardfdn.org",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://mastercardfdn.org",
    "id": "mastercard-foundation-young-africa-works",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Kevin",
    "contactEmail": "kevin@opportunities.ke"
  },
  {
    "title": "African Management Institute (AMI)",
    "provider": "African Management Institute (AMI)",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "African Management Institute (AMI): Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dJQFc4Qr",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dJQFc4Qr",
    "id": "african-management-institute-ami",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Tracy",
    "contactEmail": "tracy@opportunities.ke"
  },
  {
    "title": "GraÃ§a Machel Trust Accelerator",
    "provider": "GraÃ§a Machel Trust Accelerator",
    "category": "StartupFunding",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "GraÃ§a Machel Trust Accelerator: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dpV_-KYF",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dpV_-KYF",
    "id": "graa-machel-trust-accelerator",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Victor",
    "contactEmail": "victor@opportunities.ke"
  },
  {
    "title": "Women in Africa Initiative (WIA)",
    "provider": "Women in Africa Initiative (WIA)",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Women in Africa Initiative (WIA): Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://lnkd.in/dnT3HWgB",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://lnkd.in/dnT3HWgB",
    "id": "women-in-africa-initiative-wia",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Hillary",
    "contactEmail": "hillary@opportunities.ke"
  },
  {
    "title": "Women's Entrepreneurship Day Organization",
    "provider": "Women's Entrepreneurship Day Organization",
    "category": "Grant",
    "description": "Funding and support opportunity for women startup founders in Africa.",
    "fullDescription": "Women's Entrepreneurship Day Organization: Funding and support opportunity for women startup founders in Africa.. This is a major funding opportunity tailored for women startup founders in Africa.",
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
      "Funding and Business Support"
    ],
    "applicationType": "Platform Link",
    "applicationLink": "https://www.womenseday.org",
    "fundingType": "Partially Funded",
    "compensationType": "N/A",
    "upfrontCost": "No Upfront Cost",
    "contactLink": "https://www.womenseday.org",
    "id": "womens-entrepreneurship-day-organization",
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-05T23:44:43.536Z",
    "featured": false,
    "postedBy": "Stephen",
    "contactEmail": "stephen@opportunities.ke"
  },

  {
    "id": "ku-area-rental-scout-project-2026",
    "title": "KU Area Rental Scout â€” Earn by Gathering Hostel & Rental Vacancy Info",
    "provider": "L-earn Opportunities",
    "category": "Project",
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
    "isVerified": true,
    "status": "Verified",
    "dateAdded": "2026-07-14T07:00:00.000Z",
    "postedBy": "Williams",
    "contactEmail": "admin@l-earn.co",
    "logoUrl": "/images/hostels.jpg",
    "applicationLink": "https://docs.google.com/forms/d/e/1FAIpQLScvj_x3TnMj2BxaZLfnU5IN2ldWQfy00-0poDF6UD-xflzXCQ/viewform?usp=dialog"
  }
];
