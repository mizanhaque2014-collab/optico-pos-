const fs = require('fs');
let code = fs.readFileSync('lib/services/companyService.ts', 'utf8');

code = code.replace(
`        const idVal = res.companyId || res.id || newCompany.id;
        const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
        const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
        return {
          ...res,
          id: idVal,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedVal: isNaN(updatedVal) ? Date.now() : updatedVal
        };`,
`        const idVal = res.CompanyID || res.companyId || res.id || newCompany.id;
        const createdVal = (res.CreatedDate || res.createdDate) ? new Date(res.CreatedDate || res.createdDate).getTime() : Date.now();
        const updatedVal = (res.UpdatedDate || res.updatedDate) ? new Date(res.UpdatedDate || res.updatedDate).getTime() : createdVal;
        return {
          ...res,
          ...newCompany,
          id: idVal,
          companyId: idVal,
          CompanyID: idVal,
          companyName: newCompany.companyName,
          CompanyName: newCompany.companyName,
          status: newCompany.status,
          Status: newCompany.status,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
        };`
);

code = code.replace(
`        const idVal = res.companyId || res.id || updatedCompany.id;
        const createdVal = res.createdDate ? new Date(res.createdDate).getTime() : Date.now();
        const updatedVal = res.updatedDate ? new Date(res.updatedDate).getTime() : createdVal;
        return {
          ...res,
          id: idVal,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
        };`,
`        const idVal = res.CompanyID || res.companyId || res.id || updatedCompany.id;
        const createdVal = (res.CreatedDate || res.createdDate) ? new Date(res.CreatedDate || res.createdDate).getTime() : Date.now();
        const updatedVal = (res.UpdatedDate || res.updatedDate) ? new Date(res.UpdatedDate || res.updatedDate).getTime() : createdVal;
        return {
          ...res,
          ...updatedCompany,
          id: idVal,
          companyId: idVal,
          CompanyID: idVal,
          companyName: updatedCompany.companyName,
          CompanyName: updatedCompany.companyName,
          status: updatedCompany.status,
          Status: updatedCompany.status,
          createdDate: isNaN(createdVal) ? Date.now() : createdVal,
          updatedDate: isNaN(updatedVal) ? Date.now() : updatedVal
        };`
);

fs.writeFileSync('lib/services/companyService.ts', code);
