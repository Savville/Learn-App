const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/opportunities.ts');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /suggestCustomForm\?: boolean; \/\/ Temporary flag from AI parsing\r?\n\}/;
const replacement = 'suggestCustomForm?: boolean; // Temporary flag from AI parsing\n  views?: number;\n  clicks?: number;\n}';

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated the interface!');
} else {
  console.error('Regex did not match!');
}
