import fs from 'fs';
import path from 'path';
import { sendPowerAfricaEmail } from '../src/services/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const csvPath = path.join(process.cwd(), 'IEEE_KU_Members_Full_Emails_Only.csv');

async function broadcast() {
  console.log("📂 Reading IEEE Members CSV...");
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim()).slice(1); // Skip header

  const cc = ['opportunitieskenyalive@gmail.com'];
  let sentCount = 0;

  console.log(`📡 Starting PowerAfrica broadcast to ${lines.length} IEEE members...`);

  for (const line of lines) {
    // CSV: ID,Last Name,First Name,Email
    const parts = line.split(',');
    if (parts.length < 4) continue;

    const firstName = parts[2].trim();
    const email = parts[3].trim();

    console.log(`📡 Sending to ${firstName} (${email})...`);
    const result = await sendPowerAfricaEmail(email, firstName, cc);
    if (result.success) {
      sentCount++;
    }
    
    // Rate limit delay
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n✅ Broadcast Complete!`);
  console.log(`📧 Total Sent: ${sentCount}`);
}

broadcast();
