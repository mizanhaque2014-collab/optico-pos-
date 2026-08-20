const fs = require('fs');
let lines = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<ArrowLeft size={18} />')) {
    // i is 912 (0-indexed). The button ends at i+1
    // The next line is `          <div>` (i+2)
    // We should replace i+2 with the title
    if (lines[i+2].includes('<div>')) {
       lines[i+2] = `          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-cyan-400">📊</span> Daily Sales Report
            </h1>
            <p className="text-xs text-white/50 tracking-wider">REAL-TIME REVENUE & TRANSACTIONS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">`;
    }
    break;
  }
}

fs.writeFileSync('components/DailySalesReportView.tsx', lines.join('\n'));
