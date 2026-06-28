const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/OpportunityDetails.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The multi_replace_file_content injected literal backslashes because it didn't unescape them.
// Let's replace the broken style prop with the correct one.
const badStyle = 'style={{ width: \\`\\${Math.min(100, (localFundedAmount / (opportunity.escrowAmount || 1)) * 100)}%\\` }}';
const goodStyle = 'style={{ width: `${Math.min(100, (localFundedAmount / (opportunity.escrowAmount || 1)) * 100)}%` }}';

if (content.includes(badStyle)) {
  content = content.replace(badStyle, goodStyle);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed style syntax error!');
} else {
  console.error('Could not find the bad style string!');
}
