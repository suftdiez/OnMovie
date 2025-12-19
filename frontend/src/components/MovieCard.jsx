import { Link } from 'react-router-dom';

function MovieCard({ movie, type = 'movie' }) {
  // Use slug if id is not available (new API format)
  const movieId = movie.id || movie.slug;
  const linkPath = type === 'series' 
    ? `/series/${movieId}` 
    : `/movie/${movieId}`;

  // Handle different image field names
  const posterUrl = movie.poster || movie.thumbnail || movie.image || movie.img;

  return (
    <Link to={linkPath} className="movie-card block group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-tertiary">
        {/* Poster Image */}
        <img
          src={posterUrl || 'https://via.placeholder.com/300x450/252525/666666?text=No+Image'}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450/252525/666666?text=No+Image';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        {(movie.rating || movie.imdb) && (
          <div className="absolute top-2 right-2 bg-accent px-2 py-1 rounded text-xs font-bold">
            ⭐ {movie.rating || movie.imdb}
          </div>
        )}

        {/* Quality Badge */}
        {movie.quality && (
          <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded text-xs font-bold">
            {movie.quality}
          </div>
        )}
        
        {/* Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-accent/90 rounded-full p-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Title and Info */}
      <div className="mt-3">
        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-accent transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-text-secondary text-xs">
          {movie.year && <span>{movie.year}</span>}
          {movie.duration && (
            <>
              <span>•</span>
              <span>{movie.duration}</span>
            </>
          )}
          {movie.genre && !movie.year && (
            <span>{movie.genre}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;
