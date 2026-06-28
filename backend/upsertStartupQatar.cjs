const fs = require('fs');
const path = require('path');

async function main() {
  const password = process.env.ADMIN_PASSWORD || 'admin123local';
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  const pwd = process.env.ADMIN_PASSWORD || password;

  const loginRes = await fetch('http://localhost:5000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: pwd }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error(loginData.error || 'Login failed');

  const opportunities = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'OPPORTUNITIES', 'startup-qatar-investment-program.json'), 'utf8')
  );

  const upsertRes = await fetch('http://localhost:5000/api/admin/upsert-opportunities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify(opportunities),
  });
  const upsertData = await upsertRes.json();
  if (!upsertRes.ok) throw new Error(JSON.stringify(upsertData));
  console.log('Upserted:', upsertData);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
