import { Link } from 'react-router-dom';

function CastCard({ person }) {
  return (
    <Link 
      to={`/person/${person.id}`}
      className="flex-shrink-0 w-28 group"
    >
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-tertiary mb-2">
        {person.profile ? (
          <img
            src={person.profile}
            alt={person.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <h4 className="text-white text-sm font-medium truncate text-center group-hover:text-accent transition">
        {person.name}
      </h4>
      {person.character && (
        <p className="text-text-secondary text-xs truncate text-center">
          {person.character}
        </p>
      )}
      {person.job && (
        <p className="text-accent text-xs truncate text-center">
          {person.job}
        </p>
      )}
    </Link>
  );
}

export default CastCard;
