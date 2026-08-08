const fs = require('fs');
const file = 'src/pages/OpportunityDetails.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes("import { useAlert } from '../contexts/AlertContext';")) {
  content = content.replace("import { useSEO } from '../hooks/useSEO';", "import { useSEO } from '../hooks/useSEO';\nimport { useAlert } from '../contexts/AlertContext';");
}

// 2. Add hook usage
const hookUsage = `  const { showConfirm, showAlert } = useAlert();\n`;
if (!content.includes('const { showConfirm')) {
  // Find where to insert it: right after export default function OpportunityDetails() {
  content = content.replace('export default function OpportunityDetails() {', 'export default function OpportunityDetails() {\n' + hookUsage);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Added useAlert to OpportunityDetails');
