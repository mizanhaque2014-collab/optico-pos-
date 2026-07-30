import re

with open('lib/services/invoiceService.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r'apiCall<any>\(\'createInvoice\'',
    r"apiCall<any>('saveInvoice'",
    content
)

content = re.sub(
    r'apiCall<any>\(\'updateInvoice\'',
    r"apiCall<any>('saveInvoice'",
    content
)

with open('lib/services/invoiceService.ts', 'w') as f:
    f.write(content)
