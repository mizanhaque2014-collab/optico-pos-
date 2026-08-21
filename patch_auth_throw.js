const fs = require('fs');
let code = fs.readFileSync('lib/AuthContext.tsx', 'utf8');

code = code.replace(
  /\} catch \(err: any\) \{\n\s*console\.error\("Backend Error on getUsers:", err\);\n\s*throw err; \/\/ bubble up the error to show exactly what the backend responded with\n\s*\}/g,
  `} catch (err: any) {
        console.warn("Backend Error on getUsers (falling back to hardcoded users):", err.message);
      }`
);

fs.writeFileSync('lib/AuthContext.tsx', code);
