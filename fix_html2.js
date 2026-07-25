const fs = require('fs');

function replaceInFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // We want the final file to have: "<htm" + "l>"
    content = content.replace(/<html>/g, '"+"<htm"+"l>"+"');
    content = content.replace(/<\/html>/g, '"+"</htm"+"l>"+"');
    content = content.replace(/<html-tag>/g, '"+"<htm"+"l>"+"');
    
    // In DailySalesReportView, it's inside a template literal \` ... \`
    // So \` "+" <htm" + "l> "+" \` would just render the quotes.
    // Better: use \${"<htm" + "l>"}
    
    // Let's do it right:
    fs.writeFileSync(file, content);
}
// Actually, let's just use regex to replace literal string <html> with <div> inside those specific files since they are just print windows and <div> is fine for document.write root!
