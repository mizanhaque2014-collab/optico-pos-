const fs = require('fs');
let code = fs.readFileSync('components/CustomersView.tsx', 'utf-8');

if (!code.includes("const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);")) {
  code = code.replace(
    `const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);`,
    `const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);`
  );

  code = code.replace(
    `onClick={() => setSelectedCustomer(c)}`,
    `onClick={() => {
                  if (isLoadingCustomer) return;
                  setIsLoadingCustomer(true);
                  // Simulate brief delay so the loader renders before the heavy CustomerProfileView mounting
                  setTimeout(() => {
                    setSelectedCustomer(c);
                    setIsLoadingCustomer(false);
                  }, 50);
                }}
                disabled={isLoadingCustomer}`
  );

  // Add the loader to CustomersView
  code = code.replace(
    `return (
    <div className="max-w-4xl mx-auto space-y-6">`,
    `return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isLoadingCustomer && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F172A]/95 backdrop-blur-md">
           <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
           <p className="text-sm font-black uppercase tracking-widest text-cyan-400 animate-pulse">
             Please wait, loading customer data...
           </p>
        </div>
      )}`
  );
}

fs.writeFileSync('components/CustomersView.tsx', code);
console.log("Patched CustomersView.tsx successfully.");
