'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center sm:px-10">
      <p className="text-sm uppercase tracking-[0.32em] text-brand-700">Une erreur est survenue</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
        Oups, quelque chose s’est mal passé.
      </h1>
      <p className="mt-6 max-w-xl text-base text-slate-600">
        Réessayez d’ici quelques instants. Si le problème persiste, contactez-nous via WhatsApp ou
        email.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Réessayer
      </button>
    </main>
  );
}
