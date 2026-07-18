const fs = require('fs');

let content = fs.readFileSync('Prescriptions.gs', 'utf8');

content = content.replace(/function getPrescriptionsSheet\(\) \{/, 
`function getPrescriptionsSheet() {
  logBackend("ENTER getPrescriptionsSheet");
`);
content = content.replace(/return sheet;\n\}/, 
`  logBackend("EXIT getPrescriptionsSheet");
  return sheet;
}`);

content = content.replace(/function validatePrescriptionBackend\(p\) \{/, 
`function validatePrescriptionBackend(p) {
  logBackend("ENTER validatePrescriptionBackend");
`);
content = content.replace(/logBackend\("validatePrescriptionBackend start.", p\);/, '');

content = content.replace(/function prescriptionToRow\(p, headers\) \{/, 
`function prescriptionToRow(p, headers) {
  logBackend("ENTER prescriptionToRow");
`);
content = content.replace(/return rowData;\n\}/g, 
`  logBackend("EXIT prescriptionToRow");
  return rowData;
}`);

content = content.replace(/function getPrescriptionsByCustomer\(customerId\) \{/, 
`function getPrescriptionsByCustomer(customerId) {
  logBackend("ENTER getPrescriptionsByCustomer");
`);
content = content.replace(/return matches;\n\}/g, 
`  logBackend("EXIT getPrescriptionsByCustomer");
  return matches;
}`);

fs.writeFileSync('Prescriptions.gs', content);
