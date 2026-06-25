const fs = require('fs');
let content = fs.readFileSync('src/data/opportunities.ts', 'utf8');

const idsToRemove = [
  'canva-madaraka-day-challenge-2026', 
  'safal-eye-in-the-wild-2026', 
  'mock-gig-student-project', 
  'mock-gig-lecturer-ppt', 
  'mock-gig-grad-research', 
  'agea-startup-lab-2026', 
  'aces-civexpo-2026-incubation', 
  'worldquant-brain-iqc-2026'
];

// Instead of complex regex, let's just parse the file by removing blocks.
// An easier way is just use regex to remove each object.
for(let id of idsToRemove) {
  // matches { ... id: '...' ... }
  const regex = new RegExp(`{[^{}]*id:\\s*['"\`]${id}['"\`][\\s\\S]*?(?=\\n\\s*\\},\\s*{|\\n\\s*\\}\\s*\\])\\n\\s*\\},?`, 'g');
  content = content.replace(regex, '');
}
// Clean up trailing commas or double commas if any
content = content.replace(/,\s*,/g, ',');
content = content.replace(/,\s*\]/, '\n]');

fs.writeFileSync('src/data/opportunities.ts', content);
console.log('Removed expired opportunities from src/data/opportunities.ts');
