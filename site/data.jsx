// DiDallah Shop — données catalogue & contenu (DEFAULTS)
// Tous les prix sont en F CFA (XOF)
// Ces valeurs servent d'état initial. Les modifications faites dans le
// back-office (page Paramètres) sont stockées dans SITE_STORE (store.jsx)
// et persistées en localStorage.

const DEFAULT_PRODUCTS = [
  // ════════════════════════════════════════════════════
  //  BEAUTÉ & COSMÉTIQUE
  // ════════════════════════════════════════════════════

  // ─── Parfumerie (cœur de la maison) ────────────────
  {
    id: "parfum-femme-fleurs",
    name: "Eau de Parfum — Jardin de Liberté",
    univers: "beaute",
    category: "Parfumerie",
    price: 38000,
    tag: "Signature",
    short: "Bouquet floral, sillage poudré, fond ambré.",
    long:
      "Une rêverie florale autour du jasmin et de la rose de Damas, posée sur un fond ambré et un soupçon de vanille bourbon. Tenue 8 heures.",
    details: ["50 ml", "Notes : Jasmin, Rose, Ambre", "Fabrication française"],
  },
  {
    id: "parfum-homme-oud",
    name: "Eau de Parfum — Bois de Oud",
    univers: "beaute",
    category: "Parfumerie",
    price: 42000,
    tag: "Bestseller",
    short: "Oud, cuir et épices chaudes.",
    long:
      "Un parfum boisé et mystérieux où le oud précieux rencontre le cuir, le poivre noir et un soupçon de cardamome. Pour les hommes affirmés.",
    details: ["75 ml", "Notes : Oud, Cuir, Cardamome", "Tenue 12 h"],
  },
  {
    id: "parfum-ambre-noir",
    name: "Eau de Parfum — Ambre Noir & Épices",
    univers: "beaute",
    category: "Parfumerie",
    price: 45000,
    tag: "Édition limitée",
    short: "Ambre, encens et bois précieux.",
    long:
      "Une fragrance unisexe envoûtante : ambre noir, encens d'Éthiopie, santal et patchouli. Le sillage des grandes cérémonies.",
    details: ["75 ml", "Unisexe", "Série limitée — 200 exemplaires"],
  },
  {
    id: "musc-tahara",
    name: "Musc Tahara — Roll-On Précieux",
    univers: "beaute",
    category: "Parfumerie",
    price: 9500,
    short: "Le musc blanc traditionnel, en applicateur fin.",
    long:
      "Un musc tahara doux et poudré, hérité des rituels du Golfe. Application directe sur la peau — sillage discret, tenue prolongée, sans alcool.",
    details: ["10 ml", "Sans alcool", "Format poche"],
  },
  {
    id: "brume-cheveux-rose",
    name: "Brume Cheveux — Eau de Rose",
    univers: "beaute",
    category: "Parfumerie",
    price: 11000,
    short: "Parfume et rafraîchit les cheveux toute la journée.",
    long:
      "Une brume légère à l'eau de rose et au monoï. Parfume les cheveux sans les alourdir. Vaporiser à 30 cm.",
    details: ["100 ml", "Sans alcool", "Tous types de cheveux"],
  },

  // ─── Huiles & soins capillaires ────────────────────
  {
    id: "huile-ricin",
    name: "Huile de Ricin Noir Pressée à Froid",
    univers: "beaute",
    category: "Huiles & cheveux",
    price: 7500,
    tag: "Bestseller",
    short: "Pousse, force et brillance pour les cheveux.",
    long:
      "Pressée à froid en Casamance, l'huile de ricin noir fortifie les longueurs et stimule la croissance capillaire.",
    details: ["100 ml", "Pression à froid", "100 % naturelle"],
  },
  {
    id: "huile-cheveux-7",
    name: "Sérum Capillaire — 7 Huiles Précieuses",
    univers: "beaute",
    category: "Huiles & cheveux",
    price: 11000,
    short: "Soin nourrissant pour cheveux secs et abîmés.",
    long:
      "Un sérum de finition qui discipline, lisse et fait briller. Argan, ricin, jojoba, monoï, amande, baobab et nigelle.",
    details: ["75 ml", "Non gras", "Pour tous types de cheveux"],
  },
  {
    id: "huile-nigelle",
    name: "Huile de Nigelle Pure",
    univers: "beaute",
    category: "Huiles & cheveux",
    price: 8800,
    tag: "Nouveauté",
    short: "L'huile bénie — peau, cheveux, immunité.",
    long:
      "Huile de graines de nigelle (habba sawda) pressée à froid en Égypte. Antibactérienne, fortifiante pour les cheveux et la peau.",
    details: ["100 ml", "Pression à froid", "Habba sawda"],
  },
  {
    id: "huile-coco-bio",
    name: "Huile de Coco Vierge Bio",
    univers: "beaute",
    category: "Huiles & cheveux",
    price: 6500,
    short: "L'incontournable — cheveux, peau, multi-usage.",
    long:
      "Huile de coco vierge extra, pressée à froid, certifiée bio. Masque capillaire, démaquillant, hydratation corps.",
    details: ["250 ml", "Bio certifié", "Sans raffinage"],
  },

  // ─── Soins corps & visage ──────────────────────────
  {
    id: "lait-karite",
    name: "Lait Corporel au Karité Pur",
    univers: "beaute",
    category: "Soins corporels",
    price: 12500,
    tag: "Bestseller",
    short: "Hydratation profonde, fini soyeux. 250 ml.",
    long:
      "Notre lait signature, formulé à base de beurre de karité brut récolté en Casamance.",
    details: ["250 ml", "Karité brut 18 %", "Fabriqué au Sénégal"],
  },
  {
    id: "beurre-karite-brut",
    name: "Beurre de Karité Brut — Pot Artisanal",
    univers: "beaute",
    category: "Soins corporels",
    price: 8500,
    short: "Beurre 100 % brut, non raffiné. 150 g.",
    long:
      "Récolté en Casamance et baratté à la main par une coopérative de femmes. Nourrit, répare, protège.",
    details: ["150 g", "100 % brut", "Coopérative équitable"],
  },
  {
    id: "savon-noir",
    name: "Savon Noir Traditionnel",
    univers: "beaute",
    category: "Soins corporels",
    price: 4500,
    short: "Le rituel hammam, à la maison. 200 g.",
    long:
      "Un savon noir onctueux fabriqué selon la tradition à base d'olives et de potasse végétale.",
    details: ["200 g", "Sans conservateur", "Toutes peaux"],
  },
  {
    id: "gommage-baobab",
    name: "Gommage Corps au Baobab",
    univers: "beaute",
    category: "Soins corporels",
    price: 9800,
    tag: "Nouveauté",
    short: "Exfoliant doux, peau lumineuse. 200 ml.",
    long:
      "Un gommage sucré aux graines de baobab et au sucre de canne. Élimine les peaux mortes, réveille l'éclat.",
    details: ["200 ml", "Graines de baobab", "Texture fondante"],
  },
  {
    id: "lotion-eclat",
    name: "Lotion Visage Éclat — Fleur d'Hibiscus",
    univers: "beaute",
    category: "Soins visage",
    price: 14000,
    short: "Tonique floral, lumière instantanée.",
    long:
      "Une lotion sans alcool à l'hibiscus et à l'eau de rose. Resserre les pores, apaise, révèle l'éclat.",
    details: ["200 ml", "Sans alcool", "Tous types de peau"],
  },

  // ─── Maquillage ────────────────────────────────────
  {
    id: "rouge-a-levres",
    name: "Rouge à Lèvres Mat — Terracotta",
    univers: "beaute",
    category: "Maquillage",
    price: 9500,
    short: "Fini velours, tenue longue durée.",
    long:
      "Un rouge mat sublime, hydratant, qui sublime toutes les carnations.",
    details: ["3,5 g", "Cruelty-free", "Sans parfum"],
  },
  {
    id: "baume-levres",
    name: "Baume à Lèvres — Karité & Miel",
    univers: "beaute",
    category: "Maquillage",
    price: 5500,
    short: "Réparation, douceur, brillance discrète.",
    long:
      "Un baume nourrissant au karité brut et au miel d'acacia, pour des lèvres pulpeuses en toute saison.",
    details: ["15 g", "Sans parfum de synthèse", "Tube en aluminium recyclé"],
  },

  // ════════════════════════════════════════════════════
  //  MODE & TEXTILES
  // ════════════════════════════════════════════════════
  {
    id: "boubou-femme-brode",
    name: "Boubou Femme Brodé — Soirée d'Or",
    univers: "mode",
    category: "Tenues traditionnelles",
    price: 75000,
    tag: "Édition limitée",
    short: "Bazin riche brodé à la main, fils dorés.",
    long:
      "Confectionné dans nos ateliers à Dakar. Bazin teinté indigo, broderie or aux poignets et à l'encolure.",
    details: ["100 % Bazin Riche", "Tailles S — XL", "Confection sur mesure possible"],
  },
  {
    id: "jallaba-homme",
    name: "Jallaba Homme — Coupe Cérémonie",
    univers: "mode",
    category: "Tenues traditionnelles",
    price: 65000,
    short: "Tenue de cérémonie en bazin teinté.",
    long:
      "Une jallaba élégante, idéale pour Korité, Tabaski, baptêmes et mariages.",
    details: ["Bazin Riche", "Tailles M — XXL", "3 coloris : Ivoire, Bleu, Vert sauge"],
  },
  {
    id: "robe-wax-tendance",
    name: "Robe Midi en Wax — Coupe Asymétrique",
    univers: "mode",
    category: "Prêt-à-porter contemporain",
    price: 32000,
    tag: "Bestseller",
    short: "Wax authentique, coupe moderne.",
    long:
      "Une robe midi près du corps, manche unique, ceinture nouée. Wax importé du Ghana.",
    details: ["Wax 100 % coton", "Tailles 36 — 44", "Doublure incluse"],
  },
  {
    id: "chemise-lin",
    name: "Chemise en Lin — Homme",
    univers: "mode",
    category: "Prêt-à-porter contemporain",
    price: 22000,
    short: "Coupe droite, col mao, lin lavé.",
    long:
      "La chemise polyvalente, du déjeuner à la soirée. Lin lavé européen, finitions main.",
    details: ["Lin 100 %", "Tailles S — XL", "5 coloris"],
  },
  {
    id: "tissu-bazin",
    name: "Tissu Bazin Riche — 5 mètres",
    univers: "mode",
    category: "Tissus",
    price: 28000,
    short: "Bazin teinté, qualité couture.",
    long:
      "Notre Bazin Riche, idéal pour vos confections sur mesure. Vendu par coupon de 5 mètres.",
    details: ["5 mètres", "12 teintes disponibles", "Pour confection"],
  },
  {
    id: "tissu-wax-6y",
    name: "Tissu Wax — 6 yards",
    univers: "mode",
    category: "Tissus",
    price: 18000,
    short: "Wax authentique imprimé à la cire.",
    long:
      "Wax imprimé à la cire selon la tradition. Six yards pour ensemble complet.",
    details: ["6 yards", "Coton 100 %", "Nouveaux motifs / mois"],
  },
  {
    id: "sac-brode",
    name: "Sac à Main Brodé — Édition Dakar",
    univers: "mode",
    category: "Accessoires",
    price: 24000,
    tag: "Nouveauté",
    short: "Cuir et broderie main, bandoulière ajustable.",
    long:
      "Sac structuré en cuir grainé, rehaussé d'une broderie main aux motifs ndokette.",
    details: ["Cuir véritable", "27 × 18 × 9 cm", "Bandoulière ajustable"],
  },
];

