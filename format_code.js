const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

// I'll leave the current Code.gs as is because it actually has all the logic, we just have a few duplicated cases which JS switch statements handle by just executing the first one, so it's not a syntax error.
// BUT let me just deduplicate the cases for cleanliness.

let lines = code.split('\n');
let newLines = [];
let inDoPostSwitch = false;
let seenCases = new Set();

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('switch (action) {') && code.substring(0, code.indexOf(line)).includes('function doPost(e) {')) {
     inDoPostSwitch = true;
  }
  
  if (inDoPostSwitch && line.trim().startsWith('case ')) {
    let caseName = line.trim().match(/case\s+'([^']+)'/);
    if (caseName) {
      if (seenCases.has(caseName[1])) {
        // Skip until break
        while (i < lines.length && !lines[i].includes('break;')) {
          i++;
        }
        continue; // skip the break line too
      } else {
        seenCases.add(caseName[1]);
      }
    }
  }
  
  if (inDoPostSwitch && line.includes('default:')) {
    inDoPostSwitch = false;
  }
  
  newLines.push(line);
}

fs.writeFileSync('Code.gs', newLines.join('\n'));
console.log('Cleaned up duplicate cases in doPost');
