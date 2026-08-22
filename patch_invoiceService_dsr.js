const fs = require('fs');
let code = fs.readFileSync('lib/services/invoiceService.ts', 'utf8');

const apiAdd = `
  async getDailySalesReport(companyId: string, branchId: string, startDate: string, endDate: string): Promise<Invoice[]> {
    try {
      const data = await apiCall<any>('getDailySalesReport', { companyId, branchId, startDate, endDate });
      if (data && Array.isArray(data.invoices)) {
        return data.invoices.map(normalizeInvoice);
      }
    } catch (e) {
      console.warn('getDailySalesReport API failed:', e);
    }
    // Fallback: If API fails, fetch all invoices and filter locally to prevent breaking
    const list = await this.getInvoices();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return list.filter(inv => {
      // Company check
      if (companyId && companyId !== 'ALL') {
        const invComp = (inv as any).companyId || (inv as any).CompanyID;
        if (invComp && invComp !== companyId) return false;
      }
      // Branch check
      if (branchId && branchId !== 'ALL') {
        const invBranch = (inv as any).branchId || (inv as any).BranchID;
        if (invBranch && invBranch !== branchId) return false;
      }
      // Date check
      const t = new Date(inv.createdAt).getTime();
      return t >= start && t <= end;
    });
  },
`;

code = code.replace(
  /async getInvoices\(\): Promise<Invoice\[\]> \{/g,
  apiAdd + "\n  async getInvoices(): Promise<Invoice[]> {"
);

fs.writeFileSync('lib/services/invoiceService.ts', code);
console.log("Patched invoiceService.ts");
