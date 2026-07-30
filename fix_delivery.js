const fs = require('fs');
let code = fs.readFileSync('components/DeliveryCollectionView.tsx', 'utf-8');

code = code.replace("prescription={resolvedPrescription || null}", "prescription={resolvedPrescription || undefined}");

fs.writeFileSync('components/DeliveryCollectionView.tsx', code);
