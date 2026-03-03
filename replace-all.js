const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function (f) {
        const file = path.join(dir, f);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            results.push(file);
        }
    });
    return results;
}

const currentDir = process.cwd();
const srcDir = path.join(currentDir, 'src');
const publicDir = path.join(currentDir, 'public');

console.log('Searching in:', srcDir);

const files = [...walk(srcDir), ...walk(publicDir)];
files.push(path.join(currentDir, '.env'));
files.push(path.join(currentDir, 'prisma', 'schema.prisma'));

let updatedCount = 0;

for (const f of files) {
    if (!f.endsWith('.tsx') && !f.endsWith('.ts') && !f.endsWith('.css') && !f.endsWith('.js') && !f.endsWith('.env') && !f.endsWith('.prisma')) continue;
    if (!fs.existsSync(f)) continue;

    let content = fs.readFileSync(f, 'utf8');
    let original = content;

    content = content.replace(/PayGuard/g, '402check');
    content = content.replace(/payguard/g, '402check');
    content = content.replace(/PAYGUARD/g, '402CHECK');
    content = content.replace(/payment-guard\.js/g, '402check.js');

    if (content !== original) {
        fs.writeFileSync(f, content);
        console.log('Updated:', f);
        updatedCount++;
    }
}
console.log('Total files updated:', updatedCount);
