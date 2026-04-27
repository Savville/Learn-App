const fs = require('fs');

const filePath = 'src/data/opportunities.ts';
let content = fs.readFileSync(filePath, 'utf8');

const idsToRemove = ['33', '34', '35', 'kpa-internship-2026'];

// A very crude way to remove items from the array string.
// We look for { id: 'ID', ... }, and remove the whole block.
// This assumes the file is formatted with standard indentation.

idsToRemove.forEach(id => {
    // Regex to match the object starting with the given id
    const regex = new RegExp(`\\s+{\\s+id: '${id}',[\\s\\S]*?  },?\\n`, 'g');
    content = content.replace(regex, '');
});

fs.writeFileSync(filePath, content);
console.log('Removed expired opportunities.');
