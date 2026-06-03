'use client';

export function triggerStarBurst(clientX: number, clientY: number) {
  if (typeof window === 'undefined') return;

  const particleCount = 15;
  const container = document.body;

  const starPaths = [
    // Étoile à 4 branches
    'M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z',
    // Étoile à 8 branches
    'M12 0l2 7 7-2-5 5 5 5-7-2-2 7-2-7-7 2 5-5-5-5 7 2z',
  ];

  const colors = [
    '#d4af37', // Or signature
    '#f8f4e9', // Crème
    '#4f7ea2', // Bleu de marque
    '#f59e0b', // Ambre chaud
  ];

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 85;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    const scale = 0.4 + Math.random() * 0.7;
    const duration = 600 + Math.random() * 400; // ms
    const rotStart = Math.random() * 360;
    const rotEnd = rotStart + (Math.random() > 0.5 ? 180 : -180) + Math.random() * 90;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('star-particle');

    // Assigner les variables CSS
    svg.style.setProperty('--tx', `${tx}px`);
    svg.style.setProperty('--ty', `${ty}px`);
    svg.style.setProperty('--scale', `${scale}`);
    svg.style.setProperty('--duration', `${duration}ms`);
    svg.style.setProperty('--rot-start', `${rotStart}deg`);
    svg.style.setProperty('--rot-end', `${rotEnd}deg`);

    // Dimensions
    const size = Math.floor(12 + Math.random() * 16);
    svg.style.width = `${size}px`;
    svg.style.height = `${size}px`;
    svg.style.left = `${clientX}px`;
    svg.style.top = `${clientY}px`;

    // Sélection aléatoire de forme (ou cercle)
    if (Math.random() > 0.25) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = starPaths[Math.floor(Math.random() * starPaths.length)];
      path.setAttribute('d', d);
      path.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
      svg.appendChild(path);
    } else {
      // Paillette circulaire
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '12');
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
      svg.appendChild(circle);
    }

    container.appendChild(svg);

    // Auto-suppression après la fin de l'animation
    setTimeout(() => {
      svg.remove();
    }, duration + 100);
  }
}
