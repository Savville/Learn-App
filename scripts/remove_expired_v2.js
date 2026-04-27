const fs = require('fs');
const filePaths = ['src/data/opportunities.ts', 'backend/seed.js'];

filePaths.forEach(filePath => {
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');

const idsToRemove = ['33', '34', '35', 'kpa-internship-2026'];

let filteredLines = [];
let skipUntilNextObject = false;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Check if we are starting an object that should be removed
    if (!skipUntilNextObject && line.trim() === '{') {
        // Look ahead for the ID
        let foundId = false;
        for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
            if (lines[j].includes('id: \'')) {
                idsToRemove.forEach(id => {
                    if (lines[j].includes(`id: '${id}'`)) {
                        foundId = true;
                    }
                });
                break;
            }
        }
        
        if (foundId) {
            skipUntilNextObject = true;
            braceCount = 1;
            continue;
        }
    }
    
    if (skipUntilNextObject) {
        if (line.includes('{')) braceCount += (line.match(/{/g) || []).length;
        if (line.includes('}')) braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0) {
            // Check if there's a trailing comma on the line or next
            skipUntilNextObject = false;
        }
        continue;
    }
    
    filteredLines.push(line);
}

    fs.writeFileSync(filePath, filteredLines.join('\n'));
    console.log(`Removed expired opportunities from ${filePath} via line filtering.`);
});
