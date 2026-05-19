import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Details from './pages/Details';
import Player from './pages/Player';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [route, setRoute] = useState({ page: 'home', params: {} });
  const { isAuthOpen, setIsAuthOpen } = useAuth();

  // Custom Stateful Browser Path Router
  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname || '/';
      const searchParams = new URLSearchParams(window.location.search);
      
      // Route rules
      if (path.startsWith('/detail/')) {
        const slug = path.replace('/detail/', '').split('?')[0]; // strip query params if any
        setRoute({ page: 'detail', params: { slug } });
      } 
      else if (path.startsWith('/watch/')) {
        const pathAndQuery = path.replace('/watch/', '');
        const parts = pathAndQuery.split('?')[0].split('/');
        const slug = parts[0];
        const episodeSlug = parts[1] || ''; // could be empty to load first episode
        setRoute({ page: 'player', params: { slug, episodeSlug } });
      } 
      else if (path === '/watchlist') {
        setRoute({ page: 'watchlist', params: {} });
      } 
      else if (path === '/admin') {
        setRoute({ page: 'admin', params: {} });
      } 
      else if (path.startsWith('/search')) {
        const params = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        setRoute({ page: 'search', params });
      } 
      else if (path.startsWith('/list/')) {
        const type = path.replace('/list/', '').split('?')[0];
        setRoute({ page: 'list', params: { type } });
      } 
      else {
        // Fallback to Home
        setRoute({ page: 'home', params: {} });
      }

      // Smooth scroll to top on page transition
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    // Override pushState to trigger path change callback
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handlePathChange();
    };

    window.addEventListener('popstate', handlePathChange);
    handlePathChange(); // Initialize

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  // Helper to render the active page
  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <Home />;
      case 'detail':
        return <Details slug={route.params.slug} />;
      case 'player':
        return <Player slug={route.params.slug} episodeSlug={route.params.episodeSlug} />;
      case 'search':
        return <Search query={route.params.q} />;
      case 'list':
        return <Search type={route.params.type} />;
      case 'watchlist':
        return <Watchlist />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentRoute={route} />
      <main className="main-content" style={{ marginTop: '70px' }}>
        {renderPage()}
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default App;
