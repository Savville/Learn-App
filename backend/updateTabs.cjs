const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/pages/Opportunities.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace category buckets
const oldBuckets = /\/\/ ── Tab category buckets[\s\S]*?type TabId = 'all' \| 'gigs' \| 'career' \| 'academic';/g;
const newBuckets = `// ── Tab category buckets (must match backend constants exactly) ───────────────
const GIG_CATEGORIES      = ['Gig', 'Job'];
const ACADEMIC_CAREER_CATEGORIES = ['Internship', 'Attachment', 'Conference', 'CallForPapers', 'Event', 'Volunteer', 'Scholarship', 'Fellowship', 'Grant'];
const INNOVATION_CATEGORIES = ['Hackathon', 'Challenge', 'StartupFunding'];
const PROJECT_CATEGORIES = ['StudentProject', 'Project'];

type TabId = 'all' | 'jobs' | 'academic_career' | 'innovation' | 'projects';`;
content = content.replace(oldBuckets, newBuckets);

// Replace ALL_CATEGORY_OPTIONS
const oldOptions = /const ALL_CATEGORY_OPTIONS: \{ value: string; label: string; tab: TabId \}\[\] = \[[\s\S]*?\];/g;
const newOptions = `const ALL_CATEGORY_OPTIONS: { value: string; label: string; tab: TabId }[] = [
  { value: 'Gig',           label: 'Microgigs',            tab: 'jobs' },
  { value: 'Job',           label: 'Jobs',                 tab: 'jobs' },
  { value: 'Internship',    label: 'Internships',          tab: 'academic_career' },
  { value: 'Attachment',    label: 'Attachments',          tab: 'academic_career' },
  { value: 'Conference',    label: 'Conferences',          tab: 'academic_career' },
  { value: 'CallForPapers', label: 'Call for Papers',      tab: 'academic_career' },
  { value: 'Event',         label: 'Events',               tab: 'academic_career' },
  { value: 'Volunteer',     label: 'Volunteer Programmes', tab: 'academic_career' },
  { value: 'Scholarship',   label: 'Scholarships',         tab: 'academic_career' },
  { value: 'Fellowship',    label: 'Fellowships',          tab: 'academic_career' },
  { value: 'Grant',         label: 'Academic Grants',      tab: 'academic_career' },
  { value: 'Hackathon',     label: 'Hackathons',           tab: 'innovation' },
  { value: 'Challenge',     label: 'Industry Challenges',  tab: 'innovation' },
  { value: 'StartupFunding',label: 'Startup Funding',      tab: 'innovation' },
  { value: 'Project',       label: 'Community Projects',   tab: 'projects' },
  { value: 'StudentProject',label: 'Student Projects',     tab: 'projects' },
  { value: 'Other',         label: 'Others',               tab: 'all' },
];`;
content = content.replace(oldOptions, newOptions);

// Replace Funding Options
const oldFundingOpts = /\/\/ Funding options tailored per tab[\s\S]*?const ALL_FUNDING_OPTIONS = \[[\s\S]*?\];/g;
const newFundingOpts = `// Funding options tailored per tab
const JOBS_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Pay Types' },
  { value: 'Paid Internship',  label: 'Paid' },
  { value: 'Partially Funded', label: 'Partially Paid' },
  { value: 'Unpaid Internship',label: 'Unpaid' },
];
const ACADEMIC_CAREER_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Funding Types' },
  { value: 'Fully Funded',     label: 'Fully Funded' },
  { value: 'Partially Funded', label: 'Partially Funded' },
  { value: 'Paid Internship',  label: 'Paid / Stipend' },
  { value: 'Stipend',          label: 'Stipend' },
  { value: 'Unpaid Internship',label: 'Unpaid' },
  { value: 'Unpaid',           label: 'Unpaid' },
];
const INNOVATION_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Funding Types' },
  { value: 'Fully Funded',     label: 'Fully Funded' },
  { value: 'Partially Funded', label: 'Partially Funded' },
];
const PROJECTS_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Types' },
  { value: 'Fully Funded',     label: 'Fully Funded' },
  { value: 'Partially Funded', label: 'Partially Funded' },
];
const ALL_FUNDING_OPTIONS = [
  { value: 'all',              label: 'All Funding Types' },
  { value: 'Fully Funded',     label: 'Fully Funded' },
  { value: 'Partially Funded', label: 'Partially Funded' },
  { value: 'Paid Internship',  label: 'Paid Internship' },
  { value: 'Stipend',          label: 'Stipend' },
  { value: 'Unpaid',           label: 'Unpaid' },
];`;
content = content.replace(oldFundingOpts, newFundingOpts);

