'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function MfaSetupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const [qrCode, setQrCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function setupMfa() {
      const supabase = createClient();
      
      // 1. Vérifier si l'utilisateur a DÉJÀ un facteur TOTP (il se connecte depuis un nouvel appareil)
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        setErrorMsg(factorsError.message);
        setLoading(false);
        return;
      }
      
      const totpFactor = factorsData?.totp[0];

      if (totpFactor) {
        // L'utilisateur est déjà enrôlé, il doit juste vérifier (Challenge)
        setFactorId(totpFactor.id);
        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
        if (challengeError) {
          setErrorMsg(challengeError.message);
        } else {
          setChallengeId(challengeData.id);
        }
        setLoading(false);
      } else {
        // Nouvel utilisateur, on l'enrôle et génère le QR Code
        const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setFactorId(data.id);
          setQrCode(data.totp.qr_code);
          
          // Et on lance le challenge immédiatement pour la vérification
          const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: data.id });
          if (challengeError) {
             setErrorMsg(challengeError.message);
          } else {
             setChallengeId(challengeData.id);
          }
        }
        setLoading(false);
      }
    }
    setupMfa();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setErrorMsg("Le code doit contenir 6 chiffres.");
      return;
    }

    setVerifying(true);
    setErrorMsg('');
    const supabase = createClient();

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) {
      setErrorMsg("Code incorrect ou expiré. Veuillez réessayer.");
      setVerifying(false);
    } else {
      // Succès ! On redirige vers la page initiale
      router.push(redirectTo);
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600 mb-4" />
        <p className="font-semibold text-slate-700">Initialisation de la sécurité...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center text-white">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-3xl">
          🛡️
        </div>
        <h1 className="text-2xl font-bold">Sécurité Maximale (MFA)</h1>
        <p className="mt-2 text-sm text-white/70">
          Votre compte administrateur exige une authentification à double facteur.
        </p>
      </div>

      <div className="p-8">
        {errorMsg && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}

        {qrCode && (
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold text-slate-700 mb-4">
              1. Scannez ce QR Code avec Google Authenticator ou Authy :
            </p>
            <div className="mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200 w-fit" dangerouslySetInnerHTML={{ __html: qrCode }} />
          </div>
        )}

        {!qrCode && factorId && (
           <p className="text-sm font-semibold text-slate-700 mb-6 text-center">
             Veuillez entrer le code généré par votre application d'authentification.
           </p>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              {qrCode ? '2. Code à 6 chiffres' : 'Code à 6 chiffres'}
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-2xl font-mono tracking-widest text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:opacity-50"
          >
            {verifying ? 'Vérification...' : 'Valider mon accès'}
          </button>
        </form>
      </div>
    </div>
  );
}
