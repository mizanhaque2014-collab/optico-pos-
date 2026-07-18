const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');

const replacement = `      case 'saveInvoiceItem':
        var inv = getInvoices().find(function(i) { return i.id === payload.invoiceId; });
        if (inv) {
          inv.items = payload.items;
          result = saveInvoice(inv);
        } else {
          result = {};
        }
        break;
      case 'loadInvoiceItems':
        var inv2 = getInvoices().find(function(i) { return i.id === payload.invoiceId; });
        result = inv2 ? inv2.items : [];
        break;
      case 'saveSalesOrder':
        result = saveInvoice(payload.salesOrder || payload);
        break;
      case 'saveDeliveryCollection':
        result = saveInvoice(payload.invoice || payload);
        break;`;

code = code.replace(/case 'saveInvoiceItem':[\s\S]*?case 'saveDeliveryCollection':\s*result = payload\.invoice \|\| \{\};\s*break;/, replacement);
fs.writeFileSync('Code.gs', code);
