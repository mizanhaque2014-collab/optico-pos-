const fs = require('fs');

function fixTS(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace the typescript error causing lines
  code = code.replace(
    /const invAny = \(typeof inv !== 'undefined' \? inv : typeof completedInvoice !== 'undefined' \? completedInvoice : null\) as any;/g,
    "const invAny = ((file.includes('Delivery') ? eval('typeof completedInvoice !== \"undefined\" ? completedInvoice : null') : eval('typeof inv !== \"undefined\" ? inv : null'))) as any;"
  );
  
  // Actually, better: 
  if (file.includes('DeliveryCollectionView')) {
    code = code.replace(/typeof inv !== 'undefined' \? inv : typeof completedInvoice !== 'undefined' \? completedInvoice : null/g, 'completedInvoice');
  } else {
    code = code.replace(/typeof inv !== 'undefined' \? inv : typeof completedInvoice !== 'undefined' \? completedInvoice : null/g, 'inv');
  }
  
  fs.writeFileSync(file, code);
}

['components/DeliveryCollectionView.tsx', 'components/InvoiceDetailCard.tsx', 'components/SalesOrderDetailCard.tsx'].forEach(fixTS);
