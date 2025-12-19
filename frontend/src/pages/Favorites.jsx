import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFavorites, removeFromFavorites } from '../firebase/firestore';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        const data = await getFavorites(user.uid);
        setFavorites(data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, isAuthenticated]);

  const handleRemove = async (itemId, type) => {
    await removeFromFavorites(user.uid, itemId, type);
    setFavorites(favorites.filter(f => f.id !== itemId));
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-text-secondary mb-6">Please login to see your favorites</p>
          <Link to="/" className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <Loading type="card" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Favorites</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-lg mb-4">No favorites yet</p>
            <Link to="/movies" className="text-accent hover:underline">
              Browse movies to add favorites
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map((item) => (
              <div key={item.docId} className="relative group">
                <MovieCard movie={item} type={item.type} />
                <button
                  onClick={() => handleRemove(item.id, item.type)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from favorites"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
