const fs = require('fs');
let code = fs.readFileSync('components/InvoiceFormView.tsx', 'utf8');

code = code.replace(
  /export function InvoiceFormView\(\{ type, onBack, initialCustomer, preloadedEyeTest \}: Props\) \{/,
  `export function InvoiceFormView({ type, onBack, initialCustomer, preloadedEyeTest }: Props) {\n  const { session } = useAuth();`
);

if (!code.includes('import { useAuth } from')) {
  code = code.replace(/import \{ useStore \} from '@\/lib\/store';/, `import { useStore } from '@/lib/store';\nimport { useAuth } from '@/lib/AuthContext';`);
}

fs.writeFileSync('components/InvoiceFormView.tsx', code);
