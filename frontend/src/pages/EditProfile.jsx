import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, initializeUserProfile } from '../firebase/firestore';
import Loading from '../components/Loading';

function EditProfile() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    favoriteGenre: ''
  });

  const genreOptions = [
    'Aksi', 'Petualangan', 'Animasi', 'Komedi', 'Kejahatan', 
    'Dokumenter', 'Drama', 'Keluarga', 'Fantasi', 'Sejarah',
    'Horor', 'Musik', 'Misteri', 'Romantis', 'Sci-Fi',
    'Thriller', 'Perang', 'Barat'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        
        // Initialize profile if first time
        await initializeUserProfile(user.uid, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        });
        
        // Fetch profile
        const profileRes = await getUserProfile(user.uid);
        
        if (profileRes.success && profileRes.data) {
          setFormData({
            displayName: profileRes.data.displayName || user.displayName || '',
            bio: profileRes.data.bio || '',
            location: profileRes.data.location || '',
            favoriteGenre: profileRes.data.favoriteGenre || ''
          });
        } else {
          setFormData({
            displayName: user.displayName || '',
            bio: '',
            location: '',
            favoriteGenre: ''
          });
        }
        
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, isAuthenticated]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name is required' });
      return;
    }
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    const result = await updateUserProfile(user.uid, {
      displayName: formData.displayName.trim(),
      bio: formData.bio.trim(),
      location: formData.location.trim(),
      favoriteGenre: formData.favoriteGenre
    });
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } else {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
    
    setSaving(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-text-secondary mb-6">Please login to edit your profile</p>
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
        <div className="max-w-2xl mx-auto px-4">
          <Loading type="card" count={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
          <Link
            to="/profile"
            className="text-text-secondary hover:text-white transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </Link>
        </div>

        {/* Profile Picture Preview */}
        <div className="bg-tertiary rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.photoURL || 'https://via.placeholder.com/80'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-accent"
            />
            <div>
              <p className="text-white font-medium">{user?.email}</p>
              <p className="text-text-secondary text-sm">Profile picture is synced with Google account</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-tertiary rounded-2xl p-6">
          {/* Message */}
          {message.text && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Display Name */}
          <div className="mb-6">
            <label htmlFor="displayName" className="block text-white font-medium mb-2">
              Display Name *
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Enter your display name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent transition"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label htmlFor="bio" className="block text-white font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent transition resize-none"
              maxLength={200}
            />
            <p className="text-text-secondary text-sm mt-1">{formData.bio.length}/200 characters</p>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label htmlFor="location" className="block text-white font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Jakarta, Indonesia"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent transition"
              maxLength={50}
            />
          </div>

          {/* Favorite Genre */}
          <div className="mb-8">
            <label htmlFor="favoriteGenre" className="block text-white font-medium mb-2">
              Favorite Genre
            </label>
            <select
              id="favoriteGenre"
              name="favoriteGenre"
              value={formData.favoriteGenre}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition"
            >
              <option value="" className="bg-secondary">Select a genre</option>
              {genreOptions.map(genre => (
                <option key={genre} value={genre} className="bg-secondary">{genre}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                saving
                  ? 'bg-accent/50 cursor-not-allowed'
                  : 'bg-accent hover:bg-accent-hover'
              } text-white`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
            <Link
              to="/profile"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
