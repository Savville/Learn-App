import re

def transform_ts_to_js(ts_content):
    # Find the opportunities array content
    # Look for [ { ... } ]
    match = re.search(r'export const opportunities: Opportunity\[\] = (\[.*\]);', ts_content, re.DOTALL)
    if not match:
        print("Opportunities list not found!")
        return None
    
    array_content = match.group(1).strip()
    
    # We want to add views: 0 and clicks: 0 to each object.
    # A safe way is to find each "}" that closes an opportunity object.
    # In this file, all opportunity objects are at the top level of the array.
    
    # Let's find each object using regex.
    # An object in this file starts with "  {" and ends with "  }".
    
    # We'll replace the closing "  }" with "    views: 0,\n    clicks: 0\n  }"
    # But we also need to ensure the property before it has a comma.
    
    # Let's do a multi-step replacement.
    # 1. Add views/clicks before the closing brace.
    # 2. Add a comma before the views property if it's missing.
    
    # Finding objects:
    items = re.split(r'\n  \},', array_content)
    # The last item won't have the "},"
    
    new_items = []
    for i, item in enumerate(items):
        item = item.strip()
        if not item: continue
        
        # item is something like "{ \n id: '...', \n ... \n logoUrl: '...' \n "
        # We need to add views/clicks.
        
        # Ensure it ends with a comma if it doesn't.
        item = item.rstrip()
        if not item.endswith(','):
             item += ','
        
        item += "\n    views: 0,\n    clicks: 0\n  "
        new_items.append(item)
    
    return "[\n  " + "},\n  ".join(new_items) + "}\n]"

with open("c:/Users/User/Downloads/PortableGit/Learn Opportunities/src/data/opportunities.ts", "r", encoding="utf-8") as f:
    ts = f.read()

js_array = transform_ts_to_js(ts)

# Now read the current seed.js
with open("c:/Users/User/Downloads/PortableGit/Learn Opportunities/backend/seed.js", "r", encoding="utf-8") as f:
    seed0 = f.read()

# Replace the opportunities array
# Finds const opportunities = [ ... ];
# Using a non-greedy match for the array content
start_marker = "const opportunities = "
end_marker = "];"

start_idx = seed0.find(start_marker)
# Find the first "];" after the start marker that is at the end of a line or followed by newline
# Actually the file ends with a lot of stuff after the array.
# The array ends before "const seedDatabase = async () => {"

end_marker_full = "];\n\nconst seedDatabase"
end_idx = seed0.find(end_marker_full)

if start_idx != -1 and end_idx != -1:
    new_seed = seed0[:start_idx] + start_marker + js_array + seed0[end_idx:]
    with open("c:/Users/User/Downloads/PortableGit/Learn Opportunities/backend/seed.js", "w", encoding="utf-8") as f:
        f.write(new_seed)
    print("Seed file updated!")
else:
    print(f"Markers not found! start: {start_idx}, end: {end_idx}")
