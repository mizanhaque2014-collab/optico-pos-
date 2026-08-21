const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

const anchor = `<div className="mt-4 mb-2 px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">
            Modules
          </div>`;

const injection = `<BranchSelector />
          <div className="mt-4 mb-2 px-4 text-[10px] font-black text-white/30 uppercase tracking-widest">
            Modules
          </div>`;

code = code.replace(anchor, injection);

fs.writeFileSync('app/page.tsx', code);
