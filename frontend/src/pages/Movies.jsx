import { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { getMovies, getPopularMovies, getRecentMovies, getTopRatedMovies, getMoviesByGenre } from '../api';
import { mockMovies } from '../data/mockData';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import AnimatedSection, { AnimatedCard } from '../components/AnimatedSection';

function Movies() {
  const { genre: genreId } = useParams(); // Get genre from URL if on /genres/:genre route
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'latest');
  const [totalPages, setTotalPages] = useState(1);
  const [genreName, setGenreName] = useState('');

  // Genre ID to name mapping
  const genreNames = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
    53: 'Thriller', 10752: 'War', 37: 'Western'
  };

  const filters = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'recent', label: 'Recent Release' },
    { value: 'top-rated', label: 'Top Rated' },
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        let response;
        
        // If we have a genreId, fetch movies by genre
        if (genreId) {
          response = await getMoviesByGenre(genreId, page);
          setGenreName(genreNames[parseInt(genreId)] || `Genre ${genreId}`);
        } else {
          // Otherwise use filter
          switch (filter) {
            case 'popular':
              response = await getPopularMovies(page);
              break;
            case 'recent':
              response = await getRecentMovies(page);
              break;
            case 'top-rated':
              response = await getTopRatedMovies(page);
              break;
            default:
              response = await getMovies(page);
          }
        }

        // Handle new API response format
        const data = response.data?.movies || response.data?.results || response.data?.data || [];
        const pages = response.data?.total_pages || 1;
        
        if (data.length > 0) {
          setMovies(data);
          setTotalPages(pages);
          setUsingMockData(false);
        } else {
          setMovies(mockMovies);
          setUsingMockData(true);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setMovies(mockMovies);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, filter, genreId]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setSearchParams({ filter: newFilter, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSearchParams({ filter, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-24 min-h-screen">
      {/* Demo Banner */}
      {usingMockData && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/30 py-2 text-center text-sm text-yellow-200 mb-4">
          ⚠️ Demo Mode: Using sample data.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {genreId ? `${genreName} Movies` : 'Movies'}
          </h1>
          
          {/* Filter Tabs - Only show when not filtering by genre */}
          {!genreId && (
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleFilterChange(f.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === f.value
                      ? 'bg-accent text-white'
                      : 'bg-tertiary text-text-secondary hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && <Loading type="card" count={12} />}

        {/* Movies Grid */}
        {!loading && (
          <>
            <AnimatedSection animation="fade-up">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie, index) => (
                  <AnimatedCard key={movie.id || movie.slug || index} index={index}>
                    <MovieCard movie={movie} type="movie" />
                  </AnimatedCard>
                ))}
              </div>
            </AnimatedSection>

            {/* Pagination */}
            {movies.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === 1
                      ? 'bg-tertiary text-text-secondary cursor-not-allowed'
                      : 'bg-accent text-white hover:bg-accent-hover'
                  }`}
                >
                  Previous
                </button>
                <span className="text-white font-medium">
                  Page {page} {totalPages > 1 && `of ${totalPages}`}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={usingMockData || page >= totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    usingMockData || page >= totalPages
                      ? 'bg-tertiary text-text-secondary cursor-not-allowed'
                      : 'bg-accent text-white hover:bg-accent-hover'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Movies;
