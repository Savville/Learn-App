const fs = require('fs');
const ts = require('typescript');

function removeExpiredItems(filePath, dateCutoff) {
    const code = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true
    );

    let modifications = [];
    
    function visit(node) {
        if (ts.isObjectLiteralExpression(node)) {
            // Check if it's an item in the top level array
            if (node.parent && ts.isArrayLiteralExpression(node.parent) && node.parent.parent && ts.isVariableDeclaration(node.parent.parent) && (node.parent.parent.name.text === 'opportunities' || node.parent.parent.name.text === 'opportunitiesData' || node.parent.parent.name.text.includes('opportunities'))) {
                let deadlineProp = node.properties.find(p => p.name && p.name.text === 'deadline');
                if (deadlineProp && ts.isPropertyAssignment(deadlineProp) && ts.isStringLiteral(deadlineProp.initializer)) {
                    let deadline = deadlineProp.initializer.text;
                    if (deadline < dateCutoff && deadline !== 'Rolling') {
                        modifications.push({ start: node.getStart(), end: node.getEnd() });
                    }
                }
            }
            // but also handle backend seed.js
            else if (node.parent && ts.isArrayLiteralExpression(node.parent)) {
                 let deadlineProp = node.properties.find(p => p.name && (p.name.text === 'deadline' || p.name.escapedText === 'deadline'));
                 if (deadlineProp && ts.isPropertyAssignment(deadlineProp) && ts.isStringLiteral(deadlineProp.initializer)) {
                     let deadline = deadlineProp.initializer.text;
                     if (deadline < dateCutoff && deadline !== 'Rolling') {
                         modifications.push({ start: node.getFullStart(), end: node.getEnd() });
                     }
                 }
            }
        }
        ts.forEachChild(node, visit);
    }
    
    visit(sourceFile);
    
    // Sort descending
    modifications.sort((a, b) => b.start - a.start);
    let newCode = code;
    for (let mod of modifications) {
        // Find if there's a following comma
        let after = newCode.slice(mod.end);
        let removeEnd = mod.end;
        if (after.match(/^\s*,/)) {
            removeEnd += after.match(/^\s*,/)[0].length;
        }
        // Also remove preceding whitespace if needed, but getFullStart does a lot.
        let removeStart = mod.start;
        newCode = newCode.slice(0, removeStart) + newCode.slice(removeEnd);
    }
    return newCode;
}

try {
    let f1 = 'src/data/opportunities.ts';
    console.log('Processing', f1);
    let newF1 = removeExpiredItems(f1, '2026-04-07');
    fs.writeFileSync(f1, newF1);
    
    let f2 = 'backend/seed.js';
    console.log('Processing', f2);
    let newF2 = removeExpiredItems(f2, '2026-04-07');
    fs.writeFileSync(f2, newF2);
    
    console.log('Done');
} catch (e) {
    console.error(e);
}

// Refurbished
