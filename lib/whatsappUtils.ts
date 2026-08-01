import { Invoice, Customer, Prescription, OrderItem } from '@/lib/types';
import { shopConfig } from '@/lib/shopConfig';

export function generateWhatsAppInvoiceText(
  inv: Invoice, 
  customer: any, 
  prescription: Prescription | null | undefined, 
  parsedItems: OrderItem[]
) {
  let text = `*INVOICE:* ${inv.invoiceNumber}\n*Shop:* ${shopConfig.shopName}\n*Customer:* ${customer.name}\n`;

  // Prescription Details
  if (prescription) {
    text += `\n*PRESCRIPTION:*\n`;
    const r = prescription.rightEye;
    const l = prescription.leftEye;
    text += `*OD (Right):* SPH ${r?.sph || '-'} | CYL ${r?.cyl || '-'} | AXIS ${r?.axis || '-'} | ADD ${r?.add || '-'}\n`;
    text += `*OS (Left):* SPH ${l?.sph || '-'} | CYL ${l?.cyl || '-'} | AXIS ${l?.axis || '-'} | ADD ${l?.add || '-'}\n`;
    if ((prescription as any).pdDist || (prescription as any).pd) {
      text += `*PD:* ${(prescription as any).pdDist || (prescription as any).pd}\n`;
    }
  }

  // Items
  if (parsedItems && parsedItems.length > 0) {
    text += `\n*PURCHASED ITEMS:*\n`;
    parsedItems.forEach((item, idx) => {
      if (item.itemType === 'frame') {
        text += `- ${item.brand || 'Frame'} ${item.modelNumber || ''} [Qty: ${item.quantity}]\n`;
      } else if (item.itemType === 'lens') {
        text += `- ${item.lensBrand || 'Lens'} ${item.lensCategory || ''} (${(item as any).features || 'Standard'}) [Qty: ${item.quantity}]\n`;
      } else {
        text += `- ${item.itemName || 'Item'} [Qty: ${item.quantity}]\n`;
      }
    });
  }

  // Financials
  const productTotal = Number(inv.subTotal) || parsedItems.reduce((sum: number, item: any) => sum + ((Number(item.sellingPrice) * Number(item.quantity)) || 0), 0);
  const discount = Number(inv.totalDiscount) || 0;
  const advance = Number(inv.advanceAmount) || 0;
  const balance = Number(inv.balanceAmount) || (Number(inv.grandTotal) - advance);
  const grandTotal = Number(inv.grandTotal) || (productTotal - discount);

  text += `\n*BILLING DETAILS:*\n`;
  text += `Product Total: ₹${productTotal}\n`;
  if (discount > 0) text += `Discount: -₹${discount}\n`;
  text += `Grand Total: ₹${grandTotal}\n`;
  text += `Advance Paid: ₹${advance}\n`;
  
  if (inv.status === 'Delivered' && inv.type === 'Sales Order') {
    const collected = inv.finalCollectionPaymentDetail?.total || (grandTotal - advance);
    text += `Balance Collected: ₹${collected}\n`;
    text += `Remaining Balance: ₹0 (PAID)\n`;
  } else {
    text += `Balance Amount: ₹${balance}\n`;
  }

  if (inv.deliveryDate) {
    text += `\n*Delivery Date:* ${new Date(inv.deliveryDate).toLocaleString('en-IN')}\n`;
  }

  text += `\nThank you for your business!`;
  
  return text;
}
