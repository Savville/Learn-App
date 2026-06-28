import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const PROJECTS = [
  {
    id: 'hydro-guard-concrete',
    title: 'Hydro-Guard: Localized High-Performance Hydrophobic Concrete Admixtures',
    provider: 'MTRD / University Laboratories',
    category: 'StudentProject',
    description: 'Developing a locally manufactured, self-waterproofing concrete admixture integrating crystalline and hydrophobic mineral composites directly into the concrete matrix. Funding goal: KES 22,000.',
    fullDescription: `Traditional surface-applied concrete waterproofing is expensive, often imported, and degrades over time, leaving foundations and retaining walls vulnerable to water damage in aggressive soils.

We are developing a locally manufactured, self-waterproofing concrete admixture by integrating crystalline and hydrophobic mineral composites directly into the concrete matrix during mixing.

────────────────────────────────────
 RESOURCE BREAKDOWN
────────────────────────────────────

• KES 4,500 — 30 kg of raw bentonite & silica base (KES 150/kg)
• KES 7,500 — 5 Liters of specialized silane-siloxane composites (KES 1,500/L)
• KES 6,000 — Local field transit for sample collection over 4 weeks (KES 1,500/week)
• KES 4,000 — Consumables: specialized curing molds and fine sieves

Note: Core mixing, curing, and capillary water absorption testing are provided entirely FREE by our institutional lab partners.

────────────────────────────────────
 ELIGIBILITY
────────────────────────────────────

Open to undergraduate and postgraduate students. We are seeking an industrial attachment or senior mentorship to help guide the foundational research.

────────────────────────────────────
 BENEFITS & REWARDS
────────────────────────────────────

• Monthly progress reports
• Formal acknowledgment in any published research papers
• Early access to the admixture formulation framework`,
    deadline: '2026-12-31T23:59:59.000Z',
    location: 'Nairobi, Kenya',
    eligibility: {
      educationLevel: 'Both',
      requirements: [
        'Undergraduate or postgraduate students welcome',
        'Interest in sustainable construction materials',
        'Willing to support testing logistics (KES 22,000 funding goal)',
      ],
    },
    benefits: [
      'Monthly progress reports from the research team',
      'Formal acknowledgment in published research papers',
      'Early access to the admixture formulation framework',
    ],
    fundingType: 'N/A',
    compensationType: 'Equity',
    upfrontCost: 'No Upfront Cost',
    featured: true,
    dateAdded: '2026-06-28T14:55:00.000Z',
    logoUrl: '/images/hydrophobic_concrete_demo.png',
    postedBy: 'Williams Ochieng',
    isVerified: true,
    status: 'Verified',
    projectProposalUrl: 'https://drive.google.com/file/d/1ge6HauLBnxHg70VxlALsU5Ji0Qvi3zHK/view?usp=drive_link',
    isEscrow: true,
    escrowAmount: 22000,
    fundedAmount: 2400,
  },
  {
    id: 'alkali-activated-binders',
    title: 'Geo-Bind: Naturally Activating Geopolymer Matrix (Eco-Friendly Masonry Blocks)',
    provider: 'MTRD / University Laboratories',
    category: 'StudentProject',
    description: 'Creating a 100% locally sourced, naturally activating geopolymer masonry block using Rift Valley volcanic tuffs — eliminating expensive imported chemical activators. Funding goal: KES 27,000.',
    fullDescription: `Standard geopolymer concrete relies on highly corrosive and expensive imported chemical activators (like Sodium Hydroxide), making sustainable, "no-cement" masonry blocks financially unviable in East Africa.

We are creating a naturally activating geopolymer matrix using locally sourced Rift Valley volcanic tuffs (Menengai/Longonot) and agricultural by-products to establish a 100% locally sourced masonry block.

────────────────────────────────────
 RESOURCE BREAKDOWN
────────────────────────────────────

• KES 12,500 — 1-ton pickup hire to Rift Valley (KES 8,000/day + Fuel: 150km @ KES 30/km)
• KES 2,000 — 2 local laborers for tuff excavation (KES 1,000/day each)
• KES 9,000 — External XRD/XRF phase testing at advanced physics labs (2 samples @ KES 4,500/sample)
• KES 3,500 — Heavy-duty respirators and safety gear for ash handling

Note: Standard rock crushing and structural compression testing are subsidized for free.

────────────────────────────────────
 ELIGIBILITY
────────────────────────────────────

Open to undergraduate and postgraduate students. Looking for academic supervision regarding geopolymer activation methodologies.

────────────────────────────────────
 BENEFITS & REWARDS
────────────────────────────────────

• Bi-weekly video updates from the field
• Official acknowledgment in publications
• A prototype "zero-cement" masonry block engraved with your name`,
    deadline: '2026-12-31T23:59:59.000Z',
    location: 'Rift Valley / Nairobi, Kenya',
    eligibility: {
      educationLevel: 'Both',
      requirements: [
        'Undergraduate or postgraduate students welcome',
        'Interest in green building materials and geopolymer chemistry',
        'Supporting lab testing and field logistics (KES 27,000 funding goal)',
      ],
    },
    benefits: [
      'Bi-weekly video field updates from the research team',
      'Official acknowledgment in all publications',
      'A prototype "zero-cement" masonry block engraved with your name',
    ],
    fundingType: 'N/A',
    compensationType: 'Equity',
    upfrontCost: 'No Upfront Cost',
    featured: true,
    dateAdded: '2026-06-28T14:55:01.000Z',
    logoUrl: '/images/alkali_sustainable_binder.png',
    postedBy: 'Williams Ochieng',
    isVerified: true,
    status: 'Verified',
    projectProposalUrl: 'https://drive.google.com/file/d/1ZG-ETzE2WjxPNDPGqOdoaabuhWaMaHWz/view?usp=drive_link',
    isEscrow: true,
    escrowAmount: 27000,
    fundedAmount: 1200,
  },
  {
    id: 'uhpc-agricultural-waste',
    title: 'Agro-UHPC: Ultra-High-Performance Concrete via Rice Husk Ash',
    provider: 'Mwea Rice Mills / University Labs',
    category: 'StudentProject',
    description: 'Replacing expensive imported silica fume with locally engineered pozzolan extracted from Mwea Rice Husk Ash via controlled calcination to produce affordable UHPC. Funding goal: KES 24,000.',
    fullDescription: `Ultra-High-Performance Concrete (UHPC) relies on highly expensive imported silica fume to achieve extreme compressive strengths, making it cost-prohibitive for local construction.

We are replacing imported silica fume with a locally engineered, highly reactive pozzolan extracted from Mwea Rice Husk Ash (RHA) via controlled calcination.

────────────────────────────────────
 RESOURCE BREAKDOWN
────────────────────────────────────

• KES 9,000 — Commercial kiln rental for controlled calcination of ash at 700°C (6 hours @ KES 1,500/hour)
• KES 9,000 — External microstructural analysis (SEM/XRD) of the resulting ash (2 samples @ KES 4,500/sample)
• KES 6,000 — 5 Liters of PCE superplasticizers required for the UHPC mix design (KES 1,200/L)

Note: Raw rice husks are already sourced locally for FREE. Concrete mixing and boundary compressive strength testing are provided free at the MTRD.

────────────────────────────────────
 ELIGIBILITY
────────────────────────────────────

Open to undergraduate and postgraduate students. Seeking institutional partnership or laboratory access specifically equipped for microstructural and chemical phase analysis.

────────────────────────────────────
 BENEFITS & REWARDS
────────────────────────────────────

• Detailed technical reports on microstructural phase analysis
• Early access to the locally engineered pozzolan mix design
• Prominent listing as a research sponsor`,
    deadline: '2026-12-31T23:59:59.000Z',
    location: 'Mwea / Nairobi, Kenya',
    eligibility: {
      educationLevel: 'Both',
      requirements: [
        'Undergraduate or postgraduate students welcome',
        'Interest in agricultural waste recycling and advanced concrete technology',
        'Supporting kiln, analysis, and materials costs (KES 24,000 funding goal)',
      ],
    },
    benefits: [
      'Detailed technical reports on microstructural phase analysis',
      'Early access to the locally engineered pozzolan mix design',
      'Prominent listing as a research sponsor in publications',
    ],
    fundingType: 'N/A',
    compensationType: 'Equity',
    upfrontCost: 'No Upfront Cost',
    featured: true,
    dateAdded: '2026-06-28T14:55:02.000Z',
    logoUrl: '/images/uhpc_rice_husks.png',
    postedBy: 'Williams Ochieng',
    isVerified: true,
    status: 'Verified',
    projectProposalUrl: 'https://drive.google.com/file/d/1ib9dWeSakb28Xx2RUfAmpQ-FfW28SzKF/view?usp=drive_link',
    isEscrow: true,
    escrowAmount: 24000,
    fundedAmount: 0,
  },
];

