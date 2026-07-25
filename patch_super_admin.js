const fs = require('fs');

let code = fs.readFileSync('app/super-admin/page.tsx', 'utf8');

if (!code.includes('import { ProtectedRoute }')) {
  code = code.replace("import { useRouter } from 'next/navigation';", "import { useRouter } from 'next/navigation';\nimport { ProtectedRoute } from '@/components/ProtectedRoute';");
}

const returnSearch = `  if (!isAuthenticated) {
    // Elegant Dark Login Screen
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center px-4 font-sans selection:bg-cyan-500/30">`;

const returnReplace = `  if (!isAuthenticated) {
    // Elegant Dark Login Screen
    return (
      <ProtectedRoute>
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center px-4 font-sans selection:bg-cyan-500/30">`;

const endSearch1 = `              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (`;

const endReplace1 = `              </button>
            </form>
          </div>
        </div>
      </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>`;

const endSearch2 = `      )}
    </div>
  );
}`;

const endReplace2 = `      )}
    </div>
    </ProtectedRoute>
  );
}`;

if (code.includes(returnSearch)) {
  code = code.replace(returnSearch, returnReplace);
  code = code.replace(endSearch1, endReplace1);
  code = code.replace(endSearch2, endReplace2);
}

fs.writeFileSync('app/super-admin/page.tsx', code);
