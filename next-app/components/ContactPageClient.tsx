'use client';

import Link from 'next/link';
import { useShopStore, whatsappToHref } from '@/lib/shop-store';
import { defaultSiteContent } from '@/lib/data';
import { useHydrated } from '@/lib/use-hydrated';

export default function ContactPageClient() {
  const brand = useShopStore((state) => state.brand);
  const siteContent = useShopStore((state) => state.siteContent);
  const hydrated = useHydrated();

  const page = hydrated ? siteContent.contact : defaultSiteContent.contact;
  const whatsappHref = whatsappToHref(brand.whatsapp);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
        <div className="rounded-[2rem] bg-white p-10 shadow-soft">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.32em] text-brand-700">{page.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              {page.title}
            </h1>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-8">
              <h2 className="text-xl font-semibold text-slate-950">{page.writeUs.title}</h2>
              <p className="text-sm leading-7 text-slate-600">{page.writeUs.subtitle}</p>
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Email :</strong>{' '}
                  <a
                    href={`mailto:${brand.email}`}
                    className="text-brand-700 underline-offset-4 hover:underline"
                  >
                    {brand.email}
                  </a>
                </p>
                <p>
                  <strong>WhatsApp :</strong>{' '}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-700 underline-offset-4 hover:underline"
                  >
                    {brand.whatsapp}
                  </a>
                </p>
                <p>
                  <strong>Adresse :</strong> {brand.address}
                </p>
              </div>
            </div>
            <div className="grid gap-4 rounded-3xl border border-slate-200 p-8">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-brand-700">Horaires</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{brand.hours}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-brand-700">
                  {page.shipping.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{page.shipping.value}</p>
              </div>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {page.back}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
