const fs = require('fs');
let code = fs.readFileSync('app/super-admin/page.tsx', 'utf8');

code = code.replace('<ProtectedRoute>\n      <div className="min-h-screen bg-[#020617]', '<div className="min-h-screen bg-[#020617]');

code = code.replace(`      )}
    </div>
    </ProtectedRoute>
  );
}`, `      )}
    </div>
  );
}`);

// Wrap the whole component output correctly
// Wait, the component returns conditionally.
// 1. if (!isAuthenticated) { return (...) }
// 2. return (...)
// So we just wrap the body of both returns!

const search1 = `  if (!isAuthenticated) {
    // Elegant Dark Login Screen
    return (
      <div className="min-h-screen bg-[#020617]`;

const replace1 = `  if (!isAuthenticated) {
    // Elegant Dark Login Screen
    return (
      <ProtectedRoute>
      <div className="min-h-screen bg-[#020617]`;

const search2 = `        </p>
      </div>
    );
  }`;

const replace2 = `        </p>
      </div>
      </ProtectedRoute>
    );
  }`;

const search3 = `  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col h-screen overflow-hidden">`;

const replace3 = `  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col h-screen overflow-hidden">`;

const search4 = `      )}
    </div>
  );
}`;

const replace4 = `      )}
    </div>
    </ProtectedRoute>
  );
}`;

code = code.replace(search1, replace1);
code = code.replace(search2, replace2);
code = code.replace(search3, replace3);
code = code.replace(search4, replace4);

fs.writeFileSync('app/super-admin/page.tsx', code);
