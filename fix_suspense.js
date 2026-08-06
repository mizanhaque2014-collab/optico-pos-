const fs = require('fs');
let code = fs.readFileSync('app/super-admin/page.tsx', 'utf8');

if (!code.includes('Suspense')) {
  code = code.replace("import { useState", "import { useState, Suspense");
  
  code = code.replace("export default function SuperAdminPage() {", "function SuperAdminContent() {");
  
  code += `\n\nexport default function SuperAdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">Loading...</div>}>
      <SuperAdminContent />
    </Suspense>
  );
}
`;
  fs.writeFileSync('app/super-admin/page.tsx', code);
}
