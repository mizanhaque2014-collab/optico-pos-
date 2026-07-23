const fs = require('fs');

let code = fs.readFileSync('components/CustomerProfileView.tsx', 'utf8');

// Imports
code = code.replace("import { invoiceService } from '@/lib/services/invoiceService';", "import { invoiceService } from '@/lib/services/invoiceService';\nimport { InvoiceDetailCard } from './InvoiceDetailCard';\nimport { OpticalInvoiceA5 } from './OpticalInvoiceA5';\nimport { PrescriptionViewOnly } from './PrescriptionViewOnly';");

// States
code = code.replace("const [selectedEyeTest, setSelectedEyeTest] = useState<EyeTestRecord | null>(null);", "const [selectedEyeTest, setSelectedEyeTest] = useState<EyeTestRecord | null>(null);\n  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);\n  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);\n  const [viewingPrescription, setViewingPrescription] = useState<any>(null);\n\n  useEffect(() => {\n    if (printingInvoice) {\n      setTimeout(() => {\n        window.print();\n        setPrintingInvoice(null);\n      }, 200);\n    }\n  }, [printingInvoice]);");

const directSaleOld = `{directSaleInvoices.map(inv => (
                  <div key={inv.id} className="bg-[#0F172A] border border-white/5 p-4 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <p className="text-xs font-black text-white tracking-widest">
                          {inv.invoiceNumber} 
                          <span className="text-[10px] font-normal text-white/40 ml-2">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                          {inv.type}
                        </span>
                      </div>

                      <div className="space-y-1 mt-2">
                        {inv.items.map(item => (
                          <div key={item.id} className="flex justify-between text-[11px] text-white/60">
                            <span>{item.quantity}x {item.itemType === 'frame' ? item.brand : item.itemType === 'lens' ? item.lensBrand : item.itemName}</span>
                            <span>₹{item.finalAmount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-2">
                       <div>
                         <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Status</p>
                         <p className="\`text-xs font-black uppercase ${inv.status === 'Delivered' ? 'text-emerald-400' : 'text-yellow-400'}\`">{inv.status}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Total / Balance</p>
                         <p className="text-xs font-black text-white">₹{inv.grandTotal} <span className="text-rose-400 font-mono">/ ₹{inv.balanceAmount}</span></p>
                       </div>
                    </div>
                  </div>
                ))}`;

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


const salesOrdersOld = `{salesOrders.map(inv => (
                  <div key={inv.id} className="bg-[#0F172A] border border-white/5 p-4 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <p className="text-xs font-black text-white tracking-widest">
                          {inv.invoiceNumber} 
                          <span className="text-[10px] font-normal text-white/40 ml-2">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">
                          {inv.type}
                        </span>
                      </div>

                      <div className="space-y-1 mt-2">
                        {inv.items.map(item => (
                          <div key={item.id} className="flex justify-between text-[11px] text-white/60">
                            <span>{item.quantity}x {item.itemType === 'frame' ? item.brand : item.itemType === 'lens' ? item.lensBrand : item.itemName}</span>
                            <span>₹{item.finalAmount}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/5 pt-2 mt-2">
                       <div>
                         <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Status</p>
                         <p className="\`text-xs font-black uppercase ${inv.status === 'Delivered' ? 'text-emerald-400' : 'text-yellow-400'}\`">{inv.status}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Total / Balance</p>
                         <p className="text-xs font-black text-white">₹{inv.grandTotal} <span className="text-rose-400 font-mono">/ ₹{inv.balanceAmount}</span></p>
                       </div>
                    </div>
                  </div>
                ))}`;

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

code = code.replace(directSaleOld.replace(/`/g, '`'), directSaleReplacement);
code = code.replace(salesOrdersOld.replace(/`/g, '`'), salesOrdersReplacement);

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

// also need to replace the grid layout of invoice mapping from md:grid-cols-2 to just grid-cols-1, otherwise they're too small
code = code.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/g, '<div className="grid grid-cols-1 gap-4">');


fs.writeFileSync('components/CustomerProfileView.tsx', code);
