import MfaSetupClient from '@/components/MfaSetupClient';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Configuration Sécurité MFA — DiDallah Shop',
  description: 'Sécurisez votre compte administrateur avec la double authentification.',
};

export default function MfaSetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Suspense fallback={
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600 mb-4" />
          <p className="font-semibold text-slate-700">Chargement...</p>
        </div>
      }>
        <MfaSetupClient />
      </Suspense>
    </div>
  );
}
