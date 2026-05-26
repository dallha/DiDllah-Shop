import AdminDashboardClient from '@/components/AdminDashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — DiDallah Shop',
  description: 'Tableau de bord administratif de la boutique DiDallah Shop.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
