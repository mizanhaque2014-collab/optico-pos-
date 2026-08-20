const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

if (!code.includes('const { session } = useAuth()')) {
  code = code.replace(
    /export function StockInventoryView\(\{ onBack \}: Props\) \{/,
    `export function StockInventoryView({ onBack }: Props) {\n  const { session } = useAuth();`
  );
  
  // Also try replacing multi-line just in case
  code = code.replace(
    /export function StockInventoryView\(\{\n  onBack\n\}: Props\) \{/,
    `export function StockInventoryView({\n  onBack\n}: Props) {\n  const { session } = useAuth();`
  );
  
  fs.writeFileSync('components/StockInventoryView.tsx', code);
}
