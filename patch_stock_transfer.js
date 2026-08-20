const fs = require('fs');
let code = fs.readFileSync('components/StockInventoryView.tsx', 'utf8');

code = code.replace(
  /const BRANCHES = \['Main Branch', 'City Center Branch', 'Metro Mall Branch'\];/,
  `const [BRANCHES, setBRANCHES] = useState<string[]>([]);
  useEffect(() => {
    import('@/lib/services/branchService').then(({ branchService }) => {
      branchService.getBranches().then(branches => {
         const companyBranches = branches.filter((b: any) => 
           (b.CompanyID === session?.companyID || b.companyId === session?.companyID) &&
           String(b.Status).toUpperCase() === 'ACTIVE'
         );
         setBRANCHES(companyBranches.map((b: any) => b.BranchName || b.branchName || b.BranchID || b.id));
      });
    });
  }, [session?.companyID]);`
);

fs.writeFileSync('components/StockInventoryView.tsx', code);
