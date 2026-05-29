import AdminSidebar from '@/components/AdminSidebar';
import TeamClient from '@/components/TeamClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Équipe & Rôles — DiDallah Shop',
  description: 'Gestion des rôles et accès de votre équipe.',
};

export default function AdminTeamPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="space-y-6">
             <TeamClient />
          </div>
        </div>
      </main>
    </div>
  );
}
