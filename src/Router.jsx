import { lazy, Suspense, useEffect, useState } from 'react';
import App from './App.jsx';

const About = lazy(() => import('./components/About.jsx'));
export default function Router() {
  const [path, setPath] = useState(location.pathname);
  const [returnView, setReturnView] = useState(null);
  useEffect(() => {
    const pop = () => { setReturnView('works'); setPath(location.pathname); };
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  function navigate(next, view = 'works') {
    setReturnView(view);
    history.pushState(null, '', next + location.search);
    setPath(next);
  }
  return path.replace(/\/$/, '') === '/about' ? (
    <Suspense fallback={<div style={{background:'#252a1e',height:'100dvh'}} />}>
      <About onNavigate={(view) => navigate('/', view)} />
    </Suspense>
  ) : <App initialEntered={returnView !== null} initialMenu={returnView === 'contact'} onAbout={() => navigate('/about')} />;
}
