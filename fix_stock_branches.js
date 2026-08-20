const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

code = code.replace(
  /const \[BRANCHES, setBRANCHES\] = useState<string\[\]>\(\[\]\);\n  useEffect\(\(\) => \{\n    import\('@\/lib\/services\/branchService'\)\.then\(\(\{ branchService \}\) => \{\n      branchService\.getBranches\(\)\.then\(branches => \{\n         const companyBranches = branches\.filter\(\(b: any\) => \n           \(b\.CompanyID === session\?\.companyID \|\| b\.companyId === session\?\.companyID\) &&\n           String\(b\.Status\)\.toUpperCase\(\) === 'ACTIVE'\n         \);\n         setBRANCHES\(companyBranches\.map\(\(b: any\) => b\.BranchName \|\| b\.branchName \|\| b\.BranchID \|\| b\.id\)\);\n      \}\);\n    \}\);\n  \}, \[session\?\.companyID\]\);/,
  ''
);

code = code.replace(
  /export function StockInventoryView\(\{\n  onBack\n\}: Props\) \{\n  const \{ session \} = useAuth\(\);/,
  `export function StockInventoryView({\n  onBack\n}: Props) {\n  const { session } = useAuth();\n  const [BRANCHES, setBRANCHES] = useState<string[]>([]);\n  useEffect(() => {\n    import('@/lib/services/branchService').then(({ branchService }) => {\n      branchService.getBranches().then(branches => {\n         const companyBranches = branches.filter((b: any) => \n           (b.CompanyID === session?.companyID || b.companyId === session?.companyID) &&\n           String(b.Status).toUpperCase() === 'ACTIVE'\n         );\n         setBRANCHES(companyBranches.map((b: any) => b.BranchName || b.branchName || b.BranchID || b.id));\n      });\n    });\n  }, [session?.companyID]);`
);

fs.writeFileSync('components/StockInventoryView.tsx', code);
