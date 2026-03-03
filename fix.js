const fs = require('fs');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (f) {
        const file = dir + '/' + f;
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

try {
    const files = [...walk('./src'), ...walk('./public')];
    files.push('./.env');
    files.push('./prisma/schema.prisma');
    let updatedCount = 0;

    for (const f of files) {
        if (!f.endsWith('.tsx') && !f.endsWith('.ts') && !f.endsWith('.css') && !f.endsWith('.js') && !f.endsWith('.env') && !f.endsWith('.prisma')) continue;
        if (!fs.existsSync(f)) continue;

        let content = fs.readFileSync(f, 'utf8');
        let original = content;

        content = content.replace(/PayGuard/g, 'check402');
        content = content.replace(/payguard/g, 'check402');
        content = content.replace(/PAYGUARD/g, 'check402');
        content = content.replace(/payment-guard\.js/g, 'check402.js');

        if (content !== original) {
            fs.writeFileSync(f, content);
            console.log('Updated: ' + f);
            updatedCount++;
        }
    }
    console.log('Total files updated: ' + updatedCount);
} catch (err) {
    console.error(err);
}
