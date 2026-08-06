const fs = require('fs');
let code = fs.readFileSync('app/super-admin/page.tsx', 'utf8');

if (!code.includes('useSearchParams')) {
  code = code.replace("import { useRouter } from 'next/navigation';", "import { useRouter, useSearchParams } from 'next/navigation';");
  
  const stateRegex = /const \[activeTab, setActiveTab\] = useState<TabType>\('companies'\);/;
  
  const replaceWith = `const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('companies');
  
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);`;
  
  code = code.replace(stateRegex, replaceWith);
  fs.writeFileSync('app/super-admin/page.tsx', code);
}
