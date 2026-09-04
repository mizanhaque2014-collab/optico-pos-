const fs = require('fs');
let code = fs.readFileSync('components/DashboardView.tsx', 'utf-8');

code = code.replace(
  `payments: { title: 'Payments', subtitle: 'Payment Tracking', icon: <CreditCard size={48} className="text-green-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-green-950/80 to-green-900/40 border-green-800/50 hover:bg-green-900/60 hover:border-green-500/80 shadow-lg shadow-green-900/20', action: () => comingSoonAction('Payments') },`,
  `payments: { title: 'Payments', subtitle: 'Payment Tracking', icon: <CreditCard size={48} className="text-green-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-green-950/80 to-green-900/40 border-green-800/50 hover:bg-green-900/60 hover:border-green-500/80 shadow-lg shadow-green-900/20', action: () => onViewChange('payments') },`
);

fs.writeFileSync('components/DashboardView.tsx', code);
console.log("Patched components/DashboardView.tsx successfully.");
