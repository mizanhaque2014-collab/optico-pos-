const fs = require('fs');

let code = fs.readFileSync('components/DashboardView.tsx', 'utf8');

code = code.replace("import { ViewState } from '@/app/page';", "import { ViewState } from '@/app/page';\nimport { useAuth } from '@/lib/AuthContext';");

const search = `export function DashboardView({ onViewChange }: Props) {`;
const replace = `export function DashboardView({ onViewChange }: Props) {
  const { session } = useAuth();
  const role = session?.role || 'SHOP_USER';
  const name = session?.fullName || 'User';
`;

code = code.replace(search, replace);

const menuSearch = `  const menuItems = [`;
const menuReplace = `  let menuItems = [`;

code = code.replace(menuSearch, menuReplace);

const filterSearch = `  return (
    <div className="space-y-6">`;
const filterReplace = `
  // Filter based on roles
  if (role === 'SHOP_USER') {
    menuItems = menuItems.filter(item => 
      ['Direct Sale', 'Sales Order', 'Delivery Collection', 'Customers', 'Stock Inventory'].includes(item.title)
    );
  }

  return (
    <div className="space-y-6">`;

code = code.replace(filterSearch, filterReplace);

code = code.replace("Welcome Back! 👋", "Welcome Back, {name}! 👋");

fs.writeFileSync('components/DashboardView.tsx', code);
