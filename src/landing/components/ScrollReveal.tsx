import React, { useEffect, useRef, useState } from 'react';

export type RevealAnimation = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right' 
  | 'zoom-in' 
  | 'fade';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: RevealAnimation;
  delay?: number; // Délai en ms
  duration?: number; // Durée en ms
  distance?: number; // Distance de translation en px
  threshold?: number; // Seuil d'intersection (0.05 à 0.5)
  once?: boolean; // Déclencher une seule fois (par défaut true)
}

/**
 * Composant de révélation fluide au scroll (Scroll Reveal)
 * Utilise IntersectionObserver et des transformations 3D accélérées par le GPU.
 * Respecte le design existant sans ajouter d'écart ni modifier les layouts CSS.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fade-up',
  delay = 0,
  duration = 900, // Ajusté pour une apparition plus douce, élégante et progressive
  distance = 24, // Distance subtile sans à-coup
  threshold = 0.08,
  once = true,
  className = '',
  style = {},
  ...restProps
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Si l'utilisateur préfère réduire les animations d'accessibilité
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  // Calcul de la transformation initiale selon la direction souhaitée
  const getTransform = (): string => {
    if (isVisible) return 'none';
    switch (animation) {
      case 'fade-up':
        return `translate3d(0, ${distance}px, 0)`;
      case 'fade-down':
        return `translate3d(0, -${distance}px, 0)`;
      case 'fade-left':
        return `translate3d(-${distance}px, 0, 0)`;
      case 'fade-right':
        return `translate3d(${distance}px, 0, 0)`;
      case 'zoom-in':
        return 'scale3d(0.95, 0.95, 1)';
      case 'fade':
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: isVisible ? 'auto' : 'opacity, transform'
      }}
      {...restProps}
    >
      {children}
    </div>
  );
};
