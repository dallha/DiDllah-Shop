import type { Metadata } from 'next';
import ContactPageClient from '@/components/ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact & service client — DiDallah Shop',
  description:
    "Joignez la maison DiDallah Shop à Dakar pour vos commandes, livraisons et demandes personnalisées.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
