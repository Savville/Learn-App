const fs = require('fs');
const path = require('path');

const toSlug = (text) => {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const extractJSONFromMarkdown = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonBlocks = [];
    const regex = /```json\s+([\s\S]*?)\s+```/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      try {
        jsonBlocks.push(JSON.parse(match[1]));
      } catch (e) {}
    }
    return jsonBlocks;
  } catch (err) {
    return [];
  }
};

const gigFile = path.join('OPPORTUNITIES', 'gig_opportunities.md');
const grantsFile = path.join('OPPORTUNITIES', 'grants_opportunities.md');
const allOpps = [...extractJSONFromMarkdown(gigFile), ...extractJSONFromMarkdown(grantsFile)].map((opp, index) => {
  if (!opp.id) opp.id = toSlug(opp.title);
  opp.isVerified = true;
  opp.status = 'Verified';
  opp.dateAdded = opp.dateAdded || new Date().toISOString();
  
  opp.featured = false;
  
  const AUTHORS = ['Kevin', 'Tracy', 'Victor', 'Hillary', 'Stephen', 'Opportunities Kenya Admin'];
  const assignedAuthor = AUTHORS[index % AUTHORS.length];
  const assignedEmail = assignedAuthor === 'Opportunities Kenya Admin' 
    ? 'admin@opportunities.ke' 
    : `${assignedAuthor.toLowerCase()}@opportunities.ke`;

  opp.postedBy = opp.postedBy || assignedAuthor;
  opp.contactEmail = opp.contactEmail || assignedEmail;
  return opp;
});

const tsContent = `export interface FormField {
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

export const opportunities: Opportunity[] = ${JSON.stringify(allOpps, null, 2)};
`;

fs.writeFileSync('src/data/opportunities.ts', tsContent);
console.log('✅ Updated src/data/opportunities.ts');
