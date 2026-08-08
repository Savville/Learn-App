const fs = require('fs');
const file = 'src/services/api.ts';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  unpublishOpportunity: (id: string) => {
    const token = localStorage.getItem('user_token');
    return apiClient.post(\`/public/me/posts/\${id}/unpublish\`, {}, {
      headers: { Authorization: \`Bearer \${token}\` }
    });
  },`;

const replacementStr = `  unpublishOpportunity: (id: string) => {
    const token = localStorage.getItem('user_token');
    return apiClient.post(\`/public/me/posts/\${id}/unpublish\`, {}, {
      headers: { Authorization: \`Bearer \${token}\` }
    });
  },

  getJobApplicants: (id: string) => {
    const token = localStorage.getItem('user_token');
    return apiClient.get(\`/public/me/posts/\${id}/applicants\`, {
      headers: { Authorization: \`Bearer \${token}\` }
    });
  },`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully added getJobApplicants to api.ts');
} else {
  console.log('Could not find target string in api.ts');
}
