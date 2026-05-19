import React from 'react';
import { Play, Info, Calendar, Sparkles } from 'lucide-react';
import { getImageUrl } from '../utils/api';
import { HeroSkeleton } from './SkeletonLoader';

const HeroBanner = ({ movie, loading }) => {
  if (loading) return <HeroSkeleton />;
  if (!movie) return null;

  const handlePlayClick = () => {
    // Navigate to play page for this movie
    window.location.hash = `#/watch/${movie.slug}`;
  };

  const handleDetailsClick = () => {
    window.location.hash = `#/detail/${movie.slug}`;
  };

  const posterImage = getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div className="hero-banner">
      <div className="hero-backdrop">
        <img 
          src={posterImage} 
          alt={movie.name} 
          className="hero-backdrop-img"
        />
        <div className="hero-overlay-left"></div>
        <div className="hero-overlay-bottom"></div>
      </div>

      <div className="hero-content">
        <div className="hero-tag">
          <Sparkles size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'text-top' }} />
          Đề Cử Hôm Nay
        </div>
        
        <h1 className="hero-title">{movie.name}</h1>
        
        <div className="hero-meta">
          <span className="hero-meta-item">
            <Calendar size={14} />
            {movie.year || '2026'}
          </span>
          <span className="meta-badge badge-quality">FHD</span>
          <span className="meta-badge badge-lang">Vietsub</span>
          {movie.episode_current && (
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {movie.episode_current}
            </span>
          )}
        </div>

        <p className="hero-desc">
          {movie.content || movie.origin_name || 'Khám phá bộ phim hấp dẫn với chất lượng hình ảnh sắc nét, âm thanh sống động và tốc độ tải cực nhanh tại nền tảng của chúng tôi.'}
        </p>

        <div className="hero-actions">
          <button className="btn btn-primary" onClick={handlePlayClick}>
            <Play size={18} fill="white" />
            Xem Ngay
          </button>
          <button className="btn btn-secondary" onClick={handleDetailsClick}>
            <Info size={18} />
            Thông Tin Chi Tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
