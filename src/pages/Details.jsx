import React, { useEffect, useState } from 'react';
import { Play, Heart, HeartOff, Calendar, Clock, Film, Globe, Tags, Award } from 'lucide-react';
import { fetchMovieDetails, getImageUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Details = ({ slug }) => {
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadDetails = async () => {
      setLoading(true);
      try {
        const details = await fetchMovieDetails(slug);
        if (isMounted) {
          if (details.movie) {
            setData(details);
            checkWatchlist(details.movie.slug);
          } else {
            setData(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading details:', error);
        if (isMounted) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [slug, user]); // Reload when user auth state changes

  // Check if movie is already in Watchlist
  const checkWatchlist = async (movieSlug) => {
    if (user) {
      try {
        const res = await fetchWithAuth('/api/watch/watchlist');
        if (res.ok) {
          const list = await res.json();
          const found = list.some(item => item.movieSlug === movieSlug);
          setIsInWatchlist(found);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        const found = watchlist.some(m => m.slug === movieSlug);
        setIsInWatchlist(found);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Toggle watchlist state
  const handleWatchlistToggle = async () => {
    if (!data || !data.movie) return;
    const movie = data.movie;

    if (user) {
      try {
        const res = await fetchWithAuth('/api/watch/watchlist/toggle', {
          method: 'POST',
          body: JSON.stringify({
            movieSlug: movie.slug,
            movieName: movie.name,
            posterPath: movie.poster_url || movie.thumb_url
          })
        });
        if (res.ok) {
          const result = await res.json();
          setIsInWatchlist(result.bookmarked);
        }
      } catch (e) {
        console.error('Error toggling watchlist:', e);
      }
    } else {
      try {
        let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
        if (isInWatchlist) {
          watchlist = watchlist.filter(m => m.slug !== movie.slug);
          setIsInWatchlist(false);
        } else {
          watchlist.push({
            _id: movie._id,
            name: movie.name,
            slug: movie.slug,
            origin_name: movie.origin_name,
            poster_url: movie.poster_url,
            thumb_url: movie.thumb_url,
            year: movie.year,
            quality: movie.quality,
            lang: movie.lang
          });
          setIsInWatchlist(true);
        }
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
      } catch (e) {
        console.error('Error modifying watchlist:', e);
      }
    }
  };

  const handlePlayFirstEpisode = () => {
    if (!data || !data.episodes || data.episodes.length === 0) return;
    const firstServer = data.episodes[selectedServerIndex];
    if (firstServer && firstServer.server_data.length > 0) {
      const firstEpisode = firstServer.server_data[0];
      window.history.pushState(null, '', `/watch/${slug}/${firstEpisode.slug}?server=${selectedServerIndex}`);
    }
  };

  const handleEpisodeClick = (episodeSlug) => {
    window.history.pushState(null, '', `/watch/${slug}/${episodeSlug}?server=${selectedServerIndex}`);
  };

  if (loading) {
    return (
      <div className="details-container" style={{ minHeight: '90vh', padding: '100px 5%' }}>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ width: '300px', height: '450px', borderRadius: '20px' }}></div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="skeleton" style={{ height: '40px', width: '60%', marginBottom: '20px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: '20px' }}></div>
            <div className="skeleton" style={{ height: '100px', width: '90%', marginBottom: '40px' }}></div>
            <div className="skeleton" style={{ height: '150px', width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.movie) {
    return (
      <div className="details-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Không tìm thấy thông tin bộ phim.</p>
      </div>
    );
  }

  const { movie, episodes } = data;
  const posterImage = getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div className="details-container">
      <div className="details-backdrop">
        <img 
          src={getImageUrl(movie.thumb_url || movie.poster_url)} 
          alt={movie.name} 
          className="details-backdrop-img"
        />
      </div>

      <div className="details-content">
        <div className="details-left">
          <div className="details-poster">
            <img src={posterImage} alt={movie.name} className="details-poster-img" />
          </div>
          <div className="details-left-actions">
            {episodes.length > 0 ? (
              <button className="btn btn-primary" onClick={handlePlayFirstEpisode} style={{ justifyContent: 'center' }}>
                <Play size={18} fill="white" />
                Xem Ngay
              </button>
            ) : (
              <button className="btn btn-primary" disabled style={{ justifyContent: 'center', opacity: 0.5 }}>
                Chưa có tập phim
              </button>
            )}
            
            <button 
              className="btn btn-secondary" 
              onClick={handleWatchlistToggle}
              style={{ 
                justifyContent: 'center',
                borderColor: isInWatchlist ? '#ef4444' : '',
                color: isInWatchlist ? '#ef4444' : ''
              }}
            >
              {isInWatchlist ? (
                <>
                  <HeartOff size={18} />
                  Xóa khỏi yêu thích
                </>
              ) : (
                <>
                  <Heart size={18} />
                  Thêm vào yêu thích
                </>
              )}
            </button>
          </div>
        </div>

        <div className="details-right">
          <div className="details-title-row">
            <h1 className="details-main-title">{movie.name}</h1>
            <h2 className="details-sub-title">{movie.origin_name} ({movie.year})</h2>
          </div>

          <div className="details-meta-pills">
            {movie.quality && <span className="meta-pill" style={{ color: 'var(--accent-cyan)' }}>{movie.quality}</span>}
            {movie.lang && <span className="meta-pill">{movie.lang}</span>}
            {movie.time && <span className="meta-pill"><Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />{movie.time}</span>}
            {movie.episode_current && <span className="meta-pill" style={{ borderColor: 'var(--accent-purple)' }}>{movie.episode_current}</span>}
          </div>

          <div className="details-synopsis">
            <h3 className="synopsis-title">Nội dung phim</h3>
            <p className="synopsis-text">
              {movie.content ? movie.content.replace(/<[^>]*>/g, '') : 'Chưa có tóm tắt nội dung cho bộ phim này.'}
            </p>
          </div>

          <div className="details-info-grid">
            <div>
              <div className="info-item-label">
                <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Năm phát hành
              </div>
              <div className="info-item-value">{movie.year || 'N/A'}</div>
            </div>
            <div>
              <div className="info-item-label">
                <Globe size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Quốc gia
              </div>
              <div className="info-item-value">
                {movie.country?.map(c => c.name).join(', ') || 'N/A'}
              </div>
            </div>
            <div>
              <div className="info-item-label">
                <Tags size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Thể loại
              </div>
              <div className="info-item-value">
                {movie.category?.map(c => c.name).join(', ') || 'N/A'}
              </div>
            </div>
            <div>
              <div className="info-item-label">
                <Award size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Đạo diễn
              </div>
              <div className="info-item-value">
                {movie.director?.filter(d => d).join(', ') || 'N/A'}
              </div>
            </div>
          </div>

          {movie.actor && movie.actor.length > 0 && movie.actor[0] !== "" && (
            <div style={{ marginBottom: '30px' }}>
              <h3 className="synopsis-title">Diễn viên</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {movie.actor.map((actor, idx) => (
                  <span 
                    key={idx} 
                    style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-glass)',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Episode Section */}
          {episodes && episodes.length > 0 ? (
            <div className="episodes-section">
              <div className="episodes-title-row">
                <h3 className="episodes-header-title">Chọn Tập Phim</h3>
                
                {episodes.length > 1 && (
                  <select 
                    className="server-select"
                    value={selectedServerIndex}
                    onChange={(e) => setSelectedServerIndex(parseInt(e.target.value))}
                  >
                    {episodes.map((server, idx) => (
                      <option key={idx} value={idx}>
                        {server.server_name || `Server #${idx + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="episodes-grid">
                {episodes[selectedServerIndex]?.server_data.map((ep, idx) => (
                  <button 
                    key={idx} 
                    className="episode-btn"
                    onClick={() => handleEpisodeClick(ep.slug)}
                    title={ep.filename}
                  >
                    {ep.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="episodes-section" style={{ textAlign: 'center', padding: '30px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Phim đang cập nhật tập mới. Xin vui lòng quay lại sau!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Details;
