const fs = require('fs');
try {
    let content = fs.readFileSync('src/app/docs/page.tsx', 'utf8');
    content = content.replace(/PayGuard/g, '402check');
    content = content.replace(/payguard/g, '402check');
    content = content.replace(/PAYGUARD/g, '402CHECK');
    content = content.replace(/payment-guard\.js/g, '402check.js');
    fs.writeFileSync('src/app/docs/page.tsx', content);

    let content2 = fs.readFileSync('src/app/dashboard/docs/page.tsx', 'utf8');
    content2 = content2.replace(/PayGuard/g, '402check');
    content2 = content2.replace(/payguard/g, '402check');
    content2 = content2.replace(/PAYGUARD/g, '402CHECK');
    content2 = content2.replace(/payment-guard\.js/g, '402check.js');
    fs.writeFileSync('src/app/dashboard/docs/page.tsx', content2);

    console.log("Done replacing docs");
} catch (e) {
    console.error("Error:", e);
}
