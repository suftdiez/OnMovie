import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomListById, getCustomListItems, removeFromCustomList, updateCustomList } from '../firebase/firestore';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';

function ListDetail() {
  const { listId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    const fetchList = async () => {
      if (isAuthenticated && user && listId) {
        setLoading(true);
        
        const [listResult, itemsResult] = await Promise.all([
          getCustomListById(user.uid, listId),
          getCustomListItems(user.uid, listId)
        ]);
        
        if (listResult.success) {
          setList(listResult.list);
          setEditName(listResult.list.name);
          setEditDesc(listResult.list.description || '');
        } else {
          navigate('/lists');
        }
        
        if (itemsResult.success) {
          setItems(itemsResult.items);
        }
        
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchList();
  }, [user, isAuthenticated, listId, navigate]);

  const handleRemoveItem = async (itemId) => {
    const result = await removeFromCustomList(user.uid, listId, itemId);
    if (result.success) {
      setItems(items.filter(item => item.itemId !== itemId));
      setList(prev => ({ ...prev, itemCount: Math.max(0, (prev.itemCount || 1) - 1) }));
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    
    const result = await updateCustomList(user.uid, listId, {
      name: editName.trim(),
      description: editDesc.trim()
    });
    
    if (result.success) {
      setList(prev => ({ ...prev, name: editName.trim(), description: editDesc.trim() }));
      setIsEditing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-text-secondary mb-6">Please login to view this list</p>
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
          <Loading type="card" count={6} />
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">List Not Found</h2>
          <Link to="/lists" className="text-accent hover:underline">
            ← Back to My Lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/lists" className="text-text-secondary hover:text-white transition mb-4 inline-block">
            ← Back to My Lists
          </Link>
          
          {isEditing ? (
            <div className="bg-tertiary rounded-xl p-6">
              <div className="mb-4">
                <label className="block text-white font-medium mb-2">List Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition"
                  maxLength={50}
                />
              </div>
              <div className="mb-4">
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none"
                  maxLength={200}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{list.name}</h1>
                {list.description && (
                  <p className="text-text-secondary mt-2">{list.description}</p>
                )}
                <p className="text-text-secondary mt-2">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-text-secondary hover:text-white transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-16 bg-tertiary rounded-2xl">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">This List is Empty</h3>
            <p className="text-text-secondary mb-6">Browse movies or series and add them to this list</p>
            <Link
              to="/movies"
              className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg transition"
            >
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(item => (
              <div key={item.itemId} className="relative group">
                <MovieCard
                  movie={{
                    id: item.id,
                    slug: item.id,
                    title: item.title,
                    image: item.poster,
                    rating: item.rating,
                    year: item.year
                  }}
                  type={item.type}
                />
                <button
                  onClick={() => handleRemoveItem(item.itemId)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10"
                  title="Remove from list"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListDetail;
