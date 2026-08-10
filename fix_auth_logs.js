const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

const logCode = `      const newSession: AuthSession = {
        userID: matchedUser.UserID,
        companyID: matchedUser.CompanyID,
        branchID: matchedUser.BranchID,
        role: assignedRole,
        username: matchedUser.Username,
        fullName: matchedUser.FullName,
        loginTime: Date.now(),
        token: 'mock-jwt-token-' + Date.now()
      };

      // Add server-side logging for login action as requested in STEP 17
      try {
        const apiClient = require('@/lib/apiClient').apiClient;
        apiClient.apiCall('logActivity', {
          log: {
            Action: 'login',
            Username: matchedUser.Username,
            UserID: matchedUser.UserID,
            CompanyID: matchedUser.CompanyID,
            BranchID: matchedUser.BranchID,
            Role: assignedRole,
            Details: 'User logged in successfully'
          }
        }).catch(e => console.error("Failed to log activity:", e));
      } catch (e) {
        console.error("Failed to import/call apiClient for logging:", e);
      }
`;

code = code.replace(/      const newSession: AuthSession = \{\s*userID: matchedUser\.UserID,[\s\S]*?token: 'mock-jwt-token-' \+ Date\.now\(\)\s*\};/g, logCode);

fs.writeFileSync('lib/AuthContext.tsx', code);
