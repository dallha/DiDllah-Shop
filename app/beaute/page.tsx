import type { Metadata } from 'next';
import BeautePageClient from '@/components/BeautePageClient';

export const metadata: Metadata = {
  title: 'Beauté & soins naturels',
  description:
    "Découvrez les soins naturels DiDallah Shop : huiles précieuses, beurre de karité, parfums et cosmétiques d’exception.",
};

export default function BeautePage() {
  return <BeautePageClient />;
}
