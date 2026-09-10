import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * GsapTilt : Effet d'inclinaison 3D ultra-fluide et réactif au mouvement du curseur.
 * Utilisé sur les cartes Bento, Cartes Tarifaires, et cartes comparatives.
 * Désactivé proprement sur mobile/tactile pour garantir les meilleures performances.
 */
export interface GsapTiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // Angle maximum en degrés (défaut: 5)
  scale?: number; // Agrandissement léger au survol (défaut: 1.015)
  speed?: number; // Vitesse de transition en secondes
  className?: string;
}

export const GsapTilt: React.FC<GsapTiltProps> = ({
  children,
  maxTilt = 5,
  scale = 1.015,
  speed = 0.4,
  className = '',
  style = {},
  ...restProps
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Uniquement sur les appareils avec pointeur souris (évite les bugs sur tactile)
    const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    if (!canHover) return;

    const ctx = gsap.context(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        gsap.to(el, {
          rotateX,
          rotateY,
          scale,
          transformPerspective: 900,
          duration: speed,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      };

      const handleMouseLeave = () => {
        gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, el);

    return () => {
      ctx.revert();
    };
  }, [maxTilt, scale, speed]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style
      }}
      {...restProps}
    >
      {children}
    </div>
  );
};

/**
 * GsapMagnetic : Effet magnétique haut de gamme qui attire délicatement
 * l'élément vers le curseur lors du survol (parfait pour icônes WhatsApp, Email, boutons CTA).
 */
export interface GsapMagneticProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number; // Force d'attraction (0.1 à 0.5, défaut: 0.25)
  className?: string;
}

export const GsapMagnetic: React.FC<GsapMagneticProps> = ({
  children,
  strength = 0.25,
  className = '',
  style = {},
  ...restProps
}) => {
  const magneticRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;

    const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    if (!canHover) return;

    const ctx = gsap.context(() => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        gsap.to(el, {
          x: deltaX,
          y: deltaY,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      };

      const handleMouseLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.4)',
          overwrite: 'auto'
        });
      };

      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, el);

    return () => {
      ctx.revert();
    };
  }, [strength]);

  const hasDisplayClass = /\b(flex|inline-flex|grid|inline-grid|block|inline-block)\b/.test(className);

  return (
    <div
      ref={magneticRef}
      className={className}
      style={{
        ...(hasDisplayClass || style.display ? {} : { display: 'inline-block' }),
        willChange: 'transform',
        ...style
      }}
      {...restProps}
    >
      {children}
    </div>
  );
};

/**
 * GsapPulseBadge : Animation GSAP de pulsation subtile et continue
 * Parfait pour les badges "🔥 Le plus populaire", "-20%", ou "100% Hors-Ligne".
 */
export interface GsapPulseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  scaleAmount?: number;
  duration?: number;
  className?: string;
}

export const GsapPulseBadge: React.FC<GsapPulseBadgeProps> = ({
  children,
  scaleAmount = 1.04,
  duration = 1.4,
  className = '',
  style = {},
  ...restProps
}) => {
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = badgeRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        scale: scaleAmount,
        duration,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    }, el);

    return () => {
      ctx.revert();
    };
  }, [scaleAmount, duration]);

  const hasDisplayClass = /\b(flex|inline-flex|grid|inline-grid|block|inline-block)\b/.test(className);

  return (
    <span
      ref={badgeRef}
      className={className}
      style={{
        ...(hasDisplayClass || style.display ? {} : { display: 'inline-block' }),
        willChange: 'transform',
        ...style
      }}
      {...restProps}
    >
      {children}
    </span>
  );
};

/**
 * GsapScannerLine : Faisceau laser animé avec GSAP pour la case OCR / Scan Photo
 */
export const GsapScannerLine: React.FC<{ className?: string }> = ({ className = '' }) => {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 0, opacity: 0.3 },
        {
          y: 48,
          opacity: 0.9,
          duration: 1.6,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        }
      );
    }, el);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={lineRef}
      className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none shadow-[0_0_8px_rgba(52,211,153,0.8)] ${className}`}
    />
  );
};
