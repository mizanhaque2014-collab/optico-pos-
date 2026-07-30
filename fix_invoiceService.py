import re

with open('lib/services/invoiceService.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r'async createInvoice\(invoice: Invoice\): Promise<Invoice> \{.*?\n  \},',
    """async createInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<any>('saveInvoice', invoice);
    return data && data.id ? data : invoice;
  },""",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'async updateInvoice\(invoice: Invoice\): Promise<Invoice> \{.*?\n  \},',
    """async updateInvoice(invoice: Invoice): Promise<Invoice> {
    const data = await apiCall<any>('saveInvoice', invoice);
    return data && data.id ? data : invoice;
  },""",
    content,
    flags=re.DOTALL
)

with open('lib/services/invoiceService.ts', 'w') as f:
    f.write(content)
