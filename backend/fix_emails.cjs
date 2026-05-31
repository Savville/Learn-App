const fs = require('fs');
const path = require('path');

const emailFile = path.join(process.cwd(), 'src/services/emailService.js');
const contactFile = path.join(process.cwd(), '../src/pages/Contact.tsx');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/mailto:lead@opportunitieskenya\.live/g, 'mailto:opportunitieskenyalive@gmail.com');
  content = content.replace(/">lead@opportunitieskenya\.live<\/a>/g, '">opportunitieskenyalive@gmail.com</a>');
  content = content.replace(/reply_to:\s*'lead@opportunitieskenya\.live'/g, "reply_to: 'opportunitieskenyalive@gmail.com'");
  content = content.replace(/'lead@opportunitieskenya\.live',\s*'opportunitieskenyalive@gmail\.com'/g, "'opportunitieskenyalive@gmail.com'");
  
  if (filePath.includes('Contact.tsx')) {
    content = content.replace(/lead@opportunitieskenya\.live/g, 'opportunitieskenyalive@gmail.com');
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', filePath);
}

fixFile(emailFile);
fixFile(contactFile);
