const fs = require('fs');
const file = 'src/pages/OpportunityDetails.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the old Manage wrapper
const oldWrapperStart = `<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

if (content.includes(oldWrapperStart)) {
  content = content.replace(oldWrapperStart, `<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-2xl shadow-sm overflow-hidden">`);
}

// 2. Remove the old wrapper end
const oldWrapperEnd = `        </article>
        )}

        {/* Related Opportunities */}`;
if (content.includes(oldWrapperEnd)) {
  content = content.replace(oldWrapperEnd, `        </article>\n\n        {/* Related Opportunities */}`);
}


// 3. Inject the new Manage tabs inside the article, just before the images
const newTabsInjection = `<article className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isOwner && (
            <div className="flex border-b border-gray-200">
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
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Opportunity</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => setEditRequestPost(opportunity)}>
                  Edit Opportunity
                </Button>
                <Button variant="outline" onClick={async () => {
                  const confirmUnpublish = await showConfirm({
                    title: "Confirm Unpublish",
                    message: "Are you sure you want to unpublish this opportunity? It will no longer be visible to the public."
                  });
                  if (confirmUnpublish) {
                    try {
                      await opportunitiesAPI.unpublishOpportunity(opportunity.id);
                      window.location.href = '/manage';
                    } catch (e) {
                      console.error("Failed to unpublish.");
                    }
                  }
                }}>
                  Unpublish
                </Button>
                <Button variant="default" onClick={() => window.location.href = \`/manage/applicants/\${opportunity.id}\`}>
                  View Applicants
                </Button>
              </div>
            </div>
          ) : (
            <>
          {/* Header Image */}`;

content = content.replace(`<article className="bg-white rounded-2xl shadow-sm overflow-hidden">\n          {/* Header Image */}`, newTabsInjection);

// Close the fragment at the end of the article
content = content.replace(/<\/div>\n\s*<\/article>/, `</div>\n            </>\n          )}\n        </article>`);


// Add required imports and state
if (!content.includes('import { showConfirm }')) {
  // Use a simple confirm if showConfirm isn't available, but we'll try to add it.
  // Actually, we can use window.confirm or a custom modal for Unpublish. 
  // Let's just use window.confirm if showConfirm isn't standard, but we'll import it if it is.
  // Wait, let's inject Edit Request Modal state
}

fs.writeFileSync(file, content, 'utf8');
console.log('Opportunity details layout updated!');
