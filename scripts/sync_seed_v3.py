import re
import os

def transform_ts_to_js(ts_content):
    # Match the entire array content between [ and ];
    # Since the file might have comments or types, let's be specific.
    match = re.search(r'export const opportunities: Opportunity\[\] = (\[.*\]);', ts_content, re.DOTALL)
    if not match:
        print("Opportunities list not found in TS!")
        return None
    
    array_content = match.group(1).strip()
    
    # We want to insert views/clicks into each object.
    # An opportunity object in this array typically looks like:
    # {
    #   id: '...',
    #   ...
    #   logoUrl: '...'
    # },
    
    # Split by the object separator "  },"
    # But some might not have a comma if they are the last one.
    
    # Let's find each "}," sequence.
    # We'll replace it with ",\n    views: 0,\n    clicks: 0\n  },"
    # but we must be careful not to double-comma.
    
    # 1. Standardise props: ensure there's a newline before each property
    # 2. Find the end of each object and inject.
    
    # Actually, a simpler way: find each "  }," and replace with:
    # "    views: 0,\n    clicks: 0\n  },"
    # We need to ensure the property ABOVE it has a comma.
    
    # Step 1: Add commas to all "last" properties before the closing brace
    # e.g., "logoUrl: 'url'\n  }" -> "logoUrl: 'url',\n  }"
    # This regex looks for a property line not ending in a comma before a "  }"
    transformed = re.sub(r'([\'"\]])\n  \}', r'\1,\n    views: 0,\n    clicks: 0\n  }', array_content)
    
    # Step 2: For items with trailing commas for the next item
    transformed = re.sub(r'([\'"\]])\n  \},', r'\1,\n    views: 0,\n    clicks: 0\n  },', transformed)
    
    return transformed

ts_path = "c:/Users/User/Downloads/PortableGit/Learn Opportunities/src/data/opportunities.ts"
seed_path = "c:/Users/User/Downloads/PortableGit/Learn Opportunities/backend/seed.js"

with open(ts_path, "r", encoding="utf-8") as f:
    ts = f.read()

js_array = transform_ts_to_js(ts)

template = f"""import {{ MongoClient }} from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const opportunities = {js_array};

async function seedDatabase() {{
  const client = new MongoClient(process.env.MONGODB_URI);

  try {{
    await client.connect();
    const db = client.db('learn_opportunities');
    const collection = db.collection('opportunities');

    console.log('🧹 Clearing existing opportunities...');
    await collection.deleteMany({{}});

    console.log(`📥 Inserting ${{opportunities.length}} opportunities into MongoDB...`);
    const result = await collection.insertMany(opportunities);

    console.log(`✅ Successfully inserted ${{result.insertedCount}} opportunities!`);
    console.log('\\n📊 Database Summary:');
    console.log(`   - Total opportunities: ${{result.insertedCount}}`);

  }} catch (error) {{
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }} finally {{
    await client.close();
    console.log('\\n🏁 Database seeding complete!');
    process.exit(0);
  }}
}}

seedDatabase();
"""

with open(seed_path, "w", encoding="utf-8") as f:
    f.write(template)

print("Seed file regenerated from scratch successfully!")
