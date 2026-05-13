import fs from 'fs';

const ts = fs.readFileSync('src/data/opportunities.ts', 'utf-8');
const match = ts.match(/export const opportunities: Opportunity\[\] = (\[[\s\S]*?\]);/);
const arrStr = match[1];

let seed = fs.readFileSync('backend/seed.js', 'utf-8');
const startIdx = seed.indexOf('const opportunities = ');
const endIdx = seed.indexOf('async function seedDatabase');

if (startIdx !== -1 && endIdx !== -1) {
    const newSeed = seed.slice(0, startIdx) + 'const opportunities = ' + arrStr + ';\n\n' + seed.slice(endIdx);
    fs.writeFileSync('backend/seed.js', newSeed);
    console.log("Success");
} else {
    console.log("Markers not found");
}
