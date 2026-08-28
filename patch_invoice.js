const fs = require('fs');
let code = fs.readFileSync('components/InvoiceFormView.tsx', 'utf-8');

const targetState = `  const [stableCurrentTime, setStableCurrentTime] = useState<number>(0);`;
const replaceState = `  const [stableCurrentTime, setStableCurrentTime] = useState<number>(0);
  const [isLoadingCustomerData, setIsLoadingCustomerData] = useState<boolean>(false);`;

const targetFetch = `    const fetchLatestPrescription = async () => {
      try {`;
const replaceFetch = `    const fetchLatestPrescription = async () => {
      setIsLoadingCustomerData(true);
      try {`;

const targetFetchEnd = `      } catch (e) {
        console.warn("Failed to load customer prescription on select:", e);
        setPrescription(null);
      }
    };`;
const replaceFetchEnd = `      } catch (e) {
        console.warn("Failed to load customer prescription on select:", e);
        setPrescription(null);
      } finally {
        setIsLoadingCustomerData(false);
      }
    };`;

const targetRender = `  if (savedInvoice) {`;
const replaceRender = `  if (isLoadingCustomerData) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A]/95 backdrop-blur-md">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
         <p className="text-sm font-black uppercase tracking-widest text-cyan-400 animate-pulse">
           Please wait, loading customer data...
         </p>
      </div>
    );
  }

  if (savedInvoice) {`;

if (code.includes(targetState) && code.includes(targetFetch) && code.includes(targetFetchEnd) && code.includes(targetRender)) {
  code = code.replace(targetState, replaceState);
  code = code.replace(targetFetch, replaceFetch);
  code = code.replace(targetFetchEnd, replaceFetchEnd);
  code = code.replace(targetRender, replaceRender);
  fs.writeFileSync('components/InvoiceFormView.tsx', code);
  console.log("Patched InvoiceFormView successfully.");
} else {
  console.log("Target not found in InvoiceFormView.");
}
