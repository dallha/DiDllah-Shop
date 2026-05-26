'use client';

import { useEffect, useRef } from 'react';

const ITEMS = [
  '✨ Livraison gratuite à Dakar dès 25 000 FCFA',
  '🌍 Expédition vers la diaspora',
  '💳 Paiement Orange Money & Wave',
  '🧵 Bazin & Wax 100% authentiques',
  '🌿 Huiles naturelles pressées à froid',
  '🎁 Cadeau offert dès 50 000 FCFA',
  '📦 Retour sous 7 jours',
  '🤝 Coopératives de femmes sénégalaises',
  '✨ Livraison gratuite à Dakar dès 25 000 FCFA',
  '🌍 Expédition vers la diaspora',
  '💳 Paiement Orange Money & Wave',
  '🧵 Bazin & Wax 100% authentiques',
  '🌿 Huiles naturelles pressées à froid',
  '🎁 Cadeau offert dès 50 000 FCFA',
  '📦 Retour sous 7 jours',
  '🤝 Coopératives de femmes sénégalaises',
];

export default function MarqueeBanner() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationId: number;
    let position = 0;
    const speed = 0.5; // pixels per frame

    function animate() {
      if (!track) return;
      position -= speed;
      const halfWidth = track.scrollWidth / 2;
      if (Math.abs(position) >= halfWidth) {
        position = 0;
      }
      track.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    }

    // Pause au hover
    const onMouseEnter = () => cancelAnimationFrame(animationId);
    const onMouseLeave = () => { animationId = requestAnimationFrame(animate); };

    track.addEventListener('mouseenter', onMouseEnter);
    track.addEventListener('mouseleave', onMouseLeave);

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      if (track) {
        track.removeEventListener('mouseenter', onMouseEnter);
        track.removeEventListener('mouseleave', onMouseLeave);
      }
    };

  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 py-3 border-y border-brand-500/20">
      <div className="flex whitespace-nowrap">
        <div ref={trackRef} className="flex items-center gap-0 will-change-transform">
          {ITEMS.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 mx-6 text-sm font-medium text-white/90">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
