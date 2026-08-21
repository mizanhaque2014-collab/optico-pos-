const fs = require('fs');
let code = fs.readFileSync('components/BranchSelector.tsx', 'utf8');

// Replace the loadBranches logic to NOT override "ALL"
const oldLoadBranchesStart = `      // If no branch is selected or selected branch is not in the list, auto-select the first one`;
const oldLoadBranchesEnd = `    } catch (e) {`;

const newLoadBranches = `      // If no branch is selected at all, default to ALL
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
`;

code = code.replace(new RegExp(oldLoadBranchesStart + '[\\s\\S]*?' + oldLoadBranchesEnd), newLoadBranches + '    } catch (e) {');

// Add "ALL" to select
const oldSelect = `<option value="" disabled>
          SELECT BRANCH
        </option>`;
const newSelect = `<option value="ALL">ALL BRANCHES</option>`;

code = code.replace(oldSelect, newSelect);

// Fix onChange to handle "ALL"
const oldOnChange = `        onChange={(e) => {
          const b = branches.find(
            (br) => br.BranchID === e.target.value || br.id === e.target.value,
          );
          if (b) switchBranch(b.BranchID || b.id, b.BranchName || b.branchName);
        }}`;

const newOnChange = `        onChange={(e) => {
          const val = e.target.value;
          if (val === 'ALL') {
             switchBranch('ALL', 'All Branches');
             return;
          }
          const b = branches.find(
            (br) => br.BranchID === val || br.id === val,
          );
          if (b) switchBranch(b.BranchID || b.id, b.BranchName || b.branchName);
        }}`;

code = code.replace(oldOnChange, newOnChange);

fs.writeFileSync('components/BranchSelector.tsx', code);
