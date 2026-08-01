import { Invoice, Prescription, Customer } from '@/lib/types';
import { formatInvoiceNumber } from '@/lib/utils';
import { generateWhatsAppInvoiceText } from '@/lib/whatsappUtils';
import { Download, Edit, Eye, Play, Printer, Send } from 'lucide-react';


interface Props {
  inv: Invoice;
  customer?: Customer;
  prescription?: Prescription;
  onViewPrescription?: (et: Prescription) => void;
  onPrintA5?: (inv: Invoice) => void;
  onEditOrder?: (inv: Invoice) => void;
  onContinueBilling?: (inv: Invoice) => void;
}

export function SalesOrderDetailCard({ inv, customer, prescription, onViewPrescription, onPrintA5, onEditOrder, onContinueBilling }: Props) {
  const parsedItems = Array.isArray(inv.items) ? inv.items : (typeof inv.items === 'string' ? JSON.parse(inv.items) : []);

  const isSunglass = (item: any) => {
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    return t.includes('sunglass') || pt.includes('sunglass');
  };

  const isLens = (item: any) => {
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    return t.includes('lens') || pt.includes('lens') || item.lensBrand || item.lensType || item.lensCategory;
  };

  const isAccessory = (item: any) => {
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    return t === 'manual' || t.includes('access') || pt.includes('access');
  };

  const isFrame = (item: any) => {
    if (isSunglass(item) || isLens(item) || isAccessory(item)) return false;
    const t = String(item.itemType || item.type || item.category || '').toLowerCase();
    const pt = String(item.productType || '').toLowerCase();
    if (t.includes('frame') || pt.includes('frame')) return true;
    if (item.brand || item.model || item.modelNumber) return true;
    return false;
  };

  const frames = parsedItems.filter(isFrame);
  const lenses = parsedItems.filter(isLens);
  const sunglasses = parsedItems.filter(isSunglass);
  const accessories = parsedItems.filter(isAccessory);

  const productTotal = Number(inv.subTotal) || parsedItems.reduce((sum: number, item: any) => sum + ((Number(item.sellingPrice) * Number(item.quantity)) || 0), 0);
  const taxAmount = 0; // Tax is 0 based on current requirements
  const discountAmount = Number(inv.totalDiscount) || 0;
  const grandTotal = Number(inv.grandTotal) || (productTotal - discountAmount + taxAmount);
  const advanceAmount = Number(inv.advanceAmount) || 0;
  const balanceAmount = Number(inv.balanceAmount) || (grandTotal - advanceAmount);

  const handleShareWhatsApp = () => {
    if (!customer) return;
    const text = generateWhatsAppInvoiceText(inv, customer, prescription, parsedItems);
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=${customer.mobile}&text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-6 overflow-hidden text-white w-full">
      {/* 1. CUSTOMER DETAILS */}
      <div className="bg-[#1E293B] p-5 border-b border-white/5">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-white">{customer?.name || 'Walk-in Customer'}</h3>
            <div className="text-xs text-white/60 mt-2 space-y-1">
               <p><span className="text-white/40 font-bold uppercase tracking-wider">Customer ID:</span> {customer?.id || 'N/A'}</p>
               <p><span className="text-white/40 font-bold uppercase tracking-wider">Mobile Number:</span> {customer?.mobile || 'N/A'}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg mb-2">
                <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs">{inv.type}</span>
             </div>
             <p className="font-mono text-sm font-bold">{formatInvoiceNumber(inv.invoiceNumber)}</p>
             <p className="text-xs text-white/40">{new Date(inv.createdAt).toLocaleString('en-IN')}</p>
             <p className="text-[10px] font-black uppercase tracking-widest mt-2 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
               Status: <span className={
                 inv.status === 'Delivered' ? 'text-emerald-400' :
                 inv.status === 'Ready' ? 'text-blue-400' :
                 inv.status === 'Ordered' ? 'text-amber-400' : inv.status === 'In Lab' ? 'text-purple-400' : 'text-rose-400'
               }>{inv.status}</span>
             </p>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {prescription && (
            <div className="col-span-1 bg-[#1E293B] border border-white/5 p-4 rounded-xl flex flex-col justify-between">
               <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Linked Prescription</h4>
               <div className="space-y-2">
                 <div className="flex gap-1 items-center">
                    <span className="text-[10px] font-bold text-white/60 uppercase w-4">OD</span>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">SPH</span>
                      <span className="font-mono text-white text-[10px]">{prescription.rightEye?.sph || '-'}</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">CYL</span>
                      <span className="font-mono text-white text-[10px]">{prescription.rightEye?.cyl || '-'}</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">AXIS</span>
                      <span className="font-mono text-white text-[10px]">{prescription.rightEye?.axis || '-'}</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">ADD</span>
                      <span className="font-mono text-white text-[10px]">{prescription.rightEye?.add || '-'}</span>
                    </div>
                 </div>
                 <div className="flex gap-1 items-center">
                    <span className="text-[10px] font-bold text-white/60 uppercase w-4">OS</span>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">SPH</span>
                      <span className="font-mono text-white text-[10px]">{prescription.leftEye?.sph || '-'}</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">CYL</span>
                      <span className="font-mono text-white text-[10px]">{prescription.leftEye?.cyl || '-'}</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">AXIS</span>
                      <span className="font-mono text-white text-[10px]">{prescription.leftEye?.axis || '-'}</span>
                    </div>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1 text-center">
                      <span className="block text-[8px] text-white/40 uppercase font-bold tracking-wider mb-0.5">ADD</span>
                      <span className="font-mono text-white text-[10px]">{prescription.leftEye?.add || '-'}</span>
                    </div>
                 </div>
                 <div className="flex gap-2 justify-center mt-2 pt-2 border-t border-white/5">
                   {(prescription.pdDistance) && (
                     <div className="text-[9px] text-white/60"><span className="text-white/40">PD:</span> {prescription.pdDistance}</div>
                   )}
                   {prescription.pdNear && (
                     <div className="text-[9px] text-white/60"><span className="text-white/40">Near PD:</span> {prescription.pdNear}</div>
                   )}
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* ORDER ITEMS */}
        {frames.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             👓 Frame Details
          </h4>
          {frames.map((frame: any, idx: number) => (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{frame.brand || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{frame.modelNumber || frame.model || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Code</span><span className="font-bold text-white">{frame.frameCode || frame.itemCode || frame.code || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{frame.frameCategory || frame.productType || frame.category || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{frame.color || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Size</span><span className="font-bold text-white">{frame.frameSize || frame.size || 'N/A'}</span></div>
               
               <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{frame.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Unit Price</span><span className="font-black text-white">₹{frame.sellingPrice || frame.price || frame.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{frame.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{frame.finalAmount || 0}</span></div>
               </div>
            </div>
          ))}
        </div>
        )}

        {lenses.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🔍 Lens Details
          </h4>
          {lenses.map((lens: any, idx: number) => (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{lens.lensBrand || lens.brand || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{lens.lensCategory || lens.category || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Type</span><span className="font-bold text-white">{lens.lensType || lens.type || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Index</span><span className="font-bold text-white">{lens.lensIndex || lens.index || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Coating</span><span className="font-bold text-white">{lens.lensCoating || lens.coating || 'N/A'}</span></div>
               <div className="col-span-2 md:col-span-3"><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Features</span><span className="font-bold text-white">{lens.lensFeatures ? (Array.isArray(lens.lensFeatures) ? lens.lensFeatures.join(', ') : lens.lensFeatures) : lens.features || 'N/A'}</span></div>
               
               <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{lens.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{lens.sellingPrice || lens.price || lens.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{lens.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{lens.finalAmount || 0}</span></div>
               </div>
            </div>
          ))}
        </div>
        )}

        {sunglasses.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🕶️ Sunglass Details
          </h4>
          {sunglasses.map((sg: any, idx: number) => (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Brand</span><span className="font-bold text-white">{sg.brand || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Model</span><span className="font-bold text-white">{sg.modelNumber || sg.model || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Color</span><span className="font-bold text-white">{sg.color || 'N/A'}</span></div>
               <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{sg.frameCategory || sg.productType || sg.category || 'N/A'}</span></div>
               
               <div className="col-span-2 md:col-span-4 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{sg.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{sg.sellingPrice || sg.price || sg.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{sg.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{sg.finalAmount || 0}</span></div>
               </div>
            </div>
          ))}
        </div>
        )}

        {accessories.length > 0 && (
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
             🛍️ Accessories Details
          </h4>
          {accessories.map((acc: any, idx: number) => {
            let accessoryType = acc.category || acc.productType || 'Accessories';
            const name = String(acc.itemName || acc.name || acc.brand || '').toLowerCase();
            if (name.includes('clean')) accessoryType = 'Cleaning Kit';
            if (name.includes('hard case')) accessoryType = 'Hard Case';
            if (name.includes('soft case')) accessoryType = 'Soft Case';
            if (name.includes('chain')) accessoryType = 'Chain';
            if (name.includes('cloth')) accessoryType = 'Cloth';
            
            return (
            <div key={idx} className="bg-[#1E293B] border border-white/5 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs">
               <div className="col-span-2">
                  <span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Product Name</span>
                  <span className="font-bold text-white">{acc.itemName || acc.name || acc.brand || acc.modelNumber || 'N/A'}</span>
               </div>
               <div className="col-span-2"><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Category</span><span className="font-bold text-white">{accessoryType}</span></div>
               
               <div className="col-span-2 border-t border-white/5 pt-3 mt-1 grid grid-cols-4 gap-4 bg-white/5 p-3 rounded-lg">
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Quantity</span><span className="font-black text-white">{acc.quantity || 1}</span></div>
                  <div><span className="block text-[9px] text-white/40 uppercase tracking-wider mb-1">Price</span><span className="font-black text-white">₹{acc.sellingPrice || acc.price || acc.purchasePrice || 0}</span></div>
                  <div><span className="block text-[9px] text-rose-400 uppercase tracking-wider mb-1">Discount</span><span className="font-black text-rose-400">₹{acc.discount || 0}</span></div>
                  <div><span className="block text-[9px] text-emerald-400 uppercase tracking-wider mb-1">Final Amount</span><span className="font-black text-emerald-400 text-sm">₹{acc.finalAmount || 0}</span></div>
               </div>
            </div>
          )})}
        </div>
        )}

        {/* BILL SUMMARY & PAYMENT DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
           <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Bill Summary</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between text-white/60"><span>Product Total:</span> <span className="font-mono text-white">₹{productTotal}</span></div>
                 <div className="flex justify-between text-white/60"><span>Discount:</span> <span className="font-mono text-rose-400">-₹{discountAmount}</span></div>
                 <div className="flex justify-between text-white/60"><span>Tax:</span> <span className="font-mono text-white">₹{taxAmount}</span></div>
                 <div className="flex justify-between text-white/80 font-bold border-t border-white/5 pt-2"><span>Grand Total:</span> <span className="font-mono text-white">₹{grandTotal}</span></div>
                 <div className="flex justify-between text-emerald-400 font-bold"><span>Advance Received:</span> <span className="font-mono">₹{advanceAmount}</span></div>
                 <div className="flex justify-between text-rose-400 font-black border-t border-white/5 pt-2 mt-1"><span>Balance Amount:</span> <span className="font-mono text-sm">₹{balanceAmount}</span></div>
              </div>
           </div>

           <div className="bg-[#1E293B] border border-white/5 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Payment Details</h4>
              <div className="space-y-2 text-xs">
                 <div className="flex justify-between items-center text-white/60 mb-2 border-b border-white/5 pb-2">
                    <span>Payment Mode:</span> 
                    <span className="font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-wider text-[10px]">{inv.paymentMode}</span>
                 </div>
                 
                 {(inv.paymentMode === 'Cash' || inv.paymentMode === 'Mixed') && (
                   <div className="flex justify-between text-white/80"><span>Cash Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.cash || 0}</span></div>
                 )}
                 {(inv.paymentMode === 'Card' || inv.paymentMode === 'Mixed') && (
                   <>
                     <div className="flex justify-between text-white/80"><span>Card Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.card || 0}</span></div>
                     <div className="flex justify-between text-white/50 text-[10px]"><span>Card Reference:</span> <span>{inv.paymentDetail?.cardLast4 || 'N/A'}</span></div>
                   </>
                 )}
                 {(inv.paymentMode === 'UPI' || inv.paymentMode === 'Mixed') && (
                   <>
                     <div className="flex justify-between text-white/80"><span>UPI Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.upi || 0}</span></div>
                     <div className="flex justify-between text-white/50 text-[10px]"><span>UPI Reference:</span> <span>{inv.paymentDetail?.upiTransactionId || 'N/A'}</span></div>
                   </>
                 )}
                 {(inv.paymentMode === 'Bank Transfer' || inv.paymentMode === 'Mixed') && (
                   <div className="flex justify-between text-white/80"><span>Bank Amount:</span> <span className="font-mono font-bold text-white">₹{inv.paymentDetail?.bank || 0}</span></div>
                 )}
                 {inv.paymentDetail?.transactionId && (
                   <div className="flex justify-between text-white/50 text-[10px]"><span>Transaction Number:</span> <span>{inv.paymentDetail?.transactionId || 'N/A'}</span></div>
                 )}
                 
                 <div className="flex justify-between text-emerald-400 font-bold border-t border-white/5 pt-2 mt-1"><span>Advance Received:</span> <span className="font-mono">₹{advanceAmount}</span></div>
                 <div className="flex justify-between text-rose-400 font-black"><span>Balance Amount:</span> <span className="font-mono text-sm">₹{balanceAmount}</span></div>
              </div>
           </div>
        </div>
      </div>
      
      {/* ACTION BUTTONS */}
      <div className="bg-[#1E293B] p-4 border-t border-white/5 flex flex-wrap gap-2 justify-end">
         {prescription && onViewPrescription && (
           <button 
             onClick={() => onViewPrescription(prescription)}
             className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-yellow-500/20 transition-colors flex items-center gap-2"
           >
             <Eye size={14} /> View Prescription
           </button>
         )}
         {onPrintA5 && (
           <button 
             onClick={() => onPrintA5(inv)}
             className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-blue-500/20 transition-colors flex items-center gap-2"
           >
             <Printer size={14} /> Print Sales Order
           </button>
         )}
         {onPrintA5 && (
           <button 
             onClick={() => onPrintA5(inv)}
             className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg border border-white/10 transition-colors flex items-center gap-2"
           >
             <Download size={14} /> Download PDF
           </button>
         )}
         <button 
           onClick={handleShareWhatsApp}
           className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-2"
         >
           <Send size={14} /> WhatsApp Order
         </button>
         {inv.status !== 'Delivered' && inv.status !== 'Cancelled' && onContinueBilling && (
           <button 
             onClick={() => onContinueBilling(inv)}
             className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/50"
           >
             <Play size={14} /> Continue Billing
           </button>
         )}
         {inv.status !== 'Delivered' && inv.status !== 'Cancelled' && onEditOrder && (
           <button 
             onClick={() => onEditOrder(inv)}
             className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold text-[10px] uppercase tracking-widest rounded-lg border border-white/10 transition-colors flex items-center gap-2"
           >
             <Edit size={14} /> Edit Order
           </button>
         )}
      </div>
    </div>
  );
}
