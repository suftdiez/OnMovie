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
        const data = response.data?.data || response.data || [];
        setGenres(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('Failed to load genres');
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Fallback genres if API doesn't return any
  const fallbackGenres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
    'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi',
    'Thriller', 'War', 'Western'
  ];

  const displayGenres = genres.length > 0 ? genres : fallbackGenres.map(g => ({ name: g, slug: g.toLowerCase() }));

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
    ];
    return colors[index % colors.length];
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
        {error && (
          <div className="text-center py-12">
            <p className="text-text-secondary">{error}</p>
          </div>
        )}

        {/* Genres Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayGenres.map((genre, index) => {
              const genreName = typeof genre === 'string' ? genre : genre.name;
              const genreSlug = typeof genre === 'string' ? genre.toLowerCase() : (genre.slug || genre.name?.toLowerCase());
              
              return (
                <Link
                  key={genreSlug || index}
                  to={`/genres/${genreSlug}`}
                  className={`relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${getGenreColor(index)} p-4 flex items-center justify-center transition-transform hover:scale-105 hover:shadow-xl`}
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
