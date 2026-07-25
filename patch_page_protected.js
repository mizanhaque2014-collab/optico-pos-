const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

if (!code.includes('import { ProtectedRoute }')) {
  code = code.replace("import { LoginView } from '@/components/LoginView';", "import { ProtectedRoute } from '@/components/ProtectedRoute';");
}

const returnSearch = `  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#020617]"><p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Session...</p></div>;
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col overflow-hidden">`;

const returnReplace = `  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col overflow-hidden">`;

if (code.includes(returnSearch)) {
  code = code.replace(returnSearch, returnReplace);
  
  // also need to close it at the end.
  const endSearch = `    </div>
  );
}`;
  const endReplace = `    </div>
    </ProtectedRoute>
  );
}`;
  if (code.includes(endSearch)) {
      code = code.replace(endSearch, endReplace);
  }
} else {
  console.log("Could not find returnSearch in page.tsx");
}

fs.writeFileSync('app/page.tsx', code);
