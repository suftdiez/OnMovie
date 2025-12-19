import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../api';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { AnimatedCard } from '../components/AnimatedSection';

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await searchMovies(query);
        console.log('Search response:', response.data); // Debug log
        
        // Handle multiple possible response formats
        const data = response.data?.results || response.data?.data || response.data || [];
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error searching:', err);
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
          {query && (
            <p className="text-text-secondary">
              Results for: <span className="text-white">"{query}"</span>
            </p>
          )}
        </div>

        {/* No Query */}
        {!query && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-white mb-2">Search for Movies & Series</h2>
            <p className="text-text-secondary">Enter a title in the search bar above</p>
          </div>
        )}

        {/* Loading */}
        {loading && <Loading type="card" count={12} />}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-text-secondary">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && query && (
          <>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((item, index) => (
                  <AnimatedCard key={item.id} index={index}>
                    <MovieCard 
                      movie={item} 
                      type={item.type === 'series' ? 'series' : 'movie'} 
                    />
                  </AnimatedCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20.5c4.694 0 8.5-3.5 8.5-8.5S16.694 3.5 12 3.5 3.5 7 3.5 12s3.806 8.5 8.5 8.5z" />
                </svg>
                <h2 className="text-xl font-semibold text-white mb-2">No Results Found</h2>
                <p className="text-text-secondary">Try a different search term</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Search;
