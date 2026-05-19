import React, { useState, useEffect } from 'react';
import { Search, Film, Heart, Sparkles } from 'lucide-react';

const Navbar = ({ currentRoute }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle scroll class toggle
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search input with route query if present
  useEffect(() => {
    if (currentRoute.page === 'search' && currentRoute.params.q) {
      setSearchQuery(currentRoute.params.q);
    } else if (currentRoute.page !== 'search') {
      setSearchQuery('');
    }
  }, [currentRoute]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.hash = `#/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navigateTo = (page, type = '') => {
    if (page === 'home') {
      window.location.hash = '#/';
    } else if (page === 'list') {
      window.location.hash = `#/list/${type}`;
    } else if (page === 'watchlist') {
      window.location.hash = '#/watchlist';
    }
  };

  const isLinkActive = (page, type = '') => {
    if (page === 'home' && currentRoute.page === 'home') return true;
    if (page === 'list' && currentRoute.page === 'list' && currentRoute.params.type === type) return true;
    if (page === 'watchlist' && currentRoute.page === 'watchlist') return true;
    return false;
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div 
        className="navbar-brand" 
        style={{ cursor: 'pointer' }}
        onClick={() => navigateTo('home')}
      >
        <Film size={28} color="var(--accent-purple)" />
        <span className="brand-text">CineGlow</span>
      </div>

      <div className="navbar-links">
        <button 
          className={`nav-link ${isLinkActive('home') ? 'active' : ''}`}
          onClick={() => navigateTo('home')}
        >
          Trang chủ
        </button>
        <button 
          className={`nav-link ${isLinkActive('list', 'phim-le') ? 'active' : ''}`}
          onClick={() => navigateTo('list', 'phim-le')}
        >
          Phim Lẻ
        </button>
        <button 
          className={`nav-link ${isLinkActive('list', 'phim-bo') ? 'active' : ''}`}
          onClick={() => navigateTo('list', 'phim-bo')}
        >
          Phim Bộ
        </button>
        <button 
          className={`nav-link ${isLinkActive('list', 'hoat-hinh') ? 'active' : ''}`}
          onClick={() => navigateTo('list', 'hoat-hinh')}
        >
          Hoạt Hình
        </button>
        <button 
          className={`nav-link ${isLinkActive('list', 'tv-shows') ? 'active' : ''}`}
          onClick={() => navigateTo('list', 'tv-shows')}
        >
          TV Shows
        </button>
      </div>

      <div className="navbar-actions">
        <form onSubmit={handleSearchSubmit} className="search-box-container">
          <input 
            type="text" 
            placeholder="Tìm phim, đạo diễn, diễn viên..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} className="search-icon" />
        </form>

        <button 
          className="btn-watchlist" 
          title="Danh sách yêu thích"
          onClick={() => navigateTo('watchlist')}
          style={{
            background: isLinkActive('watchlist') ? 'var(--accent-purple)' : '',
            borderColor: isLinkActive('watchlist') ? 'var(--accent-purple)' : ''
          }}
        >
          <Heart size={18} fill={isLinkActive('watchlist') ? 'white' : 'none'} color={isLinkActive('watchlist') ? 'white' : 'var(--text-secondary)'} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
