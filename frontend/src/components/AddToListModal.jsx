import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomLists, createCustomList, addToCustomList, isInCustomList } from '../firebase/firestore';

function AddToListModal({ isOpen, onClose, item, type = 'movie' }) {
  const { user, isAuthenticated } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedToLists, setAddedToLists] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      if (isOpen && isAuthenticated && user) {
        setLoading(true);
        const result = await getCustomLists(user.uid);
        if (result.success) {
          setLists(result.lists);
          
          // Check which lists already contain this item
          const checks = {};
          for (const list of result.lists) {
            const inList = await isInCustomList(user.uid, list.id, item.id, type);
            checks[list.id] = inList;
          }
          setAddedToLists(checks);
        }
        setLoading(false);
      }
    };

    fetchLists();
  }, [isOpen, user, isAuthenticated, item, type]);

  const handleAddToList = async (listId) => {
    const result = await addToCustomList(user.uid, listId, item, type);
    if (result.success) {
      setAddedToLists(prev => ({ ...prev, [listId]: true }));
      // Update item count in local state
      setLists(lists.map(l => 
        l.id === listId ? { ...l, itemCount: (l.itemCount || 0) + 1 } : l
      ));
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    setCreating(true);
    const createResult = await createCustomList(user.uid, newListName);
    if (createResult.success) {
      await addToCustomList(user.uid, createResult.listId, item, type);
      
      // Refresh lists
      const result = await getCustomLists(user.uid);
      if (result.success) {
        setLists(result.lists);
        setAddedToLists(prev => ({ ...prev, [createResult.listId]: true }));
      }
      
      setNewListName('');
      setShowCreateForm(false);
    }
    setCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-secondary rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add to List</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item Preview */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-lg">
          <img
            src={item.image || item.poster || 'https://via.placeholder.com/60x90'}
            alt={item.title}
            className="w-12 h-18 object-cover rounded"
          />
          <div>
            <p className="text-white font-medium line-clamp-1">{item.title || item.name}</p>
            <p className="text-text-secondary text-sm capitalize">{type}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Lists */}
            <div className="space-y-2 mb-4">
              {lists.length === 0 ? (
                <p className="text-text-secondary text-center py-4">No lists yet. Create one below!</p>
              ) : (
                lists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => !addedToLists[list.id] && handleAddToList(list.id)}
                    disabled={addedToLists[list.id]}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                      addedToLists[list.id]
                        ? 'bg-green-500/20 cursor-default'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-white font-medium">{list.name}</p>
                      <p className="text-text-secondary text-sm">
                        {list.itemCount || 0} {list.itemCount === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                    {addedToLists[list.id] ? (
                      <span className="text-green-400 flex items-center gap-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Added
                      </span>
                    ) : (
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create New List */}
            {showCreateForm ? (
              <form onSubmit={handleCreateAndAdd} className="border-t border-white/10 pt-4">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="New list name..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-accent transition mb-3"
                  maxLength={50}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={creating || !newListName.trim()}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      creating || !newListName.trim()
                        ? 'bg-accent/50 cursor-not-allowed'
                        : 'bg-accent hover:bg-accent-hover'
                    } text-white`}
                  >
                    {creating ? 'Creating...' : 'Create & Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-3 border-2 border-dashed border-white/20 hover:border-accent text-text-secondary hover:text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New List
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AddToListModal;
