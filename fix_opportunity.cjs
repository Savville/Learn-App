const fs = require('fs');
const file = 'src/pages/OpportunityDetails.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 'Invalid Date' in UI
content = content.replace(
  "new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })",
  "isNaN(new Date(opportunity.deadline).getTime()) ? opportunity.deadline : new Date(opportunity.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })"
);

// Fix 'Invalid Date' in Share button
content = content.replace(
  "`📅 Deadline: ${new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`",
  "(isNaN(new Date(opportunity.deadline).getTime()) ? `📅 Deadline: ${opportunity.deadline}` : `📅 Deadline: ${new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`)"
);

// Add Imports
content = content.replace(
  "import { getDynamicImageUrl } from '../components/OpportunityCard';",
  "import { getDynamicImageUrl } from '../components/OpportunityCard';\nimport { ApplicantsSidePanel } from '../components/ApplicantsSidePanel';"
);

// Add state variables
content = content.replace(
  "const [showContributors, setShowContributors] = useState(false);",
  "const [showContributors, setShowContributors] = useState(false);\n\n  const [activeTab, setActiveTab] = useState<'details' | 'manage'>('details');\n  const [isOwner, setIsOwner] = useState(false);\n  const [showApplicantsPanel, setShowApplicantsPanel] = useState(false);\n\n  useEffect(() => {\n    if (opportunity) {\n      const email = localStorage.getItem('user_email');\n      const isAdmin = !!localStorage.getItem('adminToken');\n      if (isAdmin || (email && (\n        opportunity.userEmail === email || \n        opportunity.reporter?.email === email || \n        opportunity.contactEmail === email ||\n        opportunity.postedBy === email\n      ))) {\n        setIsOwner(true);\n      }\n    }\n  }, [opportunity]);"
);

// Wrap Content in Tabs
content = content.replace(
  "<div className=\"lg:col-span-2 space-y-12\">",
  `<div className="lg:col-span-2 space-y-12">

            {isOwner && (
              <div className="flex border-b border-gray-200 mb-8 mt-6">
                <button
                  className={\`py-3 px-6 font-semibold text-sm transition-colors \${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}\`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={\`py-3 px-6 font-semibold text-sm transition-colors \${activeTab === 'manage' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}\`}
                  onClick={() => setActiveTab('manage')}
                >
                  Manage
                </button>
              </div>
            )}

            {activeTab === 'manage' && isOwner ? (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Opportunity</h2>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => window.open(\`/post-with-us?edit=\${opportunity.id}\`, '_blank')}>
                    Edit Opportunity
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    if(confirm("Are you sure you want to unpublish this?")) {
                      try {
                        await opportunitiesAPI.unpublishOpportunity(opportunity.id);
                        toast.success("Successfully unpublished!");
                        window.location.reload();
                      } catch (e) {
                        toast.error("Failed to unpublish.");
                      }
                    }
                  }}>
                    Unpublish
                  </Button>
                  <Button variant="default" onClick={() => setShowApplicantsPanel(true)}>
                    View Applicants
                  </Button>
                </div>
              </section>
            ) : (<>`
);

// End wrapper
content = content.replace(
  "{/* Bottom Actions inside Details mode */}",
  "</>\n            )}\n\n            {/* Bottom Actions inside Details mode */}"
);

// Add SidePanel
content = content.replace(
  "</main>\n    </div>\n  );\n}",
  "</main>\n\n      <ApplicantsSidePanel \n        opportunityId={opportunity.id} \n        isOpen={showApplicantsPanel} \n        onClose={() => setShowApplicantsPanel(false)} \n      />\n    </div>\n  );\n}"
);

fs.writeFileSync(file, content, 'utf8');