const DEFAULT_CATEGORIES = {
  beaute: [
    { id: "Parfumerie",        label: "Parfumerie" },
    { id: "Huiles & cheveux",  label: "Huiles & cheveux" },
    { id: "Soins corporels",   label: "Soins corporels" },
    { id: "Soins visage",      label: "Soins visage" },
    { id: "Maquillage",        label: "Maquillage" },
  ],
  mode: [
    { id: "Prêt-à-porter contemporain", label: "Prêt-à-porter" },
    { id: "Tenues traditionnelles",     label: "Tenues traditionnelles" },
    { id: "Tissus",                     label: "Tissus" },
    { id: "Accessoires",                label: "Accessoires" },
  ],
};

const DEFAULT_CONTENT = {
  marquee: [
    "Livraison offerte à Dakar dès 35 000 F CFA",
    "Commandez sur WhatsApp · +221 76 305 05 05",
    "Nouvelle collection — Korité",
    "Confection sur mesure disponible",
  ],
  hero: {
    eyebrow: "Maison fondée à Dakar · Liberté 6",
    title1: "L'élégance",
    title2: "sénégalaise",
    title3: "au bout des doigts.",
    lede:
      "Beauté, mode et tissus d'exception — une sélection rare, livrée à votre porte depuis la capitale.",
    seasonLabel: "Saison",
    season: "Printemps · 2026",
    editionLabel: "Édition",
    edition: "N° 04 — Or & Bazin",
  },
  founder: {
    quote:
      "J'ai imaginé DiDallah comme un écrin moderne pour ce que Dakar a de plus beau à offrir — des parfums aux tissus, en passant par les huiles précieuses et les robes que portent nos mères les soirs de fête. Une boutique digitale, élégante, à portée de main.",
    name: "Madina Ba",
    role: "Fondatrice, DiDallah Shop",
  },
  brand: {
    name: "DiDallah",
    tagline: "Beauté & élégance, directement de Dakar",
    whatsapp: "+221 76 305 05 05",
    email: "bonjour@didallah.sn",
    address: "Liberté 6 Extension, Dakar — Sénégal",
    hours: "Lun – Sam · 9 h – 20 h",
    tiktok: "@didallah.shop",
    facebook: "fb.com/didallah.shop",
  },
};

// helpers
const fmtPrice = (n) =>
  new Intl.NumberFormat("fr-FR").format(n).replace(/\u202f/g, " ") + " F CFA";

Object.assign(window, {
  DEFAULT_PRODUCTS, DEFAULT_CATEGORIES, DEFAULT_CONTENT, fmtPrice,
});
