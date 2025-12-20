import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory, removeFromHistory, clearHistory } from '../firebase/firestore';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { AnimatedCard } from '../components/AnimatedSection';

function History() {
  const { user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        const data = await getHistory(user.uid);
        setHistory(data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, isAuthenticated]);

  const handleRemove = async (itemId, type) => {
    await removeFromHistory(user.uid, itemId, type);
    setHistory(history.filter(h => h.id !== itemId));
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all watch history?')) return;
    
    const result = await clearHistory(user.uid);
    if (result.success) {
      setHistory([]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-text-secondary mb-6">Please login to see your watch history</p>
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Watch History</h1>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
            >
              Clear All History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-secondary text-lg mb-4">No watch history yet</p>
            <Link to="/movies" className="text-accent hover:underline">
              Start watching movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {history.map((item, index) => (
              <AnimatedCard key={item.docId} index={index}>
                <div className="relative group">
                  <MovieCard movie={item} type={item.type} />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleRemove(item.id, item.type)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                      title="Remove from history"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {/* Watched badge - top left to not cover title */}
                  <div className="absolute top-2 left-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Watched
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
