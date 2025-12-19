import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @returns {Array} [ref, isVisible] - ref to attach to element, boolean for visibility
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Once visible, stay visible (don't animate out)
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
        ...options
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
}

/**
 * Hook for staggered animations (for grids/lists)
 * @param {number} itemCount - Number of items
 * @param {number} baseDelay - Base delay in ms
 * @returns {Function} getDelay - Function to get delay for each index
 */
export function useStaggeredAnimation(itemCount, baseDelay = 100) {
  const getDelay = (index) => {
    // Cap the delay so it doesn't get too long
    const maxDelay = 600;
    return Math.min(index * baseDelay, maxDelay);
  };

  return getDelay;
}

export default useScrollAnimation;
