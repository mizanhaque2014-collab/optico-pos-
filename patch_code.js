const fs = require('fs');
let content = fs.readFileSync('Code.gs', 'utf8');

content = content.replace(/function doPost\(e\) \{/, 
`function doPost(e) {
  backendLogs = [];
  logBackend("ENTER doPost");
`);
content = content.replace(/logBackend\("================= START doPost ================="\);/g, '');

content = content.replace(/switch \(action\) \{/, 
`logBackend("ENTER Router switch(action)");
    switch (action) {`);

fs.writeFileSync('Code.gs', content);
