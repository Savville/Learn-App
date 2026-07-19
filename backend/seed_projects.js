import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const projects = [
  {
    "id": "hydro-guard-concrete",
    "title": "Hydro-Guard: Localized High-Performance Hydrophobic Concrete Admixtures",
    "provider": "MTRD / University Laboratories",
    "category": "StudentProject",
    "description": "Developing localized hydrophobic concrete admixtures to reduce water infiltration and lower lifecycle maintenance costs by 40%.",
    "fullDescription": "Traditional surface-applied concrete waterproofing is expensive, often imported, and degrades over time, leaving foundations and retaining walls vulnerable to water damage in aggressive soils.\n\nWe are developing a locally manufactured, self-waterproofing concrete admixture by integrating crystalline and hydrophobic mineral composites directly into the concrete matrix during mixing.\n\nRESOURCE BREAKDOWN\n• KES 4,500 — 30 kg of raw bentonite & silica base (KES 150/kg)\n• KES 7,500 — 5 Liters of specialized silane-siloxane composites (KES 1,500/L)\n• KES 6,000 — Local field transit for sample collection over 4 weeks (KES 1,500/week)\n• KES 4,000 — Consumables: specialized curing molds and fine sieves\nNote: Core mixing, curing, and capillary water absorption testing are provided entirely FREE by our institutional lab partners.\n\nELIGIBILITY\nOpen to undergraduate and postgraduate students. We are seeking an industrial attachment or senior mentorship to help guide the foundational research.\n\nBENEFITS & REWARDS\n• Monthly progress reports\n• Formal acknowledgment in any published research papers\n• Early access to the admixture formulation framework",
    "deadline": "2027-01-01T23:59:59.000Z",
    "location": "Nairobi, Kenya",
    "eligibility": {
      "educationLevel": "Both",
      "requirements": [
        "Undergraduate or postgraduate students welcome",
        "Interest in sustainable construction materials",
        "Willing to support testing logistics (KES 22,000 funding goal)"
      ]
    },
    "benefits": [
      "Monthly progress reports from the research team",
      "Formal acknowledgment in published research papers",
      "Early access to the admixture formulation framework"
    ],
    "fundingType": "N/A",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "featured": true,
    "dateAdded": new Date().toISOString(),
    "logoUrl": "/images/hydrophobic_concrete_demo.png",
    "isVerified": true,
    "status": "Verified",
    "postedBy": "Williams Ochieng",
    "contactEmail": "admin@l-earn.co",
    "isEscrow": true,
    "escrowAmount": 22000,
    "fundedAmount": 2400
  },
  {
    "id": "alkali-activated-binders",
    "title": "Geo-Bind: Naturally Activating Geopolymer Matrix (Eco-Friendly Masonry Blocks)",
    "provider": "MTRD / University Laboratories",
    "category": "StudentProject",
    "description": "Creating a 100% locally sourced, naturally activating geopolymer masonry block using Rift Valley volcanic tuffs — eliminating expensive imported chemical activators. Funding goal: KES 27,000.",
    "fullDescription": "Standard geopolymer concrete relies on highly corrosive and expensive imported chemical activators (like Sodium Hydroxide), making sustainable, \"no-cement\" masonry blocks financially unviable in East Africa.\n\nWe are creating a naturally activating geopolymer matrix using locally sourced Rift Valley volcanic tuffs (Menengai/Longonot) and agricultural by-products to establish a 100% locally sourced masonry block.\n\n────────────────────────────────────\n RESOURCE BREAKDOWN\n────────────────────────────────────\n\n• KES 12,500 — 1-ton pickup hire to Rift Valley (KES 8,000/day + Fuel: 150km @ KES 30/km)\n• KES 2,000 — 2 local laborers for tuff excavation (KES 1,000/day each)\n• KES 9,000 — External XRD/XRF phase testing at advanced physics labs (2 samples @ KES 4,500/sample)\n• KES 3,500 — Heavy-duty respirators and safety gear for ash handling\n\nNote: Standard rock crushing and structural compression testing are subsidized for free.\n\n────────────────────────────────────\n ELIGIBILITY\n────────────────────────────────────\n\nOpen to undergraduate and postgraduate students. Looking for academic supervision regarding geopolymer activation methodologies.\n\n────────────────────────────────────",
    "deadline": "2027-01-01T23:59:59.000Z",
    "location": "Nairobi, Kenya",
    "eligibility": {
      "educationLevel": "All",
      "requirements": ["Interested in sustainable construction", "Willing to fund testing logistics"]
    },
    "benefits": [
      "Access to comprehensive testing data",
      "Co-authorship on final research publications",
      "First right of refusal for commercial licensing"
    ],
    "fundingType": "N/A",
    "compensationType": "Equity",
    "upfrontCost": "No Upfront Cost",
    "featured": true,
    "dateAdded": new Date().toISOString(),
    "logoUrl": "/images/geopolymer.jpg",
    "isVerified": true,
    "status": "Verified",
    "postedBy": "Williams Ochieng",
    "contactEmail": "admin@l-earn.co",
    "isEscrow": true,
    "escrowAmount": 27000,
    "fundedAmount": 1200
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const collection = db.collection('opportunities');
    
    for (const project of projects) {
      await collection.updateOne(
        { id: project.id },
        { $set: project },
        { upsert: true }
      );
      console.log(`Upserted ${project.id}`);
    }
  } finally {
    await client.close();
  }
}

seed();
