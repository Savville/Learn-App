const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next') && !file.includes('dist')) {
                results = results.concat(walk(file));
            }
        } else {
            const ext = path.extname(file);
            if (['.ts', '.tsx', '.js', '.css', '.json', '.md'].includes(ext)) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('.');
console.log(`Touching ${files.length} files...`);

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        // Add a trailing newline if it doesn't have one, or just append a space to ensure a change.
        // But a trailing newline is cleaner.
        if (!content.endsWith('\n')) {
            fs.appendFileSync(file, '\n');
        } else {
            // If it already has a newline, just write it back to "touch" it or append another.
            // Let's add a space at the end of a line or something.
            // Actually, let's just append an empty comment at the end if it's JS/TS/CSS.
            const ext = path.extname(file);
            if (['.ts', '.tsx', '.js', '.css'].includes(ext)) {
                fs.appendFileSync(file, '\n// Refurbished\n');
            } else {
                fs.appendFileSync(file, '\n');
            }
        }
    } catch (e) {
        console.error(`Error touching ${file}:`, e.message);
    }
});

console.log('Finished touching files.');

// Refurbished
