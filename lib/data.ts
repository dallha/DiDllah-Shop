export type ProductUniverse = 'beaute' | 'mode';

export type PromoCode = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  active: boolean;
};

export type ProductReview = {
  id: string;
  productId: string;
  clientName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO string
  status: 'pending' | 'approved';
};

export type Product = {
  id: string;
  name: string;
  univers: ProductUniverse;
  category: string;
  price: number;
  compareAtPrice?: number; // Prix d'origine (barré)
  tag?: string;
  short: string;
  long: string;
  details: string[];
  /** URL ou data URL de l'image produit (optionnel) */
  imageUrl?: string;
  /** false = masqué de la boutique publique, true (défaut) = visible */
  active?: boolean;
};

export type CategoryOption = {
  id: string;
  label: string;
};

export const products: Product[] = [
  {
    id: 'parfum-femme-fleurs',
    name: 'Eau de Parfum — Jardin de Liberté',
    univers: 'beaute',
    category: 'Parfumerie',
    price: 38000,
    tag: 'Signature',
    short: 'Bouquet floral, sillage poudré, fond ambré.',
    long:
      'Une rêverie florale autour du jasmin et de la rose de Damas, posée sur un fond ambré et un soupçon de vanille bourbon. Tenue 8 heures.',
    details: ['50 ml', 'Notes : Jasmin, Rose, Ambre', 'Fabrication française'],
  },
  {
    id: 'parfum-homme-oud',
    name: 'Eau de Parfum — Bois de Oud',
    univers: 'beaute',
    category: 'Parfumerie',
    price: 42000,
    tag: 'Bestseller',
    short: 'Oud, cuir et épices chaudes.',
    long:
      'Un parfum boisé et mystérieux où le oud précieux rencontre le cuir, le poivre noir et un soupçon de cardamome. Pour les hommes affirmés.',
    details: ['75 ml', 'Notes : Oud, Cuir, Cardamome', 'Tenue 12 h'],
  },
  {
    id: 'parfum-ambre-noir',
    name: 'Eau de Parfum — Ambre Noir & Épices',
    univers: 'beaute',
    category: 'Parfumerie',
    price: 45000,
    tag: 'Édition limitée',
    short: 'Ambre, encens et bois précieux.',
    long:
      'Une fragrance unisexe envoûtante : ambre noir, encens d\'Éthiopie, santal et patchouli. Le sillage des grandes cérémonies.',
    details: ['75 ml', 'Unisexe', 'Série limitée — 200 exemplaires'],
  },
  {
    id: 'musc-tahara',
    name: 'Musc Tahara — Roll-On Précieux',
    univers: 'beaute',
    category: 'Parfumerie',
    price: 9500,
    short: 'Le musc blanc traditionnel, en applicateur fin.',
    long:
      'Un musc tahara doux et poudré, hérité des rituels du Golfe. Application directe sur la peau — sillage discret, tenue prolongée, sans alcool.',
    details: ['10 ml', 'Sans alcool', 'Format poche'],
  },
  {
    id: 'brume-cheveux-rose',
    name: 'Brume Cheveux — Eau de Rose',
    univers: 'beaute',
    category: 'Parfumerie',
    price: 11000,
    short: 'Parfume et rafraîchit les cheveux toute la journée.',
    long:
      'Une brume légère à l\'eau de rose et au monoï. Parfume les cheveux sans les alourdir. Vaporiser à 30 cm.',
    details: ['100 ml', 'Sans alcool', 'Tous types de cheveux'],
  },
  {
    id: 'huile-ricin',
    name: 'Huile de Ricin Noir Pressée à Froid',
    univers: 'beaute',
    category: 'Huiles & cheveux',
    price: 7500,
    tag: 'Bestseller',
    short: 'Pousse, force et brillance pour les cheveux.',
    long:
      'Pressée à froid en Casamance, l\'huile de ricin noir fortifie les longueurs et stimule la croissance capillaire.',
    details: ['100 ml', 'Pression à froid', '100 % naturelle'],
  },
  {
    id: 'huile-cheveux-7',
    name: 'Sérum Capillaire — 7 Huiles Précieuses',
    univers: 'beaute',
    category: 'Huiles & cheveux',
    price: 11000,
    short: 'Soin nourrissant pour cheveux secs et abîmés.',
    long:
      'Un sérum de finition qui discipline, lisse et fait briller. Argan, ricin, jojoba, monoï, amande, baobab et nigelle.',
    details: ['75 ml', 'Non gras', 'Pour tous types de cheveux'],
  },
  {
    id: 'huile-nigelle',
    name: 'Huile de Nigelle Pure',
    univers: 'beaute',
    category: 'Huiles & cheveux',
    price: 8800,
    tag: 'Nouveauté',
    short: 'L\'huile bénie — peau, cheveux, immunité.',
    long:
      'Huile de graines de nigelle (habba sawda) pressée à froid en Égypte. Antibactérienne, fortifiante pour les cheveux et la peau.',
    details: ['100 ml', 'Pression à froid', 'Habba sawda'],
  },
  {
    id: 'huile-coco-bio',
    name: 'Huile de Coco Vierge Bio',
    univers: 'beaute',
    category: 'Huiles & cheveux',
    price: 6500,
    short: "L'incontournable — cheveux, peau, multi-usage.",
    long:
      'Huile de coco vierge extra, pressée à froid, certifiée bio. Masque capillaire, démaquillant, hydratation corps.',
    details: ['250 ml', 'Bio certifié', 'Sans raffinage'],
  },
  {
    id: 'lait-karite',
    name: 'Lait Corporel au Karité Pur',
    univers: 'beaute',
    category: 'Soins corporels',
    price: 12500,
    tag: 'Bestseller',
    short: 'Hydratation profonde, fini soyeux. 250 ml.',
    long:
      'Notre lait signature, formulé à base de beurre de karité brut récolté en Casamance.',
    details: ['250 ml', 'Karité brut 18 %', 'Fabriqué au Sénégal'],
  },
  {
    id: 'beurre-karite-brut',
    name: 'Beurre de Karité Brut — Pot Artisanal',
    univers: 'beaute',
    category: 'Soins corporels',
    price: 8500,
    short: 'Beurre 100 % brut, non raffiné. 150 g.',
    long:
      'Récolté en Casamance et baratté à la main par une coopérative de femmes. Nourrit, répare, protège.',
    details: ['150 g', '100 % brut', 'Coopérative équitable'],
  },
  {
    id: 'savon-noir',
    name: 'Savon Noir Traditionnel',
    univers: 'beaute',
    category: 'Soins corporels',
    price: 4500,
    short: 'Le rituel hammam, à la maison. 200 g.',
    long:
      'Un savon noir onctueux fabriqué selon la tradition à base d\'olives et de potasse végétale.',
    details: ['200 g', 'Sans conservateur', 'Toutes peaux'],
  },
  {
    id: 'gommage-baobab',
    name: 'Gommage Corps au Baobab',
    univers: 'beaute',
    category: 'Soins corporels',
    price: 9800,
    tag: 'Nouveauté',
    short: 'Exfoliant doux, peau lumineuse. 200 ml.',
    long:
      'Un gommage sucré aux graines de baobab et au sucre de canne. Élimine les peaux mortes, réveille l\'éclat.',
    details: ['200 ml', 'Graines de baobab', 'Texture fondante'],
  },
  {
    id: 'lotion-eclat',
    name: 'Lotion Visage Éclat — Fleur d\'Hibiscus',
    univers: 'beaute',
    category: 'Soins visage',
    price: 14000,
    short: 'Tonique floral, lumière instantanée.',
    long:
      "Une lotion sans alcool à l'hibiscus et à l'eau de rose. Resserre les pores, apaise, révèle l'éclat.",
    details: ['200 ml', 'Sans alcool', 'Tous types de peau'],
  },
  {
    id: 'rouge-a-levres',
    name: 'Rouge à Lèvres Mat — Terracotta',
    univers: 'beaute',
    category: 'Maquillage',
    price: 9500,
    short: 'Fini velours, tenue longue durée.',
    long: 'Un rouge mat sublime, hydratant, qui sublime toutes les carnations.',
    details: ['3,5 g', 'Cruelty-free', 'Sans parfum'],
  },
  {
    id: 'baume-levres',
    name: 'Baume à Lèvres — Karité & Miel',
    univers: 'beaute',
    category: 'Maquillage',
    price: 5500,
    short: 'Réparation, douceur, brillance discrète.',
    long:
      'Un baume nourrissant au karité brut et au miel d\'acacia, pour des lèvres pulpeuses en toute saison.',
    details: ['15 g', 'Sans parfum de synthèse', 'Tube en aluminium recyclé'],
  },
  {
    id: 'boubou-femme-brode',
    name: "Boubou Femme Brodé — Soirée d'Or",
    univers: 'mode',
    category: 'Tenues traditionnelles',
    price: 75000,
    tag: 'Édition limitée',
    short: 'Bazin riche brodé à la main, fils dorés.',
    long:
      "Confectionné dans nos ateliers à Dakar. Bazin teinté indigo, broderie or aux poignets et à l'encolure.",
    details: ['100 % Bazin Riche', 'Tailles S — XL', 'Confection sur mesure possible'],
  },
  {
    id: 'jallaba-homme',
    name: 'Jallaba Homme — Coupe Cérémonie',
    univers: 'mode',
    category: 'Tenues traditionnelles',
    price: 65000,
    short: 'Tenue de cérémonie en bazin teinté.',
    long:
      'Une jallaba élégante, idéale pour Korité, Tabaski, baptêmes et mariages.',
    details: ['Bazin Riche', 'Tailles M — XXL', '3 coloris : Ivoire, Bleu, Vert sauge'],
  },
  {
    id: 'robe-wax-tendance',
    name: 'Robe Midi en Wax — Coupe Asymétrique',
    univers: 'mode',
    category: 'Prêt-à-porter contemporain',
    price: 32000,
    tag: 'Bestseller',
    short: 'Wax authentique, coupe moderne.',
    long:
      'Une robe midi près du corps, manche unique, ceinture nouée. Wax importé du Ghana.',
    details: ['Wax 100 % coton', 'Tailles 36 — 44', 'Doublure incluse'],
  },
  {
    id: 'chemise-lin',
    name: 'Chemise en Lin — Homme',
    univers: 'mode',
    category: 'Prêt-à-porter contemporain',
    price: 22000,
    short: 'Coupe droite, col mao, lin lavé.',
    long:
      'La chemise polyvalente, du déjeuner à la soirée. Lin lavé européen, finitions main.',
    details: ['Lin 100 %', 'Tailles S — XL', '5 coloris'],
  },
  {
    id: 'tissu-bazin',
    name: 'Tissu Bazin Riche — 5 mètres',
    univers: 'mode',
    category: 'Tissus',
    price: 28000,
    short: 'Bazin teinté, qualité couture.',
    long:
      'Notre Bazin Riche, idéal pour vos confections sur mesure. Vendu par coupon de 5 mètres.',
    details: ['5 mètres', '12 teintes disponibles', 'Pour confection'],
  },
  {
    id: 'tissu-wax-6y',
    name: 'Tissu Wax — 6 yards',
    univers: 'mode',
    category: 'Tissus',
    price: 18000,
    short: 'Wax authentique imprimé à la cire.',
    long:
      'Wax imprimé à la cire selon la tradition. Six yards pour ensemble complet.',
    details: ['6 yards', 'Coton 100 %', 'Nouveaux motifs / mois'],
  },
  {
    id: 'sac-brode',
    name: 'Sac à Main Brodé — Édition Dakar',
    univers: 'mode',
    category: 'Accessoires',
    price: 24000,
    tag: 'Nouveauté',
    short: 'Cuir et broderie main, bandoulière ajustable.',
    long:
      'Sac structuré en cuir grainé, rehaussé d’une broderie main aux motifs ndokette.',
    details: ['Cuir véritable', '27 × 18 × 9 cm', 'Bandoulière ajustable'],
  },
];

