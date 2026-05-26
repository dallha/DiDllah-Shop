'use client';

import ScrollReveal from './ScrollReveal';

const ARTISANS = [
  {
    name: 'Coopérative des Femmes de Casamance',
    role: 'Beurre de Karité & Savon Noir',
    location: 'Ziguinchor, Casamance',
    story:
      'Depuis 2018, nous travaillons main dans la main avec une coopérative de 45 femmes qui perpétuent le savoir-faire ancestral du karité. Chaque pot est le fruit d\'un travail collectif, du ramassage des noix au barattage traditionnel.',
    image: null,
    initials: 'CF',
    tags: ['Karité', 'Équitable', 'Femmes'],
  },
  {
    name: 'Atelier Bazin de Dakar',
    role: 'Bazin Riche & Broderie Main',
    location: 'Médina, Dakar',
    story:
      'Notre maître teinturier, El Hadj, transforme le bazin brut en pièces uniques. Chaque coupon passe par 7 bains de teinture avant d\'être confié aux brodeuses de la Médina. Un savoir-faire transmis de père en fils depuis 1972.',
    image: null,
    initials: 'BD',
    tags: ['Bazin', 'Teinture', 'Artisanat'],
  },
  {
    name: 'Distillerie des Niayes',
    role: 'Huiles Essentielles & Parfums',
    location: 'Niayes, Thiès',
    story:
      'Au cœur des Niayes, notre distillateur Mamadou extrait les huiles essentielles selon la méthode traditionnelle de distillation à la vapeur. Baobab, moringa, hibiscus — chaque plante est récoltée à la main au rythme des saisons.',
    image: null,
    initials: 'DN',
    tags: ['Huiles', 'Distillation', 'Naturel'],
  },
];

export default function ArtisansSection() {
  return (
    <section className="bg-slate-950 py-20 md:py-28 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        {/* En-tête */}
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-brand-400 to-brand-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-400">
              Savoir-Faire
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Nos Artisans
          </h2>
          <p className="text-slate-400 max-w-2xl mb-14 text-sm md:text-base leading-relaxed">
            Derrière chaque produit DiDallah, il y a des mains expertes, des histoires et un héritage 
            transmis depuis des générations. Découvrez celles et ceux qui donnent vie à notre collection.
          </p>
        </ScrollReveal>

        {/* Grille */}
        <div className="grid md:grid-cols-3 gap-5">
          {ARTISANS.map((artisan, i) => (
            <ScrollReveal key={artisan.name} delay={i * 150}>
              <div className="group relative bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-900/10 hover:-translate-y-1">
                {/* En-tête avec initiales */}
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg">
                      {artisan.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-white truncate">{artisan.name}</p>
                      <p className="text-xs text-brand-400 mt-0.5">{artisan.role}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {artisan.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Histoire */}
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    &ldquo;{artisan.story}&rdquo;
                  </p>
                </div>

                {/* Localisation */}
                <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800/50 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-xs text-slate-500">{artisan.location}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Call to action */}
        <ScrollReveal delay={300}>
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 mb-4">
              Vous êtes artisan ou producteur local ? Rejoignez notre réseau.
            </p>
            <a
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-brand-500 hover:bg-brand-600 hover:shadow-lg"
            >
              <span>Nous contacter</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
