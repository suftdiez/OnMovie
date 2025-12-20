import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMovieDetails, getSeriesDetails, getMovieCredits, getSeriesCredits, getSimilarMovies, getSimilarSeries, getMovieRecommendations, getSeriesRecommendations } from '../api';
import { mockMovies, mockSeries } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { addToFavorites, removeFromFavorites, isInFavorites, addToWatchlist, removeFromWatchlist, isInWatchlist } from '../firebase/firestore';
import Loading from '../components/Loading';
import CastCard from '../components/CastCard';
import MovieCard from '../components/MovieCard';
import ReviewSection from '../components/ReviewSection';

function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Determine type from URL
  const isMovie = type === 'movie' || window.location.pathname.startsWith('/movie/');
  const isSeries = type === 'series' || window.location.pathname.startsWith('/series/');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch main details
        const response = isMovie 
          ? await getMovieDetails(id)
          : await getSeriesDetails(id);
        
        const data = response.data?.result || response.data?.data || response.data;
        if (data && Object.keys(data).length > 0) {
          setItem(data);
          setUsingMockData(false);
          
          // Fetch additional data in parallel
          try {
            const [creditsRes, similarRes, recsRes] = await Promise.all([
              isMovie ? getMovieCredits(id) : getSeriesCredits(id),
              isMovie ? getSimilarMovies(id) : getSimilarSeries(id),
              isMovie ? getMovieRecommendations(id) : getSeriesRecommendations(id)
            ]);
            
            setCast(creditsRes.data?.cast || []);
            setCrew(creditsRes.data?.crew || []);
            setSimilar(isMovie ? (similarRes.data?.movies || []) : (similarRes.data?.series || []));
            setRecommendations(isMovie ? (recsRes.data?.movies || []) : (recsRes.data?.series || []));
          } catch (additionalErr) {
            console.error('Error fetching additional data:', additionalErr);
          }
        } else {
          useMockData();
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        useMockData();
      } finally {
        setLoading(false);
      }
    };

    const useMockData = () => {
      // Find item in mock data by id
      const sourceData = isSeries ? mockSeries : mockMovies;
      const found = sourceData.find(m => m.id === id);
      if (found) {
        setItem(found);
        setUsingMockData(true);
      } else {
        // Use first item as fallback
        setItem(sourceData[0]);
        setUsingMockData(true);
      }
    };

    fetchDetails();
  }, [id, isMovie, isSeries]);

  // Check if item is in favorites/watchlist
  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && user && id) {
        const contentType = isSeries ? 'series' : 'movie';
        const favStatus = await isInFavorites(user.uid, id, contentType);
        const watchStatus = await isInWatchlist(user.uid, id, contentType);
        setIsFavorite(favStatus);
        setIsWatchlisted(watchStatus);
      }
    };
    checkStatus();
  }, [id, user, isAuthenticated, isSeries]);

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }
    const contentType = isSeries ? 'series' : 'movie';
    try {
      if (isFavorite) {
        const result = await removeFromFavorites(user.uid, id, contentType);
        if (result.success) {
          setIsFavorite(false);
        } else {
          console.error('Remove favorite failed:', result.error);
          alert('Failed to remove from favorites: ' + (result.error?.message || 'Unknown error'));
        }
      } else {
        console.log('Adding to favorites:', { userId: user.uid, item, contentType });
        const result = await addToFavorites(user.uid, item, contentType);
        if (result.success) {
          setIsFavorite(true);
        } else {
          console.error('Add favorite failed:', result.error);
          alert('Failed to add to favorites: ' + (result.error?.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Favorite error:', error);
      alert('Error: ' + error.message);
    }
  };

  // Toggle watchlist
  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      alert('Please login to add to watchlist');
      return;
    }
    const contentType = isSeries ? 'series' : 'movie';
    try {
      if (isWatchlisted) {
        const result = await removeFromWatchlist(user.uid, id, contentType);
        if (result.success) {
          setIsWatchlisted(false);
        } else {
          console.error('Remove watchlist failed:', result.error);
          alert('Failed to remove from watchlist: ' + (result.error?.message || 'Unknown error'));
        }
      } else {
        console.log('Adding to watchlist:', { userId: user.uid, item, contentType });
        const result = await addToWatchlist(user.uid, item, contentType);
        if (result.success) {
          setIsWatchlisted(true);
        } else {
          console.error('Add watchlist failed:', result.error);
          alert('Failed to add to watchlist: ' + (result.error?.message || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Watchlist error:', error);
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <Loading type="detail" />;
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Not Found</h2>
          <p className="text-text-secondary mb-6">Content not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const contentType = isSeries ? 'series' : 'movie';

  return (
    <div className="min-h-screen">
      {/* Demo Banner */}
      {usingMockData && (
        <div className="bg-yellow-600/20 border-b border-yellow-600/30 py-2 text-center text-sm text-yellow-200">
          ⚠️ Demo Mode: Using sample data.
        </div>
      )}

      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${item.backdrop || item.poster || item.image || item.thumbnail || ''})`,
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 gradient-overlay" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={item.poster || item.image || item.thumbnail || 'https://via.placeholder.com/300x450/252525/666666?text=No+Image'}
              alt={item.title}
              className="w-64 rounded-lg shadow-2xl mx-auto md:mx-0"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x450/252525/666666?text=No+Image';
              }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {item.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
              {item.rating && (
                <span className="flex items-center gap-1 bg-yellow-600/20 px-3 py-1 rounded">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{item.rating}</span>
                </span>
              )}
              {(item.year || item.diterbitkan) && (
                <span className="bg-white/10 px-3 py-1 rounded">{item.year || item.diterbitkan?.split('-')[0]}</span>
              )}
              {item.duration && (
                <span className="bg-white/10 px-3 py-1 rounded">{item.duration}</span>
              )}
              {item.quality && (
                <span className="bg-blue-600 px-3 py-1 rounded font-medium">
                  {item.quality}
                </span>
              )}
            </div>

            {/* Genres */}
            {item.genres && (
              <div className="flex flex-wrap gap-2 mb-6">
                {(typeof item.genres === 'string' ? item.genres.split(', ') : item.genres).map((genre, index) => (
                  <span 
                    key={index}
                    className="bg-tertiary text-text-secondary px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {item.synopsis && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                <p className="text-text-secondary leading-relaxed">{item.synopsis}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to={`/watch/${contentType}/${id}`}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
              
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isFavorite ? 'Favorited' : 'Favorite'}
              </button>

              {/* Watchlist Button */}
              <button
                onClick={handleToggleWatchlist}
                className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors ${
                  isWatchlisted 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <svg className="w-5 h-5" fill={isWatchlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isWatchlisted ? 'In Watchlist' : 'Watchlist'}
              </button>
            </div>

            {/* Additional Info */}
            {(item.director || item.country || crew.length > 0) && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {crew.filter(p => p.job === 'Director').length > 0 && (
                    <div>
                      <span className="text-text-secondary">Director: </span>
                      <span className="text-white">
                        {crew.filter(p => p.job === 'Director').map(p => p.name).join(', ')}
                      </span>
                    </div>
                  )}
                  {item.country && (
                    <div>
                      <span className="text-text-secondary">Country: </span>
                      <span className="text-white">{item.country}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {cast.map((person) => (
                <CastCard key={person.id} person={person} />
              ))}
            </div>
          </section>
        )}

        {/* Similar Section */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Similar {isMovie ? 'Movies' : 'Series'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.slice(0, 6).map((item, index) => (
                <MovieCard key={item.id || index} movie={item} type={contentType} />
              ))}
            </div>
          </section>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <section className="mt-12 pb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Recommendations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.slice(0, 6).map((item, index) => (
                <MovieCard key={item.id || index} movie={item} type={contentType} />
              ))}
            </div>
          </section>
        )}

        {/* User Reviews Section */}
        <ReviewSection 
          itemId={id} 
          itemTitle={item?.title || item?.name || 'Unknown'} 
          type={contentType} 
        />
      </div>
    </div>
  );
}

export default Detail;
