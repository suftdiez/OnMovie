import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGenres } from '../api';
import Loading from '../components/Loading';

function Genres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await getGenres();
        // API returns genres in results array
        const data = response.data?.results || response.data?.genres || response.data?.data || response.data || [];
        setGenres(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genres');
        // Use fallback genres on error
        setGenres(fallbackGenres);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Fallback genres with TMDB IDs
  const fallbackGenres = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];

  const displayGenres = genres.length > 0 ? genres : fallbackGenres;

  const getGenreColor = (index) => {
    const colors = [
      'from-red-600 to-red-800',
      'from-blue-600 to-blue-800',
      'from-green-600 to-green-800',
      'from-purple-600 to-purple-800',
      'from-yellow-600 to-yellow-800',
      'from-pink-600 to-pink-800',
      'from-indigo-600 to-indigo-800',
      'from-teal-600 to-teal-800',
      'from-orange-600 to-orange-800',
      'from-cyan-600 to-cyan-800',
    ];
    return colors[index % colors.length];
  };

  const getGenreIcon = (genreName) => {
    const icons = {
      'Action': '💥',
      'Adventure': '🗺️',
      'Animation': '🎨',
      'Comedy': '😂',
      'Crime': '🔪',
      'Documentary': '📹',
      'Drama': '🎭',
      'Family': '👨‍👩‍👧‍👦',
      'Fantasy': '🧙',
      'History': '📜',
      'Horror': '👻',
      'Music': '🎵',
      'Mystery': '🔍',
      'Romance': '❤️',
      'Science Fiction': '🚀',
      'Thriller': '😱',
      'War': '⚔️',
      'Western': '🤠'
    };
    return icons[genreName] || '🎬';
  };

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Genres</h1>
          <p className="text-text-secondary">Browse movies and series by genre</p>
        </div>

        {/* Loading */}
        {loading && <Loading />}

        {/* Error */}
        {error && displayGenres.length === 0 && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Genres Grid */}
        {!loading && displayGenres.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayGenres.map((genre, index) => {
              const genreName = genre.name || genre;
              const genreId = genre.id || index;
              
              return (
                <Link
                  key={genreId}
                  to={`/genres/${genreId}`}
                  className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${getGenreColor(index)} p-4 flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl hover:shadow-black/30`}
                >
                  <span className="text-white font-semibold text-center">
                    {genreName}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Genres;

