'use client';

import { useEffect, useRef, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number; // ms
  direction?: 'up' | 'left' | 'right' | 'none';
};

export default function ScrollReveal({ children, className = '', delay = 0, direction = 'up' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Petit délai supplémentaire si demandé
            setTimeout(() => {
              el.classList.remove('opacity-0');
              if (direction === 'up') el.classList.remove('translate-y-8');
              else if (direction === 'left') el.classList.remove('-translate-x-8');
              else if (direction === 'right') el.classList.remove('translate-x-8');
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, direction]);

  const initialTransform = () => {
    if (direction === 'up') return 'translate-y-8';
    if (direction === 'left') return '-translate-x-8';
    if (direction === 'right') return 'translate-x-8';
    return '';
  };

  return (
    <div
      ref={ref}
      className={`opacity-0 transition-all duration-700 ease-out ${initialTransform()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
