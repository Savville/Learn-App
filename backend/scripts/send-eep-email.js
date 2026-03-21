import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendEepEmail } from '../src/services/emailService.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const subscribers = [];
  const csvFilePath = path.join(__dirname, '..', 'IEEE_KU_Members_Full_Emails_Only.csv');

  console.log(`Reading CSV file from: ${csvFilePath}`);

  fs.createReadStream(csvFilePath)
    .on('error', (error) => {
      console.error('Error reading CSV file:', error.message);
      process.exit(1);
    })
    .pipe(csv())
    .on('data', (row) => {
      const email = row['Email'];
      const firstName = row['First Name'];

      if (email && firstName) {
        // Capitalize first letter of the name
        const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        subscribers.push({ email: email.trim(), name: formattedName });
      }
    })
    .on('end', async () => {
      console.log('CSV file successfully processed.');
      
      if (subscribers.length === 0) {
        console.log('No subscribers found in the CSV file.');
        process.exit(0);
      }

      console.log(`Found ${subscribers.length} subscribers. Preparing to send broadcast...`);

      try {
        await sendEepEmail(subscribers);
        console.log('✅ Broadcast successfully sent to all subscribers.');
        process.exit(0);
      } catch (error) {
        console.error('❌ An error occurred during the email broadcast:', error);
        process.exit(1);
      }
    });
}

main();
