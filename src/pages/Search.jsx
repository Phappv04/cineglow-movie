import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/SkeletonLoader';
import { searchMovies, fetchMovieList } from '../utils/api';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const GENRES = [
  { name: 'Tất cả thể loại', slug: '' },
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Tâm Lý', slug: 'tam-ly' }
];

const COUNTRIES = [
  { name: 'Tất cả quốc gia', slug: '' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Việt Nam', slug: 'viet-nam' },
  { name: 'Đài Loan', slug: 'dai-loan' }
];

const YEARS = [
  { name: 'Tất cả năm', slug: '' },
  { name: '2026', slug: '2026' },
  { name: '2025', slug: '2025' },
  { name: '2024', slug: '2024' },
  { name: '2023', slug: '2023' },
  { name: '2022', slug: '2022' },
  { name: '2020', slug: '2020' }
];

const Search = ({ query, type }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [title, setTitle] = useState('Tìm kiếm phim');

  // Filters state
  const [genre, setGenre] = useState('');
  const [country, setCountry] = useState('');
  const [year, setYear] = useState('');

  // Reset filters and page when path changes (e.g. search keyword or list type changes)
  useEffect(() => {
    setPage(1);
    setGenre('');
    setCountry('');
    setYear('');
  }, [query, type]);

  // Load movies on filter or page change
  useEffect(() => {
    let isMounted = true;
    const loadMovies = async () => {
      setLoading(true);
      try {
        let result;
        if (query) {
          setTitle(`Kết quả tìm kiếm: "${query}"`);
          result = await searchMovies(query, page);
        } else if (type) {
          // Map type slug to readable Vietnamese title
          const typeTitles = {
            'phim-le': 'Phim Lẻ',
            'phim-bo': 'Phim Bộ',
            'hoat-hinh': 'Phim Hoạt Hình',
            'tv-shows': 'TV Shows'
          };
          setTitle(typeTitles[type] || 'Danh sách phim');
          result = await fetchMovieList(type, page, { category: genre, country, year });
        } else {
          result = { items: [], pagination: { currentPage: 1, totalPages: 1 } };
        }

        if (isMounted) {
          setMovies(result.items || []);
          setPagination(result.pagination || { currentPage: 1, totalPages: 1 });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading search results:', err);
        if (isMounted) setLoading(false);
      }
    };

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, [query, type, page, genre, country, year]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <h1 className="search-page-title">{title}</h1>
        {!loading && (
          <p className="search-result-count">
            Tìm thấy {pagination.totalItems || movies.length} phim {query ? 'phù hợp' : ''}
          </p>
        )}
      </div>

      {/* Show filters only in Category List view (API limits filters in search) */}
      {type && (
        <div className="filters-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', color: 'var(--accent-purple)', fontWeight: 'bold' }}>
            <SlidersHorizontal size={18} />
            <span>Bộ lọc:</span>
          </div>

          <div className="filter-group">
            <label className="filter-label">Thể loại</label>
            <select 
              className="filter-select" 
              value={genre} 
              onChange={(e) => { setGenre(e.target.value); setPage(1); }}
            >
              {GENRES.map(g => (
                <option key={g.slug} value={g.slug}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Quốc gia</label>
            <select 
              className="filter-select" 
              value={country} 
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
            >
              {COUNTRIES.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Năm</label>
            <select 
              className="filter-select" 
              value={year} 
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
            >
              {YEARS.map(y => (
                <option key={y.slug} value={y.slug}>{y.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Results grid */}
      {loading ? (
        <MovieGridSkeleton count={12} />
      ) : movies.length > 0 ? (
        <div className="results-grid">
          {movies.map((movie) => (
            <MovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Không tìm thấy phim nào khớp với điều kiện lọc.
        </div>
      )}

      {/* Pagination component */}
      {!loading && pagination.totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="pagination-info">
            Trang <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{page}</span> / {pagination.totalPages}
          </div>

          <button 
            className="pagination-btn"
            disabled={page === pagination.totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
