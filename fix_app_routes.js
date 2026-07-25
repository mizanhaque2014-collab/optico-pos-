const fs = require('fs');

// We will just create a catch-all route that renders Home.
const catchAllDir = 'app/[...slug]';
if (!fs.existsSync(catchAllDir)){
    fs.mkdirSync(catchAllDir, { recursive: true });
}

fs.writeFileSync(catchAllDir + '/page.tsx', `
"use client";
import Home from '../page';
import { usePathname } from 'next/navigation';

export default function CatchAll() {
  // We can just render the Home page
  return <Home />;
}
`);
