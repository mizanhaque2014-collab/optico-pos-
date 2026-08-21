const fs = require('fs');
let code = fs.readFileSync('components/BranchSelector.tsx', 'utf8');

const regex = /const loadBranches = async \(\) => \{\n    setLoading\(true\);\n    try \{\n      const allBranches = await branchService\.getBranchesV2\(\);\n      const companyBranches: any\[\] = allBranches\.filter\(\n        \(b: any\) =>\n          \(b\.CompanyID === session\?\.companyID \|\|\n            b\.companyId === session\?\.companyID\) &&\n          String\(b\.Status\)\.toUpperCase\(\) === "ACTIVE",\n      \);\n      setBranches\(companyBranches\);\n      \/\/ If no branch is selected or selected branch is not in the list, auto-select the first one\n      if \(\n        companyBranches\.length > 0 &&\n        \(!session\?\.branchID \|\| session\?\.branchID === "ALL"\)\n      \) \{\n        switchBranch\(\n          companyBranches\[0\]\.BranchID \|\| companyBranches\[0\]\.id,\n          companyBranches\[0\]\.BranchName \|\| companyBranches\[0\]\.branchName,\n        \);\n      \} else if \(\n        !session\?\.branchName &&\n        session\?\.branchID &&\n        session\?\.branchID !== "ALL"\n      \) \{\n        const current = companyBranches\.find\(\n          \(b\) => b\.BranchID === session\.branchID \|\| b\.id === session\.branchID,\n        \);\n        if \(current\) \{\n          switchBranch\(\n            session\.branchID,\n            current\.BranchName \|\| current\.branchName,\n          \);\n        \}\n      \}\n    \} catch \(e\) \{/g;

const newCode = `const loadBranches = async () => {
    setLoading(true);
    console.log("[BRANCH DEBUG] CompanyID =", session?.companyID);
    console.log("[BRANCH DEBUG] API URL =", "branchService.getBranchesV2()");
    try {
      const allBranches = await branchService.getBranchesV2();
      console.log("[BRANCH DEBUG] getBranches Response =", allBranches);
      console.log("[BRANCH DEBUG] Total Branches =", allBranches?.length);
      const companyBranches: any[] = allBranches.filter(
        (b: any) =>
          String(b.CompanyID || b.companyId || '').trim() === String(session?.companyID || '').trim() &&
          String(b.Status || '').toUpperCase() === "ACTIVE",
      );
      console.log("[BRANCH DEBUG] Matching Company Branches =", companyBranches);
      setBranches(companyBranches);
      console.log("[BRANCH DEBUG] Final Branch List =", companyBranches.map(b => b.BranchName || b.branchName));

      if (!session?.branchID) {
        switchBranch('ALL', 'All Branches');
      } else if (session?.branchID !== 'ALL' && !session?.branchName) {
        const current = companyBranches.find(
          (b) => b.BranchID === session.branchID || b.id === session.branchID,
        );
        if (current) {
          switchBranch(
            session.branchID,
            current.BranchName || current.branchName,
          );
        }
      }
    } catch (e) {`;

code = code.replace(regex, newCode);
fs.writeFileSync('components/BranchSelector.tsx', code);
