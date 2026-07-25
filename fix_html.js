const fs = require('fs');

function replaceInFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // <html>
    if (content.includes('<html>')) {
        content = content.replace(/<html>/g, '<' + 'html>');
        modified = true;
    }
    // </html>
    if (content.includes('</html>')) {
        content = content.replace(/<\/html>/g, '<' + '/html>');
        modified = true;
    }
    // <html-tag>
    if (content.includes('<html-tag>')) {
        content = content.replace(/<html-tag>/g, '<' + 'html>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log('Fixed ' + file);
    }
}

['components/WhatsAppMarketingView.tsx', 'components/DailySalesReportView.tsx', 'components/DeliveryCollectionView.tsx'].forEach(replaceInFile);
