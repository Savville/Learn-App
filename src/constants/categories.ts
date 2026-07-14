/** Canonical category taxonomy — single source of truth for browse + post flows */

export type TabId = 'all' | 'jobs' | 'academic_career' | 'innovation' | 'projects';

export type OpportunityCategory =
  | 'CallForPapers' | 'Internship' | 'Grant' | 'Conference' | 'Scholarship' | 'Fellowship'
  | 'Attachment' | 'Hackathon' | 'Event' | 'Volunteer' | 'Challenge' | 'Project' | 'StudentProject' | 'ResearchCollaboration'
  | 'Gig' | 'Job' | 'Partnership' | 'StartupFunding' | 'Other';

export const GIG_CATEGORIES: OpportunityCategory[] = ['Gig', 'Job'];

export const ACADEMIC_CAREER_CATEGORIES: OpportunityCategory[] = [
  'Internship', 'Attachment', 'Conference', 'CallForPapers', 'Event', 'Volunteer',
  'Scholarship', 'Fellowship',
];

export const INNOVATION_CATEGORIES: OpportunityCategory[] = ['Grant', 'StartupFunding'];

export const PROJECT_CATEGORIES: OpportunityCategory[] = ['StudentProject', 'Project', 'ResearchCollaboration', 'Hackathon', 'Challenge'];

export const PARSER_CATEGORY_LIST =
  'CallForPapers, Internship, Grant, Conference, Scholarship, Fellowship, Attachment, Hackathon, Event, Volunteer, Challenge, Project, StudentProject, ResearchCollaboration, Gig, Job, Partnership, StartupFunding, Other';

export const ALL_CATEGORY_OPTIONS: { value: OpportunityCategory | 'Other'; label: string; tab: TabId }[] = [
  { value: 'Gig', label: 'Microgigs', tab: 'jobs' },
  { value: 'Job', label: 'Jobs', tab: 'jobs' },
  { value: 'Internship', label: 'Internships', tab: 'academic_career' },
  { value: 'Attachment', label: 'Attachments', tab: 'academic_career' },
  { value: 'Conference', label: 'Conferences', tab: 'academic_career' },
  { value: 'CallForPapers', label: 'Call for Papers', tab: 'academic_career' },
  { value: 'Event', label: 'Events', tab: 'academic_career' },
  { value: 'Volunteer', label: 'Volunteer Programmes', tab: 'academic_career' },
  { value: 'Scholarship', label: 'Scholarships', tab: 'academic_career' },
  { value: 'Fellowship', label: 'Fellowships', tab: 'academic_career' },
  { value: 'Grant', label: 'Grants', tab: 'innovation' },
  { value: 'Hackathon', label: 'Hackathons', tab: 'projects' },
  { value: 'Challenge', label: 'Industry Challenges', tab: 'projects' },
  { value: 'StartupFunding', label: 'Startup Funding', tab: 'innovation' },
  { value: 'Project', label: 'Community Projects', tab: 'projects' },
  { value: 'StudentProject', label: 'Student Projects', tab: 'projects' },
  { value: 'ResearchCollaboration', label: 'Research Collaborations', tab: 'projects' },
  { value: 'Partnership', label: 'Partnerships', tab: 'all' },
  { value: 'Other', label: 'Others', tab: 'all' },
];

/** Optgroups for Post With Us category select */
export const POST_WITH_US_CATEGORY_GROUPS: { label: string; options: { value: OpportunityCategory | 'Other'; label: string }[] }[] = [
  {
    label: 'Jobs & Microgigs',
    options: [
      { value: 'Gig', label: 'Microgig' },
      { value: 'Job', label: 'Job' },
    ],
  },
  {
    label: 'Academic & Career',
    options: [
      { value: 'Internship', label: 'Internship' },
      { value: 'Attachment', label: 'Attachment' },
      { value: 'Conference', label: 'Conference' },
      { value: 'CallForPapers', label: 'Call for Papers' },
      { value: 'Event', label: 'Event' },
      { value: 'Volunteer', label: 'Volunteer Programme' },
      { value: 'Scholarship', label: 'Scholarship' },
      { value: 'Fellowship', label: 'Fellowship' },
      { value: 'Grant', label: 'Academic Grant' },
    ],
  },
  {
    label: 'Innovation',
    options: [
      { value: 'Hackathon', label: 'Hackathon' },
      { value: 'Challenge', label: 'Industry Challenge' },
      { value: 'StartupFunding', label: 'Startup Funding' },
    ],
  },
  {
    label: 'Projects',
    options: [
      { value: 'StudentProject', label: 'Student Project' },
      { value: 'Project', label: 'Community Project' },
      { value: 'ResearchCollaboration', label: 'Research Collaboration' },
    ],
  },
  {
    label: 'Other',
    options: [
      { value: 'Partnership', label: 'Partnership' },
      { value: 'Other', label: 'Other' },
    ],
  },
];

