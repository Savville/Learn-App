const fs = require('fs');
const file = 'src/pages/OpportunityDetails.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStart = /<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">\s*<article className="bg-white rounded-2xl shadow-sm overflow-hidden">/g;

const replacementStart = `<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Opportunity</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => window.open(\`/post-with-us?edit=\${opportunity.id}\`, '_blank')}>
                Edit Opportunity
              </Button>
              <Button variant="outline" onClick={async () => {
                if(confirm("Are you sure you want to unpublish this?")) {
                  try {
                    await opportunitiesAPI.unpublishOpportunity(opportunity.id);
                    // Reload page or navigate away
                    window.location.reload();
                  } catch (e) {
                    console.error("Failed to unpublish.");
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
        ) : (
          <article className="bg-white rounded-2xl shadow-sm overflow-hidden">`;

if (targetStart.test(content)) {
  content = content.replace(targetStart, replacementStart);
  console.log('Replaced start!');
} else {
  console.log('Target start not found!');
}

const targetEnd = /<\/article>\s*\{\/\* Related Opportunities \*\/\}/g;

const replacementEnd = `        </article>
        )}

        {/* Related Opportunities */}`;

if (targetEnd.test(content)) {
  content = content.replace(targetEnd, replacementEnd);
  console.log('Replaced end!');
} else {
  console.log('Target end not found!');
}

const endFileStr = /<\/main>\s*<\/div>\s*\);\s*\}/g;
const endFileReplacement = `</main>

      <ApplicantsSidePanel 
        opportunityId={opportunity.id} 
        isOpen={showApplicantsPanel} 
        onClose={() => setShowApplicantsPanel(false)} 
      />
    </div>
  );
}`;

if (endFileStr.test(content)) {
  content = content.replace(endFileStr, endFileReplacement);
  console.log('Replaced SidePanel!');
} else {
  console.log('Target SidePanel not found!');
}

fs.writeFileSync(file, content, 'utf8');
