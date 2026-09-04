const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

code = code.replace(
  /useEffect\(\(\) => \{\s*if \(typeof window !== 'undefined' && currentView !== 'dashboard'\) \{\s*if \(window\.location\.pathname !== '\/' \+ currentView\) \{\s*window\.history\.pushState\(null, '', '\/' \+ currentView\);\s*\}\s*\} else if \(typeof window !== 'undefined' && currentView === 'dashboard'\) \{\s*if \(window\.location\.pathname !== '\/' && window\.location\.pathname !== '\/dashboard'\) \{\s*window\.history\.pushState\(null, '', '\/'\);\s*\}\s*\}\s*\}, \[currentView\]\);/g,
  `useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = currentView === 'dashboard' ? '' : currentView;
    }
  }, [currentView]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== 'dashboard') {
        setCurrentView(hash as ViewState);
      }
    }
  }, []);`
);

fs.writeFileSync('app/page.tsx', code);
console.log("Patched router to use hash routing.");