const JOB_CATS = new Set(GIG_CATEGORIES);
const HIDE_FUNDING_CATS = new Set<OpportunityCategory | string>([...GIG_CATEGORIES, 'Internship', 'Attachment', 'Volunteer']);
const HIDE_COMPENSATION_CATS = new Set<OpportunityCategory | string>([
  ...ACADEMIC_CAREER_CATEGORIES.filter(c => ['Scholarship', 'Grant', 'CallForPapers', 'Conference', 'Fellowship'].includes(c)),
  ...INNOVATION_CATEGORIES,
  ...PROJECT_CATEGORIES,
  'Volunteer',
]);
const PROJECT_CATS = new Set(PROJECT_CATEGORIES);
const CHALLENGE_CATS = new Set(['Challenge']);

export function isProjectCategory(category: string) {
  return PROJECT_CATS.has(category as OpportunityCategory);
}

export function isChallengeCategory(category: string) {
  return CHALLENGE_CATS.has(category);
}

export function categoryHidesFunding(category: string) {
  return HIDE_FUNDING_CATS.has(category);
}

export function categoryHidesCompensation(category: string) {
  return HIDE_COMPENSATION_CATS.has(category);
}

export function categoryHidesUpfrontCost(category: string) {
  return isProjectCategory(category) || isChallengeCategory(category);
}

export function categoryShowsJobEscrow(category: string) {
  return JOB_CATS.has(category as OpportunityCategory);
}

export function categoryShowsEndorsement(category: string) {
  return isProjectCategory(category);
}

export function categoryShowsProjectFunding(category: string) {
  return isProjectCategory(category);
}

/** Apply defaults when user changes category in Post With Us */
export function applyCategoryFieldDefaults<T extends Record<string, any>>(category: string, basicInfo: T): T {
  const next: any = { ...basicInfo, category };
  if (categoryHidesFunding(category)) {
    next.fundingType = 'Not Applicable';
  }
  if (categoryHidesCompensation(category)) {
    next.compensationType = 'N/A';
  }
  if (categoryHidesUpfrontCost(category)) {
    next.upfrontCost = 'No Upfront Cost';
  }
  return next;
}

export const BROWSE_TABS: { id: TabId; label: string; description: string }[] = [
  { id: 'all', label: 'All', description: 'Opportunities' },
  { id: 'jobs', label: 'Jobs', description: 'Jobs & Microgigs' },
  { id: 'academic_career', label: 'Academic & Career', description: 'Academic & Career' },
  { id: 'innovation', label: 'Grants', description: 'Grants & Funding' },
  { id: 'projects', label: 'Projects/Hackathons', description: 'Projects & Hackathons' },
];

export function categoryMatchesTab(category: string, tab: TabId): boolean {
  // Coerce to string and normalise — prevents null/array/undefined leaking into all tabs
  const cat = (typeof category === 'string' ? category : String(category ?? '')).trim();
  if (!cat) return false;
  if (tab === 'all') return true;
  if (tab === 'jobs') return GIG_CATEGORIES.includes(cat as OpportunityCategory);
  if (tab === 'academic_career') return ACADEMIC_CAREER_CATEGORIES.includes(cat as OpportunityCategory);
  if (tab === 'innovation') return INNOVATION_CATEGORIES.includes(cat as OpportunityCategory);
  if (tab === 'projects') return PROJECT_CATEGORIES.includes(cat as OpportunityCategory);
  return false;
}
