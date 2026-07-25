const fs = require('fs');

function fix(file) {
    let code = fs.readFileSync(file, 'utf8');
    if (code.startsWith('"use client";\'use client\';')) {
        code = code.replace('"use client";\'use client\';', '"use client";\n');
    }
    if (code.startsWith('"use client";import')) {
        code = code.replace('"use client";import', '"use client";\nimport');
    }
    if (code.startsWith("'use client';import")) {
        code = code.replace("'use client';import", "'use client';\nimport");
    }
    fs.writeFileSync(file, code);
}

fix('app/page.tsx');
fix('app/super-admin/page.tsx');
fix('lib/AuthContext.tsx');
