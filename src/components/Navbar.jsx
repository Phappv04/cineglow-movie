import React, { useState, useEffect } from 'react';
import { Search, Film, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentRoute }) => {
  const { user, logout, setIsAuthOpen } = useAuth();
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
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigateTo = (page, type = '') => {
    if (page === 'home') {
      window.history.pushState(null, '', '/');
    } else if (page === 'list') {
      window.history.pushState(null, '', `/list/${type}`);
    } else if (page === 'watchlist') {
      window.history.pushState(null, '', '/watchlist');
    } else if (page === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (page === 'profile') {
      window.history.pushState(null, '', '/profile');
    }
  };

  const isLinkActive = (page, type = '') => {
    if (page === 'home' && currentRoute.page === 'home') return true;
    if (page === 'list' && currentRoute.page === 'list' && currentRoute.params.type === type) return true;
    if (page === 'watchlist' && currentRoute.page === 'watchlist') return true;
    if (page === 'admin' && currentRoute.page === 'admin') return true;
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
        {user && user.role === 'ADMIN' && (
          <button 
            className={`nav-link ${isLinkActive('admin') ? 'active' : ''}`}
            onClick={() => navigateTo('admin')}
            style={{ color: 'var(--accent-cyan)' }}
          >
            Quản trị
          </button>
        )}
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

        {user ? (
          <div className="user-profile-menu" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px' }}>
            <span 
              className="user-name-display" 
              onClick={() => navigateTo('profile')}
              style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)', 
                fontWeight: 600, 
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              title="Xem thông tin cá nhân"
            >
              {user.fullName}
            </span>
            <button 
              className="btn btn-secondary" 
              onClick={logout} 
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px' }}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={() => setIsAuthOpen(true)}
            style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: '20px', marginLeft: '8px' }}
          >
            Đăng Nhập
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
