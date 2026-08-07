const fs = require('fs');
let code = fs.readFileSync('lib/services/companyService.ts', 'utf8');

code = code.replace(
`export interface Company {
  id: string;
  companyName: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  gstNumber: string;
  subscriptionPlan: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  status: 'Active' | 'Inactive';
  createdDate: number;
  updatedDate: number;
}`,
`export interface Company {
  id: string;
  companyId?: string;
  CompanyID?: string;
  companyName: string;
  CompanyName?: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  gstNumber: string;
  subscriptionPlan: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  status: 'Active' | 'Inactive';
  Status?: string;
  createdDate: number;
  updatedDate: number;
}`
);

fs.writeFileSync('lib/services/companyService.ts', code);
