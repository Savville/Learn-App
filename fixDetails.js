const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/OpportunityDetails.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `              <div className="flex items-center gap-2 text-gray-600">\n                <Users className="w-5 h-5 text-blue-500" />\n                <div>\n                  <p className="text-gray-500 text-sm">Applicants</p>\n                  <p className="font-semibold text-blue-600">{applicants} applied</p>\n                </div>\n              </div>`;
const targetWindows = `              <div className="flex items-center gap-2 text-gray-600">\r\n                <Users className="w-5 h-5 text-blue-500" />\r\n                <div>\r\n                  <p className="text-gray-500 text-sm">Applicants</p>\r\n                  <p className="font-semibold text-blue-600">{applicants} applied</p>\r\n                </div>\r\n              </div>`;

if (content.includes(target)) {
  content = content.replace(target, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully removed applicants block (Unix)!');
} else if (content.includes(targetWindows)) {
  content = content.replace(targetWindows, '');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully removed applicants block (Windows)!');
} else {
  console.error('Target not found in OpportunityDetails.tsx!');
}
