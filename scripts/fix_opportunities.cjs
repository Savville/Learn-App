const fs = require('fs');

let content = fs.readFileSync('src/data/opportunities.ts', 'utf8');

// 1. Fix the Boston array insertion syntax error
content = content.replace(
  /export const opportunities:\s*Opportunity\[\s*\{/,
  'export const opportunities: Opportunity[] = [\n  {'
);
content = content.replace(
  /\},\s*\]\s*=\s*\[\s*\{/,
  '  },\n  {'
);

// 2. Fix the Boston logoUrl
content = content.replace(
  /"logoUrl": "https:\/\/images\.unsplash\.com[^"]*"/,
  '"logoUrl": "/images/boston_university.png"'
);

// 3. Remove leftover thematicAreas syntax from ACES CivExpo
const leftoverAces = /\s*\{\s*heading:\s*'Tech & Automation \(Phase 2\)',[\s\S]*?\}\s*\]\s*\},?/g;
content = content.replace(leftoverAces, '\n');

// 4. Remove leftover thematicAreas syntax from WorldQuant BRAIN
const leftoverQuant = /\s*\{\s*heading:\s*'Simulation & Backtesting',[\s\S]*?\}\s*\]\s*\},?/g;
content = content.replace(leftoverQuant, '\n');

// Extra cleanup for multiple blank lines
content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

fs.writeFileSync('src/data/opportunities.ts', content);
console.log('Fixed src/data/opportunities.ts');
