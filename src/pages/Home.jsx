import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/HeroBanner';
import MovieSlider from '../components/MovieSlider';
import { fetchRecentMovies, fetchMovieList, fetchMovieDetails } from '../utils/api';

const Home = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [recentMovies, setRecentMovies] = useState([]);
  const [phimLe, setPhimLe] = useState([]);
  const [phimBo, setPhimBo] = useState([]);
  const [hoatHinh, setHoatHinh] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  
  const [loadingHero, setLoadingHero] = useState(true);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        // Load recent updates first to select featured movie
        const recentData = await fetchRecentMovies(1);
        if (!isMounted) return;
        
        const items = recentData.items || [];
        setRecentMovies(items);

        // If there are movies, pick the first one as featured and fetch its full details (for synopsis)
        if (items.length > 0) {
          setLoadingHero(true);
          const firstMovie = items[0];
          const details = await fetchMovieDetails(firstMovie.slug);
          if (isMounted && details.movie) {
            setFeaturedMovie(details.movie);
          } else if (isMounted) {
            setFeaturedMovie(firstMovie);
          }
          setLoadingHero(false);
        } else {
          setLoadingHero(false);
        }

        // Parallel load of lists
        const [leData, boData, animeData, tvData] = await Promise.all([
          fetchMovieList('phim-le', 1, { limit: 12 }),
          fetchMovieList('phim-bo', 1, { limit: 12 }),
          fetchMovieList('hoat-hinh', 1, { limit: 12 }),
          fetchMovieList('tv-shows', 1, { limit: 12 })
        ]);

        if (!isMounted) return;

        setPhimLe(leData.items || []);
        setPhimBo(boData.items || []);
        setHoatHinh(animeData.items || []);
        setTvShows(tvData.items || []);
        setLoadingLists(false);

      } catch (error) {
        console.error('Error loading home data:', error);
        if (isMounted) {
          setLoadingHero(false);
          setLoadingLists(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <HeroBanner movie={featuredMovie} loading={loadingHero} />
      
      <div style={{ marginTop: '-40px', position: 'relative', zIndex: 5 }}>
        <MovieSlider 
          title="Mới Cập Nhật" 
          movies={recentMovies} 
          loading={loadingLists} 
        />
        
        <MovieSlider 
          title="Phim Lẻ Hot" 
          movies={phimLe} 
          loading={loadingLists} 
          typeLink="phim-le" 
        />
        
        <MovieSlider 
          title="Phim Bộ Hay" 
          movies={phimBo} 
          loading={loadingLists} 
          typeLink="phim-bo" 
        />
        
        <MovieSlider 
          title="Hoạt Hình & Anime" 
          movies={hoatHinh} 
          loading={loadingLists} 
          typeLink="hoat-hinh" 
        />

        <MovieSlider 
          title="TV Shows" 
          movies={tvShows} 
          loading={loadingLists} 
          typeLink="tv-shows" 
        />
      </div>
    </div>
  );
};

export default Home;
