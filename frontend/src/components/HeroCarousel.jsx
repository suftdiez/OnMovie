import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

function HeroCarousel({ movies }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-slide every 6 seconds
  const nextSlide = useCallback(() => {
    if (isTransitioning || !movies || movies.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setTimeout(() => setIsTransitioning(false), 700);
  }, [movies, isTransitioning]);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, movies]);

  // Go to specific slide
  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  if (!movies || movies.length === 0) return null;

  const movie = movies[currentIndex];

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Images - All slides */}
      {movies.map((m, index) => (
        <div
          key={m.id || index}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out ${
            index === currentIndex 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          }`}
          style={{
            backgroundImage: `url(${m.backdrop || m.poster || m.thumbnail || ''})`,
            zIndex: index === currentIndex ? 1 : 0
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 hero-gradient z-[2]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 gradient-overlay z-[2]" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Title with slide animation */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
              }`}
            >
              {movie.title}
            </h1>

            {/* Meta Info */}
            <div 
              className={`flex flex-wrap items-center gap-4 text-white/80 mb-6 transition-all duration-500 delay-100 ${
                isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
              }`}
            >
              {movie.rating && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{movie.rating}</span>
                </span>
              )}
              {movie.year && <span>{movie.year}</span>}
              {movie.duration && <span>{movie.duration}</span>}
              {movie.quality && (
                <span className="bg-blue-600 px-2 py-0.5 rounded text-sm font-medium">
                  {movie.quality}
                </span>
              )}
            </div>

            {/* Description */}
            {movie.synopsis && (
              <p 
                className={`text-white/70 text-lg mb-8 line-clamp-3 transition-all duration-500 delay-150 ${
                  isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
                }`}
              >
                {movie.synopsis}
              </p>
            )}

            {/* Buttons */}
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-500 delay-200 ${
                isTransitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0'
              }`}
            >
              <Link
                to={`/watch/movie/${movie.id}`}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </Link>
              <Link
                to={`/movie/${movie.id}`}
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-lg transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dot Indicators */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-accent w-8 h-3'
                  : 'bg-white/50 hover:bg-white/80 w-3 h-3'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HeroCarousel;
