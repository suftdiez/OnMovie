import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserStats } from '../firebase/firestore';
import Loading from '../components/Loading';

function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ favorites: 0, watchlist: 0, history: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        
        // Fetch profile and stats in parallel
        const [profileRes, statsRes] = await Promise.all([
          getUserProfile(user.uid),
          getUserStats(user.uid)
        ]);
        
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        } else {
          // Use data from Google Auth if no profile exists
          setProfile({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            bio: '',
            favoriteGenre: '',
            location: ''
          });
        }
        
        if (statsRes.success) {
          setStats(statsRes.stats);
        }
        
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-text-secondary mb-6">Please login to view your profile</p>
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
        <div className="max-w-4xl mx-auto px-4">
          <Loading type="card" count={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-tertiary rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile?.photoURL || user?.photoURL || 'https://via.placeholder.com/120'}
                alt="Profile"
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-accent"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-tertiary"></div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {profile?.displayName || user?.displayName || 'Movie Lover'}
              </h1>
              <p className="text-text-secondary mb-3">{profile?.email || user?.email}</p>
              
              {profile?.bio && (
                <p className="text-white/80 mb-4 max-w-xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-text-secondary">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {profile.location}
                  </span>
                )}
                {profile?.favoriteGenre && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                    {profile.favoriteGenre}
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <Link
              to="/profile/edit"
              className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/favorites" className="bg-tertiary rounded-xl p-6 text-center hover:bg-white/10 transition group">
            <div className="text-3xl font-bold text-accent mb-1">{stats.favorites}</div>
            <div className="text-text-secondary group-hover:text-white transition">Favorites</div>
          </Link>
          <Link to="/watchlist" className="bg-tertiary rounded-xl p-6 text-center hover:bg-white/10 transition group">
            <div className="text-3xl font-bold text-blue-400 mb-1">{stats.watchlist}</div>
            <div className="text-text-secondary group-hover:text-white transition">Watchlist</div>
          </Link>
          <Link to="/history" className="bg-tertiary rounded-xl p-6 text-center hover:bg-white/10 transition group">
            <div className="text-3xl font-bold text-green-400 mb-1">{stats.history}</div>
            <div className="text-text-secondary group-hover:text-white transition">Watched</div>
          </Link>
          <div className="bg-tertiary rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.reviews}</div>
            <div className="text-text-secondary">Reviews</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-tertiary rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/movies"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">Browse Movies</div>
                <div className="text-text-secondary text-sm">Find your next movie</div>
              </div>
            </Link>
            <Link
              to="/series"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">Browse Series</div>
                <div className="text-text-secondary text-sm">Discover TV shows</div>
              </div>
            </Link>
            <Link
              to="/favorites"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-4 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">My Favorites</div>
                <div className="text-text-secondary text-sm">Movies you love</div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 bg-white/5 hover:bg-red-500/20 p-4 rounded-lg transition text-left"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">Logout</div>
                <div className="text-text-secondary text-sm">Sign out of account</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
