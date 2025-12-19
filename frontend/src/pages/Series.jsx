import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSeries, getPopularSeries, getRecentSeries, getTopRatedSeries } from '../api';
import { mockSeries } from '../data/mockData';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import AnimatedSection, { AnimatedCard } from '../components/AnimatedSection';

function Series() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'latest');

  const filters = [
    { value: 'latest', label: 'Latest' },
    { value: 'popular', label: 'Popular' },
    { value: 'recent', label: 'Recent Release' },
    { value: 'top-rated', label: 'Top Rated' },
  ];

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        setLoading(true);
        let response;
        
        switch (filter) {
          case 'popular':
            response = await getPopularSeries(page);
            break;
          case 'recent':
            response = await getRecentSeries(page);
            break;
          case 'top-rated':
            response = await getTopRatedSeries(page);
            break;
          default:
            response = await getSeries(page);
        }

        const data = response.data?.data || response.data || [];
        
        if (data.length > 0) {
          setSeries(data);
          setUsingMockData(false);
        } else {
          setSeries(mockSeries);
          setUsingMockData(true);
        }
      } catch (err) {
        console.error('Error fetching series:', err);
        setSeries(mockSeries);
        setUsingMockData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [page, filter]);

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
          <h1 className="text-3xl font-bold text-white mb-4">Series</h1>
          
          {/* Filter Tabs */}
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
        </div>

        {/* Loading State */}
        {loading && <Loading type="card" count={12} />}

        {/* Series Grid */}
        {!loading && (
          <>
            <AnimatedSection animation="fade-up">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {series.map((item, index) => (
                  <AnimatedCard key={item.id || index} index={index}>
                    <MovieCard movie={item} type="series" />
                  </AnimatedCard>
                ))}
              </div>
            </AnimatedSection>

            {/* Pagination */}
            {series.length > 0 && !usingMockData && (
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
                <span className="text-white font-medium">Page {page}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  className="px-4 py-2 rounded-lg font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
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

export default Series;
