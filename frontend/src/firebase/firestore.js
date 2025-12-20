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
