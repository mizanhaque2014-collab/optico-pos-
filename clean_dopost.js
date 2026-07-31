const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const doPostStart = code.indexOf('function doPost(e) {');
const doPostEnd = code.indexOf('function doGet(e) {');

if (doPostStart !== -1 && doPostEnd !== -1) {
  // we will replace this block
}
