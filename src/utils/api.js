import { API_BASE_URL } from '../config';

const API_DOMAINS = [
  'https://phimapi.com',
  'https://ophim1.com'
];

/**
 * Normalizes image URLs from the API.
 * Some API endpoints return full URLs, while others return relative paths (e.g. upload/vod/...).
 */
export const getImageUrl = (url) => {
  if (!url) return 'https://placehold.co/300x450/111116/ffffff?text=No+Poster';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Ensure the relative path does not have double leading slashes
  const path = url.startsWith('/') ? url.slice(1) : url;
  return `https://phimimg.com/${path}`;
};

/**
 * Helper to fetch from primary and fall back to secondary mirrors on error.
 */
const fetchWithFallback = async (subPath, options = {}) => {
  let lastError = null;
  for (const domain of API_DOMAINS) {
    try {
      const response = await fetch(`${domain}${subPath}`, options);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.warn(`API Mirror Failover Warning: Failed to fetch from ${domain}${subPath}:`, error.message);
      lastError = error;
    }
  }
  throw lastError || new Error('All API mirrors failed to respond');
};

/**
 * Fetch newly updated movies (phim-moi-cap-nhat).
 * This endpoint has items directly at the root.
 */
export const fetchRecentMovies = async (page = 1) => {
  try {
    const response = await fetchWithFallback(`/danh-sach/phim-moi-cap-nhat?page=${page}`);
    const data = await response.json();
    return {
      items: data.items || [],
      pagination: data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItemsPerPage: 10,
        totalItems: 0
      }
    };
  } catch (error) {
    console.error('Error fetching recent movies from all mirrors:', error);
    return { items: [], pagination: { currentPage: 1, totalPages: 1 } };
  }
};

/**
 * Fetch movie list by list type (phim-le, phim-bo, hoat-hinh, tv-shows).
 * Uses the V1 API endpoint where items are nested under data.items.
 */
export const fetchMovieList = async (type, page = 1, options = {}) => {
  try {
    let subPath = `/v1/api/danh-sach/${type}?page=${page}`;
    
    // Add additional query filters if provided
    const params = new URLSearchParams();
    if (options.category) params.append('category', options.category);
    if (options.country) params.append('country', options.country);
    if (options.year) params.append('year', options.year);
    if (options.limit) params.append('limit', options.limit);
    
    const queryString = params.toString();
    if (queryString) {
      subPath += `&${queryString}`;
    }

    const response = await fetchWithFallback(subPath);
    const resJson = await response.json();
    
    // Check nested response structure in V1 API
    const data = resJson.data || {};
    return {
      items: data.items || [],
      pagination: data.params?.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItemsPerPage: 24,
        totalItems: 0
      },
      titlePage: resJson.titlePage || data.titlePage || 'Danh sách phim'
    };
  } catch (error) {
    console.error(`Error fetching movie list for ${type} from all mirrors:`, error);
    return { items: [], pagination: { currentPage: page, totalPages: 1 }, titlePage: '' };
  }
};

/**
 * Fetch detailed movie information and episode links.
 * Returns movie metadata and episodes array.
 */
export const fetchMovieDetails = async (slug) => {
  try {
    // 1. Try local custom movies endpoint first
    try {
      const localRes = await fetch(`${API_BASE_URL}/api/public/custom-movies/${slug}`);
      if (localRes.ok) {
        const localData = await localRes.json();
        return {
          movie: localData.movie || null,
          episodes: localData.episodes || []
        };
      }
    } catch (localError) {
      console.log('Local custom movie API is offline or slug not found, falling back to mirrors...');
    }

    // 2. Fallback to mirror API
    const response = await fetchWithFallback(`/phim/${slug}`);
    const data = await response.json();
    return {
      movie: data.movie || null,
      episodes: data.episodes || []
    };
  } catch (error) {
    console.error(`Error fetching movie details for ${slug} from all mirrors:`, error);
    return { movie: null, episodes: [] };
  }
};

/**
 * Search movies by keyword.
 * Uses the V1 API search endpoint.
 */
export const searchMovies = async (keyword, page = 1) => {
  try {
    let localItems = [];
    if (page === 1) {
      try {
        const localRes = await fetch(`${API_BASE_URL}/api/public/custom-movies/search?keyword=${encodeURIComponent(keyword)}`);
        if (localRes.ok) {
          const localData = await localRes.json();
          localItems = localData.map(movie => ({
            _id: "custom-" + movie.id,
            name: movie.name,
            slug: movie.slug,
            origin_name: movie.originName,
            poster_url: movie.posterUrl,
            thumb_url: movie.thumbUrl,
            year: movie.year,
            quality: movie.quality,
            lang: movie.lang
          }));
        }
      } catch (localError) {
        console.log("Local custom movies search offline or failed:", localError.message);
      }
    }

    const response = await fetchWithFallback(
      `/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`
    );
    const resJson = await response.json();
    const data = resJson.data || {};
    const mirrorItems = data.items || [];
    
    // Combine items: local items first!
    const combinedItems = [...localItems, ...mirrorItems];

    return {
      items: combinedItems,
      pagination: data.params?.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItemsPerPage: 24,
        totalItems: combinedItems.length
      }
    };
  } catch (error) {
    console.error(`Error searching movies for keyword "${keyword}" from all mirrors:`, error);
    return { items: [], pagination: { currentPage: page, totalPages: 1 } };
  }
};

/**
 * Fetch all local custom movies uploaded by administrator.
 */
export const fetchCustomMovies = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/custom-movies`);
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.log("Local custom movies API is offline:", error.message);
  }
  return [];
};
