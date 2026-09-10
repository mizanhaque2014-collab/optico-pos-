const fs = require('fs');

let code = fs.readFileSync('components/DeliveryCollectionView.tsx', 'utf8');

const hookRegex = /  const \[customShopName, setCustomShopName\] = useState\(''\);\n\n  useEffect\(\(\) => \{[\s\S]*?\}, \[completedInvoice, session\?.companyID, session\?.branchID\]\);\n/;
const match = code.match(hookRegex);

if (match) {
  code = code.replace(match[0], '');
  
  const insertTarget = '  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);\n';
  code = code.replace(insertTarget, insertTarget + "\n" + match[0]);
  
  fs.writeFileSync('components/DeliveryCollectionView.tsx', code);
}
