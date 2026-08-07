const fs = require('fs');
let code = fs.readFileSync('lib/services/branchService.ts', 'utf8');

code = code.replace(
`      const data = await apiCall<any[]>('getBranches');
      if (Array.isArray(data)) {`,
`      const resData = await apiCall<any>('getBranches');
      const data = (resData && typeof resData === 'object' && resData.success && Array.isArray(resData.data)) ? resData.data : (Array.isArray(resData) ? resData : []);
      if (Array.isArray(data)) {`
);

fs.writeFileSync('lib/services/branchService.ts', code);