export const categories: Record<ProductUniverse, CategoryOption[]> = {
  beaute: [
    { id: 'Parfumerie', label: 'Parfumerie' },
    { id: 'Huiles & cheveux', label: 'Huiles & cheveux' },
    { id: 'Soins corporels', label: 'Soins corporels' },
    { id: 'Soins visage', label: 'Soins visage' },
    { id: 'Maquillage', label: 'Maquillage' },
  ],
  mode: [
    { id: 'Prêt-à-porter contemporain', label: 'Prêt-à-porter' },
    { id: 'Tenues traditionnelles', label: 'Tenues traditionnelles' },
    { id: 'Tissus', label: 'Tissus' },
    { id: 'Accessoires', label: 'Accessoires' },
  ],
};

export const shop = {
  name: 'DiDallah',
  tagline: 'Beauté & élégance, directement de Dakar',
  whatsapp: '+221 76 305 05 05',
  email: 'bonjour@didallah.sn',
  address: 'Liberté 6 Extension, Dakar — Sénégal',
  hours: 'Lun – Sam · 9 h – 20 h',
};

export const content = {
  hero: {
    eyebrow: 'Maison fondée à Dakar · Liberté 6',
    title1: "L'élégance",
    title2: 'sénégalaise',
    title3: 'au bout des doigts.',
    lede:
      'Beauté, mode et tissus d’exception — une sélection rare, livrée à votre porte depuis la capitale.',
    seasonLabel: 'Saison',
    season: 'Printemps · 2026',
    editionLabel: 'Édition',
    edition: 'N° 04 — Or & Bazin',
  },
};

