const fs = require('fs');
let code = fs.readFileSync('public/backend-bundle.gs', 'utf8');

if (!code.includes('var GLOBAL_PAYLOAD')) {
  code = code.replace(
    /function doPost\(e\) \{/,
    `var GLOBAL_PAYLOAD = null;\nfunction doPost(e) {`
  );
  code = code.replace(
    /payload = JSON.parse\(e.postData.contents\);/,
    `payload = JSON.parse(e.postData.contents);\n      GLOBAL_PAYLOAD = payload;`
  );
  code = code.replace(
    /payload = e.parameter;/,
    `payload = e.parameter;\n      GLOBAL_PAYLOAD = payload;`
  );
  
  code = code.replace(
    /typeof payload !== 'undefined' && payload\.__auth/,
    `typeof GLOBAL_PAYLOAD !== 'undefined' && GLOBAL_PAYLOAD !== null && GLOBAL_PAYLOAD.__auth`
  );
  code = code.replace(
    /filterByAuth\(records, payload\.__auth\)/,
    `filterByAuth(records, GLOBAL_PAYLOAD.__auth)`
  );

  fs.writeFileSync('public/backend-bundle.gs', code);
  fs.writeFileSync('Code.gs', code);
  fs.writeFileSync('Code.js', code);
}
