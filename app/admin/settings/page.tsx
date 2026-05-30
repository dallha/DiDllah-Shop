'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useShopStore, type ShopSettings, whatsappToHref } from '@/lib/shop-store';
import { saveAllToSupabase } from '@/components/SupabaseSync';

export default function SettingsPage() {
  const brand = useShopStore((state) => state.brand);
  const setBrand = useShopStore((state) => state.setBrand);
  const reset = useShopStore((state) => state.reset);
  const siteContent = useShopStore((state) => state.siteContent);
  const siteImages = useShopStore((state) => state.siteImages);

  // Évite tout flash de valeurs par défaut avant l'hydratation depuis localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Assistant facile (Wizard)
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wStep, setWStep] = useState(0);
  const [wName, setWName] = useState('');
  const [wTagline, setWTagline] = useState('');
  const [wWhatsapp, setWWhatsapp] = useState('');
  const [wEmail, setWEmail] = useState('');
  const [wAddress, setWAddress] = useState('');
  const [wHours, setWHours] = useState('');
  const [wTiktok, setWTiktok] = useState('');
  const [wFacebook, setWFacebook] = useState('');

  function handleStartWizard() {
    setWName(brand.name || '');
    setWTagline(brand.tagline || '');
    setWWhatsapp(brand.whatsapp || '');
    setWEmail(brand.email || '');
    setWAddress(brand.address || '');
    setWHours(brand.hours || '');
    setWTiktok(brand.tiktok || '');
    setWFacebook(brand.facebook || '');
    setWStep(0);
    setWizardOpen(true);
  }

  const updateRealTime = (field: keyof ShopSettings, value: string) => {
    setBrand({ [field]: value } as Partial<ShopSettings>);
    setDirty(true);
    setSaveStatus('idle');
  };

  async function handleFinalSave() {
    setSaving(true);
    const freshSiteTheme = useShopStore.getState().siteTheme;
    const result = await saveAllToSupabase(siteContent, siteImages, freshSiteTheme, brand);
    setSaving(false);
    if (result.ok) {
      setSaveStatus('success');
      setDirty(false);
      setWizardOpen(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  }

  const handleChange =
    (field: keyof ShopSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setBrand({ [field]: event.target.value } as Partial<ShopSettings>);
      setDirty(true);
      setSaveStatus('idle');
    };

  async function handleSave() {
    setSaving(true);
    const freshSiteTheme = useShopStore.getState().siteTheme;
    const result = await saveAllToSupabase(siteContent, siteImages, freshSiteTheme, brand);
    setSaving(false);
    if (result.ok) {
      setSaveStatus('success');
      setDirty(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  }

  const fieldClass =
    'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-brand-700">Paramètres</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              Marque &amp; contact
            </h1>
            <p className="mt-3 max-w-xl text-slate-600">
              Vos coordonnées : WhatsApp, email, adresse. Tout ce qui s’affiche dans le footer,
              la page Contact et le bouton « Commander » de la boutique.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
          >
            ← Tableau de bord
          </Link>
        </header>

        {/* Assistant Facile (Wizard) */}
        {mounted && wizardOpen ? (
          <div className="mb-10 rounded-[2.5rem] border-2 border-brand-200 bg-brand-50/40 p-8 shadow-md transition-all duration-300">
            {/* Barre de progression */}
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-brand-700 mb-2">
                  <span>Étape {wStep + 1} sur 5</span>
                  <span>{Math.round(((wStep + 1) / 5) * 100)}% complété</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all duration-300"
                    style={{ width: `${((wStep + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWizardOpen(false)}
                className="rounded-full bg-slate-200/80 p-2 text-slate-500 hover:bg-slate-200 transition"
              >
                ✕ Fermer
              </button>
            </div>

            {/* Contenu des étapes */}
            <div className="mb-8 min-h-[220px]">
              {wStep === 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">🏷️ Donnons un nom et une voix à votre boutique</h3>
                  <p className="text-sm text-slate-600 mb-6">Ces informations s'affichent en grand tout en haut du site et sur vos factures imprimées.</p>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nom de la boutique</span>
                      <input
                        type="text"
                        value={wName}
                        onChange={(e) => { setWName(e.target.value); updateRealTime('name', e.target.value); }}
                        className={fieldClass}
                        placeholder="Ex: DiDallah Shop"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Slogan publicitaire</span>
                      <input
                        type="text"
                        value={wTagline}
                        onChange={(e) => { setWTagline(e.target.value); updateRealTime('tagline', e.target.value); }}
                        className={fieldClass}
                        placeholder="Ex: L'élégance africaine au bout des doigts"
                      />
                    </label>
                  </div>
                  <div className="mt-6 rounded-2xl bg-amber-50 p-4 border border-amber-100/60 flex items-start gap-3">
                    <span className="text-lg">💡</span>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Conseil :</strong> Choisissez un nom mémorable et court. Votre slogan doit donner envie en quelques mots !
                    </p>
                  </div>
                </div>
              )}

              {wStep === 1 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">💬 Votre numéro de commandes WhatsApp</h3>
                  <p className="text-sm text-slate-600 mb-6">C'est le lien le plus important de votre boutique. C'est ici que les clients vous enverront leur panier d'achat.</p>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Numéro WhatsApp professionnel</span>
                      <input
                        type="tel"
                        value={wWhatsapp}
                        onChange={(e) => { setWWhatsapp(e.target.value); updateRealTime('whatsapp', e.target.value); }}
                        className={fieldClass}
                        placeholder="Ex: +221 76 305 05 05"
                      />
                    </label>
                  </div>
                  <div className="mt-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 flex items-start gap-3">
                    <span className="text-lg">💬</span>
                    <div className="text-xs text-emerald-800 leading-relaxed">
                      <strong>Lien généré automatiquement :</strong> Le système nettoie les espaces pour créer un lien wa.me opérationnel. 
                      {wWhatsapp && (
                        <span className="block mt-2 font-mono font-bold bg-white/60 p-2 rounded-lg text-emerald-900">
                          {whatsappToHref(wWhatsapp)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {wStep === 2 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">📍 Votre adresse physique & horaires</h3>
                  <p className="text-sm text-slate-600 mb-6">Permet aux clients de savoir d'où vous livrez ou de venir récupérer leurs commandes en magasin.</p>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Adresse de la boutique</span>
                      <input
                        type="text"
                        value={wAddress}
                        onChange={(e) => { setWAddress(e.target.value); updateRealTime('address', e.target.value); }}
                        className={fieldClass}
                        placeholder="Ex: Liberté 6 Extension, Dakar — Sénégal"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Jours et Horaires d'ouverture</span>
                      <input
                        type="text"
                        value={wHours}
                        onChange={(e) => { setWHours(e.target.value); updateRealTime('hours', e.target.value); }}
                        className={fieldClass}
                        placeholder="Ex: Lun – Sam · 9 h – 20 h"
                      />
                    </label>
                  </div>
                </div>
              )}

              {wStep === 3 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">✉️ Contact & réseaux sociaux</h3>
                  <p className="text-sm text-slate-600 mb-6">Ajoutez d'autres canaux de contact pour rassurer vos clients et augmenter votre communauté.</p>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Adresse e-mail professionnelle</span>
                      <input
                        type="email"
                        value={wEmail}
                        onChange={(e) => { setWEmail(e.target.value); updateRealTime('email', e.target.value); }}
                        className={fieldClass}
                        placeholder="Ex: contact@didallah.sn"
                      />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Compte TikTok</span>
                        <input
                          type="text"
                          value={wTiktok}
                          onChange={(e) => { setWTiktok(e.target.value); updateRealTime('tiktok', e.target.value); }}
                          className={fieldClass}
                          placeholder="Ex: @didallah.shop"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Page Facebook</span>
                        <input
                          type="text"
                          value={wFacebook}
                          onChange={(e) => { setWFacebook(e.target.value); updateRealTime('facebook', e.target.value); }}
                          className={fieldClass}
                          placeholder="Ex: fb.com/didallah.shop"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {wStep === 4 && (
                <div className="text-center py-6">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600 mb-6 animate-bounce">
                    🎉
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Toutes les informations sont prêtes !</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto mb-8">
                    Vous avez configuré votre marque, votre WhatsApp et vos réseaux avec succès. Cliquez ci-dessous pour appliquer et sauvegarder en toute sécurité.
                  </p>
                  
                  <div className="inline-flex flex-col items-center gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleFinalSave}
                      className="btn-3d btn-3d-emerald rounded-full px-8 py-4 text-base font-bold text-white shadow-xl flex items-center gap-3 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Sauvegarde…
                        </>
                      ) : '🚀 Appliquer & Enregistrer en ligne'}
                    </button>
                    <p className="text-xs text-slate-400">Cette action enregistre instantanément vos données dans Supabase.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons de navigation */}
            {wStep < 4 && (
              <div className="flex justify-between items-center border-t border-brand-200/50 pt-6">
                <button
                  type="button"
                  onClick={() => setWStep((s) => Math.max(0, s - 1))}
                  disabled={wStep === 0}
                  className="btn-3d btn-3d-slate rounded-full px-5 py-2.5 text-xs font-semibold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setWStep((s) => Math.min(4, s + 1))}
                  className="btn-3d btn-3d-emerald rounded-full px-6 py-2.5 text-xs font-semibold text-white"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        ) : null}

        {mounted && !wizardOpen && (
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-brand-50 to-brand-100/50 border border-brand-200/60 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-3xl">✨</span>
              <div>
                <h4 className="font-bold text-brand-900 text-base">Pas à l'aise avec la technique ?</h4>
                <p className="text-xs text-brand-700/80 mt-1">Laissez-vous guider étape par étape par notre assistant interactif intelligent !</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartWizard}
              className="btn-3d btn-3d-emerald whitespace-nowrap rounded-full px-6 py-3 text-sm font-bold text-white shadow-md flex items-center gap-2"
            >
              Lancer l'Assistant Facile 🚀
            </button>
          </div>
        )}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Nom de la maison
              </span>
              <input
                type="text"
                value={mounted ? brand.name : ''}
                onChange={handleChange('name')}
                className={fieldClass}
                placeholder="DiDallah"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Slogan / tagline
              </span>
              <input
                type="text"
                value={mounted ? brand.tagline : ''}
                onChange={handleChange('tagline')}
                className={fieldClass}
              />
            </label>
            <div className="block">
              <label className="block mb-4">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Numéro WhatsApp
                </span>
                <input
                  type="tel"
                  value={mounted ? brand.whatsapp : ''}
                  onChange={handleChange('whatsapp')}
                  className={fieldClass}
                  placeholder="+221 76 305 05 05"
                />
                {mounted && brand.whatsapp ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Lien testé :{' '}
                    <a
                      href={whatsappToHref(brand.whatsapp, 'Test depuis Paramètres DiDallah')}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-brand-700 underline-offset-4 hover:underline"
                    >
                      {whatsappToHref(brand.whatsapp).replace('https://', '')}
                    </a>
                  </p>
                ) : null}
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={mounted ? (brand.whatsappFloatEnabled ?? true) : true}
                    onChange={(e) => {
                      updateRealTime('whatsappFloatEnabled', e.target.checked as any);
                    }}
                  />
                  <div className={`block w-10 h-6 rounded-full transition ${brand.whatsappFloatEnabled !== false ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${brand.whatsappFloatEnabled !== false ? 'translate-x-4' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">Afficher la bulle WhatsApp</span>
                  <span className="text-xs text-slate-500">Bouton flottant visible par vos clients en bas à droite de l'écran.</span>
                </div>
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Email
              </span>
              <input
                type="email"
                value={mounted ? brand.email : ''}
                onChange={handleChange('email')}
                className={fieldClass}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Adresse
              </span>
              <input
                type="text"
                value={mounted ? brand.address : ''}
                onChange={handleChange('address')}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Horaires
              </span>
              <input
                type="text"
                value={mounted ? brand.hours : ''}
                onChange={handleChange('hours')}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                TikTok
              </span>
              <input
                type="text"
                value={mounted ? brand.tiktok ?? '' : ''}
                onChange={handleChange('tiktok')}
                className={fieldClass}
                placeholder="@didallah.shop"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Facebook
              </span>
              <input
                type="text"
                value={mounted ? brand.facebook ?? '' : ''}
                onChange={handleChange('facebook')}
                className={fieldClass}
                placeholder="fb.com/didallah.shop"
              />
            </label>
          </div>

          {/* ── Liens de navigation ── */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 mb-4">
              Liens de navigation (header)
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Personnalisez les liens affichés dans la barre de navigation. Ajoutez, modifiez ou supprimez des liens.
            </p>
            <div className="space-y-3">
              {(mounted && brand.navLinks ? brand.navLinks : []).map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...(brand.navLinks || [])];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setBrand({ navLinks: updated });
                      setDirty(true);
                      setSaveStatus('idle');
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    placeholder="Texte affiché"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => {
                      const updated = [...(brand.navLinks || [])];
                      updated[i] = { ...updated[i], href: e.target.value };
                      setBrand({ navLinks: updated });
                      setDirty(true);
                      setSaveStatus('idle');
                    }}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    placeholder="/lien"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (brand.navLinks || []).filter((_, idx) => idx !== i);
                      setBrand({ navLinks: updated });
                      setDirty(true);
                      setSaveStatus('idle');
                    }}
                    className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = [...(brand.navLinks || []), { label: 'Nouveau lien', href: '/' }];
                setBrand({ navLinks: updated });
                setDirty(true);
                setSaveStatus('idle');
              }}
              className="mt-3 w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-2.5 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
            >
              + Ajouter un lien de navigation
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              {saveStatus === 'success' && <p className="text-emerald-700">✓ Paramètres enregistrés avec succès.</p>}
              {saveStatus === 'error' && <p className="text-rose-700">✗ Erreur lors de l&apos;enregistrement. Réessaie.</p>}
              {dirty && saveStatus === 'idle' && <p className="text-amber-600">⚠ Modifications non enregistrées.</p>}
              {!dirty && saveStatus === 'idle' && <p className="text-slate-400">Cliquez sur Enregistrer pour sauvegarder.</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="inline-flex items-center gap-2 justify-center rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-slate-800 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Enregistrement…
                  </>
                ) : dirty ? '💾 Enregistrer' : '✓ Enregistré'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Restaurer les valeurs par défaut ?')) {
                    reset();
                    setDirty(true);
                  }
                }}
                className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
              >
                Restaurer les valeurs par défaut
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-700">
              Aperçu en direct
            </p>
            <div className="mt-4 space-y-6 text-sm text-slate-700">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Boutique</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">
                  {mounted ? brand.name : 'DiDallah'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {mounted ? brand.tagline : 'Beauté & élégance, directement de Dakar'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">WhatsApp</p>
                  <p className="mt-2 text-sm text-slate-900">{mounted ? brand.whatsapp : '+221 76 305 05 05'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Email</p>
                  <p className="mt-2 text-sm text-slate-900">{mounted ? brand.email : 'bonjour@didallah.sn'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Adresse</p>
                  <p className="mt-2 text-sm text-slate-900">{mounted ? brand.address : 'Liberté 6 Extension, Dakar — Sénégal'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Horaires</p>
                  <p className="mt-2 text-sm text-slate-900">{mounted ? brand.hours : 'Lun – Sam · 9 h – 20 h'}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={mounted ? whatsappToHref(brand.whatsapp, 'Bonjour DiDallah, je teste le lien WhatsApp.') : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-3xl bg-brand-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-800"
                >
                  Ouvrir WhatsApp
                </a>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Réseaux</p>
                  <p className="mt-2 text-sm text-slate-900">{mounted ? brand.tiktok || '@didallah.shop' : '@didallah.shop'}</p>
                  <p className="mt-1 text-sm text-slate-900">{mounted ? brand.facebook || 'fb.com/didallah.shop' : 'fb.com/didallah.shop'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-200">
              Bon à savoir
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                Les modifications sont sauvegardées localement dans ce navigateur via localStorage.
                Sur un autre appareil ou dans un autre navigateur, le site affiche à nouveau les
                valeurs par défaut.
              </li>
              <li>
                Pour rendre ces réglages partagés et persistants côté serveur, il faudrait stocker
                les données dans une base externe. L’endroit prévu pour cela est
                <code className="rounded bg-white/10 px-1.5 py-0.5">lib/supabase.ts</code>.
              </li>
              <li>
                Le numéro WhatsApp est formaté automatiquement en chiffres seuls pour générer un
                lien <code className="rounded bg-white/10 px-1.5 py-0.5">https://wa.me/...</code>.
                Par exemple <code>+221 76 305 05 05</code> devient <code>221763050505</code>.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
