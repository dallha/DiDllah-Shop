'use client';

import { useShopStore, whatsappToHref } from '@/lib/shop-store';
import { useEffect, useState } from 'react';

export default function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false);
  const brand = useShopStore((state) => state.brand);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (brand.whatsappFloatEnabled === false) return null;
  if (!brand.whatsapp) return null;

  return (
    <a
      href={whatsappToHref(brand.whatsapp, 'Bonjour, j\'aimerais avoir un renseignement sur vos produits.')}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/20 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50"
      aria-label="Nous contacter sur WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-8 w-8"
      >
        <path d="M12.031 0C5.405 0 0 5.394 0 12.025c0 2.115.548 4.179 1.594 6.002L.038 24l6.113-1.603a12.015 12.015 0 0 0 5.88 1.543c6.626 0 12.03-5.394 12.03-12.025C24.062 5.394 18.657 0 12.031 0zm3.626 17.275c-.156.44-1.503.864-2.07.904-.568.04-1.282.176-3.882-.84-3.14-1.228-5.166-4.436-5.322-4.646-.156-.21-1.272-1.693-1.272-3.23 0-1.537.804-2.287 1.092-2.585.286-.298.623-.374.832-.374.208 0 .416.002.597.01.19.008.448-.076.702.54.26.634.884 2.158.962 2.316.078.158.13.344.026.554-.104.21-.156.342-.312.526-.156.184-.328.39-.468.514-.156.142-.316.298-.14.6.176.3.784 1.293 1.685 2.096 1.163 1.037 2.14 1.354 2.44 1.504.3.15.474.126.65-.07.176-.196.76-1.042.964-1.4.204-.358.408-.3.684-.196.276.104 1.743.82 2.042.97.298.15.498.224.572.35.074.126.074.726-.082 1.166z" />
      </svg>
    </a>
  );
}
