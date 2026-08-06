const fs = require('fs');
let code = fs.readFileSync('components/LoginView.tsx', 'utf8');

const importStatement = "import { Lock, User as UserIcon, LogIn, Activity, Settings, Database, Key } from 'lucide-react';";
code = code.replace("import { Lock, User as UserIcon, LogIn, Activity } from 'lucide-react';", importStatement);

const importConfig = "import { saveApiUrl, API_URL } from '@/lib/config';";
code = code.replace("import { shopConfig } from '@/lib/shopConfig';", "import { shopConfig } from '@/lib/shopConfig';\n" + importConfig);

const stateStatements = `  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(API_URL);`;
code = code.replace("  const [isSubmitting, setIsSubmitting] = useState(false);", stateStatements);

const gearIcon = `      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>
      
      <button 
        onClick={() => setShowApiSetup(true)}
        className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-white transition-all z-20 group"
        title="Server Connection Setup"
      >
        <Database size={20} className="group-hover:scale-110 transition-transform" />
      </button>`;
code = code.replace(`      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>`, gearIcon);


const modalHTML = `
      {showApiSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 bg-gradient-to-r from-cyan-950/40 to-slate-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                  <Database size={18} />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">SaaS Database Connection</h2>
              </div>
              <button
                onClick={() => setShowApiSetup(false)}
                className="text-white/40 hover:text-white transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                  <Key size={14} />
                  <span>Google Apps Script Endpoint</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Enter your unique Google Apps Script Web App URL to connect this frontend to your company's dedicated database.
                </p>
                <input
                  type="text"
                  value={tempApiUrl}
                  onChange={(e) => setTempApiUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full bg-[#1E293B] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-white/20"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-900 border-t border-white/5 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowApiSetup(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => saveApiUrl(tempApiUrl)}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-cyan-900/30"
              >
                Connect Database
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-8 z-10 relative backdrop-blur-sm">`;
code = code.replace(`      <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-8 z-10 relative backdrop-blur-sm">`, modalHTML);


fs.writeFileSync('components/LoginView.tsx', code);
