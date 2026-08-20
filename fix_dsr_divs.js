const fs = require('fs');
let code = fs.readFileSync('components/DailySalesReportView.tsx', 'utf8');

code = code.replace(
  /      <\/AnimatePresence>\n    <\/div>\n  \);\n\}/,
  `      </AnimatePresence>\n    </div>\n    </div>\n    </div>\n  );\n}`
);

fs.writeFileSync('components/DailySalesReportView.tsx', code);