// =========================================================================
// Contenu éditorial du site — éditable depuis /admin/content
// =========================================================================

export type StatCard = {
  eyebrow: string;
  value: string;
  description: string;
  variant?: 'sombre' | 'clair' | 'vert' | 'clair-simple';
  size?: 'normal' | 'large';
};

export type ValueCard = {
  emoji: string;
  title: string;
  description: string;
};

export type HomeContent = {
  hero: {
    badge: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  stats: StatCard[];
  featured: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
  };
  universes: {
    title: string;
    subtitle: string;
    beaute: { title: string; description: string; variant?: 'auto' | 'sombre' | 'clair' | 'vert' | 'rose' | 'ambre'; size?: 'compact' | 'medium' | 'large' };
    mode: { title: string; description: string; variant?: 'auto' | 'sombre' | 'clair' | 'vert' | 'rose' | 'ambre'; size?: 'compact' | 'medium' | 'large' };
  };
  cta: {
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
  };
};

export type UniversePageContent = {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  values: {
    title: string;
    items: ValueCard[];
  };
  productsTitle: string;
  productsSubtitleTemplate: string; // peut contenir {count}
  catalogueCta: string;
  contactBlock: {
    title: string;
    subtitle: string;
    cta: string;
  };
};

export type CatalogueContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  backLabel: string;
  filterUniverseLabel: string;
  filterCategoryLabel: string;
  emptyState: {
    title: string;
    subtitle: string;
    cta: string;
  };
  ctaBlock: {
    title: string;
    subtitle: string;
    cta: string;
  };
};

