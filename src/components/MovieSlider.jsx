import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { MovieSliderSkeleton } from './SkeletonLoader';

const MovieSlider = ({ title, movies, loading, typeLink }) => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.75 
        : scrollLeft + clientWidth * 0.75;
      
      sliderRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const handleSeeAll = () => {
    if (typeLink) {
      window.history.pushState(null, '', `/list/${typeLink}`);
    }
  };

  return (
    <section className="movie-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {typeLink && (
          <button 
            onClick={handleSeeAll} 
            style={{ 
              fontSize: '0.85rem', 
              color: 'var(--accent-cyan)', 
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Xem tất cả
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="slider-container" style={{ position: 'relative' }}>
        {movies && movies.length > 0 && (
          <>
            <button 
              className="glass-panel" 
              onClick={() => scroll('left')}
              style={{
                position: 'absolute',
                left: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
              }}
            >
              <ChevronLeft size={24} />
            </button>

            <button 
              className="glass-panel" 
              onClick={() => scroll('right')}
              style={{
                position: 'absolute',
                right: '-20px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {loading ? (
          <MovieSliderSkeleton />
        ) : (
          <div className="slider-track" ref={sliderRef}>
            {movies && movies.length > 0 ? (
              movies.map((movie) => (
                <MovieCard key={movie._id || movie.slug} movie={movie} />
              ))
            ) : (
              <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                Không tìm thấy phim nào.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default MovieSlider;
