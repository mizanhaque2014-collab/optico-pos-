const fs = require('fs');
let code = fs.readFileSync('components/CustomersView.tsx', 'utf8');

code = code.replace(
  /import \{ CustomerProfileView \} from '\.\/CustomerProfileView';/,
  `import { CustomerProfileView } from './CustomerProfileView';\nimport { useAuth } from '@/lib/AuthContext';`
);

code = code.replace(
  /export function CustomersView\(\{ onBack, onNavigateTo \}: Props\) \{/,
  `export function CustomersView({ onBack, onNavigateTo }: Props) {\n  const { session } = useAuth();`
);

fs.writeFileSync('components/CustomersView.tsx', code);