export type ContactContent = {
  eyebrow: string;
  title: string;
  writeUs: {
    title: string;
    subtitle: string;
  };
  shipping: {
    label: string;
    value: string;
  };
  back: string;
};

export type Review = {
  initials: string;
  name: string;
  role: string;
  product: string;
  rating: number;
  text: string;
  tags: string[];
  result?: string;
  period?: string;
};

export type Artisan = {
  name: string;
  role: string;
  location: string;
  description: string;
  tags: string[];
  imageSeed: string;
};

export type MarqueeItem = string;

export type TrustBarItem = {
  icon: string;
  label: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type SiteTheme = {
  radius: 'square' | 'rounded' | 'pill';
  shadows: 'none' | 'soft' | 'deep';
  brandColor: 'nuit' | 'ocean' | 'emeraude' | 'rubis' | 'or';
  animations: boolean;
};

export type SiteContent = {
  home: HomeContent;
  beaute: UniversePageContent;
  mode: UniversePageContent;
  catalogue: CatalogueContent;
  contact: ContactContent;
  reviews: {
    title: string;
    subtitle: string;
    items: Review[];
  };
  artisans: {
    title: string;
    subtitle: string;
    items: Artisan[];
  };
  marquee: MarqueeItem[];
  trustBar: TrustBarItem[];
  footerLinks: FooterLink[];
};

export const defaultSiteContent: SiteContent = {
  home: {
    hero: {
      badge: 'Luxe africain • expérience premium',
      subtitle:
        "Une expérience commerce moderne, pensée pour le mobile, avec un univers beauté, mode et accessoires d'exception.",
      ctaPrimary: 'Explorer la collection',
      ctaSecondary: 'Voir le catalogue',
    },
    stats: [
      { eyebrow: 'Conversion', value: '+24%', description: 'sur les ventes après optimisation mobile', variant: 'sombre', size: 'normal' },
      { eyebrow: 'Livraison', value: '24-48h', description: 'Dakar & diaspora', variant: 'clair', size: 'normal' },
      { eyebrow: 'Qualité', value: 'Premium', description: 'Ingrédients naturels & savoir-faire local', variant: 'vert', size: 'normal' },
      { eyebrow: 'Impact', value: 'Local', description: 'Coopératives & économie circulaire', variant: 'clair-simple', size: 'normal' },
    ],
    featured: {
      eyebrow: 'Nouveautés',
      title: 'Produits phares',
      subtitle:
        "Découvrez notre sélection de produits d'exception, fabriqués avec soin et passion.",
      ctaLabel: 'Voir toute la collection',
    },
    universes: {
      title: 'Nos univers',
      subtitle: "Deux mondes d'exception pour sublimer votre style et votre bien-être.",
      beaute: {
        title: 'Beauté',
        description:
          "Huiles essentielles, soins naturels et parfums d'exception pour révéler votre éclat naturel.",
        variant: 'rose',
        size: 'medium',
      },
      mode: {
        title: 'Mode',
        description:
          'Tenues traditionnelles et prêt-à-porter contemporain, confectionnés avec les meilleurs tissus africains.',
        variant: 'ambre',
        size: 'medium',
      },
    },
    cta: {
      title: "Prêt à découvrir l'excellence africaine ?",
      subtitle:
        "Rejoignez notre communauté de clients satisfaits et bénéficiez d'une expérience shopping premium.",
      primary: 'Commencer mes achats',
      secondary: 'Nous contacter',
    },
  },
  beaute: {
    hero: {
      badge: 'Univers beauté',
      title: 'Éclat & bien-être africain',
      subtitle:
        'Découvrez nos soins naturels issus des meilleures traditions africaines. Huiles essentielles, cosmétiques bio et produits de soin pour révéler votre beauté authentique.',
      cta: 'Explorer les soins',
    },
    values: {
      title: 'Nos engagements',
      items: [
        {
          emoji: '🌿',
          title: 'Ingrédients naturels',
          description:
            "Huiles essentielles, plantes et extraits naturels issus de l'agriculture biologique et durable.",
        },
        {
          emoji: '🏺',
          title: 'Savoir-faire ancestral',
          description:
            'Méthodes de fabrication traditionnelles respectées et modernisées pour garantir qualité et sécurité.',
        },
        {
          emoji: '🤝',
          title: 'Économie locale',
          description:
            'Collaboration avec des coopératives et artisans locaux pour un impact positif sur les communautés.',
        },
      ],
    },
    productsTitle: 'Beauté sur mesure',
    productsSubtitleTemplate:
      '{count} produits sélectionnés pour leur style, leur qualité et leur authenticité.',
    catalogueCta: 'Voir tout le catalogue',
    contactBlock: {
      title: 'Contactez-nous pour une création personnalisée',
      subtitle:
        'Vous ne trouvez pas exactement ce que vous cherchez ? Nous pouvons créer une pièce unique selon vos envies.',
      cta: 'Nous contacter',
    },
  },
  mode: {
    hero: {
      badge: 'Univers mode',
      title: 'Élégance & tradition africaine',
      subtitle:
        'Découvrez notre collection de mode traditionnelle et contemporaine. Bazin riche, wax authentique et accessoires élégants pour sublimer votre style.',
      cta: 'Explorer la collection',
    },
    values: {
      title: 'Notre artisanat',
      items: [
        {
          emoji: '🧵',
          title: 'Confection artisanale',
          description:
            'Chaque pièce est cousue à la main dans nos ateliers dakarois, avec le plus grand soin du détail.',
        },
        {
          emoji: '🎨',
          title: "Tissus d'exception",
          description:
            'Bazin riche teintés indigo, wax imprimés à la cire et autres tissus africains de qualité supérieure.',
        },
        {
          emoji: '🌍',
          title: 'Made in Senegal',
          description:
            "Production locale qui soutient l'économie sénégalaise et préserve les savoir-faire traditionnels.",
        },
      ],
    },
    productsTitle: 'Mode sur mesure',
    productsSubtitleTemplate:
      '{count} produits sélectionnés pour leur style, leur qualité et leur authenticité.',
    catalogueCta: 'Voir tout le catalogue',
    contactBlock: {
      title: 'Contactez-nous pour une création personnalisée',
      subtitle:
        'Vous ne trouvez pas exactement ce que vous cherchez ? Nous pouvons créer une pièce unique selon vos envies.',
      cta: 'Nous contacter',
    },
  },
  catalogue: {
    eyebrow: 'Catalogue',
    title: 'Découvrez nos collections',
    subtitle:
      "Des produits d'exception, sélectionnés pour leur qualité et leur authenticité africaine.",
    backLabel: "Retour à l'accueil",
    filterUniverseLabel: 'Univers',
    filterCategoryLabel: 'Catégories',
    emptyState: {
      title: 'Aucun produit trouvé',
      subtitle: "Essayez de modifier vos filtres pour découvrir d'autres produits.",
      cta: 'Voir tous les produits',
    },
    ctaBlock: {
      title: 'Vous ne trouvez pas ce que vous cherchez ?',
      subtitle:
        'Contactez-nous pour des produits sur mesure ou des recommandations personnalisées.',
      cta: 'Nous contacter',
    },
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Service client & commandes',
    writeUs: {
      title: 'Nous écrire',
      subtitle:
        'Pour vos demandes de disponibilité, commandes personnalisées ou suivi de livraison.',
    },
    shipping: {
      label: 'Expédition',
      value: 'Dakar & Régions · Diaspora',
    },
    back: 'Retour à l’accueil',
  },
  reviews: {
    title: 'Ce que disent nos clients',
    subtitle: 'Des avis authentiques de clients satisfaits à travers le monde.',
    items: [
      {
        initials: 'AK',
        name: 'Aïssatou K.',
        role: 'Cliente beauté',
        product: 'Lait Corporel au Karité',
        rating: 5,
        text: 'Ce lait corporel est une merveille ! Ma peau est hydratée toute la journée, et le parfum est subtil et agréable. Je recommande vivement.',
        tags: ['Hydratation', 'Karité'],
        result: 'Peau nourrie',
        period: '1 mois',
      },
      {
        initials: 'MB',
        name: 'Moussa B.',
        role: 'Client mode',
        product: 'Chemise en Lin',
        rating: 5,
        text: 'La qualité est exceptionnelle. Le lin est doux, la coupe parfaite. Je l\'ai portée pour un mariage et j\'ai reçu des compliments.',
        tags: ['Qualité', 'Coupe'],
        result: 'Look élégant',
        period: '2 semaines',
      },
      {
        initials: 'FD',
        name: 'Fatou D.',
        role: 'Cliente beauté',
        product: 'Huile de Ricin Noir',
        rating: 5,
        text: 'Mes cheveux ont retrouvé leur force et leur brillance en seulement 3 semaines. Le produit est 100 % naturel, ça se voit !',
        tags: ['Cheveux', 'Naturel'],
        result: 'Cheveux fortifiés',
        period: '3 semaines',
      },
    ],
  },
  artisans: {
    title: 'Nos artisans',
    subtitle: 'Des mains d\'exception qui perpétuent les savoir-faire traditionnels sénégalais.',
    items: [
      {
        name: 'Mame Diarra',
        role: 'Teinturière Bazin',
        location: 'Dakar',
        description: 'Mame perpétue l\'art de la teinture du bazin riche, une tradition familiale transmise depuis trois générations dans son atelier de Dakar.',
        tags: ['Bazin', 'Teinture', 'Artisanat'],
        imageSeed: 'artisan-bazin',
      },
      {
        name: 'Aminata Sow',
        role: 'Couturière Traditionnelle',
        location: 'Thiès',
        description: 'Aminata confectionne des tenues traditionnelles et contemporaines avec une précision remarquable, mêlant motifs anciens et coupes modernes.',
        tags: ['Couture', 'Tradition', 'Mode'],
        imageSeed: 'artisan-couture',
      },
      {
        name: 'Khady Ndiaye',
        role: 'Productrice de Karité',
        location: 'Casamance',
        description: 'Khady dirige une coopérative de femmes qui produisent du beurre de karité brut selon les méthodes ancestrales de la Casamance.',
        tags: ['Karité', 'Coopérative', 'Naturel'],
        imageSeed: 'artisan-karite',
      },
    ],
  },
  marquee: [
    'Livraison offerte dès 50 000 FCFA',
    'Paiement sécurisé Orange Money · Wave · Carte bancaire',
    'Retour sous 14 jours',
    'Artisanat sénégalais — Made in Dakar',
    '🌍 Livraison internationale disponible',
  ],
  trustBar: [
    { icon: '🔒', label: 'Achats sécurisés' },
    { icon: '🚚', label: 'Livraison 24-48h Dakar' },
    { icon: '💳', label: 'Paiement Orange Money · Wave · Carte' },
    { icon: '✅', label: 'Produits authentiques' },
  ],
  footerLinks: [
    { label: 'Boutique', href: '/catalogue' },
    { label: 'Contact', href: '/contact' },
    { label: 'Administration', href: '/admin' },
  ],
};

// =========================================================================
// Images du site — gérées depuis /admin/content (section Médias)
// Stockées en base64 dans localStorage (max ~500 Ko par image recommandé).
// Migrer vers Supabase Storage pour la production multi-utilisateurs.
// =========================================================================

export type SiteImages = {
  /** Logo — remplace le cercle "D" dans le header. null = logo par défaut */
  logoDataUrl: string | null;
  /** Image de fond du hero (page d'accueil) */
  heroDataUrl: string | null;
  /** Image de fond du hero de la page Beauté */
  beauteHeroDataUrl: string | null;
  /** Image de fond du hero de la page Mode */
  modeHeroDataUrl: string | null;
  /** Image de fond du hero du tableau de bord admin */
  adminHeroDataUrl: string | null;
  /** Image de fond de la page de connexion admin */
  adminLoginDataUrl: string | null;
};

export const defaultSiteImages: SiteImages = {
  logoDataUrl: null,
  heroDataUrl: null,
  beauteHeroDataUrl: null,
  modeHeroDataUrl: null,
  adminHeroDataUrl: null,
  adminLoginDataUrl: null,
};

export const defaultSiteTheme: SiteTheme = {
  radius: 'rounded',
  shadows: 'soft',
  brandColor: 'nuit',
  animations: true,
};

/** Ex : 38 000 FCFA */
export function formatPrice(value: number) {
  return (
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) +
    ' FCFA'
  );
}

/** Version courte pour les stat-cards — Ex : 1,2M FCFA · 38K FCFA · 8 500 FCFA */
export function formatPriceCompact(value: number) {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + 'M FCFA';
  }
  if (value >= 10_000) {
    const k = value / 1_000;
    return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + 'K FCFA';
  }
  return (
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) +
    ' FCFA'
  );
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getProductsByUniverse(universe: ProductUniverse) {
  return products.filter((product) => product.univers === universe);
}

// Helper to build a wa.me href from a raw phone string
export function whatsappToHref(raw: string, text?: string) {
  const digits = raw.replace(/\D/g, '');
  return text ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : `https://wa.me/${digits}`;
}
