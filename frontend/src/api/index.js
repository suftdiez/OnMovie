import axios from 'axios';

const API_BASE = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Movies
export const getMovies = (page = 1) => api.get(`/movies/latest?page=${page}`);
export const getPopularMovies = (page = 1) => api.get(`/movies/popular?page=${page}`);
export const getRecentMovies = (page = 1) => api.get(`/movies/latest?page=${page}`);
export const getTopRatedMovies = (page = 1) => api.get(`/movies/top-rated?page=${page}`);
export const getUpcomingMovies = (page = 1) => api.get(`/movies/upcoming?page=${page}`);
export const getMovieDetails = (id) => api.get(`/movies/${id}/stream`);
export const getMovieStreams = (id) => api.get(`/movies/${id}/stream`);

// Series
export const getSeries = (page = 1) => api.get(`/series/popular?page=${page}`);
export const getPopularSeries = (page = 1) => api.get(`/series/popular?page=${page}`);
export const getRecentSeries = (page = 1) => api.get(`/series/popular?page=${page}`);
export const getTopRatedSeries = (page = 1) => api.get(`/series/popular?page=${page}`);
export const getSeriesDetails = (id) => api.get(`/series/${id}/stream`);
export const getSeriesStreams = (id) => api.get(`/series/${id}/stream`);

// Filters
export const getGenres = () => api.get('/movies/genres');
export const getMoviesByGenre = (genre, page = 1) => api.get(`/movies/genre/${genre}?page=${page}`);

// Series Filters
export const getSeriesGenres = () => api.get('/series/genres');
export const getSeriesByGenre = (genre, page = 1) => api.get(`/series/genre/${genre}?page=${page}`);

// Search
export const searchMovies = (query) => api.get(`/search?s=${encodeURIComponent(query)}`);

// ==================== NEW FEATURES ====================

// Trending
export const getTrendingMovies = (time = 'day') => api.get(`/trending/movies?time=${time}`);
export const getTrendingSeries = (time = 'day') => api.get(`/trending/series?time=${time}`);

// Credits (Cast & Crew)
export const getMovieCredits = (id) => api.get(`/movies/${id}/credits`);
export const getSeriesCredits = (id) => api.get(`/series/${id}/credits`);

// Similar & Recommendations
export const getSimilarMovies = (id) => api.get(`/movies/${id}/similar`);
export const getMovieRecommendations = (id) => api.get(`/movies/${id}/recommendations`);
export const getSimilarSeries = (id) => api.get(`/series/${id}/similar`);
export const getSeriesRecommendations = (id) => api.get(`/series/${id}/recommendations`);

// Person
export const getPersonDetails = (id) => api.get(`/person/${id}`);

export default api;
