const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

code = code.replace(
  /import \{ shopConfig \} from '@\/lib\/shopConfig';/,
  `import { shopConfig } from '@/lib/shopConfig';\nimport { useAuth } from '@/lib/AuthContext';`
);

code = code.replace(
  /export function DailySalesReportView\(\{ onBack \}: Props\) \{/,
  `export function DailySalesReportView({ onBack }: Props) {\n  const { session } = useAuth();`
);

fs.writeFileSync('components/DailySalesReportView.tsx', code);
