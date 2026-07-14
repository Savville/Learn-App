const GIG_CATEGORIES = ['Gig', 'Job'];
const ACADEMIC_CAREER_CATEGORIES = [
  'Internship', 'Attachment', 'Conference', 'CallForPapers', 'Event', 'Volunteer',
  'Scholarship', 'Fellowship', 'Grant',
];
const INNOVATION_CATEGORIES = ['Hackathon', 'Challenge', 'StartupFunding'];
const PROJECT_CATEGORIES = ['StudentProject', 'Project', 'ResearchCollaboration'];

function categoryMatchesTab(category, tab) {
  if (tab === 'all') return true;
  if (tab === 'jobs') return GIG_CATEGORIES.includes(category);
  if (tab === 'academic_career') return ACADEMIC_CAREER_CATEGORIES.includes(category);
  if (tab === 'innovation') return INNOVATION_CATEGORIES.includes(category);
  if (tab === 'projects') return PROJECT_CATEGORIES.includes(category);
  return true;
}

const opps = [
  { title: "Boston", category: "Scholarship" },
  { title: "Google", category: "Internship" },
  { title: "Agro-UHPC", category: "ResearchCollaboration" },
];

function applyFilters(opps, activeTab) {
  return opps.filter(opp => categoryMatchesTab(opp.category, activeTab));
}

console.log("projects tab:");
console.log(applyFilters(opps, "projects"));

console.log("jobs tab:");
console.log(applyFilters(opps, "jobs"));
