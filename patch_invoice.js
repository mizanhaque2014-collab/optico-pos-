const fs = require('fs');
let code = fs.readFileSync('components/OpticalInvoiceA5.tsx', 'utf8');

// Add imports
code = code.replace(
  "import { generateWhatsAppInvoiceText } from '@/lib/whatsappUtils';",
  "import { generateWhatsAppInvoiceText } from '@/lib/whatsappUtils';\nimport { branchService } from '@/lib/services/branchService';\nimport { companyService } from '@/lib/services/companyService';\nimport { useAuth } from '@/lib/AuthContext';"
);

// Find the start of the component
const startIdx = code.indexOf('  const store = useStore();');

const hookCode = `  const { session } = useAuth();
  const [shopInfo, setShopInfo] = useState({
    shopName: 'Loading...',
    addressLine1: 'Loading...',
    addressLine2: '',
    mobile: '...',
    whatsapp: '...',
    gstin: '',
    logo: shopConfig.logo || ''
  });

  useEffect(() => {
    let isMounted = true;
    async function loadShopData() {
      try {
        // Handle variations in field names
        const invAny = invoice as any;
        const cId = invAny?.companyId || invAny?.CompanyID || session?.companyID;
        const bId = invAny?.branchId || invAny?.BranchID || session?.branchID;
        
        let loadedCompanyName = '';
        let loadedGst = '';
        let loadedBranchName = '';
        let loadedAddress = '';
        let loadedMobile = '';
        let loadedWhatsapp = '';

        if (cId && cId !== 'ALL' && cId !== 'COMP-default') {
          try {
             const companies = await companyService.getCompanies();
             const comp = companies.find(c => (c as any).CompanyID === cId || c.companyId === cId || c.id === cId);
             if (comp) {
               loadedCompanyName = (comp as any).CompanyName || comp.companyName || '';
               loadedGst = (comp as any).GSTNumber || comp.gstNumber || '';
             }
          } catch(e) {}
        }

        if (bId && bId !== 'ALL' && bId !== 'BR-default') {
          try {
             const branches = await branchService.getBranchesV2();
             const br = branches.find(b => (b as any).BranchID === bId || b.branchId === bId || b.id === bId);
             if (br) {
               loadedBranchName = (br as any).BranchName || br.branchName || '';
               loadedAddress = (br as any).Location || (br as any).location || br.address || (br as any).Address || '';
               loadedMobile = (br as any).Mobile || br.mobile || '';
               loadedWhatsapp = (br as any).WhatsApp || br.whatsAppNumber || (br as any).whatsApp || '';
             }
          } catch(e) {}
        }
        
        if (isMounted) {
           const finalShopName = loadedBranchName || loadedCompanyName || 'Shop Name Not Configured';
           setShopInfo({
             shopName: finalShopName.toLowerCase().includes('optico pos') ? 'Shop Name Not Configured' : finalShopName,
             addressLine1: loadedAddress || 'Address Not Configured',
             addressLine2: '',
             mobile: loadedMobile || 'N/A',
             whatsapp: loadedWhatsapp || loadedMobile || '',
             gstin: loadedGst || '',
             logo: shopConfig.logo || ''
           });
        }
      } catch (err) {
         if (isMounted) {
           setShopInfo({
             shopName: 'Shop Name Not Configured',
             addressLine1: 'Address Not Configured',
             addressLine2: '',
             mobile: 'N/A',
             whatsapp: '',
             gstin: '',
             logo: shopConfig.logo || ''
           });
         }
      }
    }
    loadShopData();
    return () => { isMounted = false; };
  }, [invoice, session?.companyID, session?.branchID]);

`;

code = code.slice(0, startIdx) + hookCode + code.slice(startIdx);

// Replace shopConfig usages in JSX
code = code.replace(/shopConfig\.shopName/g, 'shopInfo.shopName');
code = code.replace(/shopConfig\.addressLine1/g, 'shopInfo.addressLine1');
code = code.replace(/shopConfig\.addressLine2/g, 'shopInfo.addressLine2');
code = code.replace(/shopConfig\.mobile/g, 'shopInfo.mobile');
code = code.replace(/shopConfig\.whatsapp/g, 'shopInfo.whatsapp');
code = code.replace(/shopConfig\.gstin/g, 'shopInfo.gstin');
code = code.replace(/shopConfig\.logo/g, 'shopInfo.logo');

fs.writeFileSync('components/OpticalInvoiceA5.tsx', code);
