const fs = require('fs');

try {
    fs.copyFileSync('favicon.png', 'public/favicon.png');
    fs.copyFileSync('favicon.png', 'src/app/icon.png');
    fs.copyFileSync('favicon.png', 'src/app/favicon.ico');
    console.log('Successfully copied favicon.');
} catch (e) {
    console.error('Error copying favicon:', e);
}
