const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', 'PostWithUs.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Fix handleParse to use AbortController and timeout
content = content.replace(
  /const response = await fetch\(\`\$\{API_BASE\}\/public\/parse-opportunity\`, \{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*\},\s*body: JSON\.stringify\(\{ rawText \}\),\s*\}\);/,
  `const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout
      const response = await fetch(\`\${API_BASE}/public/parse-opportunity\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawText }),
        signal: controller.signal,
      });`
);

// 2. Add the Manual Entry button
const oldButtons = `<div className="md:col-span-1 space-y-3 rounded-md bg-slate-50 p-3 flex flex-col justify-end">
                    <Button
                      onClick={handleParse}
                      disabled={isParsing || !rawText}
                      size="lg"
                      className="w-full"
                      style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                    >
                      {isParsing ? 'Extracting…' : 'Extract data points'}
                    </Button>
                </div>`;

const newButtons = `<div className="md:col-span-1 space-y-3 rounded-md bg-slate-50 p-3 flex flex-col justify-end">
                    <Button
                      onClick={handleParse}
                      disabled={isParsing || !rawText}
                      size="lg"
                      className="w-full"
                      style={{ backgroundColor: '#0933ed', color: '#ffffff' }}
                    >
                      {isParsing ? 'Extracting...' : 'AI Extract Data'}
                    </Button>
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-slate-300"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">OR</span>
                      <div className="flex-grow border-t border-slate-300"></div>
                    </div>
                    <Button
                      onClick={handleManualEntry}
                      disabled={isParsing}
                      variant="outline"
                      size="lg"
                      className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      Enter Manually
                    </Button>
                </div>`;

// Replace using regex to ignore exact whitespace differences
content = content.replace(/<div className="md:col-span-1 space-y-3 rounded-md bg-slate-50 p-3 flex flex-col justify-end">[\s\S]*?<\/div>/, newButtons);

// 3. Make sure we catch AbortError and show friendly message
content = content.replace(
  /setError\(`Parsing failed: \$\{error\.message\}`\);/,
  `if (error.name === 'AbortError') {
        setError('Extraction timed out. The server might be busy. Please try "Enter Manually".');
      } else {
        setError(\`Parsing failed: \${error.message}\`);
      }`
);

fs.writeFileSync(file, content, 'utf8');
console.log('PostWithUs.tsx updated successfully via script.');
