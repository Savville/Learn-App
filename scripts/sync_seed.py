import re
import json

def transform_ts_to_js(ts_content):
    # Find the opportunities array content
    match = re.search(r'export const opportunities: Opportunity\[\] = \[(.*)\];', ts_content, re.DOTALL)
    if not match:
        print("Opportunities list not found!")
        return None
    
    array_content = match.group(1).strip()
    
    # We'll parse this later but for now we'll do some basic string manipulation
    # To add "views: 0, clicks: 0" inside every opportunity object
    
    # Each object ends with a "}" followed by optional whitespace and a comma
    # We'll replace it with "  views: 0,\n    clicks: 0\n  },"
    
    transformed = re.sub(r'\},', r'    views: 0,\n    clicks: 0\n  },', array_content)
    # Also handle the last object
    if not transformed.strip().endswith('},'):
         transformed = transformed.strip() + ',\n    views: 0,\n    clicks: 0\n  '
    
    return transformed

with open("c:/Users/User/Downloads/PortableGit/Learn Opportunities/src/data/opportunities.ts", "r", encoding="utf-8") as f:
    ts = f.read()

js_array = transform_ts_to_js(ts)

# Now read the current seed.js
with open("c:/Users/User/Downloads/PortableGit/Learn Opportunities/backend/seed.js", "r", encoding="utf-8") as f:
    seed0 = f.read()

# Replace "const opportunities = [ ... ];" with new list
# Use re.DOTALL to match multiline
new_seed = re.sub(r'const opportunities = \[.*?\];', f'const opportunities = [\n{js_array}\n];', seed0, flags=re.DOTALL)

with open("c:/Users/User/Downloads/PortableGit/Learn Opportunities/backend/seed.js", "w", encoding="utf-8") as f:
    f.write(new_seed)

print("Seed file successfully updated!")
