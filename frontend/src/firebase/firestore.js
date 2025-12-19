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
    await setDoc(docRef, {
      id: item.id,
      title: item.title,
      poster: item.poster || item.images || item.image,
      rating: item.rating,
      year: item.year,
      type: type,
      addedAt: serverTimestamp()
    });
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
    await setDoc(docRef, {
      id: item.id,
      title: item.title,
      poster: item.poster || item.images || item.image,
      rating: item.rating,
      year: item.year,
      type: type,
      addedAt: serverTimestamp()
    });
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
