const fs = require('fs');
let code = fs.readFileSync('lib/services/branchService.ts', 'utf8');

code = code.replace(
`export interface Branch {
  id: string;
  companyId: string;
  branchName: string;
  address: string;
  mobile: string;
  whatsAppNumber: string;
  status: 'Active' | 'Inactive';
  createdDate: number;
}`,
`export interface Branch {
  id: string;
  branchId?: string;
  BranchID?: string;
  companyId: string;
  CompanyID?: string;
  branchName: string;
  BranchName?: string;
  address: string;
  mobile: string;
  whatsAppNumber: string;
  status: 'Active' | 'Inactive';
  Status?: string;
  createdDate: number;
}`
);

fs.writeFileSync('lib/services/branchService.ts', code);
