const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

const targetStr = `<button
            onClick={onBack}
            className="p-2.5 hover:bg-white/5 rounded-full transition-colors border border-white/10"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>          
          {/* Quick Date Filters Selector */}
          <div>`;

const replacementStr = `<button
            onClick={onBack}
            className="p-2.5 hover:bg-white/5 rounded-full transition-colors border border-white/10"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-cyan-400">📊</span> Daily Sales Report
            </h1>
            <p className="text-xs text-white/50 tracking-wider">REAL-TIME REVENUE & TRANSACTIONS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Date Filters Selector */}
          <div>`;

code = code.replace(targetStr, replacementStr);

// Also remove the extra two </div> we added at the bottom
code = code.replace(/    <\/div>\n    <\/div>\n    <\/div>\n  \);\n\}/, '    </div>\n  );\n}');

fs.writeFileSync('components/DailySalesReportView.tsx', code);
