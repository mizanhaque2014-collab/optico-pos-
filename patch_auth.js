const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const returnSearch = `  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col overflow-hidden">`;

const returnReplace = `  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#020617]"><p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Session...</p></div>;
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col overflow-hidden">`;

if (code.includes(returnSearch)) {
  code = code.replace(returnSearch, returnReplace);
  fs.writeFileSync('app/page.tsx', code);
  console.log("Patched successfully!");
} else {
  console.log("Not found!");
}
