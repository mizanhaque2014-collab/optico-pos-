const fs = require('fs');
let code = fs.readFileSync('components/CustomerSelect.tsx', 'utf-8');

if (!code.includes("const [isSelecting, setIsSelecting]")) {
  code = code.replace(
    `const [search, setSearch] = useState('');`,
    `const [search, setSearch] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);`
  );

  code = code.replace(
    `onClick={() => onSelect(c)}`,
    `onClick={async () => {
                  if (isSelecting) return;
                  setIsSelecting(true);
                  try {
                    await onSelect(c);
                  } finally {
                    setIsSelecting(false);
                  }
                }}
                disabled={isSelecting}`
  );
  
  // Need to replace the second instance as well (there are two `onClick={() => onSelect(c)}` - one in the absolute list, one in the static list if it exists)
  code = code.replace(
    `onClick={() => onSelect(c)}`,
    `onClick={async () => {
                  if (isSelecting) return;
                  setIsSelecting(true);
                  try {
                    await onSelect(c);
                  } finally {
                    setIsSelecting(false);
                  }
                }}
                disabled={isSelecting}`
  );
  
  // Disable search input while selecting
  code = code.replace(
    `onChange={e => setSearch(e.target.value)}`,
    `onChange={e => setSearch(e.target.value)}
            disabled={isSelecting}`
  );
}

fs.writeFileSync('components/CustomerSelect.tsx', code);
console.log("Patched CustomerSelect.tsx successfully.");
