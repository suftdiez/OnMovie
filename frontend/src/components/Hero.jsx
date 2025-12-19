import { Link } from 'react-router-dom';

function Hero({ movie }) {
  if (!movie) return null;

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${movie.poster || movie.thumbnail || ''})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-32 gradient-overlay" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {movie.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
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
              <p className="text-white/70 text-lg mb-8 line-clamp-3">
                {movie.synopsis}
              </p>
            )}
            
            {/* Buttons */}
            <div className="flex flex-wrap gap-4">
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
    </div>
  );
}

export default Hero;
