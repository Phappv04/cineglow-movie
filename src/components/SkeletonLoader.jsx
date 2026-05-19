import React from 'react';

export const MovieCardSkeleton = () => {
  return (
    <div className="movie-card" style={{ cursor: 'default', border: 'none', boxShadow: 'none' }}>
      <div className="card-img-container skeleton" style={{ aspectRatio: '2/3' }}></div>
      <div className="card-info" style={{ padding: '12px 0 0 0' }}>
        <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ height: '12px', width: '50%' }}></div>
      </div>
    </div>
  );
};

export const HeroSkeleton = () => {
  return (
    <div className="hero-banner" style={{ borderBottom: '1px solid var(--border-glass)' }}>
      <div className="hero-content" style={{ width: '100%' }}>
        <div className="skeleton" style={{ height: '24px', width: '120px', borderRadius: '20px', marginBottom: '16px' }}></div>
        <div className="skeleton" style={{ height: '50px', width: '70%', marginBottom: '16px' }}></div>
        <div className="skeleton" style={{ height: '18px', width: '40%', marginBottom: '24px' }}></div>
        <div className="skeleton" style={{ height: '100px', width: '100%', marginBottom: '28px' }}></div>
        <div className="hero-actions">
          <div className="skeleton" style={{ height: '45px', width: '140px', borderRadius: '12px' }}></div>
          <div className="skeleton" style={{ height: '45px', width: '140px', borderRadius: '12px' }}></div>
        </div>
      </div>
    </div>
  );
};

export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="results-grid">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const MovieSliderSkeleton = ({ count = 6 }) => {
  return (
    <div className="slider-track" style={{ overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
};
