const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

code = code.replace(
  /export function StockInventoryView\(\{ onBack \}: Props\) \{\n  const \{ session \} = useAuth\(\);/,
  `export function StockInventoryView({ onBack }: Props) {\n  const { session } = useAuth();\n  const [BRANCHES, setBRANCHES] = React.useState<string[]>([]);\n  React.useEffect(() => {\n    import('@/lib/services/branchService').then(({ branchService }) => {\n      branchService.getBranches().then(branches => {\n         const companyBranches: any[] = branches.filter((b: any) => \n           (b.CompanyID === session?.companyID || b.companyId === session?.companyID) &&\n           String(b.Status).toUpperCase() === 'ACTIVE'\n         );\n         setBRANCHES(companyBranches.map((b: any) => b.BranchName || b.branchName || b.BranchID || b.id));\n      });\n    });\n  }, [session?.companyID]);`
);

fs.writeFileSync('components/StockInventoryView.tsx', code);
