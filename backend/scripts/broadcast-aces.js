import fs from 'fs';
import path from 'path';
import { sendAcesEmail } from '../src/services/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

const csvPath = path.join(process.cwd(), 'ACES_Members_Summary.csv');

async function broadcast() {
  console.log("📂 Reading ACES Members CSV...");
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').slice(1); // Skip header

  const cc = ['opportunitieskenyalive@gmail.com'];
  let sentCount = 0;
  let skippedCount = 0;

  console.log("🔍 Filtering members (2021 and above)...");

  for (const line of lines) {
    if (!line.trim()) continue;
    
    // CSV structure: NO,Member Identification (MID),Name,Email,Registration Number,...
    const parts = line.split(',');
    if (parts.length < 5) continue;

    const name = parts[2].trim();
    const email = parts[3].trim();
    const regNo = parts[4].trim();

    // Filter Logic: ends in /2021, /2022, /2023, /2024, /2025
    const yearMatch = regNo.match(/\/20(2[1-5])$/);
    
    if (yearMatch) {
      console.log(`📡 Sending to ${name} (${regNo})...`);
      const result = await sendAcesEmail(email, name, cc);
      if (result.success) {
        sentCount++;
      }
      // Delay to respect rate limits
      await new Promise(r => setTimeout(r, 200));
    } else {
      skippedCount++;
    }
  }

  console.log(`\n✅ Broadcast Complete!`);
  console.log(`📧 Sent: ${sentCount}`);
  console.log(`⏭️ Skipped (2020 or below): ${skippedCount}`);
}

broadcast();
