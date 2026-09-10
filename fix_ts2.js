const fs = require('fs');

function fixTS(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (file.includes('Delivery')) {
    code = code.replace(/const invAny = \(\(file\.includes[^\n]+;/g, 'const invAny = completedInvoice as any;');
    code = code.replace(/\[\(\(file\.includes[^\]]+\]/g, '[completedInvoice, session?.companyID, session?.branchID]');
  } else {
    code = code.replace(/const invAny = \(\(file\.includes[^\n]+;/g, 'const invAny = inv as any;');
    code = code.replace(/\[\(\(file\.includes[^\]]+\]/g, '[inv, session?.companyID, session?.branchID]');
  }
  
  fs.writeFileSync(file, code);
}

['components/DeliveryCollectionView.tsx', 'components/InvoiceDetailCard.tsx', 'components/SalesOrderDetailCard.tsx'].forEach(fixTS);
