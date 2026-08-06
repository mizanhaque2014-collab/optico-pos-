const fs = require('fs');
let code = fs.readFileSync('components/LoginView.tsx', 'utf8');

const oldHTML = `<div className="space-y-4">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                  <Key size={14} />
                  <span>Google Apps Script Endpoint</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Enter your unique Google Apps Script Web App URL to connect this frontend to your company's dedicated database.
                </p>
                <input`;

const newHTML = `<div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5">
                  <div>
                    <h3 className="text-white font-bold text-sm">Need a new backend?</h3>
                    <p className="text-white/40 text-xs mt-1">Download the Google Apps Script code to create a new database.</p>
                  </div>
                  <a 
                    href="/backend-bundle.gs" 
                    download="optico_pos_backend.gs"
                    className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all border border-white/10"
                  >
                    Download Code.gs
                  </a>
                </div>

                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-xs pt-2">
                  <Key size={14} />
                  <span>Google Apps Script Endpoint</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Enter your unique Google Apps Script Web App URL to connect this frontend to your company's dedicated database.
                </p>
                <input`;

code = code.replace(oldHTML, newHTML);
fs.writeFileSync('components/LoginView.tsx', code);
