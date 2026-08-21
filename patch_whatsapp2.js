const fs = require('fs');
let code = fs.readFileSync('components/WhatsAppMarketingView.tsx', 'utf8');

code = code.replace(
  /import \{ shopConfig \} from '@\/lib\/shopConfig';/,
  `import { shopConfig } from '@/lib/shopConfig';\nimport { useAuth } from '@/lib/AuthContext';`
);

code = code.replace(
  /export function WhatsAppMarketingView\(\{ onBack \}: Props\) \{/,
  `export function WhatsAppMarketingView({ onBack }: Props) {\n  const { session } = useAuth();`
);

fs.writeFileSync('components/WhatsAppMarketingView.tsx', code);
