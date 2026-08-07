const fs = require('fs');
let code = fs.readFileSync('lib/services/companyService.ts', 'utf8');

code = code.replace(
`      return data.map(c => {
        const idVal = c.companyId || c.id;
        const createdVal = c.createdDate ? new Date(c.createdDate).getTime() : Date.now();
        const updatedVal = c.updatedDate ? new Date(c.updatedDate).getTime() : createdVal;
        return {
          ...c,
          id: idVal,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal,
        };
      });`,
`      return data.map(c => {
        const idVal = c.CompanyID || c.companyId || c.id || c.ID;
        const companyNameVal = c.CompanyName || c.companyName || '';
        const statusVal = c.Status || c.status || 'Active';
        const createdVal = (c.CreatedDate || c.createdDate) ? new Date(c.CreatedDate || c.createdDate).getTime() : Date.now();
        const updatedVal = (c.UpdatedDate || c.updatedDate) ? new Date(c.UpdatedDate || c.updatedDate).getTime() : createdVal;
        return {
          ...c,
          id: idVal,
          companyId: idVal,
          CompanyID: idVal,
          companyName: companyNameVal,
          CompanyName: companyNameVal,
          status: statusVal,
          Status: statusVal,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal,
        };
      });`
);

fs.writeFileSync('lib/services/companyService.ts', code);
