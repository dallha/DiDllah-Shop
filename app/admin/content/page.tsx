'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useShopStore } from '@/lib/shop-store';
import { useHydrated } from '@/lib/use-hydrated';
import { saveAllToSupabase, saveAllToLocal } from '@/components/SupabaseSync';
import { createClient } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  defaultSiteContent,
  defaultSiteImages,
  defaultSiteTheme,
  type SiteContent,
  type SiteImages,
  type SiteTheme,
  type ProductUniverse,
  type Review,
  type Artisan,
} from '@/lib/data';

// ─── Styles partagés ──────────────────────────────────────────────────────────

const fieldClass =
  'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

const textareaClass = fieldClass + ' min-h-[88px] resize-y leading-6';

// ─── Composants réutilisables ─────────────────────────────────────────────────

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
};

function TextField({ label, value, onChange, hint, multiline }: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={textareaClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass}
        />
      )}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  hint?: string;
};

function SelectField({ label, value, options, onChange, hint }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

type VisualSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  type: 'color' | 'size' | 'stat-style' | 'stat-size';
};

function VisualSelectField({ label, value, onChange, hint, type }: VisualSelectFieldProps) {
  let options: { value: string; label: string; desc: string; previewHtml?: React.ReactNode }[] = [];

  if (type === 'color') {
    options = [
      {
        value: 'rose',
        label: 'Rose Beauté 🌸',
        desc: 'Teinte poudrée et douce pour la beauté.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-rose-300 border border-rose-400" />
      },
      {
        value: 'ambre',
        label: 'Ambre Mode 🍊',
        desc: 'Teinte chaude et énergique pour le prêt-à-porter.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-amber-400 border border-amber-500" />
      },
      {
        value: 'sombre',
        label: 'Maison Noire 🖤',
        desc: 'Fond anthracite profond très haut de gamme.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-slate-900 border border-slate-950" />
      },
      {
        value: 'vert',
        label: 'Vert Ansar 🟢',
        desc: 'Vert émeraude vif inspiré de WhatsApp.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-emerald-500 border border-emerald-600" />
      },
      {
        value: 'clair',
        label: 'Clair Épuré ⚪',
        desc: 'Blanc mat moderne s’intégrant partout.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-white border border-slate-300 shadow-sm" />
      }
    ];
  } else if (type === 'size') {
    options = [
      {
        value: 'compact',
        label: 'Hauteur Compacte 📱',
        desc: 'Format compact idéal pour les fiches produits courtes.',
        previewHtml: (
          <div className="flex flex-col gap-1 w-10 border border-slate-300 rounded p-1 bg-white">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-1 bg-slate-100 rounded w-2/3" />
          </div>
        )
      },
      {
        value: 'medium',
        label: 'Hauteur Standard 💻',
        desc: 'Hauteur moyenne équilibrée pour la majorité des univers.',
        previewHtml: (
          <div className="flex flex-col gap-1 w-10 border border-slate-300 rounded p-1 bg-white">
            <div className="h-5 bg-slate-200 rounded w-full" />
            <div className="h-1.5 bg-slate-100 rounded w-2/3" />
          </div>
        )
      },
      {
        value: 'large',
        label: 'Grande Hauteur 🖥️',
        desc: 'Format géant pour donner un effet luxueux aux photos.',
        previewHtml: (
          <div className="flex flex-col gap-1 w-10 border border-slate-300 rounded p-1 bg-white">
            <div className="h-7 bg-slate-200 rounded w-full" />
            <div className="h-2 bg-slate-100 rounded w-2/3" />
          </div>
        )
      }
    ];
  } else if (type === 'stat-style') {
    options = [
      {
        value: 'auto',
        label: 'Multicolore 🔄',
        desc: 'Alterne les couleurs de manière dynamique.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-brand-500 to-rose-400 shadow-sm" />
      },
      {
        value: 'sombre',
        label: 'Noir Profond 🖤',
        desc: 'Cadre noir intense très contrasté.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-slate-950 shadow-sm" />
      },
      {
        value: 'clair',
        label: 'Verre Dépoli 💡',
        desc: 'Effet transparent moderne effet « glace ».',
        previewHtml: <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-300/40 shadow-sm" />
      },
      {
        value: 'vert',
        label: 'Vert WhatsApp 🟢',
        desc: 'Vert tonique très invitant au clic.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-emerald-500 shadow-sm" />
      },
      {
        value: 'clair-simple',
        label: 'Blanc Simple ⚪',
        desc: 'Cadre blanc discret s’intégrant partout.',
        previewHtml: <div className="h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm" />
      }
    ];
  } else if (type === 'stat-size') {
    options = [
      {
        value: 'normal',
        label: 'Standard 📱',
        desc: 'Prend 1 colonne de large dans la grille.',
        previewHtml: <div className="w-8 h-4 border-2 border-slate-400 rounded bg-white" />
      },
      {
        value: 'large',
        label: 'Double Largeur 🖥️',
        desc: 'Prend le double d’espace pour attirer l’attention.',
        previewHtml: <div className="w-12 h-4 border-2 border-slate-400 rounded bg-white" />
      }
    ];
  }

  return (
    <div className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {label}
      </span>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selected
                  ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600 scale-[1.01]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                {opt.previewHtml}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${selected ? 'text-brand-900' : 'text-slate-900'}`}>
                  {opt.label}
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-normal">
                  {opt.desc}
                </p>
              </div>
              {selected && (
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function Card({
  title,
  description,
  children,
  accent,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  accent?: string; // ex: 'border-rose-200 bg-rose-50'
}) {
  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm ${accent ?? 'border-slate-200'}`}>
      <div className="mb-5">
        <p className="font-semibold text-slate-900">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 700_000;
const MAX_DIMENSION = 1400;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('READ_FAILED'));

      const img = new window.Image();

      img.onerror = () => {
        if (file.size <= MAX_IMAGE_BYTES) resolve(src);
        else reject(new Error('DECODE_FAILED'));
      };

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width >= height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            if (file.size <= MAX_IMAGE_BYTES) return resolve(src);
            return reject(new Error('NO_CANVAS'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.85;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          while (dataUrl.length * 0.75 > MAX_IMAGE_BYTES && quality > 0.2) {
            quality -= 0.05;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        } catch {
          if (file.size <= MAX_IMAGE_BYTES) resolve(src);
          else reject(new Error('CANVAS_ERROR'));
        }
      };

      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({
  label,
  hint,
  value,
  onUpload,
  onRemove,
}: {
  label: string;
  hint?: string;
  value: string | null;
  onUpload: (dataUrl: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    const isHeic =
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      file.name.toLowerCase().endsWith('.heic') ||
      file.name.toLowerCase().endsWith('.heif');
    if (isHeic) {
      setError(
        "Format HEIC non supporté. Sur iPhone : Réglages → Appareil photo → Format → « Le plus compatible » (JPEG)."
      );
      return;
    }
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => { onUpload(e.target?.result as string); };
      reader.onerror = () => setError('Impossible de lire le fichier SVG.');
      reader.readAsDataURL(file);
      return;
    }
    setCompressing(true);
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl.length * 0.75 > MAX_IMAGE_BYTES * 1.5) {
        setError('Image trop complexe même après compression. Essaie une image plus petite.');
        return;
      }
      onUpload(dataUrl);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'DECODE_FAILED') {
        setError("Le navigateur ne peut pas décoder ce fichier. Probablement en HEIC — Réglages → Appareil photo → Format → « Le plus compatible ».");
      } else if (code === 'READ_FAILED') {
        setError("Impossible de lire le fichier. Vérifie qu'il n'est pas corrompu.");
      } else {
        setError('Erreur lors du traitement. Essaie une image JPEG ou PNG plus petite (max 4000 × 4000 px).');
      }
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {value ? (
            <Image src={value} alt={label} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-slate-300">🖼️</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => !compressing && inputRef.current?.click()}
            disabled={compressing}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            {compressing ? (
              <>
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Compression…
              </>
            ) : (
              <>📁 {value ? 'Remplacer' : 'Uploader'}</>
            )}
          </button>
          {value && !compressing && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
            >
              🗑 Supprimer
            </button>
          )}
        </div>
      </div>
      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
      {compressing && <p className="text-xs text-slate-400">Compression en cours, patienter…</p>}
    </div>
  );
}

