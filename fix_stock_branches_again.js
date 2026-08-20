const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

if (!code.includes('const [BRANCHES, setBRANCHES]')) {
  code = code.replace(
    /export function StockInventoryView\(\{\n  onBack\n\}: Props\) \{\n  const \{ session \} = useAuth\(\);/,
    `export function StockInventoryView({\n  onBack\n}: Props) {\n  const { session } = useAuth();\n  const [BRANCHES, setBRANCHES] = React.useState<string[]>([]);\n  React.useEffect(() => {\n    import('@/lib/services/branchService').then(({ branchService }) => {\n      branchService.getBranches().then(branches => {\n         const companyBranches: any[] = branches.filter((b: any) => \n           (b.CompanyID === session?.companyID || b.companyId === session?.companyID) &&\n           String(b.Status).toUpperCase() === 'ACTIVE'\n         );\n         setBRANCHES(companyBranches.map((b: any) => b.BranchName || b.branchName || b.BranchID || b.id));\n      });\n    });\n  }, [session?.companyID]);`
  );
  
  if (!code.includes('import React')) {
    code = "import React from 'react';\n" + code;
  }
  
  fs.writeFileSync('components/StockInventoryView.tsx', code);
}
