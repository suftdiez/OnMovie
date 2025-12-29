// Firestore Service for Favorites and Watchlist
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./config";

// ==================== FAVORITES ====================

// Add movie/series to favorites
export const addToFavorites = async (userId, item, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "favorites", `${type}_${item.id}`);
    
    // Extract year from various possible fields
    const year = item.year || 
                 (item.release_date ? item.release_date.split('-')[0] : null) ||
                 (item.first_air_date ? item.first_air_date.split('-')[0] : null) ||
                 (item.diterbitkan ? item.diterbitkan.split('-')[0] : null) ||
                 null;
    
    // Build data object, excluding undefined values
    const data = {
      id: item.id,
      title: item.title || item.name || 'Unknown',
      poster: item.poster || item.poster_path || item.images || item.image || null,
      rating: item.rating || item.vote_average || null,
      year: year,
      type: type,
      addedAt: serverTimestamp()
    };
    
    await setDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return { success: false, error };
  }
};

// Remove from favorites
export const removeFromFavorites = async (userId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "favorites", `${type}_${itemId}`);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return { success: false, error };
  }
};

// Get all favorites
export const getFavorites = async (userId) => {
  try {
    const q = query(
      collection(db, "users", userId, "favorites"),
      orderBy("addedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
};

// Check if item is in favorites
export const isInFavorites = async (userId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "favorites", `${type}_${itemId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking favorites:", error);
    return false;
  }
};

// ==================== WATCHLIST ====================

// Add to watchlist
export const addToWatchlist = async (userId, item, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "watchlist", `${type}_${item.id}`);
    
    // Extract year from various possible fields
    const year = item.year || 
                 (item.release_date ? item.release_date.split('-')[0] : null) ||
                 (item.first_air_date ? item.first_air_date.split('-')[0] : null) ||
                 (item.diterbitkan ? item.diterbitkan.split('-')[0] : null) ||
                 null;
    
    // Build data object, excluding undefined values
    const data = {
      id: item.id,
      title: item.title || item.name || 'Unknown',
      poster: item.poster || item.poster_path || item.images || item.image || null,
      rating: item.rating || item.vote_average || null,
      year: year,
      type: type,
      addedAt: serverTimestamp()
    };
    
    await setDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return { success: false, error };
  }
};

// Remove from watchlist
export const removeFromWatchlist = async (userId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "watchlist", `${type}_${itemId}`);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return { success: false, error };
  }
};

// Get all watchlist
export const getWatchlist = async (userId) => {
  try {
    const q = query(
      collection(db, "users", userId, "watchlist"),
      orderBy("addedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting watchlist:", error);
    return [];
  }
};

// Check if item is in watchlist
export const isInWatchlist = async (userId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "watchlist", `${type}_${itemId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking watchlist:", error);
    return false;
  }
};

// ==================== REVIEWS & RATINGS ====================

// Add or update a review
export const addReview = async (userId, itemId, type, reviewData) => {
  try {
    // Save to reviews collection (global - all reviews for a movie)
    const reviewDocRef = doc(db, "reviews", `${type}_${itemId}`, "userReviews", userId);
    
    const data = {
      userId,
      userName: reviewData.userName || 'Anonymous',
      userPhoto: reviewData.userPhoto || null,
      rating: reviewData.rating, // 1-10
      review: reviewData.review || '',
      itemId,
      itemTitle: reviewData.itemTitle || '',
      type,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(reviewDocRef, data);
    
    // Also save to user's reviews subcollection
    const userReviewRef = doc(db, "users", userId, "reviews", `${type}_${itemId}`);
    await setDoc(userReviewRef, data);
    
    return { success: true };
  } catch (error) {
    console.error("Error adding review:", error);
    return { success: false, error };
  }
};

// Get all reviews for a movie/series
export const getReviews = async (itemId, type = "movie") => {
  try {
    const reviewsRef = collection(db, "reviews", `${type}_${itemId}`, "userReviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting reviews:", error);
    return [];
  }
};

// Get user's review for a specific item
export const getUserReview = async (userId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "reviews", `${type}_${itemId}`, "userReviews", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { exists: true, data: docSnap.data() };
    }
    return { exists: false, data: null };
  } catch (error) {
    console.error("Error getting user review:", error);
    return { exists: false, data: null };
  }
};

// Update a review
export const updateReview = async (userId, itemId, type, reviewData) => {
  try {
    const reviewDocRef = doc(db, "reviews", `${type}_${itemId}`, "userReviews", userId);
    const userReviewRef = doc(db, "users", userId, "reviews", `${type}_${itemId}`);
    
    const updates = {
      rating: reviewData.rating,
      review: reviewData.review || '',
      updatedAt: serverTimestamp()
    };
    
    await setDoc(reviewDocRef, updates, { merge: true });
    await setDoc(userReviewRef, updates, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating review:", error);
    return { success: false, error };
  }
};

// Delete a review
export const deleteReview = async (userId, itemId, type = "movie") => {
  try {
    const reviewDocRef = doc(db, "reviews", `${type}_${itemId}`, "userReviews", userId);
    const userReviewRef = doc(db, "users", userId, "reviews", `${type}_${itemId}`);
    
    await deleteDoc(reviewDocRef);
    await deleteDoc(userReviewRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error };
  }
};

// Get average rating for a movie/series
export const getAverageRating = async (itemId, type = "movie") => {
  try {
    const reviews = await getReviews(itemId, type);
    if (reviews.length === 0) return { average: 0, count: 0 };
    
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = sum / reviews.length;
    
    return { average: parseFloat(average.toFixed(1)), count: reviews.length };
  } catch (error) {
    console.error("Error calculating average rating:", error);
    return { average: 0, count: 0 };
  }
};

// Get all reviews by a user
export const getUserReviews = async (userId) => {
  try {
    const reviewsRef = collection(db, "users", userId, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting user reviews:", error);
    return [];
  }
};

// ==================== REVIEW LIKES ====================

// Like a review
export const likeReview = async (reviewId, itemId, itemType, likerId, reviewAuthorId) => {
  try {
    // Store like in a global reviews collection for easier querying
    const likeRef = doc(db, "reviewLikes", `${reviewId}_${likerId}`);
    
    await setDoc(likeRef, {
      reviewId,
      itemId,
      itemType,
      likerId,
      reviewAuthorId,
      likedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error liking review:", error);
    return { success: false, error };
  }
};

// Unlike a review
export const unlikeReview = async (reviewId, likerId) => {
  try {
    const likeRef = doc(db, "reviewLikes", `${reviewId}_${likerId}`);
    await deleteDoc(likeRef);
    return { success: true };
  } catch (error) {
    console.error("Error unliking review:", error);
    return { success: false, error };
  }
};

// Get like count for a review
export const getReviewLikesCount = async (reviewId) => {
  try {
    const likesRef = collection(db, "reviewLikes");
    const q = query(likesRef, orderBy("likedAt", "desc"));
    const snapshot = await getDocs(q);
    
    // Filter by reviewId
    const likes = snapshot.docs.filter(doc => doc.data().reviewId === reviewId);
    return likes.length;
  } catch (error) {
    console.error("Error getting review likes count:", error);
    return 0;
  }
};

// Check if user has liked a review
export const hasUserLikedReview = async (reviewId, userId) => {
  try {
    const likeRef = doc(db, "reviewLikes", `${reviewId}_${userId}`);
    const docSnap = await getDoc(likeRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking review like:", error);
    return false;
  }
};

// Get all likes for reviews on a specific item (movie/series)
export const getItemReviewLikes = async (itemId, itemType) => {
  try {
    const likesRef = collection(db, "reviewLikes");
    const snapshot = await getDocs(likesRef);
    
    // Group likes by reviewId
    const likesMap = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.itemId === itemId && data.itemType === itemType) {
        if (!likesMap[data.reviewId]) {
          likesMap[data.reviewId] = { count: 0, likers: [] };
        }
        likesMap[data.reviewId].count++;
        likesMap[data.reviewId].likers.push(data.likerId);
      }
    });
    
    return likesMap;
  } catch (error) {
    console.error("Error getting item review likes:", error);
    return {};
  }
};

// ==================== WATCH HISTORY ====================

// Add to watch history
export const addToHistory = async (userId, item, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "history", `${type}_${item.id}`);
    
    // Extract year from various possible fields
    const year = item.year || 
                 (item.release_date ? item.release_date.split('-')[0] : null) ||
                 (item.first_air_date ? item.first_air_date.split('-')[0] : null) ||
                 null;
    
    const data = {
      id: item.id,
      title: item.title || item.name || 'Unknown',
      poster: item.poster || item.poster_path || item.images || item.image || null,
      rating: item.rating || item.vote_average || null,
      year: year,
      type: type,
      watchedAt: serverTimestamp()
    };
    
    await setDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error("Error adding to history:", error);
    return { success: false, error };
  }
};

// Get watch history
export const getHistory = async (userId) => {
  try {
    const historyRef = collection(db, "users", userId, "history");
    const q = query(historyRef, orderBy("watchedAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

// Remove from history
export const removeFromHistory = async (userId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "history", `${type}_${itemId}`);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error("Error removing from history:", error);
    return { success: false, error };
  }
};

// Clear all history
export const clearHistory = async (userId) => {
  try {
    const historyRef = collection(db, "users", userId, "history");
    const snapshot = await getDocs(historyRef);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return { success: true };
  } catch (error) {
    console.error("Error clearing history:", error);
    return { success: false, error };
  }
};

// Check if item is in history
export const isInHistory = async (userId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "history", `${type}_${itemId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking history:", error);
    return false;
  }
};

// ==================== USER PROFILE ====================

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId, "profile", "data");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error("Error getting profile:", error);
    return { success: false, error };
  }
};

// Create or update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const docRef = doc(db, "users", userId, "profile", "data");
    
    await setDoc(docRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error };
  }
};

// Initialize user profile on first login
export const initializeUserProfile = async (userId, userData) => {
  try {
    const docRef = doc(db, "users", userId, "profile", "data");
    const docSnap = await getDoc(docRef);
    
    // Only create if doesn't exist
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        displayName: userData.displayName || '',
        email: userData.email || '',
        photoURL: userData.photoURL || '',
        bio: '',
        favoriteGenre: '',
        location: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error initializing profile:", error);
    return { success: false, error };
  }
};

// Get user stats (favorites count, watchlist count, reviews count, history count)
export const getUserStats = async (userId) => {
  try {
    const favoritesRef = collection(db, "users", userId, "favorites");
    const watchlistRef = collection(db, "users", userId, "watchlist");
    const historyRef = collection(db, "users", userId, "history");
    const reviewsRef = collection(db, "users", userId, "reviews");
    
    const [favSnap, watchSnap, histSnap, revSnap] = await Promise.all([
      getDocs(favoritesRef),
      getDocs(watchlistRef),
      getDocs(historyRef),
      getDocs(reviewsRef)
    ]);
    
    return {
      success: true,
      stats: {
        favorites: favSnap.size,
        watchlist: watchSnap.size,
        history: histSnap.size,
        reviews: revSnap.size
      }
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return { success: false, error, stats: { favorites: 0, watchlist: 0, history: 0, reviews: 0 } };
  }
};

// ==================== CUSTOM LISTS ====================

// Create a new custom list
export const createCustomList = async (userId, listName, description = '') => {
  try {
    const listId = `list_${Date.now()}`;
    const docRef = doc(db, "users", userId, "customLists", listId);
    
    await setDoc(docRef, {
      id: listId,
      name: listName.trim(),
      description: description.trim(),
      itemCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, listId };
  } catch (error) {
    console.error("Error creating custom list:", error);
    return { success: false, error };
  }
};

// Get all custom lists for a user
export const getCustomLists = async (userId) => {
  try {
    const listsRef = collection(db, "users", userId, "customLists");
    const q = query(listsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const lists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, lists };
  } catch (error) {
    console.error("Error getting custom lists:", error);
    return { success: false, error, lists: [] };
  }
};

// Get a specific custom list by ID
export const getCustomListById = async (userId, listId) => {
  try {
    const docRef = doc(db, "users", userId, "customLists", listId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, list: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'List not found' };
    }
  } catch (error) {
    console.error("Error getting custom list:", error);
    return { success: false, error };
  }
};

// Update a custom list
export const updateCustomList = async (userId, listId, data) => {
  try {
    const docRef = doc(db, "users", userId, "customLists", listId);
    
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating custom list:", error);
    return { success: false, error };
  }
};

// Delete a custom list and all its items
export const deleteCustomList = async (userId, listId) => {
  try {
    // Delete all items in the list first
    const itemsRef = collection(db, "users", userId, "customLists", listId, "items");
    const itemsSnap = await getDocs(itemsRef);
    const deletePromises = itemsSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete the list itself
    const docRef = doc(db, "users", userId, "customLists", listId);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting custom list:", error);
    return { success: false, error };
  }
};

// Add item to a custom list
export const addToCustomList = async (userId, listId, item, type = "movie") => {
  try {
    const itemId = `${type}_${item.id}`;
    const itemRef = doc(db, "users", userId, "customLists", listId, "items", itemId);
    
    const year = item.year || 
                 (item.release_date ? item.release_date.split('-')[0] : null) ||
                 (item.first_air_date ? item.first_air_date.split('-')[0] : null) ||
                 (item.diterbitkan ? item.diterbitkan.split('-')[0] : null) ||
                 null;
    
    await setDoc(itemRef, {
      id: item.id,
      itemId: itemId,
      type: type,
      title: item.title || item.name || 'Unknown',
      poster: item.poster || item.image || item.poster_path || null,
      rating: item.rating || item.vote_average || null,
      year: year,
      addedAt: serverTimestamp()
    });
    
    // Update item count in the list
    const listRef = doc(db, "users", userId, "customLists", listId);
    const listSnap = await getDoc(listRef);
    if (listSnap.exists()) {
      const currentCount = listSnap.data().itemCount || 0;
      await setDoc(listRef, { itemCount: currentCount + 1, updatedAt: serverTimestamp() }, { merge: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error adding to custom list:", error);
    return { success: false, error };
  }
};

// Remove item from a custom list
export const removeFromCustomList = async (userId, listId, itemId) => {
  try {
    const itemRef = doc(db, "users", userId, "customLists", listId, "items", itemId);
    await deleteDoc(itemRef);
    
    // Update item count in the list
    const listRef = doc(db, "users", userId, "customLists", listId);
    const listSnap = await getDoc(listRef);
    if (listSnap.exists()) {
      const currentCount = listSnap.data().itemCount || 0;
      await setDoc(listRef, { itemCount: Math.max(0, currentCount - 1), updatedAt: serverTimestamp() }, { merge: true });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error removing from custom list:", error);
    return { success: false, error };
  }
};

// Get all items in a custom list
export const getCustomListItems = async (userId, listId) => {
  try {
    const itemsRef = collection(db, "users", userId, "customLists", listId, "items");
    const q = query(itemsRef, orderBy("addedAt", "desc"));
    const snapshot = await getDocs(q);
    
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, items };
  } catch (error) {
    console.error("Error getting custom list items:", error);
    return { success: false, error, items: [] };
  }
};

// Check if item is in a custom list
export const isInCustomList = async (userId, listId, itemId, type = "movie") => {
  try {
    const docRef = doc(db, "users", userId, "customLists", listId, "items", `${type}_${itemId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking custom list:", error);
    return false;
  }
};
