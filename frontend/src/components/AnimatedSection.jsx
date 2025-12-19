import { useScrollAnimation } from '../hooks/useScrollAnimation';

/**
 * Wrapper component that applies scroll animation to children
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {string} props.animation - Animation type: 'fade-up' | 'fade-in' | 'slide-left' | 'scale-up'
 * @param {number} props.delay - Delay in ms before animation starts
 * @param {string} props.className - Additional CSS classes
 */
function AnimatedSection({ 
  children, 
  animation = 'fade-up', 
  delay = 0, 
  className = '',
  threshold = 0.1
}) {
  const [ref, isVisible] = useScrollAnimation({ threshold });

  const animationClass = `animate-${animation}`;

  return (
    <div
      ref={ref}
      className={`${animationClass} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Animated grid item for staggered animations
 */
export function AnimatedCard({ 
  children, 
  index = 0, 
  className = '' 
}) {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.05 });
  const delay = Math.min(index * 80, 400); // Cap at 400ms

  return (
    <div
      ref={ref}
      className={`animate-fade-up ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default AnimatedSection;
