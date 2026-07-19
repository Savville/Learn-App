import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const smartCommerce = {
  "id": "smart-commerce-infrastructure-challenge",
  "title": "The Smart Commerce Infrastructure Challenge",
  "provider": "Polygon / Ignyte SOC",
  "category": "Challenge",
  "description": "Build the payment solutions that bridge traditional finance and blockchain—powered by Polygon, launched from DIFC, and scaled globally.",
  "fullDescription": "The UAE processes over USD 50 billion in annual remittances, has a 30% crypto adoption rate, and stablecoins already account for 51.3% of all crypto activity in the country. The world’s first comprehensive stablecoin regulation is live. The infrastructure is ready. The market is waiting.\n\nWe’re backing builders who can turn the UAE’s regulatory clarity and market demand into real, deployed stablecoin and payment products.\n\nProblems Worth Solving\n1. SME Trade Finance Is Broken\nThe Problem: Over USD 2 trillion in global trade finance goes unfilled. 40% of SME applications are rejected. Letters of credit take 7–10 days of manual processing. Jebel Ali Port processes 15M+ TEUs annually—the opportunity is massive.\nWhat you need to build: Tokenized receivables, smart contract-based letters of credit, and on-chain trade credit scoring solutions on Polygon that dramatically reduce friction and unlock capital for SMEs.\n\n2. Merchant Payments Need a Blockchain-Native Layer\nThe Problem: The UAE targets 90% cashless transactions. The USD 10.8 billion e-commerce market is growing. The CBUAE’s PTSR regulation now requires compliant stablecoin acceptance systems—but merchants lack integration tools.\nWhat you need to build: POS integration for AED stablecoins, tourist-friendly crypto wallets, and loyalty program tokenization built on Polygon’s infrastructure.\n\nWhat You’ll Receive\nPrize Pool: 25,000 USDC (15K / 7.5K / 5K for 1st, 2nd, 3rd place)\nFull DevRel Support for deployment and maintenance on Polygon\nAdditional Rewards Incentives up for grabs\nGas Fee Coverage during development\nPOL Incentives to scale user base post-launch\nEcosystem Introductions to investors, DIFC’s 5,000+ VCs, 289 banking institutions\n\nDemo Day in Dubai (Mid–Late September 2026)",
  "deadline": "2026-07-13T23:59:59.000Z",
  "location": "Dubai, UAE / Remote",
  "eligibility": {
    "educationLevel": "All",
    "requirements": [
      "Team background and technical credentials",
      "Technical architecture and approach on Polygon",
      "MVP / Prototype required"
    ]
  },
  "benefits": [
    "Prize Pool: 25,000 USDC (15K / 7.5K / 5K)",
    "Full DevRel Support for deployment",
    "Ecosystem Introductions to VCs and banks"
  ],
  "fundingType": "Prize",
  "compensationType": "Paid",
  "upfrontCost": "No Upfront Cost",
  "featured": false,
  "views": 3284,
  "dateAdded": "2026-04-08T00:00:00.000Z",
  "logoUrl": "/images/tech.avif",
  "isVerified": true,
  "status": "Verified",
  "postedBy": "Ignyte SOC",
  "contactEmail": "admin@l-earn.co"
};

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const opportunities = db.collection('opportunities');

    await opportunities.updateOne(
      { id: smartCommerce.id },
      { $set: smartCommerce },
      { upsert: true }
    );
    
    // Also correctly format the UrbanPulse Hackathon deadline since it's wrong in DB
    await opportunities.updateOne(
      { id: 'urbanpulse-hackathon' },
      { $set: { deadline: '2026-05-08T23:59:59.000Z' } }
    );

    console.log('Successfully inserted expired opportunity and fixed UrbanPulse');
  } finally {
    await client.close();
  }
}

run();