// Replace TABS
const oldTabsMeta = /const TABS: \{ id: TabId; label: string; description: string \}\[\] = \[[\s\S]*?\];/g;
const newTabsMeta = `const TABS: { id: TabId; label: string; description: string }[] = [
  { id: 'all',             label: 'All',                  description: 'Opportunities' },
  { id: 'jobs',            label: 'Jobs',                 description: 'Jobs & Microgigs' },
  { id: 'academic_career', label: 'Academic & Career',    description: 'Academic & Career' },
  { id: 'innovation',      label: 'Innovation',           description: 'Innovation & Tech' },
  { id: 'projects',        label: 'Projects',             description: 'Student & Community Projects' },
];`;
content = content.replace(oldTabsMeta, newTabsMeta);

// In applyFilters
const oldApplyFilters = /let matchesTab = true;\r?\n    if \(activeTab === 'gigs'\)     matchesTab = GIG_CATEGORIES\.includes\(opp\.category\);\r?\n    else if \(activeTab === 'career'\)   matchesTab = CAREER_CATEGORIES\.includes\(opp\.category\);\r?\n    else if \(activeTab === 'academic'\) matchesTab = ACADEMIC_CATEGORIES\.includes\(opp\.category\);/g;
const newApplyFilters = `let matchesTab = true;
    if (activeTab === 'jobs') matchesTab = GIG_CATEGORIES.includes(opp.category);
    else if (activeTab === 'academic_career') matchesTab = ACADEMIC_CAREER_CATEGORIES.includes(opp.category);
    else if (activeTab === 'innovation') matchesTab = INNOVATION_CATEGORIES.includes(opp.category);
    else if (activeTab === 'projects') matchesTab = PROJECT_CATEGORIES.includes(opp.category);`;
content = content.replace(oldApplyFilters, newApplyFilters);

// visibleFundingOptions
const oldVisFund = /const visibleFundingOptions =[\s\S]*?activeTab === 'academic' \? ACADEMIC_FUNDING_OPTIONS :\r?\n    ALL_FUNDING_OPTIONS;/g;
const newVisFund = `const visibleFundingOptions =
    activeTab === 'jobs' ? JOBS_FUNDING_OPTIONS :
    activeTab === 'academic_career' ? ACADEMIC_CAREER_FUNDING_OPTIONS :
    activeTab === 'innovation' ? INNOVATION_FUNDING_OPTIONS :
    activeTab === 'projects' ? PROJECTS_FUNDING_OPTIONS :
    ALL_FUNDING_OPTIONS;`;
content = content.replace(oldVisFund, newVisFund);

// countFor
const oldCountFor = /activeTab === 'gigs'     \? GIG_CATEGORIES\.includes\(o\.category\) :\r?\n        activeTab === 'career'   \? CAREER_CATEGORIES\.includes\(o\.category\) :\r?\n        activeTab === 'academic' \? ACADEMIC_CATEGORIES\.includes\(o\.category\) :\r?\n        true;/g;
const newCountFor = `activeTab === 'jobs' ? GIG_CATEGORIES.includes(o.category) :
        activeTab === 'academic_career' ? ACADEMIC_CAREER_CATEGORIES.includes(o.category) :
        activeTab === 'innovation' ? INNOVATION_CATEGORIES.includes(o.category) :
        activeTab === 'projects' ? PROJECT_CATEGORIES.includes(o.category) :
        true;`;
content = content.replace(oldCountFor, newCountFor);

// totalForTab
const oldTotal = /const totalForTab =\r?\n    activeTab === 'gigs'     \? localOpportunities\.filter\(o => GIG_CATEGORIES\.includes\(o\.category\)\)\.length :\r?\n    activeTab === 'career'   \? localOpportunities\.filter\(o => CAREER_CATEGORIES\.includes\(o\.category\)\)\.length :\r?\n    activeTab === 'academic' \? localOpportunities\.filter\(o => ACADEMIC_CATEGORIES\.includes\(o\.category\)\)\.length :\r?\n    localOpportunities\.length;/g;
const newTotal = `const totalForTab =
    activeTab === 'jobs' ? localOpportunities.filter(o => GIG_CATEGORIES.includes(o.category)).length :
    activeTab === 'academic_career' ? localOpportunities.filter(o => ACADEMIC_CAREER_CATEGORIES.includes(o.category)).length :
    activeTab === 'innovation' ? localOpportunities.filter(o => INNOVATION_CATEGORIES.includes(o.category)).length :
    activeTab === 'projects' ? localOpportunities.filter(o => PROJECT_CATEGORIES.includes(o.category)).length :
    localOpportunities.length;`;
content = content.replace(oldTotal, newTotal);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done replacing Opportunities tabs');
