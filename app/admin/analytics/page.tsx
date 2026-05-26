import Link from 'next/link';

export default function AdminAnalyticsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.32em] text-brand-700">Analyses</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Statistiques trafic & ventes</h1>
            <p className="mt-3 text-slate-600">
              Cette page est un placeholder fonctionnel pour l’analyse du site et des performances commerciales.
            </p>
          </div>
          <div className="space-y-6 text-slate-700">
            <p>Vous pouvez revenir au tableau de bord ou consulter le catalogue et les paramètres.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin" className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                Retour au tableau de bord
              </Link>
              <Link href="/admin/settings" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-50">
                Paramètres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
