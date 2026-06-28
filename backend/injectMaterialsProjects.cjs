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

  const opportunities = [
    {
      "id": "hydro-guard-concrete",
      "title": "Hydro-Guard: Localized High-Performance Hydrophobic Concrete Admixtures",
      "provider": "MTRD / University Laboratories",
      "category": "ResearchCollaboration",
      "description": "Developing localized hydrophobic concrete admixtures to reduce water infiltration and lower lifecycle maintenance costs by 40%.",
      "fullDescription": "Traditional surface-applied concrete waterproofing is expensive, often imported, and degrades over time, leaving foundations and retaining walls vulnerable to water damage in aggressive soils.\n\nWe have engineered a novel surface-reactive concrete matrix that achieves 99% water repellency at the micro-structural level. Initial compressive strength tests show it performs 15% better than standard KS 572 compliant mixes. We are seeking funds for specialized out-of-house testing (XRD/XRF) and logistics.",
      "deadline": "2026-12-31T23:59:59.000Z",
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
      "logoUrl": "/images/tech.avif",
      "postedBy": "Williams Ochieng",
      "isVerified": true,
      "status": "Verified",
      "isEscrow": true,
      "escrowAmount": 15000,
      "fundedAmount": 0
    },
    {
      "id": "alkali-activated-binders",
      "title": "Alkali-Activated Binders for Sustainable Construction",
      "provider": "MTRD / University Laboratories",
      "category": "ResearchCollaboration",
      "description": "Creating eco-friendly binders using industrial by-products to replace traditional Portland cement.",
      "fullDescription": "Cement production is a massive contributor to global CO2 emissions. This project focuses on alkali-activated binders using local industrial by-products to create a sustainable alternative to ordinary Portland cement. \n\nOur bench-scale prototypes have shown excellent early-strength development. We require funding to cover advanced microstructural analysis (XRD/SEM) at commercial labs that are not available for free at our institution.",
      "deadline": "2026-12-31T23:59:59.000Z",
      "location": "Nairobi, Kenya",
      "eligibility": {
        "educationLevel": "All",
        "requirements": ["Interest in green building materials", "Support for lab testing fees"]
      },
      "benefits": [
        "Detailed material performance reports",
        "Recognition as a founding sponsor in publications"
      ],
      "fundingType": "N/A",
      "compensationType": "Equity",
      "upfrontCost": "No Upfront Cost",
      "featured": true,
      "dateAdded": new Date().toISOString(),
      "logoUrl": "/images/tech.avif",
      "postedBy": "Williams Ochieng",
      "isVerified": true,
      "status": "Verified",
      "isEscrow": true,
      "escrowAmount": 12000,
      "fundedAmount": 0
    },
    {
      "id": "uhpc-agricultural-waste",
      "title": "UHPC utilizing Agricultural Waste (Rice Husks)",
      "provider": "Mwea Rice Mills / University Labs",
      "category": "ResearchCollaboration",
      "description": "Utilizing locally sourced rice husks from Mwea to produce Ultra-High Performance Concrete.",
      "fullDescription": "Agricultural waste like rice husks is often burned or discarded, creating environmental hazards. By carefully incinerating these husks, we extract highly reactive silica which can be used to produce Ultra-High Performance Concrete (UHPC) at a fraction of the cost of imported silica fume.\n\nSince we are sourcing from nearby Mwea, raw material costs are negligible. We are raising funds strictly for the logistics of hauling the waste and renting specialized high-temperature kilns for controlled incineration.",
      "deadline": "2026-12-31T23:59:59.000Z",
      "location": "Mwea / Nairobi, Kenya",
      "eligibility": {
        "educationLevel": "All",
        "requirements": ["Interest in agricultural waste recycling", "Funding for transport and kiln rental"]
      },
      "benefits": [
        "Access to cost-effective UHPC mix designs",
        "Acknowledgment in environmental sustainability reports"
      ],
      "fundingType": "N/A",
      "compensationType": "Equity",
      "upfrontCost": "No Upfront Cost",
      "featured": true,
      "dateAdded": new Date().toISOString(),
      "logoUrl": "/images/tech.avif",
      "postedBy": "Williams Ochieng",
      "isVerified": true,
      "status": "Verified",
      "isEscrow": true,
      "escrowAmount": 8000,
      "fundedAmount": 0
    }
  ];

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
