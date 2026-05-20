import React, { useEffect, useState } from 'react';
import { Heart, Trash2, Play, Calendar, Clock } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../context/AuthContext';

const Watchlist = () => {
  const { user, fetchWithAuth } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      if (user) {
        try {
          // 1. Fetch Watchlist from Backend
          const watchlistRes = await fetchWithAuth('/api/watch/watchlist');
          if (watchlistRes.ok) {
            const watchlistData = await watchlistRes.json();
            // Map backend fields to frontend structures
            const formattedWatchlist = watchlistData.map(item => ({
              _id: item.movieSlug,
              slug: item.movieSlug,
              name: item.movieName,
              poster_url: item.posterPath
            }));
            setWatchlist(formattedWatchlist);
          }

          // 2. Fetch Watch History from Backend
          const historyRes = await fetchWithAuth('/api/watch/history');
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            // Map backend history fields to frontend structures
            const formattedHistory = historyData.map(item => ({
              _id: item.movieSlug,
              slug: item.movieSlug,
              name: item.movieName,
              poster_url: item.posterPath,
              lastEpisode: {
                name: item.lastEpisodeName,
                slug: item.lastEpisodeSlug
              },
              watchedAt: item.updatedAt
            }));
            setHistory(formattedHistory);
          }
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu từ server:', error);
        }
      } else {
        // Fallback to local storage if logged out
        const savedWatchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        setWatchlist(savedWatchlist);

        const savedHistory = JSON.parse(localStorage.getItem('watch_history') || '[]');
        setHistory(savedHistory);
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleClearWatchlist = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách yêu thích?')) {
      if (!user) {
        localStorage.removeItem('watchlist');
        setWatchlist([]);
      } else {
        alert('Trong chế độ đăng nhập, hãy bỏ thích từng phim trên trang chi tiết để xóa.');
      }
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem phim?')) {
      if (!user) {
        localStorage.removeItem('watch_history');
        setHistory([]);
      } else {
        alert('Lịch sử xem trên máy chủ sẽ được cập nhật tự động khi bạn xem các tập phim mới.');
      }
    }
  };

  const handleResumeWatching = (movieSlug, lastEpisode) => {
    window.history.pushState(null, '', `/watch/${movieSlug}/${lastEpisode.slug}?server=${lastEpisode.serverIndex || 0}`);
  };

  if (loading) {
    return (
      <div className="watchlist-container" style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      {/* 1. Watch History Section */}
      <div style={{ marginBottom: '60px' }}>
        <div className="watchlist-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={28} color="var(--accent-cyan)" />
            <h1 className="search-page-title" style={{ margin: 0 }}>Lịch sử xem</h1>
          </div>
          {history.length > 0 && !user && (
            <button className="btn-clear" onClick={handleClearHistory}>
              <Trash2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Xóa Lịch Sử
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '20px' 
            }}
          >
            {history.map((item) => (
              <div 
                key={item._id} 
                className="glass-panel"
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  alignItems: 'center'
                }}
              >
                <div style={{ width: '80px', height: '110px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden' }}>
                  <img 
                    src={item.poster_url?.startsWith('http') ? item.poster_url : `https://phimimg.com/${item.poster_url}`} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                  <h3 
                    style={{ 
                      fontSize: '1rem', 
                      fontWeight: 600, 
                      margin: 0, 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      cursor: 'pointer'
                    }}
                    onClick={() => window.history.pushState(null, '', `/detail/${item.slug}`)}
                  >
                    {item.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Đang xem: <span style={{ color: 'var(--accent-cyan)' }}>{item.lastEpisode?.name}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(item.watchedAt).toLocaleDateString('vi-VN')} {new Date(item.watchedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleResumeWatching(item.slug, item.lastEpisode)}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.75rem', 
                      borderRadius: '6px', 
                      marginTop: '4px',
                      alignSelf: 'flex-start',
                      gap: '4px'
                    }}
                  >
                    <Play size={12} fill="white" />
                    Xem tiếp
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state glass-panel" style={{ borderRadius: '12px' }}>
            <Clock className="empty-icon" size={48} />
            <div className="empty-text">Bạn chưa xem bộ phim nào gần đây.</div>
          </div>
        )}
      </div>

      {/* 2. Watchlist Section */}
      <div>
        <div className="watchlist-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={28} color="var(--accent-purple)" fill="var(--accent-purple)" />
            <h1 className="search-page-title" style={{ margin: 0 }}>Danh sách yêu thích</h1>
          </div>
          {watchlist.length > 0 && !user && (
            <button className="btn-clear" onClick={handleClearWatchlist}>
              <Trash2 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Xóa Tất Cả
            </button>
          )}
        </div>

        {watchlist.length > 0 ? (
          <div className="results-grid">
            {watchlist.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="empty-state glass-panel" style={{ borderRadius: '12px' }}>
            <Heart className="empty-icon" size={48} />
            <div className="empty-text">Chưa có phim nào trong danh sách yêu thích của bạn.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
