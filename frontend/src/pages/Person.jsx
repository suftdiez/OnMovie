import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPersonDetails } from '../api';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

function Person() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPersonDetails(id);
        const data = response.data?.result || response.data;
        setPerson(data);
      } catch (err) {
        console.error('Error fetching person:', err);
        setError('Failed to load person details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPerson();
    }
  }, [id]);

  const calculateAge = (birthday, deathday = null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const monthDiff = end.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <Loading type="detail" />
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Person Not Found</h2>
          <p className="text-text-secondary mb-6">{error || 'Could not load person details'}</p>
          <Link to="/" className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const age = calculateAge(person.birthday, person.deathday);
  const bioPreview = person.biography?.slice(0, 500);
  const hasLongBio = person.biography?.length > 500;

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Person Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {person.profile ? (
              <img
                src={person.profile}
                alt={person.name}
                className="w-64 h-80 object-cover rounded-2xl shadow-xl"
              />
            ) : (
              <div className="w-64 h-80 bg-tertiary rounded-2xl flex items-center justify-center">
                <svg className="w-24 h-24 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>

          {/* Person Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{person.name}</h1>
            
            {/* Known For */}
            {person.known_for && (
              <p className="text-accent text-lg mb-4">{person.known_for}</p>
            )}

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {person.birthday && (
                <div className="bg-tertiary rounded-lg p-4">
                  <p className="text-text-secondary text-sm">Birthday</p>
                  <p className="text-white font-medium">
                    {formatDate(person.birthday)}
                    {age && !person.deathday && ` (${age} years old)`}
                  </p>
                </div>
              )}
              
              {person.deathday && (
                <div className="bg-tertiary rounded-lg p-4">
                  <p className="text-text-secondary text-sm">Died</p>
                  <p className="text-white font-medium">
                    {formatDate(person.deathday)}
                    {age && ` (aged ${age})`}
                  </p>
                </div>
              )}
              
              {person.place_of_birth && (
                <div className="bg-tertiary rounded-lg p-4 sm:col-span-2">
                  <p className="text-text-secondary text-sm">Place of Birth</p>
                  <p className="text-white font-medium">{person.place_of_birth}</p>
                </div>
              )}
            </div>

            {/* Biography */}
            {person.biography && person.biography !== "No biography available" && (
              <div>
                <h2 className="text-xl font-bold text-white mb-3">Biography</h2>
                <p className="text-text-secondary leading-relaxed">
                  {showFullBio ? person.biography : bioPreview}
                  {hasLongBio && !showFullBio && '...'}
                </p>
                {hasLongBio && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-accent hover:underline mt-2"
                  >
                    {showFullBio ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Movies */}
        {person.movies && person.movies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {person.movies.map((movie, index) => (
                <MovieCard key={movie.id || index} movie={movie} type="movie" />
              ))}
            </div>
          </section>
        )}

        {/* TV Shows */}
        {person.tvShows && person.tvShows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">TV Shows</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {person.tvShows.map((show, index) => (
                <MovieCard key={show.id || index} movie={show} type="series" />
              ))}
            </div>
          </section>
        )}

        {/* No Credits */}
        {(!person.movies || person.movies.length === 0) && 
         (!person.tvShows || person.tvShows.length === 0) && (
          <div className="text-center py-12 bg-tertiary rounded-2xl">
            <p className="text-text-secondary">No filmography available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Person;
