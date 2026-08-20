const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

code = code.replace(
  /<button\n            onClick=\{onBack\}\n            className="p-2\.5 hover:bg-white\/5 rounded-full transition-colors border border-white\/10"\n            title="Back to Dashboard"\n          >\n            <ArrowLeft size=\{18\} \/>\n          <\/button>\n          <div>\n          \n          \{\/\* Quick Date Filters Selector \*\/\}\n          <div>/,
  `<button\n            onClick={onBack}\n            className="p-2.5 hover:bg-white/5 rounded-full transition-colors border border-white/10"\n            title="Back to Dashboard"\n          >\n            <ArrowLeft size={18} />\n          </button>\n          <div>\n            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">\n              <span className="text-cyan-400">📊</span> Daily Sales Report\n            </h1>\n            <p className="text-xs text-white/50 tracking-wider">REAL-TIME REVENUE & TRANSACTIONS</p>\n          </div>\n        </div>\n\n        <div className="flex items-center gap-3">\n          {/* Quick Date Filters Selector */}\n          <div>`
);

fs.writeFileSync('components/DailySalesReportView.tsx', code);
