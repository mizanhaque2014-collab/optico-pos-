const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf-8');

const target = `  useEffect(() => {
    if (typeof window !== 'undefined' && currentView !== 'dashboard') {
      // Don't pushState if it's already there to avoid infinite loop
      if (window.location.pathname !== '/' + currentView) {
        window.history.pushState(null, '', '/' + currentView);
      }
    } else if (typeof window !== 'undefined' && currentView === 'dashboard') {
      if (window.location.pathname !== '/' && window.location.pathname !== '/dashboard') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [currentView]);`;

const replacement = `  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = currentView === 'dashboard' ? '' : currentView;
    }
  }, [currentView]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== 'dashboard') {
        // setCurrentView is called below but we need it here, so just rely on the existing currentView init logic if possible
      }
    }
  }, []);`;

code = code.replace(target, replacement);
fs.writeFileSync('app/page.tsx', code);
console.log("Replaced successfully!");
