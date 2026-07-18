const fs = require('fs');
let code = fs.readFileSync('Code.gs', 'utf8');
const patch = `      case 'getBranches':
        result = getBranches();
        break;
      case 'assignUserToBranch':
        result = assignUserToBranch(payload.username || e.parameter.username, payload.branchName || e.parameter.branchName);
        break;`;
code = code.replace(/case 'getBranches':\s*result = getBranches\(\);\s*break;/, patch);

const func = `
// Assign user to branch
function assignUserToBranch(username, branchName) {
  if (!username || !branchName) throw new Error("Username and Branch Name are required");
  var users = getUsers();
  var targetUser = null;
  for (var i = 0; i < users.length; i++) {
    var uName = users[i].Username || users[i].username;
    if (uName && uName.toString().trim().toLowerCase() === username.toString().trim().toLowerCase()) {
      targetUser = users[i];
      break;
    }
  }
  if (!targetUser) throw new Error("User not found with username: " + username);

  var branches = getBranches();
  var targetBranch = null;
  for (var j = 0; j < branches.length; j++) {
    var bName = branches[j].branchName || branches[j].BranchName || branches[j]["Branch Name"];
    if (bName && bName.toString().trim().toLowerCase() === branchName.toString().trim().toLowerCase()) {
      targetBranch = branches[j];
      break;
    }
  }
  if (!targetBranch) throw new Error("Branch not found with name: " + branchName);

  targetUser.BranchID = targetBranch.id || targetBranch.BranchID;
  updateUser(targetUser);
  return true;
}
`;
code += func;
fs.writeFileSync('Code.gs', code);
