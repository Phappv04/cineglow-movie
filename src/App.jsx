import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Details from './pages/Details';
import Player from './pages/Player';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';

function App() {
  const [route, setRoute] = useState({ page: 'home', params: {} });

  // Custom Stateful Hash Router
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      
      // Route rules
      if (hash.startsWith('#/detail/')) {
        const slug = hash.replace('#/detail/', '').split('?')[0]; // strip query params if any
        setRoute({ page: 'detail', params: { slug } });
      } 
      else if (hash.startsWith('#/watch/')) {
        const pathAndQuery = hash.replace('#/watch/', '');
        const parts = pathAndQuery.split('?')[0].split('/');
        const slug = parts[0];
        const episodeSlug = parts[1] || ''; // could be empty to load first episode
        setRoute({ page: 'player', params: { slug, episodeSlug } });
      } 
      else if (hash === '#/watchlist') {
        setRoute({ page: 'watchlist', params: {} });
      } 
      else if (hash.startsWith('#/search')) {
        const queryPart = hash.split('?')[1] || '';
        const params = {};
        queryPart.split('&').forEach(pair => {
          const [k, v] = pair.split('=');
          if (k) params[k] = decodeURIComponent(v || '');
        });
        setRoute({ page: 'search', params });
      } 
      else if (hash.startsWith('#/list/')) {
        const type = hash.replace('#/list/', '').split('?')[0];
        setRoute({ page: 'list', params: { type } });
      } 
      else {
        // Fallback to Home
        setRoute({ page: 'home', params: {} });
      }

      // Smooth scroll to top on page transition
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initialize

    return () => window.removeEventListener('hashchange', handleHashChange);
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
    </div>
  );
}

export default App;
