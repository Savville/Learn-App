import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const data = {
    "id": "ku-area-rental-scout-project-2026",
    "title": "KU Area Rental Scout — Earn by Gathering Hostel & Rental Vacancy Info",
    "provider": "L-earn Opportunities",
    "category": "Project",
    "description": "Get paid to scout rental vacancies near Kenyatta University. Visit hostels, collect details, photos and contacts — then earn a commission each time your info helps a student find a place.",
    "fullDescription": "HOW IT WORKS\n\nWe are building a live, verified database of rental rooms and hostels near Kenyatta University (Ruiru/Thika Road area) so students can find affordable housing without being scammed or wasting time.\n\nYOUR ROLE AS A SCOUT\n\nYou will:\n• Visit hostels and rental properties in your area\n• Record room types, rent prices, deposit terms, water and electricity details\n• Get the caretaker's contact and the property's M-Pesa paybill or payment method\n• Note current vacancies and take clear photos of the room and compound\n• Submit everything through our verified listing form\n\nOnce we verify your submission (within 48 hours), your listing goes live and starts earning for you.\n\nHOW YOU GET PAID\n\nWhen a student finds your listing and pays for one of our services, you earn 50% of what we collect:\n\n• Info Package — Student pays KES 500 to receive full hostel details (exact contacts, room sizes, directions, payment method). You earn KES 250.\n• Full Booking Support — Student pays KES 1,000. We coordinate the booking on their behalf, confirm availability, and handle the process with the caretaker using the info you provided. You earn KES 500.\n• Guided Visit — Student pays KES 1,500 for you to physically accompany them to the property, show them the room, and assist with the process on-ground. You earn KES 750.\n\nAll payments go through the L-earn platform (M-Pesa). You are paid to your M-Pesa after each successful transaction is confirmed.\n\nWHY VERIFIABLE INFO MATTERS\n\nWe require scouts to submit the property's actual payment details (M-Pesa paybill, bank paybill, or Equity account) along with their listing. This is how we protect students:\n• A real listing has a traceable payment method — scammers cannot fake this\n• Students who choose Full Booking can have rent paid directly through the verified paybill — they never send money to an unknown person\n• If your info is wrong or outdated, your scout rating drops and your future earnings are affected\n\nWHY THIS MODEL PROTECTS EVERYONE\n\n• The student pays the platform — not you or the caretaker directly — eliminating the most common hostel scam\n• We verify each listing before publishing it\n• You get paid only on successful transactions — your incentive is to provide accurate, up-to-date info\n• For bookings, we disburse rent directly to the landlord's verified paybill after the student is confirmed on-ground\n• You never handle rent money — your role is scouting and (for Guided Visits) on-ground support only\n\nWHAT MAKES A GOOD SCOUT\n\n• Lives near or regularly around the KU/Thika Road/Ruiru area\n• Can visit properties, talk to caretakers and photograph the room\n• Gets the payment method details (paybill number, bank, etc.) — this is mandatory\n• Honest — inaccurate info reduces your rating and future earnings\n• Responsive — students paying for visits need timely coordination\n\nGETTING STARTED\n\n1. Apply below with your name, phone number and the area you operate in\n2. We onboard you via WhatsApp and share the submission checklist\n3. You submit your first verified property listing — we review within 48 hours\n4. Once live, you earn from every student it helps\n\nThis is flexible and ongoing — no fixed hours, no upfront cost. The more accurate listings you submit, the more you earn.",
    "deadline": "Ongoing",
    "location": "Kenyatta University Vicinity (Ruiru / Thika Road Area)",
    "eligibility": {
      "educationLevel": "All",
      "fieldOfStudy": [],
      "requirements": [
        "Lives near or operates in the KU/Ruiru/Thika Road area",
        "Has a smartphone with a working camera",
        "Has an active M-Pesa account for receiving payments",
        "Honest and reliable — inaccurate data will reduce your rating"
      ]
    },
    "benefits": [
      "KES 250–750 per successful student placement",
      "50% commission on all platform transactions from your listings",
      "Flexible — work at your own pace, no fixed hours",
      "No upfront cost to participate",
      "Ongoing earning opportunity as long as vacancies are active"
    ],
    "applicationType": "Platform Link",
    "fundingType": "N/A",
    "compensationType": "Paid",
    "upfrontCost": "No Upfront Cost",
    "duration": "Ongoing",
    "featured": true,
    "isVerified": true,
    "status": "Verified",
    "dateAdded": new Date().toISOString(),
    "postedBy": "Williams",
    "contactEmail": "admin@l-earn.co",
    "logoUrl": "/images/hostels.jpg",
    "applicationLink": "https://docs.google.com/forms/d/e/1FAIpQLScvj_x3TnMj2BxaZLfnU5IN2ldWQfy00-0poDF6UD-xflzXCQ/viewform?usp=dialog"
};

async function seed() {
  console.log("Connecting to", process.env.MONGODB_URI ? "MongoDB..." : "ERROR: MONGODB_URI not found");
  if (!process.env.MONGODB_URI) return;
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    await db.collection('opportunities').updateOne(
      { id: data.id },
      { $set: data },
      { upsert: true }
    );
    console.log("Successfully upserted KU Rental Scout gig to DB!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

seed();
