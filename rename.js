const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.js') && !filePath.endsWith('.css') && !filePath.endsWith('.prisma') && !filePath.endsWith('.env')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/PayGuard/g, 'check402');
    content = content.replace(/payguard/g, 'check402');
    content = content.replace(/PAYGUARD/g, 'check402');
    content = content.replace(/payment-guard/g, 'check402');

    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function walkArgs(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    let list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walkArgs(file));
            }
        } else {
            results.push(file);
        }
    });
    return results;
}

let files = walkArgs('./src').concat(walkArgs('./public'));
files.forEach(replaceInFile);
if (fs.existsSync('./.env')) replaceInFile('./.env');
if (fs.existsSync('./prisma/schema.prisma')) replaceInFile('./prisma/schema.prisma');
