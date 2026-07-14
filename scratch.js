const fs = require('fs');

const expiredIds = [
  'arice-scholarship-program-2026-27',
  'london-metropolitan-sanctuary-scholarship-2026',
  'hamad-bin-khalifa-university-scholarship-2026',
  'sbw-berlin-scholarship-in-germany-2026',
  'vice-chancellor-international-excellence-scholarship-2026'
];

let opps = fs.readFileSync('src/data/opportunities.ts', 'utf8');
let backend = fs.readFileSync('backend/src/routes/public.js', 'utf8');

// Remove expired objects
for (const id of expiredIds) {
  const regex = new RegExp(`\\{\\s*id:\\s*'${id}'.*?status:\\s*'Verified'\\s*\\},?\\s*`, 'gs');
  opps = opps.replace(regex, '');
  backend = backend.replace(regex, '');
}

// Re-assign Bond to Tracy
backend = backend.replace(/id: 'bond-university-leadership-scholarships-2026'(.*?)(postedBy: 'Opportunities Kenya Admin',\s*contactEmail: 'admin@opportunities.ke',\s*reporter: \{ name: 'Opportunities Kenya Admin', email: 'admin@opportunities.ke' \})/s, (match, p1, p2) => {
    return match.replace(p2, "postedBy: 'Tracy',\n        contactEmail: 'tracy@opportunities.ke',\n        reporter: { name: 'Tracy', email: 'tracy@opportunities.ke' }");
});
opps = opps.replace(/id: 'bond-university-leadership-scholarships-2026'(.*?)(postedBy: 'Opportunities Kenya Admin')/s, (match, p1, p2) => {
    return match.replace(p2, "postedBy: 'Tracy'");
});

// Re-assign Ellison to Kevin
backend = backend.replace(/id: 'ellison-undergraduate-scholars-program-2027'(.*?)(postedBy: 'Opportunities Kenya Admin',\s*contactEmail: 'admin@opportunities.ke',\s*reporter: \{ name: 'Opportunities Kenya Admin', email: 'admin@opportunities.ke' \})/s, (match, p1, p2) => {
    return match.replace(p2, "postedBy: 'Kevin',\n        contactEmail: 'kevin@opportunities.ke',\n        reporter: { name: 'Kevin', email: 'kevin@opportunities.ke' }");
});
opps = opps.replace(/id: 'ellison-undergraduate-scholars-program-2027'(.*?)(postedBy: 'Opportunities Kenya Admin')/s, (match, p1, p2) => {
    return match.replace(p2, "postedBy: 'Kevin'");
});

// Re-assign Google to Stephen
backend = backend.replace(/id: 'google-student-researcher-internship-2026'(.*?)(postedBy: 'Opportunities Kenya Admin',\s*contactEmail: 'admin@opportunities.ke',\s*reporter: \{ name: 'Opportunities Kenya Admin', email: 'admin@opportunities.ke' \})/s, (match, p1, p2) => {
    return match.replace(p2, "postedBy: 'Stephen',\n        contactEmail: 'stephen@opportunities.ke',\n        reporter: { name: 'Stephen', email: 'stephen@opportunities.ke' }");
});
opps = opps.replace(/id: 'google-student-researcher-internship-2026'(.*?)(postedBy: 'Opportunities Kenya Admin')/s, (match, p1, p2) => {
    return match.replace(p2, "postedBy: 'Stephen'");
});

// Add DB deletion block for expired ones in backend/src/routes/public.js
const deleteBlock = `
    // Delete expired opportunities
    await db.collection('opportunities').deleteMany({
      id: { $in: [
        'arice-scholarship-program-2026-27',
        'london-metropolitan-sanctuary-scholarship-2026',
        'hamad-bin-khalifa-university-scholarship-2026',
        'sbw-berlin-scholarship-in-germany-2026',
        'vice-chancellor-international-excellence-scholarship-2026'
      ]}
    });
`;
backend = backend.replace(/\/\/ Wipe out old duplicate Google Internships/, deleteBlock + '\n    // Wipe out old duplicate Google Internships');

fs.writeFileSync('src/data/opportunities.ts', opps);
fs.writeFileSync('backend/src/routes/public.js', backend);

console.log('Update complete');
