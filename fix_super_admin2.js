const fs = require('fs');
let code = fs.readFileSync('app/super-admin/page.tsx', 'utf8');

code = code.replace("export default function SuperAdminPortal() {", "function SuperAdminContent() {");
code = code.replace("export default function SuperAdminPage() {", "export default function SuperAdminPortal() {");

fs.writeFileSync('app/super-admin/page.tsx', code);
