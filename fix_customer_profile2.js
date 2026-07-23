const fs = require('fs');

let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf8');

// Replace PrescriptionSection in the Modal
code = code.replace("import PrescriptionSection from './PrescriptionSection';", "import PrescriptionSection from './PrescriptionSection';\nimport { PrescriptionViewOnly } from './PrescriptionViewOnly';");

code = code.replace(/<PrescriptionSection[\s\S]*?onNewPrescription=\{.*\}[\s\S]*?\/>/, `<PrescriptionViewOnly prescription={viewingPrescription} />`);

fs.writeFileSync('components/CustomerProfileView.tsx', code);
