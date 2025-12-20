import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  addReview, 
  getReviews, 
  getUserReview, 
  updateReview, 
  deleteReview 
} from '../firebase/firestore';

function ReviewSection({ itemId, itemTitle, type = 'movie' }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews();
  }, [itemId, type]);

  // Check if current user has reviewed
  useEffect(() => {
    if (isAuthenticated && user) {
      checkUserReview();
    }
  }, [user, isAuthenticated, itemId, type]);

  const fetchReviews = async () => {
    setLoading(true);
    const data = await getReviews(itemId, type);
    setReviews(data);
    setLoading(false);
  };

  const checkUserReview = async () => {
    const result = await getUserReview(user.uid, itemId, type);
    if (result.exists) {
      setHasReviewed(true);
      setUserRating(result.data.rating || 0);
      setUserReviewText(result.data.review || '');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || userRating === 0) return;

    setSubmitting(true);
    
    const reviewData = {
      rating: userRating,
      review: userReviewText,
      userName: user.displayName || 'Anonymous',
      userPhoto: user.photoURL || null,
      itemTitle: itemTitle
    };

    let result;
    if (hasReviewed) {
      result = await updateReview(user.uid, itemId, type, reviewData);
    } else {
      result = await addReview(user.uid, itemId, type, reviewData);
    }

    if (result.success) {
      setHasReviewed(true);
      setIsEditing(false);
      fetchReviews();
    }
    
    setSubmitting(false);
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    
    setSubmitting(true);
    const result = await deleteReview(user.uid, itemId, type);
    
    if (result.success) {
      setHasReviewed(false);
      setUserRating(0);
      setUserReviewText('');
      fetchReviews();
    }
    
    setSubmitting(false);
  };

  const StarRating = ({ rating, onRate, interactive = false, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate && onRate(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={`${sizeClasses[size]} ${
                star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-500'
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        User Reviews 
        {reviews.length > 0 && (
          <span className="text-lg font-normal text-text-secondary ml-2">
            ({reviews.length} reviews • ⭐ {averageRating}/10 average)
          </span>
        )}
      </h2>

      {/* Write Review Section */}
      <div className="bg-tertiary rounded-xl p-6 mb-8">
        {!isAuthenticated ? (
          <p className="text-text-secondary text-center py-4">
            Please login to write a review
          </p>
        ) : hasReviewed && !isEditing ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {user?.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <p className="text-white font-medium">Your Review</p>
                  <StarRating rating={userRating} size="sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteReview}
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            {userReviewText && (
              <p className="text-text-secondary">{userReviewText}</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <h3 className="text-lg font-semibold text-white mb-4">
              {hasReviewed ? 'Edit Your Review' : 'Write a Review'}
            </h3>
            
            {/* Star Rating */}
            <div className="mb-4">
              <label className="block text-text-secondary mb-2">Your Rating</label>
              <div className="flex items-center gap-4">
                <StarRating 
                  rating={userRating} 
                  onRate={setUserRating} 
                  interactive 
                  size="lg" 
                />
                <span className="text-2xl font-bold text-white">
                  {hoverRating || userRating || 0}/10
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label className="block text-text-secondary mb-2">
                Your Review (optional)
              </label>
              <textarea
                value={userReviewText}
                onChange={(e) => setUserReviewText(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                rows={4}
                className="w-full bg-secondary text-white rounded-lg p-4 border border-white/10 focus:border-accent focus:outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={userRating === 0 || submitting}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  userRating === 0 || submitting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-accent hover:bg-accent-hover text-white'
                }`}
              >
                {submitting ? 'Saving...' : hasReviewed ? 'Update Review' : 'Submit Review'}
              </button>
              {hasReviewed && isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          No reviews yet. Be the first to review!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div 
              key={review.docId} 
              className="bg-secondary/50 rounded-xl p-5 border border-white/5"
            >
              <div className="flex items-start gap-4">
                {review.userPhoto ? (
                  <img 
                    src={review.userPhoto} 
                    alt={review.userName} 
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold">
                    {review.userName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white font-medium">{review.userName}</span>
                      <span className="text-text-secondary text-sm ml-2">
                        {review.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-white font-bold">{review.rating}/10</span>
                    </div>
                  </div>
                  {review.review && (
                    <p className="text-text-secondary">{review.review}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewSection;
