import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getMovieStreams, getSeriesStreams, getMovieDetails, getSeriesDetails } from '../api';
import { useAuth } from '../context/AuthContext';
import { addToHistory } from '../firebase/firestore';
import Loading from '../components/Loading';

function Watch() {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [streams, setStreams] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  
  // For series
  const season = parseInt(searchParams.get('season')) || 1;
  const episode = parseInt(searchParams.get('episode')) || 1;
  
  const isMovie = type === 'movie';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch details
        const detailsRes = isMovie 
          ? await getMovieDetails(id)
          : await getSeriesDetails(id);
        setItem(detailsRes.data?.data || detailsRes.data);
        
        // Fetch streams
        const streamsRes = isMovie
          ? await getMovieStreams(id)
          : await getSeriesStreams(id, season, episode);
        
        const streamData = streamsRes.data?.data || streamsRes.data || [];
        setStreams(Array.isArray(streamData) ? streamData : [streamData]);
        
        if (streamData.length > 0) {
          setSelectedQuality(streamData[0]);
        }
      } catch (err) {
        console.error('Error fetching streams:', err);
        setError('Failed to load video. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isMovie, season, episode]);

  // Auto-save to watch history when item loads
  useEffect(() => {
    const saveToHistory = async () => {
      if (isAuthenticated && user && item) {
        // API returns {developers, result, status} - actual data is in "result"
        const data = item.result || item;
        
        console.log('Data to save:', data); // Debug
        
        const historyItem = {
          id: id,
          title: data.title || data.name || 'Unknown',
          poster: data.image || data.poster || data.backdrop || data.poster_path || null,
          rating: data.rating || data.vote_average || null,
          year: data.year || 
                (data.diterbitkan ? data.diterbitkan.split('-')[0] : null) ||
                (data.release_date ? data.release_date.split('-')[0] : null) || 
                (data.first_air_date ? data.first_air_date.split('-')[0] : null) ||
                null
        };
        
        console.log('Saving to history:', historyItem);
        const result = await addToHistory(user.uid, historyItem, isMovie ? 'movie' : 'series');
        console.log('History save result:', result);
      }
    };
    
    saveToHistory();
  }, [item, isAuthenticated, user, isMovie, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link 
            to={`/${type}/${id}`}
            className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition inline-block"
          >
            Back to Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Player Area */}
        <div className="bg-black rounded-lg overflow-hidden aspect-video mb-8">
          {selectedQuality?.url || selectedQuality?.link ? (
            <iframe
              src={selectedQuality.url || selectedQuality.link}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-text-secondary">No streaming source available</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {item?.title}
            </h1>
            
            {!isMovie && (
              <p className="text-accent mb-4">
                Season {season} - Episode {episode}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-text-secondary mb-6">
              {item?.rating && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  {item.rating}
                </span>
              )}
              {item?.year && <span>{item.year}</span>}
              {item?.duration && <span>{item.duration}</span>}
            </div>

            {item?.synopsis && (
              <p className="text-text-secondary">{item.synopsis}</p>
            )}
          </div>

          {/* Quality Selection */}
          <div className="lg:w-72">
            <h3 className="text-lg font-semibold text-white mb-4">Server / Quality</h3>
            <div className="flex flex-wrap gap-2">
              {streams.map((stream, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedQuality(stream)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedQuality === stream
                      ? 'bg-accent text-white'
                      : 'bg-tertiary text-text-secondary hover:text-white'
                  }`}
                >
                  {stream.quality || stream.server || `Server ${index + 1}`}
                </button>
              ))}
            </div>

            {/* Back Button */}
            <Link
              to={`/${type}/${id}`}
              className="mt-6 block text-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
            >
              ← Back to Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Watch;
