import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

function TrendingCarousel({ items, type, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Number of items to show at once
  const itemsPerView = 6;
  const totalSlides = Math.ceil(items.length / itemsPerView);
  
  // Auto-slide every 5 seconds
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [totalSlides, isTransitioning]);

  useEffect(() => {
    if (items.length <= itemsPerView) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, items.length]);

  // Go to specific slide
  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (!items || items.length === 0) return null;

  // Get visible items for current slide
  const getVisibleItems = () => {
    const start = currentIndex * itemsPerView;
    return items.slice(start, start + itemsPerView);
  };

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <Link
          to={type === 'movie' ? '/movies' : '/series'}
          className="text-accent hover:text-accent-hover transition-colors text-sm"
        >
          View All →
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-500 ease-in-out ${
            isTransitioning ? 'opacity-80' : 'opacity-100'
          }`}
          style={{
            transform: `translateX(-${currentIndex * 0}%)`,
          }}
        >
          {getVisibleItems().map((item) => (
            <div
              key={item.id}
              className="transform transition-transform duration-300 hover:scale-105"
            >
              <MovieCard movie={item} type={type} />
            </div>
          ))}
        </div>
      </div>

      {/* Dot Indicators */}
      {totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-accent w-8'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default TrendingCarousel;