// Contributor records for the transactions collection
const CONTRIBUTOR_TRANSACTIONS = [
  {
    opportunityId: 'hydro-guard-concrete',
    contributorName: 'Anonymous',
    contributorPhone: '254700000000',
    amount: 2400,
    checkoutRequestId: 'ws_restored_hydro_001',
    status: 'completed',
    type: 'crowdfund',
    createdAt: new Date('2026-06-20T10:00:00.000Z'),
  },
  {
    opportunityId: 'alkali-activated-binders',
    contributorName: 'Anonymous',
    contributorPhone: '254700000000',
    amount: 1200,
    checkoutRequestId: 'ws_restored_alkali_001',
    status: 'completed',
    type: 'crowdfund',
    createdAt: new Date('2026-06-21T14:00:00.000Z'),
  },
];

async function fixProjects() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('learn_opportunities');
    const opps = db.collection('opportunities');
    const txns = db.collection('transactions');

    console.log('🔧 Fixing 3 student projects...\n');

    for (const project of PROJECTS) {
      // Delete and reinsert so we guarantee all fields are fresh
      await opps.deleteOne({ id: project.id });
      await opps.insertOne(project);
      console.log(`✅ Replaced: ${project.id}`);
      console.log(`   Category: ${project.category}`);
      console.log(`   Title: ${project.title}`);
      console.log(`   fundedAmount: KES ${project.fundedAmount}`);
      console.log('');
    }

    console.log('💰 Restoring contributor transaction records...\n');

    for (const tx of CONTRIBUTOR_TRANSACTIONS) {
      // Remove any old restored records for these projects
      await txns.deleteOne({ checkoutRequestId: tx.checkoutRequestId });
      await txns.insertOne(tx);
      console.log(`✅ Contributor: ${tx.contributorName} → KES ${tx.amount} on ${tx.opportunityId}`);
    }

    console.log('\n🎉 All done! Projects fixed, contributors restored.');
    console.log('   The live site will now show StudentProject category,');
    console.log('   full resource breakdowns, and contributor list.');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
    process.exit(0);
  }
}

fixProjects();