// ─── Définition des onglets ───────────────────────────────────────────────────

type TabId = 'theme' | 'medias' | 'accueil' | 'beaute' | 'mode' | 'catalogue' | 'contact' | 'avis' | 'artisans' | 'marquee' | 'pending-reviews' | 'trustbar' | 'footerlinks';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'theme',     icon: '🎨', label: 'Thème Global' },
  { id: 'medias',    icon: '🖼️', label: 'Médias' },
  { id: 'accueil',   icon: '🏠', label: 'Accueil' },
  { id: 'beaute',    icon: '✨', label: 'Beauté' },
  { id: 'mode',      icon: '👗', label: 'Mode' },
  { id: 'catalogue', icon: '📦', label: 'Catalogue' },
  { id: 'contact',   icon: '📞', label: 'Contact' },
  { id: 'avis',      icon: '⭐', label: 'Avis clients' },
  { id: 'artisans',  icon: '🧵', label: 'Artisans' },
  { id: 'marquee',   icon: '📢', label: 'Marquee' },
  { id: 'trustbar',  icon: '🔒', label: 'Barre de confiance' },
  { id: 'footerlinks', icon: '🔗', label: 'Liens footer' },
  { id: 'pending-reviews', icon: '⏳', label: 'Avis en attente' },
];

// ─── Panneaux de contenu ──────────────────────────────────────────────────────

