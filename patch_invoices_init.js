const fs = require('fs');
const path = './components/CustomerProfileView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const [invoices, setInvoices] = useState<Invoice[]>([]);',
  `const store = useStore();
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const localInvoices = store.getInvoices().filter((i: any) => i.customerId === customer.id || (i as any).CustomerID === customer.id);
      return localInvoices.sort((a: any, b: any) => b.createdAt - a.createdAt);
    } catch(e) {
      return [];
    }
  });`
);

fs.writeFileSync(path, code);
