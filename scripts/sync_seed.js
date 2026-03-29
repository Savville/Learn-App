import fs from 'fs';
import path from 'path';

const tsPath = 'c:/Users/User/Downloads/PortableGit/Learn Opportunities/src/data/opportunities.ts';
const seedPath = 'c:/Users/User/Downloads/PortableGit/Learn Opportunities/backend/seed.js';

let tsContent = fs.readFileSync(tsPath, 'utf8');

// Pull the array content
const match = tsContent.match(/export const opportunities: Opportunity\[\] = \[\s*([\s\S]*)\s*\];\s*$/);
if (!match) {
    console.error("No opportunities found!");
    process.exit(1);
}

let arrayContent = match[1];

// Add views, clicks to each item
// We'll replace the closing brace of each item with our extra properties
// A better way is to regex for `},` and add it before the comma
let updatedArray = arrayContent.replace(/\},/g, '    views: 0,\n    clicks: 0\n  },');

// Add to the final item (since it doesn't have a trailing comma after the array content match)
// but wait, the last item might have a comma if the dev left it.
// Checking the actual content from earlier: `logoUrl: '/images/opportunities/google.jpg'\n    }\n];`
// So it doesn't have a comma after the last one.
updatedArray = updatedArray.trim();
if (!updatedArray.endsWith('},')) {
    // replace the last } with views/clicks + }
    updatedArray = updatedArray.replace(/\}\s*$/, '    views: 0,\n    clicks: 0\n  }');
}

let seedContent = fs.readFileSync(seedPath, 'utf8');

const newSeed = seedContent.replace(/const opportunities = \[\s*[\s\S]*?\s*\];/ , `const opportunities = [\n${updatedArray}\n];`);

fs.writeFileSync(seedPath, newSeed);
console.log("Seed file successfully updated using node!");
