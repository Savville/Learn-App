const { MongoClient } = require('mongodb');
require('dotenv').config();

MongoClient.connect(process.env.MONGODB_URI).then(async client => {
  const db = client.db('learn_opportunities');
  const coll = db.collection('projects');
  
  // 1. Delete existing mock projects
  await coll.deleteMany({});
  
  // 2. Insert the real student projects
  const newProjects = [
    {
      title: "Hydro-Guard: Localized High-Performance Hydrophobic Concrete Admixtures",
      description: "Traditional surface-applied concrete waterproofing is expensive, often imported, and degrades over time, leaving foundations and retaining walls vulnerable to water damage in aggressive soils.\n\nWe are developing a locally manufactured, self-waterproofing concrete admixture by integrating crystalline and hydrophobic mineral composites directly into the concrete matrix during mixing.\n\nRESOURCE BREAKDOWN\n• KES 4,500 — 30 kg of raw bentonite & silica base (KES 150/kg)\n• KES 7,500 — 5 Liters of specialized silane-siloxane composites (KES 1,500/L)\n• KES 6,000 — Local field transit for sample collection over 4 weeks (KES 1,500/week)\n• KES 4,000 — Consumables: specialized curing molds and fine sieves\nNote: Core mixing, curing, and capillary water absorption testing are provided entirely FREE by our institutional lab partners.\n\nELIGIBILITY\nOpen to undergraduate and postgraduate students. We are seeking an industrial attachment or senior mentorship to help guide the foundational research.\n\nBENEFITS & REWARDS\n• Monthly progress reports\n• Formal acknowledgment in any published research papers\n• Early access to the admixture formulation framework",
      category: "StudentProject",
      tags: ["Hydrophobic", "Concrete", "Sustainability"],
      status: "Seeking Funding",
      authorName: "WILLIAMS OCHIENG",
      userEmail: "admin@l-earn.co", // Contact email from opp
      createdAt: new Date("2026-07-14T08:00:00.000Z"),
      bannerImage: "", // Remove image as requested
      resourceLinks: []
    },
    {
      title: "Geo-Bind: Naturally Activating Geopolymer Matrix (Eco-Friendly Masonry Blocks)",
      description: "Standard geopolymer concrete relies on highly corrosive and expensive imported chemical activators (like Sodium Hydroxide), making sustainable, \"no-cement\" masonry blocks financially unviable in East Africa.\n\nWe are creating a naturally activating geopolymer matrix using locally sourced Rift Valley volcanic tuffs (Menengai/Longonot) and agricultural by-products to establish a 100% locally sourced masonry block.\n\n────────────────────────────────────\n RESOURCE BREAKDOWN\n────────────────────────────────────\n\n• KES 12,500 — 1-ton pickup hire to Rift Valley (KES 8,000/day + Fuel: 150km @ KES 30/km)\n• KES 2,000 — 2 local laborers for tuff excavation (KES 1,000/day each)\n• KES 9,000 — External XRD/XRF phase testing at advanced physics labs (2 samples @ KES 4,500/sample)\n• KES 3,500 — Heavy-duty respirators and safety gear for ash handling\n\nNote: Standard rock crushing and structural compression testing are subsidized for free.\n\n────────────────────────────────────\n ELIGIBILITY\n────────────────────────────────────\n\nOpen to undergraduate and postgraduate students. Looking for academic supervision regarding geopolymer activation methodologies.\n\n────────────────────────────────────",
      category: "StudentProject",
      tags: ["Geopolymer", "Eco-Friendly", "Masonry"],
      status: "Seeking Funding",
      authorName: "WILLIAMS OCHIENG",
      userEmail: "admin@l-earn.co",
      createdAt: new Date("2026-07-14T08:00:00.000Z"),
      bannerImage: "", // Remove image as requested
      resourceLinks: []
    }
  ];
  
  await coll.insertMany(newProjects);
  console.log('Replaced fake projects with real student projects!');
  client.close();
});
