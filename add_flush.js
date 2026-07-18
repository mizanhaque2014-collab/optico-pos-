const fs = require('fs');

const files = ['Code.gs', 'Customers.gs', 'Prescriptions.gs', 'Users.gs'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let lines = content.split('\n');
  let newLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    newLines.push(line);
    
    // Only insert if it contains a write operation and not already followed by flush
    if (line.match(/\.appendRow\(/) || line.match(/\.setValues\(/) || line.match(/\.deleteRow\(/)) {
      // Look ahead to see if SpreadsheetApp.flush() is already there
      let nextLineIndex = i + 1;
      let alreadyHasFlush = false;
      while (nextLineIndex < lines.length) {
         let nextLine = lines[nextLineIndex].trim();
         if (nextLine === '') {
             nextLineIndex++;
             continue;
         }
         if (nextLine.includes('SpreadsheetApp.flush()')) {
             alreadyHasFlush = true;
         }
         break;
      }
      if (!alreadyHasFlush) {
        // match the indentation
        const indentMatch = line.match(/^\s*/);
        const indent = indentMatch ? indentMatch[0] : '';
        newLines.push(`${indent}SpreadsheetApp.flush();`);
      }
    }
  }
  fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
}
console.log("Done adding flush!");
