import React, { useEffect, useState } from 'react';
import { Play, Tv, ArrowLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { fetchMovieDetails } from '../utils/api';
import HlsPlayer from '../components/HlsPlayer';
import { useAuth } from '../context/AuthContext';

const Player = ({ slug, episodeSlug }) => {
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverIndex, setServerIndex] = useState(0);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [playerType, setPlayerType] = useState('direct'); // 'direct' (Hls) or 'embed' (Iframe)

  // Get server index from URL query param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sIdx = parseInt(urlParams.get('server')) || 0;
    setServerIndex(sIdx);
  }, [slug, episodeSlug, window.location.search]);

  // Load details
  useEffect(() => {
    let isMounted = true;
    const loadPlayer = async () => {
      setLoading(true);
      try {
        const result = await fetchMovieDetails(slug);
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading details for player:', err);
        if (isMounted) setLoading(false);
      }
    };
    loadPlayer();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Resolve current active episode
  useEffect(() => {
    if (!data || !data.episodes || data.episodes.length === 0) return;
    const server = data.episodes[serverIndex] || data.episodes[0];
    if (!server || !server.server_data || server.server_data.length === 0) return;

    let targetEp = null;
    if (episodeSlug) {
      targetEp = server.server_data.find(ep => ep.slug === episodeSlug);
    }
    
    // Default to first episode if not found
    if (!targetEp) {
      targetEp = server.server_data[0];
    }

    setActiveEpisode(targetEp);

    // Save to Watch History
    saveToHistory(data.movie, targetEp, serverIndex);
  }, [data, serverIndex, episodeSlug, user]); // Reload when user log in state changes

  const saveToHistory = async (movie, episode, sIndex) => {
    if (!movie || !episode) return;
    
    if (user) {
      try {
        await fetchWithAuth('http://localhost:8080/api/watch/history', {
          method: 'POST',
          body: JSON.stringify({
            movieSlug: movie.slug,
            movieName: movie.name,
            posterPath: movie.poster_url || movie.thumb_url,
            lastEpisodeName: episode.name,
            lastEpisodeSlug: episode.slug,
            progressSeconds: 0.0
          })
        });
      } catch (e) {
        console.error('Error saving history to server:', e);
      }
    } else {
      try {
        let history = JSON.parse(localStorage.getItem('watch_history') || '[]');
        
        // Remove existing item to put the new one at the top
        history = history.filter(item => item._id !== movie._id);

        history.unshift({
          _id: movie._id,
          name: movie.name,
          slug: movie.slug,
          origin_name: movie.origin_name,
          poster_url: movie.poster_url,
          thumb_url: movie.thumb_url,
          year: movie.year,
          lastEpisode: {
            name: episode.name,
            slug: episode.slug,
            serverIndex: sIndex
          },
          watchedAt: new Date().getTime()
        });

        // Limit history to 20 items
        if (history.length > 20) {
          history = history.slice(0, 20);
        }

        localStorage.setItem('watch_history', JSON.stringify(history));
      } catch (e) {
        console.error('Error saving history locally:', e);
      }
    }
  };

  const handleEpisodeChange = (epSlug) => {
    window.history.pushState(null, '', `/watch/${slug}/${epSlug}?server=${serverIndex}`);
  };

  const handleBackToDetails = () => {
    window.history.pushState(null, '', `/detail/${slug}`);
  };

  const handleNextEpisode = () => {
    if (!data || !data.episodes || !activeEpisode) return;
    const server = data.episodes[serverIndex] || data.episodes[0];
    const currentIndex = server.server_data.findIndex(ep => ep.slug === activeEpisode.slug);
    if (currentIndex !== -1 && currentIndex + 1 < server.server_data.length) {
      const nextEp = server.server_data[currentIndex + 1];
      handleEpisodeChange(nextEp.slug);
    }
  };

  const hasNextEpisode = () => {
    if (!data || !data.episodes || !activeEpisode) return false;
    const server = data.episodes[serverIndex] || data.episodes[0];
    const currentIndex = server.server_data.findIndex(ep => ep.slug === activeEpisode.slug);
    return currentIndex !== -1 && currentIndex + 1 < server.server_data.length;
  };

  if (loading) {
    return (
      <div className="player-page-container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ height: '30px', width: '50%', marginTop: '20px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '340px', height: '500px', borderRadius: '12px' }}></div>
      </div>
    );
  }

  if (!data || !data.movie || !activeEpisode) {
    return (
      <div className="player-page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '16px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Không tìm thấy tập phim hoặc máy chủ phù hợp.</p>
        <button className="btn btn-secondary" onClick={handleBackToDetails}>
          <ArrowLeft size={16} /> Quay lại chi tiết
        </button>
      </div>
    );
  }

  const { movie, episodes } = data;
  const currentServer = episodes[serverIndex] || episodes[0];

  return (
    <div className="player-page-container">
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <span style={{ cursor: 'pointer', hover: { color: 'white' } }} onClick={() => window.history.pushState(null, '', '/')}>Trang chủ</span>
        <ChevronRight size={14} />
        <span style={{ cursor: 'pointer' }} onClick={handleBackToDetails}>{movie.name}</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--accent-cyan)' }}>{activeEpisode.name}</span>
      </div>

      <div className="player-layout">
        <div className="player-main-area">
          {/* Video Box Container */}
          <div className="player-wrapper">
            {playerType === 'direct' ? (
              <HlsPlayer 
                src={activeEpisode.link_m3u8} 
                movieSlug={slug}
                episodeSlug={activeEpisode.slug}
              />
            ) : (
              <iframe 
                src={activeEpisode.link_embed} 
                className="iframe-player"
                allowFullScreen
                title={activeEpisode.name}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            )}
          </div>

          {/* Player Toggle Bar */}
          <div className="player-controls-toggle">
            <div className="toggle-switch-container">
              <button 
                className={`btn-toggle-player ${playerType === 'direct' ? 'active' : ''}`}
                onClick={() => setPlayerType('direct')}
              >
                Trình phát Direct HLS (Khuyên dùng)
              </button>
              <button 
                className={`btn-toggle-player ${playerType === 'embed' ? 'active' : ''}`}
                onClick={() => setPlayerType('embed')}
              >
                Trình phát Embed (Dự phòng)
              </button>
            </div>
            
            {hasNextEpisode() && (
              <button className="btn btn-primary" onClick={handleNextEpisode} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem' }}>
                Tập Tiếp
              </button>
            )}
          </div>

          {/* Informational Warning / Tips */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '12px 16px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              borderLeft: '4px solid var(--accent-cyan)'
            }}
          >
            <HelpCircle size={16} color="var(--accent-cyan)" />
            <span>Mẹo: Nếu trình phát Direct HLS bị giật hoặc tải chậm, vui lòng chuyển qua **Trình phát Embed (Dự phòng)** để xem bằng link nhúng của máy chủ gốc.</span>
          </div>

          {/* Movie Details Summary */}
          <div className="player-movie-info">
            <h1 className="player-movie-title">{movie.name}</h1>
            <p className="player-episode-title">{activeEpisode.name} • Server: {currentServer.server_name}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {movie.content ? movie.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : movie.origin_name}
            </p>
          </div>
        </div>

        {/* Sidebar episode selection */}
        <div className="player-sidebar">
          <div className="sidebar-title">Danh sách tập phim</div>
          
          {episodes.length > 1 && (
            <select 
              className="server-select"
              value={serverIndex}
              onChange={(e) => window.history.pushState(null, '', `/watch/${slug}/${activeEpisode.slug}?server=${e.target.value}`)}
              style={{ width: '100%' }}
            >
              {episodes.map((server, idx) => (
                <option key={idx} value={idx}>
                  {server.server_name}
                </option>
              ))}
            </select>
          )}

          <div className="sidebar-episodes-grid">
            {currentServer.server_data.map((ep, idx) => (
              <button
                key={idx}
                className={`episode-btn ${ep.slug === activeEpisode.slug ? 'active' : ''}`}
                onClick={() => handleEpisodeChange(ep.slug)}
                title={ep.filename}
                style={{ width: '100%', minWidth: '60px' }}
              >
                {ep.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
