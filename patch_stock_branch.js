const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

if (!code.includes('useAuth')) {
  code = code.replace(
    /import \{ useStore \} from '@\/lib\/store';/,
    `import { useStore } from '@/lib/store';\nimport { useAuth } from '@/lib/AuthContext';`
  );
  
  code = code.replace(
    /export function StockInventoryView\(\{\n  onBack\n\}: Props\) \{/,
    `export function StockInventoryView({\n  onBack\n}: Props) {\n  const { session } = useAuth();`
  );
}

// Replace the selectedBranch state with session.branchName
code = code.replace(/const \[selectedBranch, setSelectedBranch\] = useState<string>\('Main Branch'\);/g, `const selectedBranch = session?.branchName || 'Default Branch';\n  // No setSelectedBranch anymore, it is managed globally`);

// Remove any onChange={e => setSelectedBranch} dropdowns for selectedBranch
code = code.replace(/onChange=\{\(e\) => setSelectedBranch\(e\.target\.value\)\}/g, 'disabled={true}');

fs.writeFileSync('components/StockInventoryView.tsx', code);
