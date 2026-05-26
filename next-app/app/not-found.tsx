import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center sm:px-10">
      <p className="text-sm uppercase tracking-[0.32em] text-brand-700">Erreur 404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
        Cette page n’existe pas (encore).
      </h1>
      <p className="mt-6 max-w-xl text-base text-slate-600">
        Le lien que vous avez suivi est peut-être périmé, ou la page a été déplacée. Retrouvez nos
        collections depuis l’accueil.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Revenir à l’accueil
        </Link>
        <Link
          href="/catalogue"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Voir le catalogue
        </Link>
      </div>
    </main>
  );
}
