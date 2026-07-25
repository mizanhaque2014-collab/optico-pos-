const fs = require('fs');

let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

if (!code.includes('import { useRouter } from')) {
    code = code.replace("import { userService, User } from '@/lib/services/userService';", "import { userService, User } from '@/lib/services/userService';\nimport { useRouter } from 'next/navigation';");
}

if (!code.includes('const router = useRouter();')) {
    code = code.replace("  const [error, setError] = useState<string | null>(null);", "  const [error, setError] = useState<string | null>(null);\n  const router = useRouter();");
}

const logoutSearch = `  const logout = () => {
    setSession(null);
    localStorage.removeItem('opt_session');
    sessionStorage.removeItem('opt_session');
  };`;

const logoutReplace = `  const logout = () => {
    setSession(null);
    localStorage.removeItem('opt_session');
    sessionStorage.removeItem('opt_session');
    router.replace('/login');
  };`;

if (code.includes(logoutSearch)) {
    code = code.replace(logoutSearch, logoutReplace);
    fs.writeFileSync('lib/AuthContext.tsx', code);
    console.log("Patched logout");
}
