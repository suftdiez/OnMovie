import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPopularMovies, getRecentMovies, getPopularSeries, getTrendingMovies, getTrendingSeries } from '../api';
import { mockMovies, mockSeries } from '../data/mockData';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

function Home() {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [popularRes, recentRes, seriesRes, trendingMoviesRes, trendingSeriesRes] = await Promise.all([
          getPopularMovies(),
          getRecentMovies(),
          getPopularSeries(),
          getTrendingMovies('day'),
          getTrendingSeries('day'),
        ]);

        // Handle API response format
        const popular = popularRes.data?.movies || popularRes.data?.results || [];
        const recent = recentRes.data?.movies || recentRes.data?.results || [];
        const series = seriesRes.data?.series || seriesRes.data?.results || [];
        const trendingMov = trendingMoviesRes.data?.movies || trendingMoviesRes.data?.results || [];
        const trendingSer = trendingSeriesRes.data?.series || trendingSeriesRes.data?.results || [];

        // Check if we got valid data
        if (popular.length > 0 || recent.length > 0 || series.length > 0) {
          setPopularMovies(popular.slice(0, 12));
          setRecentMovies(recent.slice(0, 12));
          setPopularSeries(series.slice(0, 12));
          setTrendingMovies(trendingMov.slice(0, 6));
          setTrendingSeries(trendingSer.slice(0, 6));
          
          // Use trending movie for featured if available
          if (trendingMov.length > 0) {
            setFeaturedMovie(trendingMov[0]);
          } else if (popular.length > 0) {
            setFeaturedMovie(popular[0]);
          }
          setUsingMockData(false);
        } else {
          useMockData();
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        useMockData();
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      setUsingMockData(true);
      setPopularMovies(mockMovies.slice(0, 6));
      setRecentMovies(mockMovies.slice(6, 12));
      setPopularSeries(mockSeries);
      setTrendingMovies(mockMovies.slice(0, 6));
      setTrendingSeries(mockSeries.slice(0, 6));
      setFeaturedMovie(mockMovies[0]);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <Loading type="hero" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Loading type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Demo Banner */}
      {usingMockData && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/30 py-2 text-center text-sm text-yellow-200">
          ⚠️ Demo Mode: Using sample data. Start the backend API for live content.
        </div>
      )}

      {/* Hero Section */}
      <Hero movie={featuredMovie} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        
        {/* 🔥 Trending Movies Section */}
        {trendingMovies.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Trending Movies
              </h2>
              <Link to="/movies" className="text-accent hover:text-accent-hover transition">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingMovies.map((movie, index) => (
                <MovieCard key={movie.id || movie.slug || index} movie={movie} type="movie" />
              ))}
            </div>
          </section>
        )}

        {/* 🔥 Trending Series Section */}
        {trendingSeries.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Trending Series
              </h2>
              <Link to="/series" className="text-accent hover:text-accent-hover transition">
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingSeries.map((series, index) => (
                <MovieCard key={series.id || series.slug || index} movie={series} type="series" />
              ))}
            </div>
          </section>
        )}

        {/* Popular Movies Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Popular Movies</h2>
            <Link to="/movies" className="text-accent hover:text-accent-hover transition">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popularMovies.map((movie, index) => (
              <MovieCard key={movie.id || movie.slug || index} movie={movie} type="movie" />
            ))}
          </div>
        </section>

        {/* Recent Movies Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Now Playing</h2>
            <Link to="/movies" className="text-accent hover:text-accent-hover transition">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recentMovies.map((movie, index) => (
              <MovieCard key={movie.id || movie.slug || index} movie={movie} type="movie" />
            ))}
          </div>
        </section>

        {/* Popular Series Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Popular Series</h2>
            <Link to="/series" className="text-accent hover:text-accent-hover transition">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popularSeries.map((series, index) => (
              <MovieCard key={series.id || series.slug || index} movie={series} type="series" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