function TabTheme({
  theme,
  updateTheme,
}: {
  theme: SiteTheme;
  updateTheme: (patch: Partial<SiteTheme>) => void;
}) {
  const radii = [
    { value: 'square', label: 'Carré (Luxe classique)', desc: 'Bords droits, très chic et minimaliste.', preview: <div className="w-8 h-8 bg-slate-200 border-2 border-slate-300" /> },
    { value: 'rounded', label: 'Arrondi (Moderne)', desc: 'Légèrement arrondi pour adoucir le design.', preview: <div className="w-8 h-8 rounded-lg bg-slate-200 border-2 border-slate-300" /> },
    { value: 'pill', label: 'Très arrondi (Bulle)', desc: 'Bords totalement ronds, très accueillant.', preview: <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-300" /> },
  ];

  const shadows = [
    { value: 'none', label: 'Plat (Sans ombre)', desc: 'Design 2D pur, très actuel.', preview: <div className="w-8 h-8 rounded bg-white border border-slate-200" /> },
    { value: 'soft', label: 'Ombre douce', desc: 'Sépare subtilement les éléments du fond.', preview: <div className="w-8 h-8 rounded bg-white border border-slate-200 shadow" /> },
    { value: 'deep', label: 'Ombre profonde', desc: 'Effet 3D flottant, très prononcé.', preview: <div className="w-8 h-8 rounded bg-white shadow-xl" /> },
  ];

  const colors = [
    { value: 'nuit', label: 'Bleu Nuit (Défaut)', desc: 'Élégant, institutionnel et profond.', preview: <div className="w-8 h-8 rounded-full bg-[#0d2b3f] shadow-inner" /> },
    { value: 'ocean', label: 'Bleu Océan', desc: 'Plus clair et dynamique.', preview: <div className="w-8 h-8 rounded-full bg-[#0ea5e9] shadow-inner" /> },
    { value: 'emeraude', label: 'Vert Émeraude', desc: 'Naturel, évoque la croissance.', preview: <div className="w-8 h-8 rounded-full bg-[#10b981] shadow-inner" /> },
    { value: 'rubis', label: 'Rouge Rubis', desc: 'Chaud, passionné et audacieux.', preview: <div className="w-8 h-8 rounded-full bg-[#e11d48] shadow-inner" /> },
    { value: 'or', label: 'Doré / Ambre', desc: 'Luxueux et solaire.', preview: <div className="w-8 h-8 rounded-full bg-[#d97706] shadow-inner" /> },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm text-indigo-800">
        🎨 <strong>Nouveau :</strong> Les modifications de thème s'appliquent globalement à tout le site. 
      </div>

      <Card title="Forme Globale (Bords)" description="Choisissez le niveau d'arrondi des cadres, boutons et images.">
        <div className="grid gap-3 sm:grid-cols-3">
          {radii.map((opt) => (
            <button key={opt.value} type="button" onClick={() => updateTheme({ radius: opt.value as SiteTheme['radius'] })} className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all ${theme.radius === opt.value ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600 scale-[1.01]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              {opt.preview}
              <div>
                <p className={`text-sm font-semibold ${theme.radius === opt.value ? 'text-brand-900' : 'text-slate-900'}`}>{opt.label}</p>
                <p className="mt-1 text-xs text-slate-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Profondeur (Ombres)" description="Définissez comment les éléments se détachent du fond.">
        <div className="grid gap-3 sm:grid-cols-3">
          {shadows.map((opt) => (
            <button key={opt.value} type="button" onClick={() => updateTheme({ shadows: opt.value as SiteTheme['shadows'] })} className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all bg-slate-50 ${theme.shadows === opt.value ? 'border-brand-600 ring-1 ring-brand-600 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'}`}>
              {opt.preview}
              <div>
                <p className={`text-sm font-semibold ${theme.shadows === opt.value ? 'text-brand-900' : 'text-slate-900'}`}>{opt.label}</p>
                <p className="mt-1 text-xs text-slate-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Couleur de la Marque" description="La couleur principale des boutons et accents.">
        <div className="grid gap-3 sm:grid-cols-3">
          {colors.map((opt) => (
            <button key={opt.value} type="button" onClick={() => updateTheme({ brandColor: opt.value as SiteTheme['brandColor'] })} className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all ${theme.brandColor === opt.value ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600 scale-[1.01]' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              {opt.preview}
              <div>
                <p className={`text-sm font-semibold ${theme.brandColor === opt.value ? 'text-brand-900' : 'text-slate-900'}`}>{opt.label}</p>
                <p className="mt-1 text-xs text-slate-500">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Micro-animations" description="Activer les animations au survol (boutons qui grossissent, etc).">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.animations}
            onChange={(e) => updateTheme({ animations: e.target.checked })}
            className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-slate-900">Activer les animations fluides</span>
        </label>
      </Card>
    </div>
  );
}

function TabMedias({
  imgs,
  updateImage,
}: {
  imgs: SiteImages;
  updateImage: (patch: Partial<SiteImages>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800">
        ✓ Les images sont automatiquement compressées. Cliquez sur <strong>Enregistrer</strong> pour les synchroniser via Supabase.
      </div>

      <Card title="Logo du site" description="Remplace le cercle « D » dans la barre de navigation.">
        <ImageUploadField
          label="Logo"
          hint="PNG ou SVG transparent recommandé. Hauteur affichée : 40 px."
          value={imgs.logoDataUrl}
          onUpload={(url) => updateImage({ logoDataUrl: url })}
          onRemove={() => updateImage({ logoDataUrl: null })}
        />
      </Card>

      <Card title="Image hero — Page d'accueil" description="S'affiche en fond derrière le texte d'introduction.">
        <ImageUploadField
          label="Hero accueil"
          hint="JPEG ou WebP. Taille idéale : 1920 × 1080 px."
          value={imgs.heroDataUrl}
          onUpload={(url) => updateImage({ heroDataUrl: url })}
          onRemove={() => updateImage({ heroDataUrl: null })}
        />
      </Card>

      <Card title="Image hero — Page Beauté" description="S'affiche en fond sur la page Beauté.">
        <ImageUploadField
          label="Hero Beauté"
          hint="JPEG ou WebP. Taille idéale : 1920 × 600 px."
          value={imgs.beauteHeroDataUrl}
          onUpload={(url) => updateImage({ beauteHeroDataUrl: url })}
          onRemove={() => updateImage({ beauteHeroDataUrl: null })}
        />
      </Card>

      <Card title="Image hero — Page Mode" description="S'affiche en fond sur la page Mode.">
        <ImageUploadField
          label="Hero Mode"
          hint="JPEG ou WebP. Taille idéale : 1920 × 600 px."
          value={imgs.modeHeroDataUrl}
          onUpload={(url) => updateImage({ modeHeroDataUrl: url })}
          onRemove={() => updateImage({ modeHeroDataUrl: null })}
        />
      </Card>

      <Card title="Image de fond — Tableau de bord admin" description="S'affiche en bandeau en haut du tableau de bord admin.">
        <ImageUploadField
          label="Hero dashboard admin"
          hint="JPEG ou WebP. Taille idéale : 1920 × 500 px."
          value={imgs.adminHeroDataUrl}
          onUpload={(url) => updateImage({ adminHeroDataUrl: url })}
          onRemove={() => updateImage({ adminHeroDataUrl: null })}
        />
      </Card>

      <Card title="Image de fond — Page de connexion admin" description="S'affiche sur le panneau gauche de la page de connexion.">
        <ImageUploadField
          label="Image connexion admin"
          hint="JPEG ou WebP. Taille idéale : 1200 × 1800 px (portrait)."
          value={imgs.adminLoginDataUrl}
          onUpload={(url) => updateImage({ adminLoginDataUrl: url })}
          onRemove={() => updateImage({ adminLoginDataUrl: null })}
        />
      </Card>
    </div>
  );
}

function TabAccueil({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">

      <Card title="Hero — Bandeau principal">
        <TextField
          label="Badge (petit texte en haut)"
          value={c.home.hero.badge}
          onChange={(v) => update((d) => { d.home.hero.badge = v; })}
        />
        <TextField
          label="Sous-titre du hero"
          value={c.home.hero.subtitle}
          onChange={(v) => update((d) => { d.home.hero.subtitle = v; })}
          multiline
          hint="Le titre principal est piloté par le tagline dans Paramètres."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Bouton principal"
            value={c.home.hero.ctaPrimary}
            onChange={(v) => update((d) => { d.home.hero.ctaPrimary = v; })}
          />
          <TextField
            label="Bouton secondaire"
            value={c.home.hero.ctaSecondary}
            onChange={(v) => update((d) => { d.home.hero.ctaSecondary = v; })}
          />
        </div>
      </Card>

      <Card title="Cartes statistiques" description="Ajoutez, modifiez ou supprimez des cartes. Minimum 1.">
        <div className="space-y-3">
          {c.home.stats.map((stat, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Carte {i + 1}</span>
                {c.home.stats.length > 1 && (
                  <button
                    type="button"
                    onClick={() => update((d) => { d.home.stats.splice(i, 1); })}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    🗑 Supprimer
                  </button>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <TextField
                  label="Eyebrow"
                  value={stat.eyebrow}
                  onChange={(v) => update((d) => { d.home.stats[i].eyebrow = v; })}
                />
                <TextField
                  label="Valeur (gros)"
                  value={stat.value}
                  onChange={(v) => update((d) => { d.home.stats[i].value = v; })}
                />
                <TextField
                  label="Description"
                  value={stat.description}
                  onChange={(v) => update((d) => { d.home.stats[i].description = v; })}
                />
                <div className="lg:col-span-5 grid gap-5 sm:grid-cols-2 mt-2 border-t border-slate-100 pt-4">
                  <VisualSelectField
                    label="Style du cadre"
                    value={stat.variant || 'auto'}
                    type="stat-style"
                    onChange={(v) => update((d) => { d.home.stats[i].variant = v as any; })}
                  />
                  <VisualSelectField
                    label="Taille de la carte"
                    value={stat.size || 'normal'}
                    type="stat-size"
                    onChange={(v) => update((d) => { d.home.stats[i].size = v as any; })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update((d) => { d.home.stats.push({ eyebrow: 'Nouveau', value: '—', description: 'Description' }); })}
          className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-3 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
        >
          + Ajouter une carte
        </button>
      </Card>

      <Card title="Section « Produits phares »">
        <TextField
          label="Eyebrow"
          value={c.home.featured.eyebrow}
          onChange={(v) => update((d) => { d.home.featured.eyebrow = v; })}
        />
        <TextField
          label="Titre"
          value={c.home.featured.title}
          onChange={(v) => update((d) => { d.home.featured.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.home.featured.subtitle}
          onChange={(v) => update((d) => { d.home.featured.subtitle = v; })}
          multiline
        />
        <TextField
          label="Libellé du bouton"
          value={c.home.featured.ctaLabel}
          onChange={(v) => update((d) => { d.home.featured.ctaLabel = v; })}
        />
      </Card>

      <Card title="Section « Nos univers »">
        <TextField
          label="Titre"
          value={c.home.universes.title}
          onChange={(v) => update((d) => { d.home.universes.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.home.universes.subtitle}
          onChange={(v) => update((d) => { d.home.universes.subtitle = v; })}
          multiline
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-rose-700">Bloc Beauté</p>
            <TextField
              label="Titre"
              value={c.home.universes.beaute.title}
              onChange={(v) => update((d) => { d.home.universes.beaute.title = v; })}
            />
            <div className="mt-4">
              <TextField
                label="Description"
                value={c.home.universes.beaute.description}
                onChange={(v) => update((d) => { d.home.universes.beaute.description = v; })}
                multiline
              />
            </div>
            <div className="mt-4 space-y-4">
              <VisualSelectField
                label="Couleur du cadre"
                value={c.home.universes.beaute.variant || 'rose'}
                type="color"
                onChange={(v) => update((d) => { d.home.universes.beaute.variant = v as any; })}
              />
              <VisualSelectField
                label="Taille du cadre"
                value={c.home.universes.beaute.size || 'medium'}
                type="size"
                onChange={(v) => update((d) => { d.home.universes.beaute.size = v as any; })}
              />
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">Bloc Mode</p>
            <TextField
              label="Titre"
              value={c.home.universes.mode.title}
              onChange={(v) => update((d) => { d.home.universes.mode.title = v; })}
            />
            <div className="mt-4">
              <TextField
                label="Description"
                value={c.home.universes.mode.description}
                onChange={(v) => update((d) => { d.home.universes.mode.description = v; })}
                multiline
              />
            </div>
            <div className="mt-4 space-y-4">
              <VisualSelectField
                label="Couleur du cadre"
                value={c.home.universes.mode.variant || 'ambre'}
                type="color"
                onChange={(v) => update((d) => { d.home.universes.mode.variant = v as any; })}
              />
              <VisualSelectField
                label="Taille du cadre"
                value={c.home.universes.mode.size || 'medium'}
                type="size"
                onChange={(v) => update((d) => { d.home.universes.mode.size = v as any; })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Bannière CTA finale">
        <TextField
          label="Titre"
          value={c.home.cta.title}
          onChange={(v) => update((d) => { d.home.cta.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.home.cta.subtitle}
          onChange={(v) => update((d) => { d.home.cta.subtitle = v; })}
          multiline
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Bouton 1"
            value={c.home.cta.primary}
            onChange={(v) => update((d) => { d.home.cta.primary = v; })}
          />
          <TextField
            label="Bouton 2"
            value={c.home.cta.secondary}
            onChange={(v) => update((d) => { d.home.cta.secondary = v; })}
          />
        </div>
      </Card>
    </div>
  );
}

function TabUniverse({
  universe,
  c,
  update,
}: {
  universe: ProductUniverse;
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  const isBeaute = universe === 'beaute';

  return (
    <div className="space-y-5">
      <Card title="Hero" accent={isBeaute ? 'border-rose-200' : 'border-amber-200'}>
        <TextField
          label="Badge"
          value={c[universe].hero.badge}
          onChange={(v) => update((d) => { d[universe].hero.badge = v; })}
        />
        <TextField
          label="Titre"
          value={c[universe].hero.title}
          onChange={(v) => update((d) => { d[universe].hero.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c[universe].hero.subtitle}
          onChange={(v) => update((d) => { d[universe].hero.subtitle = v; })}
          multiline
        />
        <TextField
          label="Bouton hero"
          value={c[universe].hero.cta}
          onChange={(v) => update((d) => { d[universe].hero.cta = v; })}
        />
      </Card>

      <Card title="Bloc « Valeurs / engagements »" description="Ajoutez, modifiez ou supprimez des valeurs. Minimum 1.">
        <TextField
          label="Titre du bloc"
          value={c[universe].values.title}
          onChange={(v) => update((d) => { d[universe].values.title = v; })}
        />
        <div className="space-y-3">
          {c[universe].values.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Valeur {i + 1}</span>
                {c[universe].values.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => update((d) => { d[universe].values.items.splice(i, 1); })}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                  >
                    🗑 Supprimer
                  </button>
                )}
              </div>
              <div className="grid gap-4 grid-cols-[80px_1fr]">
                <TextField
                  label="Emoji"
                  value={item.emoji}
                  onChange={(v) => update((d) => { d[universe].values.items[i].emoji = v; })}
                />
                <TextField
                  label="Titre"
                  value={item.title}
                  onChange={(v) => update((d) => { d[universe].values.items[i].title = v; })}
                />
              </div>
              <div className="mt-4">
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(v) => update((d) => { d[universe].values.items[i].description = v; })}
                  multiline
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update((d) => { d[universe].values.items.push({ emoji: '✨', title: 'Nouvelle valeur', description: 'Description de cette valeur.' }); })}
          className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-3 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
        >
          + Ajouter une valeur
        </button>
      </Card>

      <Card title="Bloc « Produits sur mesure »">
        <TextField
          label="Titre du bloc produits"
          value={c[universe].productsTitle}
          onChange={(v) => update((d) => { d[universe].productsTitle = v; })}
        />
        <TextField
          label="Sous-titre (peut contenir {count})"
          hint="Utilisez {count} pour insérer le nombre de produits."
          value={c[universe].productsSubtitleTemplate}
          onChange={(v) => update((d) => { d[universe].productsSubtitleTemplate = v; })}
          multiline
        />
        <TextField
          label="Bouton « Voir le catalogue »"
          value={c[universe].catalogueCta}
          onChange={(v) => update((d) => { d[universe].catalogueCta = v; })}
        />
      </Card>

      <Card title="Bandeau contact bas de page">
        <TextField
          label="Titre"
          value={c[universe].contactBlock.title}
          onChange={(v) => update((d) => { d[universe].contactBlock.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c[universe].contactBlock.subtitle}
          onChange={(v) => update((d) => { d[universe].contactBlock.subtitle = v; })}
          multiline
        />
        <TextField
          label="Bouton"
          value={c[universe].contactBlock.cta}
          onChange={(v) => update((d) => { d[universe].contactBlock.cta = v; })}
        />
      </Card>
    </div>
  );
}

function TabCatalogue({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="En-tête de la page">
        <TextField
          label="Eyebrow"
          value={c.catalogue.eyebrow}
          onChange={(v) => update((d) => { d.catalogue.eyebrow = v; })}
        />
        <TextField
          label="Titre"
          value={c.catalogue.title}
          onChange={(v) => update((d) => { d.catalogue.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.catalogue.subtitle}
          onChange={(v) => update((d) => { d.catalogue.subtitle = v; })}
          multiline
        />
        <TextField
          label="Bouton retour"
          value={c.catalogue.backLabel}
          onChange={(v) => update((d) => { d.catalogue.backLabel = v; })}
        />
      </Card>

      <Card title="Libellés des filtres">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Filtre Univers"
            value={c.catalogue.filterUniverseLabel}
            onChange={(v) => update((d) => { d.catalogue.filterUniverseLabel = v; })}
          />
          <TextField
            label="Filtre Catégories"
            value={c.catalogue.filterCategoryLabel}
            onChange={(v) => update((d) => { d.catalogue.filterCategoryLabel = v; })}
          />
        </div>
      </Card>

      <Card title="État vide (aucun produit trouvé)">
        <TextField
          label="Titre"
          value={c.catalogue.emptyState.title}
          onChange={(v) => update((d) => { d.catalogue.emptyState.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.catalogue.emptyState.subtitle}
          onChange={(v) => update((d) => { d.catalogue.emptyState.subtitle = v; })}
          multiline
        />
        <TextField
          label="Bouton « Voir tous »"
          value={c.catalogue.emptyState.cta}
          onChange={(v) => update((d) => { d.catalogue.emptyState.cta = v; })}
        />
      </Card>

      <Card title="Bandeau CTA bas de page">
        <TextField
          label="Titre"
          value={c.catalogue.ctaBlock.title}
          onChange={(v) => update((d) => { d.catalogue.ctaBlock.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.catalogue.ctaBlock.subtitle}
          onChange={(v) => update((d) => { d.catalogue.ctaBlock.subtitle = v; })}
          multiline
        />
        <TextField
          label="Bouton"
          value={c.catalogue.ctaBlock.cta}
          onChange={(v) => update((d) => { d.catalogue.ctaBlock.cta = v; })}
        />
      </Card>
    </div>
  );
}

function TabContact({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="En-tête">
        <TextField
          label="Eyebrow"
          value={c.contact.eyebrow}
          onChange={(v) => update((d) => { d.contact.eyebrow = v; })}
        />
        <TextField
          label="Titre"
          value={c.contact.title}
          onChange={(v) => update((d) => { d.contact.title = v; })}
        />
      </Card>

      <Card title="Bloc « Nous écrire »">
        <TextField
          label="Titre du bloc"
          value={c.contact.writeUs.title}
          onChange={(v) => update((d) => { d.contact.writeUs.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.contact.writeUs.subtitle}
          onChange={(v) => update((d) => { d.contact.writeUs.subtitle = v; })}
          multiline
        />
      </Card>

      <Card
        title="Expédition / retour"
        description="Email, WhatsApp, adresse et horaires sont configurés dans Paramètres."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Libellé « Expédition »"
            value={c.contact.shipping.label}
            onChange={(v) => update((d) => { d.contact.shipping.label = v; })}
          />
          <TextField
            label="Valeur affichée"
            value={c.contact.shipping.value}
            onChange={(v) => update((d) => { d.contact.shipping.value = v; })}
          />
        </div>
        <TextField
          label="Bouton « Retour à l'accueil »"
          value={c.contact.back}
          onChange={(v) => update((d) => { d.contact.back = v; })}
        />
      </Card>
    </div>
  );
}

// ─── Onglet Avis clients ──────────────────────────────────────────────────────

function TabAvis({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="En-tête de la section">
        <TextField
          label="Titre"
          value={c.reviews.title}
          onChange={(v) => update((d) => { d.reviews.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.reviews.subtitle}
          onChange={(v) => update((d) => { d.reviews.subtitle = v; })}
          multiline
        />
      </Card>

      <Card title="Avis clients" description="Ajoutez, modifiez ou supprimez des avis.">
        <div className="space-y-3">
          {c.reviews.items.map((review, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Avis {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update((d) => { d.reviews.items.splice(i, 1); })}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  🗑 Supprimer
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Initiales"
                  value={review.initials}
                  onChange={(v) => update((d) => { d.reviews.items[i].initials = v; })}
                  hint="Ex: AK"
                />
                <TextField
                  label="Nom"
                  value={review.name}
                  onChange={(v) => update((d) => { d.reviews.items[i].name = v; })}
                />
                <TextField
                  label="Rôle"
                  value={review.role}
                  onChange={(v) => update((d) => { d.reviews.items[i].role = v; })}
                />
                <TextField
                  label="Produit"
                  value={review.product}
                  onChange={(v) => update((d) => { d.reviews.items[i].product = v; })}
                />
                <TextField
                  label="Note (1-5)"
                  value={String(review.rating)}
                  onChange={(v) => update((d) => { d.reviews.items[i].rating = parseInt(v) || 5; })}
                />
                <TextField
                  label="Résultat"
                  value={review.result || ''}
                  onChange={(v) => update((d) => { d.reviews.items[i].result = v; })}
                />
                <TextField
                  label="Période"
                  value={review.period || ''}
                  onChange={(v) => update((d) => { d.reviews.items[i].period = v; })}
                />
              </div>
              <div className="mt-4">
                <TextField
                  label="Texte du témoignage"
                  value={review.text}
                  onChange={(v) => update((d) => { d.reviews.items[i].text = v; })}
                  multiline
                />
              </div>
              <div className="mt-4">
                <TextField
                  label="Tags (séparés par des virgules)"
                  value={review.tags.join(', ')}
                  onChange={(v) => update((d) => { d.reviews.items[i].tags = v.split(',').map(t => t.trim()).filter(Boolean); })}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update((d) => {
            d.reviews.items.push({
              initials: 'XX',
              name: 'Nouveau Client',
              role: 'Client',
              product: 'Produit',
              rating: 5,
              text: 'Super produit, je recommande !',
              tags: ['Qualité'],
              result: 'Satisfait',
              period: '1 mois',
            });
          })}
          className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-3 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
        >
          + Ajouter un avis
        </button>
      </Card>
    </div>
  );
}

// ─── Onglet Artisans ──────────────────────────────────────────────────────────

function TabArtisans({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="En-tête de la section">
        <TextField
          label="Titre"
          value={c.artisans.title}
          onChange={(v) => update((d) => { d.artisans.title = v; })}
        />
        <TextField
          label="Sous-titre"
          value={c.artisans.subtitle}
          onChange={(v) => update((d) => { d.artisans.subtitle = v; })}
          multiline
        />
      </Card>

      <Card title="Artisans" description="Ajoutez, modifiez ou supprimez des artisans.">
        <div className="space-y-3">
          {c.artisans.items.map((artisan, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Artisan {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update((d) => { d.artisans.items.splice(i, 1); })}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  🗑 Supprimer
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Nom"
                  value={artisan.name}
                  onChange={(v) => update((d) => { d.artisans.items[i].name = v; })}
                />
                <TextField
                  label="Rôle"
                  value={artisan.role}
                  onChange={(v) => update((d) => { d.artisans.items[i].role = v; })}
                />
                <TextField
                  label="Localisation"
                  value={artisan.location}
                  onChange={(v) => update((d) => { d.artisans.items[i].location = v; })}
                />
                <TextField
                  label="Image Seed"
                  value={artisan.imageSeed}
                  onChange={(v) => update((d) => { d.artisans.items[i].imageSeed = v; })}
                  hint="Identifiant pour l'image (picsum.photos)"
                />
              </div>
              <div className="mt-4">
                <TextField
                  label="Description"
                  value={artisan.description}
                  onChange={(v) => update((d) => { d.artisans.items[i].description = v; })}
                  multiline
                />
              </div>
              <div className="mt-4">
                <TextField
                  label="Tags (séparés par des virgules)"
                  value={artisan.tags.join(', ')}
                  onChange={(v) => update((d) => { d.artisans.items[i].tags = v.split(',').map(t => t.trim()).filter(Boolean); })}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update((d) => {
            d.artisans.items.push({
              name: 'Nouvel Artisan',
              role: 'Artisan',
              location: 'Dakar',
              description: 'Description de l\'artisan.',
              tags: ['Artisanat'],
              imageSeed: 'artisan-default',
            });
          })}
          className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-3 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
        >
          + Ajouter un artisan
        </button>
      </Card>
    </div>
  );
}

// ─── Onglet Marquee ───────────────────────────────────────────────────────────

function TabMarquee({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="Barre défilante (Marquee)" description="Messages qui défilent en haut du site. Ajoutez, modifiez ou supprimez des messages.">
        <div className="space-y-3">
          {c.marquee.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Message {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update((d) => { d.marquee.splice(i, 1); })}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  🗑 Supprimer
                </button>
              </div>
              <TextField
                label="Texte"
                value={item}
                onChange={(v) => update((d) => { d.marquee[i] = v; })}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update((d) => { d.marquee.push('Nouveau message'); })}
          className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-3 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
        >
          + Ajouter un message
        </button>
      </Card>
    </div>
  );
}

// ─── Onglet Barre de confiance ───────────────────────────────────────────────

function TabTrustBar({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="Barre de confiance" description="Icônes et textes affichés sous le header. Ajoutez, modifiez ou supprimez des éléments.">
        <div className="space-y-3">
          {c.trustBar.map((item, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Élément {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update((d) => { d.trustBar.splice(i, 1); })}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  🗑 Supprimer
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Icône (emoji)"
                  value={item.icon}
                  onChange={(v) => update((d) => { d.trustBar[i].icon = v; })}
                  hint="Ex: 🔒, 🚚, 💳, ✅"
                />
                <TextField
                  label="Texte"
                  value={item.label}
                  onChange={(v) => update((d) => { d.trustBar[i].label = v; })}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update((d) => { d.trustBar.push({ icon: '✨', label: 'Nouvel élément' }); })}
          className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-3 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
        >
          + Ajouter un élément
        </button>
      </Card>
    </div>
  );
}

// ─── Onglet Liens footer ─────────────────────────────────────────────────────

function TabFooterLinks({
  c,
  update,
}: {
  c: SiteContent;
  update: (mutator: (draft: SiteContent) => void) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="Liens du footer" description="Liens affichés dans le pied de page. Ajoutez, modifiez ou supprimez des liens.">
        <div className="space-y-3">
          {c.footerLinks.map((link, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Lien {i + 1}</span>
                <button
                  type="button"
                  onClick={() => update((d) => { d.footerLinks.splice(i, 1); })}
                  className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                >
                  🗑 Supprimer
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Texte affiché"
                  value={link.label}
                  onChange={(v) => update((d) => { d.footerLinks[i].label = v; })}
                />
                <TextField
                  label="Lien (URL)"
                  value={link.href}
                  onChange={(v) => update((d) => { d.footerLinks[i].href = v; })}
                  hint="Ex: /catalogue, /contact, /admin"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => update((d) => { d.footerLinks.push({ label: 'Nouveau lien', href: '/' }); })}
          className="w-full rounded-xl border-2 border-dashed border-brand-200 bg-brand-50/40 py-3 text-sm font-semibold text-brand-700 hover:border-brand-400 hover:bg-brand-50 transition"
        >
          + Ajouter un lien
        </button>
      </Card>
    </div>
  );
}

// ─── Onglet Avis en attente ──────────────────────────────────────────────────

type PendingReview = {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  product: string;
  text: string;
  status: string;
  created_at: string;
};

function TabPendingReviews({
  update,
  onSave,
}: {
  update: (mutator: (draft: SiteContent) => void) => void;
  onSave: () => Promise<void>;
}) {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase non configuré.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('pending_reviews')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (fetchError) throw new Error(fetchError.message);
      setReviews(data || []);
    } catch (err) {
      setError('Erreur lors du chargement des avis en attente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function approveReview(id: string) {
    setActionLoading(id);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('pending_reviews')
        .update({ status: 'approved' })
        .eq('id', id);
      if (updateError) throw new Error(updateError.message);

      // Ajouter l'avis au contenu éditorial du site
      const reviewObj = reviews.find((r) => r.id === id);
      if (reviewObj) {
        const names = reviewObj.name.trim().split(/\s+/);
        let initials = 'CL';
        if (names.length > 0) {
          initials = names.map((n) => n[0]).join('').toUpperCase().slice(0, 2);
        }

        update((draft) => {
          draft.reviews.items.push({
            initials,
            name: reviewObj.name,
            role: 'Client vérifié',
            product: reviewObj.product,
            rating: reviewObj.rating,
            text: reviewObj.text,
            tags: ['Vérifié'],
            result: 'Satisfait',
            period: 'Récemment',
          });
        });

        // Déclencher la sauvegarde persistante vers site_settings
        setTimeout(() => {
          void onSave();
        }, 100);
      }

      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('[TabPendingReviews] Erreur approbation:', err);
      setError('Erreur lors de l\'approbation.');
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectReview(id: string) {
    setActionLoading(id);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('pending_reviews')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (updateError) throw new Error(updateError.message);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Erreur lors du rejet.');
    } finally {
      setActionLoading(null);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
        ⚠ Supabase n'est pas configuré. Les visiteurs ne peuvent pas soumettre d'avis.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="font-semibold text-slate-900">Avis en attente de validation</p>
            <p className="mt-1 text-xs text-slate-500">
              {reviews.length} avis en attente
            </p>
          </div>
          <button
            type="button"
            onClick={loadReviews}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
          >
            {loading ? '⟳' : '↻'} Actualiser
          </button>
        </div>

        {loading && (
          <div className="text-center py-10 text-sm text-slate-400">
            Chargement des avis…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm font-semibold text-slate-700">Aucun avis en attente</p>
            <p className="text-xs text-slate-400 mt-1">Tous les avis ont été traités.</p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900">{review.name}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(review.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-400 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                        {review.product}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 italic mb-2">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    {review.email && (
                      <p className="text-xs text-slate-400">📧 {review.email}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => approveReview(review.id)}
                      disabled={actionLoading === review.id}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                      {actionLoading === review.id ? '…' : '✓ Approuver'}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectReview(review.id)}
                      disabled={actionLoading === review.id}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-60"
                    >
                      ✗ Rejeter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const siteContent = useShopStore((state) => state.siteContent);
  const setSiteContentDeep = useShopStore((state) => state.setSiteContentDeep);
  const resetSiteContent = useShopStore((state) => state.resetSiteContent);

  const siteImages = useShopStore((state) => state.siteImages);
  const setSiteImages = useShopStore((state) => state.setSiteImages);
  const resetSiteImages = useShopStore((state) => state.resetSiteImages);

  const brand = useShopStore((state) => state.brand);

  const hydrated = useHydrated();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<TabId>('medias');

  useEffect(() => {
    void useShopStore.persist.rehydrate();
  }, []);

  const c = hydrated ? siteContent : defaultSiteContent;
  const imgs = hydrated ? siteImages : defaultSiteImages;
  const t = hydrated ? useShopStore.getState().siteTheme : defaultSiteTheme;

  function update(mutator: (draft: SiteContent) => void) {
    setSiteContentDeep((current) => {
      const clone: SiteContent = JSON.parse(JSON.stringify(current));
      mutator(clone);
      return clone;
    });
    setDirty(true);
    setSaveStatus('idle');
  }

  function updateImage(patch: Partial<SiteImages>) {
    setSiteImages(patch);
    setDirty(true);
    setSaveStatus('idle');
  }

  function updateTheme(patch: Partial<SiteTheme>) {
    useShopStore.getState().setSiteTheme(patch);
    setDirty(true);
    setSaveStatus('idle');
  }

  async function handleSave() {
    setSaving(true);
    setSaveStatus('idle');

    // Lire les valeurs les plus récentes du store Zustand pour éviter l'état obsolète (stale state)
    const freshSiteContent = useShopStore.getState().siteContent;
    const freshSiteImages = useShopStore.getState().siteImages;
    const freshSiteTheme = useShopStore.getState().siteTheme;
    const freshBrand = useShopStore.getState().brand;

    // 1) Sauvegarder vers Supabase (si configuré)
    const supabaseResult = await saveAllToSupabase(freshSiteContent, freshSiteImages, freshSiteTheme, freshBrand);

    // 2) Sauvegarder aussi localement (fallback fichier JSON)
    const localResult = await saveAllToLocal(freshSiteContent, freshSiteImages, freshSiteTheme, freshBrand);

    setSaving(false);
    if (supabaseResult.ok && localResult.ok) {
      setSaveStatus('success');
      setDirty(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  }

  async function handleSaveLocal() {
    setSaving(true);
    setSaveStatus('idle');
    const freshSiteContent = useShopStore.getState().siteContent;
    const freshSiteImages = useShopStore.getState().siteImages;
    const freshSiteTheme = useShopStore.getState().siteTheme;
    const freshBrand = useShopStore.getState().brand;
    const result = await saveAllToLocal(freshSiteContent, freshSiteImages, freshSiteTheme, freshBrand);
    setSaving(false);
    if (result.ok) {
      setSaveStatus('success');
      setDirty(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
          <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
            <AdminSidebar />
            <div className="rounded-3xl bg-white p-8 shadow-lg text-slate-500">
              Chargement de l&apos;éditeur de contenu…
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
          <AdminSidebar />

          <div className="space-y-6 min-w-0">

            {/* ── Header ── */}
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-brand-700 font-semibold">Contenu</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Édition du contenu du site
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Modifiez les textes et images. Cliquez sur <strong>Enregistrer</strong> pour sauvegarder.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Voir le site →
                  </Link>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || (!dirty && saveStatus === 'idle')}
                    className={`inline-flex items-center gap-2 justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-60
                      ${saveStatus === 'success'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : saveStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-700'
                        : dirty
                        ? 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700'
                        : 'bg-slate-400'
                      }`}
                  >
                    {saving ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enregistrement…
                      </>
                    ) : saveStatus === 'success' ? '✓ Enregistré'
                      : saveStatus === 'error' ? '✗ Erreur'
                      : dirty ? '💾 Enregistrer'
                      : '✓ À jour'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLocal}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
                  >
                    💾 Sauvegarder localement
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Restaurer les textes par défaut ? Vos modifications seront perdues.')) {
                        resetSiteContent();
                        resetSiteImages();
                        setDirty(true);
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition"
                  >
                    Restaurer
                  </button>
                </div>
              </div>

              {/* Bandeaux de statut */}
              {saveStatus === 'success' && (
                <p className="mt-4 text-sm text-emerald-700 font-medium">✓ Modifications enregistrées avec succès.</p>
              )}
              {saveStatus === 'error' && (
                <p className="mt-4 text-sm text-rose-700 font-medium">✗ Erreur lors de l&apos;enregistrement. Réessaie.</p>
              )}
              {dirty && saveStatus === 'idle' && (
                <p className="mt-4 text-sm text-amber-600">⚠ Modifications non enregistrées.</p>
              )}
            </div>

            {/* ── Éditeur avec onglets latéraux ── */}
            <div className="rounded-3xl bg-white shadow-lg overflow-hidden">
              <div className="flex min-h-[600px]">

                {/* Onglets latéraux */}
                <nav className="flex w-44 shrink-0 flex-col border-r border-slate-100 bg-slate-50 py-4">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left
                        ${activeTab === tab.id
                          ? 'bg-white text-slate-950 shadow-sm border-r-2 border-brand-600 font-semibold'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                    >
                      <span className="text-base leading-none">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Contenu de l'onglet actif */}
                <div className="flex-1 overflow-y-auto p-6 min-w-0">
                  {activeTab === 'theme' && (
                    <TabTheme theme={t} updateTheme={updateTheme} />
                  )}
                  {activeTab === 'medias' && (
                    <TabMedias imgs={imgs} updateImage={updateImage} />
                  )}
                  {activeTab === 'accueil' && (
                    <TabAccueil c={c} update={update} />
                  )}
                  {activeTab === 'beaute' && (
                    <TabUniverse universe="beaute" c={c} update={update} />
                  )}
                  {activeTab === 'mode' && (
                    <TabUniverse universe="mode" c={c} update={update} />
                  )}
                  {activeTab === 'catalogue' && (
                    <TabCatalogue c={c} update={update} />
                  )}
                  {activeTab === 'contact' && (
                    <TabContact c={c} update={update} />
                  )}
                  {activeTab === 'avis' && (
                    <TabAvis c={c} update={update} />
                  )}
                  {activeTab === 'artisans' && (
                    <TabArtisans c={c} update={update} />
                  )}
                  {activeTab === 'marquee' && (
                    <TabMarquee c={c} update={update} />
                  )}
                  {activeTab === 'trustbar' && (
                    <TabTrustBar c={c} update={update} />
                  )}
                  {activeTab === 'footerlinks' && (
                    <TabFooterLinks c={c} update={update} />
                  )}
                  {activeTab === 'pending-reviews' && (
                    <TabPendingReviews
                      update={update}
                      onSave={handleSave}
                    />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
