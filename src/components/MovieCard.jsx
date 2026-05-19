import React from 'react';
import { getImageUrl } from '../utils/api';

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const handleClick = () => {
    window.history.pushState(null, '', `/detail/${movie.slug}`);
  };

  // Safe checks for badges
  const quality = movie.quality || 'FHD';
  const lang = movie.lang || movie.language || 'Vietsub';
  const year = movie.year || '';
  const currentEpisode = movie.episode_current || '';

  const decodeHtml = (text) => {
    if (!text) return '';
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.documentElement.textContent || text;
  };

  return (
    <div className="movie-card" onClick={handleClick}>
      <div className="card-img-container">
        <img 
          src={getImageUrl(movie.poster_url || movie.thumb_url)} 
          alt={decodeHtml(movie.name)} 
          className="card-img"
          loading="lazy"
        />
        <div className="card-badges">
          {quality && <span className="badge-top badge-quality">{quality}</span>}
          {lang && <span className="badge-top badge-lang">{lang.replace(' + ', '/')}</span>}
        </div>
        <div className="card-overlay">
          {currentEpisode && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              {currentEpisode}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{year}</span>
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title" title={decodeHtml(movie.name)}>{decodeHtml(movie.name)}</h3>
        <div className="card-subinfo">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {decodeHtml(movie.origin_name)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
