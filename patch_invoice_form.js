const fs = require('fs');
let code = fs.readFileSync('components/InvoiceFormView.tsx', 'utf8');

if (!code.includes('useAuth')) {
  code = code.replace(
    /import \{ useStore \} from '@\/lib\/store';/,
    `import { useStore } from '@/lib/store';\nimport { useAuth } from '@/lib/AuthContext';`
  );
  
  code = code.replace(
    /export function InvoiceFormView\(\{\n  onBack,\n  initialType = 'Direct Sale',\n  defaultCustomer = null\n\}: Props\) \{/,
    `export function InvoiceFormView({\n  onBack,\n  initialType = 'Direct Sale',\n  defaultCustomer = null\n}: Props) {\n  const { session } = useAuth();`
  );
  
  code = code.replace(
    /companyId: 'COMP-default',/g,
    `companyId: session?.companyID || 'COMP-default',`
  );
  
  code = code.replace(
    /branchId: 'BR-default',/g,
    `branchId: session?.branchID || 'BR-default',`
  );
  
  fs.writeFileSync('components/InvoiceFormView.tsx', code);
}
