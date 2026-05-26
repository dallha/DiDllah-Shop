import type { Metadata } from 'next';
import ModePageClient from '@/components/ModePageClient';

export const metadata: Metadata = {
  title: 'Mode & élégance africaine',
  description:
    "Bazin riche, wax authentique, prêt-à-porter et accessoires : la sélection mode DiDallah Shop, confectionnée à Dakar.",
};

export default function ModePage() {
  return <ModePageClient />;
}
