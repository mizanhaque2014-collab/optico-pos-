const fs = require('fs');
let code = fs.readFileSync('lib/services/branchService.ts', 'utf8');

code = code.replace(
`        return data.map(b => {
          const idVal = b.branchId || b.id;
          const dateVal = b.createdDate ? new Date(b.createdDate).getTime() : Date.now();
          return {
            ...b,
            id: idVal,
            whatsAppNumber: b.whatsApp || b.whatsAppNumber || '',
            createdDate: isNaN(dateVal) ? Date.now() : dateVal
          };
        });`,
`        return data.map(b => {
          const idVal = b.BranchID || b.branchId || b.id || b.ID || '';
          const compIdVal = b.CompanyID || b.companyId || '';
          const nameVal = b.BranchName || b.branchName || '';
          const mobileVal = b.Mobile || b.mobile || '';
          const statusVal = b.Status || b.status || 'Active';
          const addrVal = b.Address || b.address || '';
          
          const dateVal = (b.CreatedDate || b.createdDate) ? new Date(b.CreatedDate || b.createdDate).getTime() : Date.now();
          return {
            ...b,
            id: idVal,
            branchId: idVal,
            BranchID: idVal,
            companyId: compIdVal,
            CompanyID: compIdVal,
            branchName: nameVal,
            BranchName: nameVal,
            mobile: mobileVal,
            status: statusVal,
            address: addrVal,
            whatsAppNumber: b.WhatsApp || b.whatsApp || b.WhatsAppNumber || b.whatsAppNumber || '',
            createdDate: isNaN(dateVal) ? Date.now() : dateVal
          };
        });`
);

fs.writeFileSync('lib/services/branchService.ts', code);
