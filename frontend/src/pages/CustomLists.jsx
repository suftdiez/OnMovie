import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomLists, createCustomList, deleteCustomList } from '../firebase/firestore';
import Loading from '../components/Loading';

function CustomLists() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        const result = await getCustomLists(user.uid);
        if (result.success) {
          setLists(result.lists);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchLists();
  }, [user, isAuthenticated]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    setCreating(true);
    const result = await createCustomList(user.uid, newListName, newListDesc);
    if (result.success) {
      // Refresh lists
      const listsResult = await getCustomLists(user.uid);
      if (listsResult.success) {
        setLists(listsResult.lists);
      }
      setNewListName('');
      setNewListDesc('');
      setShowCreateModal(false);
    }
    setCreating(false);
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    
    const result = await deleteCustomList(user.uid, listId);
    if (result.success) {
      setLists(lists.filter(l => l.id !== listId));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-text-secondary mb-6">Please login to view your custom lists</p>
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
        <div className="max-w-6xl mx-auto px-4">
          <Loading type="card" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Lists</h1>
            <p className="text-text-secondary mt-1">Create custom collections of movies and series</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New List
          </button>
        </div>

        {/* Lists Grid */}
        {lists.length === 0 ? (
          <div className="text-center py-16 bg-tertiary rounded-2xl">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">No Lists Yet</h3>
            <p className="text-text-secondary mb-6">Create your first custom list to organize your movies</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition"
            >
              Create List
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <div
                key={list.id}
                className="bg-tertiary rounded-xl p-6 hover:bg-white/10 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Link to={`/lists/${list.id}`} className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-accent transition">
                      {list.name}
                    </h3>
                    {list.description && (
                      <p className="text-text-secondary text-sm mt-1 line-clamp-2">{list.description}</p>
                    )}
                  </Link>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="text-text-secondary hover:text-red-400 transition p-1"
                    title="Delete list"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <Link to={`/lists/${list.id}`} className="block">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      {list.itemCount || 0} {list.itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="text-accent group-hover:translate-x-1 transition-transform">
                      View →
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-secondary rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-6">Create New List</h2>
              <form onSubmit={handleCreateList}>
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">List Name *</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Weekend Watch, Horror Favorites"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent transition"
                    maxLength={50}
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Description (optional)</label>
                  <textarea
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    placeholder="What's this list about?"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent transition resize-none"
                    maxLength={200}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating || !newListName.trim()}
                    className={`flex-1 py-3 rounded-lg font-medium transition ${
                      creating || !newListName.trim()
                        ? 'bg-accent/50 cursor-not-allowed'
                        : 'bg-accent hover:bg-accent-hover'
                    } text-white`}
                  >
                    {creating ? 'Creating...' : 'Create List'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomLists;
