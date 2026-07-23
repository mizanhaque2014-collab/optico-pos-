const fs = require('fs');

let code = fs.readFileSync('components/DeliveryCollectionView.tsx', 'utf8');

code = code.replace("import { OpticalInvoiceA5 } from './OpticalInvoiceA5';", "import { OpticalInvoiceA5 } from './OpticalInvoiceA5';\nimport { SalesOrderDetailCard } from './SalesOrderDetailCard';\nimport { PrescriptionViewOnly } from './PrescriptionViewOnly';");

const search = `<OpticalInvoiceA5 invoice={selectedInvoice} isPrintPreviewOnly={true} />`;
const replace = `<SalesOrderDetailCard 
                  inv={selectedInvoice} 
                  customer={resolvedCustomer || undefined} 
                  prescription={resolvedPrescription || null} 
                  onViewPrescription={() => {}} 
                  onPrintA5={() => {
                     const printWindow = window.open('', '_blank');
                     if (printWindow) {
                        printWindow.document.write('<html><body><script>window.print();</script></body></html>');
                     }
                  }} 
                />`;

code = code.replace(search, replace);

// Remove the bg-slate-300 wrapper
code = code.replace(`<div className="bg-slate-300 p-4 rounded-2xl flex justify-center border border-slate-400/20 shadow-inner">
                <SalesOrderDetailCard`, `<div className="">
                <SalesOrderDetailCard`);

fs.writeFileSync('components/DeliveryCollectionView.tsx', code);
