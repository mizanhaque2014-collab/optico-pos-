const fs = require('fs');
let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf8');

// Replace imports
code = code.replace("import { invoiceService } from '@/lib/services/invoiceService';", "import { invoiceService } from '@/lib/services/invoiceService';\nimport { InvoiceDetailCard } from './InvoiceDetailCard';\nimport { OpticalInvoiceA5 } from './OpticalInvoiceA5';\nimport { PrescriptionViewOnly } from './PrescriptionViewOnly';");

// States
code = code.replace("const [selectedEyeTest, setSelectedEyeTest] = useState<EyeTestRecord | null>(null);", "const [selectedEyeTest, setSelectedEyeTest] = useState<EyeTestRecord | null>(null);\n  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);\n  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);\n  const [viewingPrescription, setViewingPrescription] = useState<any>(null);\n\n  useEffect(() => {\n    if (printingInvoice) {\n      setTimeout(() => {\n        window.print();\n        setPrintingInvoice(null);\n      }, 200);\n    }\n  }, [printingInvoice]);");

// EXACT string replacement using substring
const searchDirectSale = "{directSaleInvoices.map(inv => (";
const endDirectSale = `</div>\n                ))}`;

const idx1 = code.indexOf(searchDirectSale);
let idx2 = code.indexOf(endDirectSale, idx1);
if (idx1 !== -1 && idx2 !== -1) {
  const directSaleReplacement = `{directSaleInvoices.map(inv => (
                  <InvoiceDetailCard
                    key={inv.id}
                    inv={inv}
                    customer={customer}
                    prescription={prescriptions.find(p => p.id === inv.prescriptionId)}
                    onViewPrescription={setViewingPrescription}
                    onViewInvoice={setViewingInvoice}
                    onPrintA5={setPrintingInvoice}
                  />
                ))}`;
  code = code.substring(0, idx1) + directSaleReplacement + code.substring(idx2 + endDirectSale.length);
}

const searchSalesOrders = "{salesOrders.map(inv => (";
const endSalesOrders = `</div>\n                ))}`;

const idx3 = code.indexOf(searchSalesOrders);
let idx4 = code.indexOf(endSalesOrders, idx3);
if (idx3 !== -1 && idx4 !== -1) {
  const salesOrdersReplacement = `{salesOrders.map(inv => (
                  <InvoiceDetailCard
                    key={inv.id}
                    inv={inv}
                    customer={customer}
                    prescription={prescriptions.find(p => p.id === inv.prescriptionId)}
                    onViewPrescription={setViewingPrescription}
                    onViewInvoice={setViewingInvoice}
                    onPrintA5={setPrintingInvoice}
                  />
                ))}`;
  code = code.substring(0, idx3) + salesOrdersReplacement + code.substring(idx4 + endSalesOrders.length);
}

const extraModals = `      {/* INVOICE VIEW MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1E293B]">
              <h2 className="font-extrabold text-[#94A3B8] tracking-widest text-[10px] uppercase">Invoice Preview</h2>
              <button onClick={() => setViewingInvoice(null)} className="text-white/40 hover:text-white font-bold text-sm">✖</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-sm flex-1 bg-slate-300 flex justify-center items-start">
              <div className="shadow-lg rounded-md overflow-hidden bg-white">
                <OpticalInvoiceA5 
                  customer={customer} 
                  prescription={prescriptions.find(p => p.id === viewingInvoice.prescriptionId) || null} 
                  invoice={viewingInvoice}
                  isPrintPreviewOnly={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT INVOICE RENDERER (Hidden from UI, visible to printer) */}
      {printingInvoice && (
        <div className="fixed inset-0 z-[200] bg-white hidden print:block">
           <OpticalInvoiceA5 
              customer={customer} 
              prescription={prescriptions.find(p => p.id === printingInvoice.prescriptionId) || null} 
              invoice={printingInvoice}
              isPrintPreviewOnly={true}
           />
        </div>
      )}

      {/* VIEW PRESCRIPTION MODAL */}
      {viewingPrescription && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1E293B]">
              <h2 className="font-extrabold text-[#94A3B8] tracking-widest text-[10px] uppercase">Prescription Details</h2>
              <button onClick={() => setViewingPrescription(null)} className="text-white/40 hover:text-white font-bold text-sm">✖</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <PrescriptionViewOnly prescription={viewingPrescription} />
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/\{showBillingModal && selectedEyeTest && \(/, extraModals + '\n      {showBillingModal && selectedEyeTest && (');

code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/g, '<div className="grid grid-cols-1 gap-4">');

fs.writeFileSync('components/CustomerProfileView.tsx', code);
