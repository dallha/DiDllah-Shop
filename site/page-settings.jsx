// DiDallah Shop — Page Paramètres

function SettingsPage({ navigate }) {
  const [active, setActive] = useState("profil");
  const [saved, setSaved] = useState(false);

  // Données utilisateur (démo)
  const [profile, setProfile] = useState({
    firstName: "Madina",
    lastName: "Ba",
    email: "madina.ba@email.com",
    phone: "+221 77 432 18 09",
    birthday: "1996-04-12",
    gender: "femme",
  });

  const [prefs, setPrefs] = useState({
    language: "fr",
    currency: "XOF",
    sizeSystem: "fr",
    measureUnit: "cm",
  });

  const [notif, setNotif] = useState({
    orderEmail: true,
    orderSms: true,
    orderWhatsapp: true,
    newsletter: true,
    drops: true,
    journal: false,
    ambassadeur: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: false,
    marketing: true,
    analytics: true,
    personalization: true,
  });

  const [addresses, setAddresses] = useState([
    {
      id: "a1",
      label: "Domicile",
      name: "Madina Ba",
      line: "Sicap Liberté 6, Villa 4187",
      city: "Dakar",
      country: "Sénégal",
      phone: "+221 77 432 18 09",
      isDefault: true,
    },
    {
      id: "a2",
      label: "Bureau",
      name: "Madina Ba",
      line: "Immeuble Almadies Business — 3ème étage",
      city: "Dakar",
      country: "Sénégal",
      phone: "+221 33 869 00 12",
      isDefault: false,
    },
  ]);

  const sections = [
    // Gestion du site
    { id: "produits",   n: "01", label: "Catalogue",        group: "Gestion" },
    { id: "categories", n: "02", label: "Catégories",       group: "Gestion" },
    { id: "contenu",    n: "03", label: "Contenu",          group: "Gestion" },
    { id: "marque",     n: "04", label: "Marque & contact", group: "Gestion" },
    { id: "reset",      n: "05", label: "Réinitialisation", group: "Gestion" },
    // Mon compte
    { id: "profil",     n: "06", label: "Profil",           group: "Compte" },
    { id: "preferences",n: "07", label: "Préférences",      group: "Compte" },
    { id: "notifs",     n: "08", label: "Notifications",    group: "Compte" },
    { id: "confid",     n: "09", label: "Confidentialité",  group: "Compte" },
    { id: "adresses",   n: "10", label: "Adresses",         group: "Compte" },
    { id: "securite",   n: "11", label: "Sécurité",         group: "Compte" },
    { id: "compte",     n: "12", label: "Compte",           group: "Compte" },
  ];

  // Scroll spy : observe les sections pour mettre à jour l'item actif du sommaire
  useEffect(() => {
    const root = document.querySelector(".dd-scroll");
    if (!root) return;
    const onScroll = () => {
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById("sec-" + s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top < 220) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    root.addEventListener("scroll", onScroll, { passive: true });
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (id) => {
    const el = document.getElementById("sec-" + id);
    const root = document.querySelector(".dd-scroll");
    if (!el || !root) return;
    const top = el.getBoundingClientRect().top + root.scrollTop - 110;
    root.scrollTo({ top, behavior: "smooth" });
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    flashSaved();
  };
  const removeAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    flashSaved();
  };

  return (
    <main className="dd-page dd-settings">
      {/* En-tête */}
      <section className="dd-univers-header">
        <div className="dd-univers-crumb">
          <button onClick={() => navigate({ name: "home" })}>Accueil</button>
          <span>—</span>
          <span>Mon compte</span>
          <span>—</span>
          <span>Paramètres</span>
        </div>
        <div className="dd-univers-titlerow">
          <div>
            <span className="dd-univers-num">N° 07</span>
            <h1 className="dd-univers-title">Mes <em>paramètres</em></h1>
            <p className="dd-univers-lede">
              Back-office complet — gérez produits, prix, catégories,
              textes et identité de la maison DiDallah. Vos modifications
              sont enregistrées automatiquement et visibles immédiatement.
            </p>
          </div>
          <div className="dd-set-greet">
            <span className="dd-set-greet-k">Bonjour</span>
            <span className="dd-set-greet-v"><em>{profile.firstName}</em></span>
            <span className="dd-set-greet-meta">
              Cliente depuis avril 2024 · 12 commandes · Cercle <em>Or</em>
            </span>
          </div>
        </div>
      </section>

      {/* Sommaire + panneaux */}
      <section className="dd-set-layout">
        <aside className="dd-set-side">
          <span className="dd-set-side-label">Gestion du site</span>
          <nav className="dd-set-nav">
            {sections.filter((s) => s.group === "Gestion").map((s) => (
              <button
                key={s.id}
                className="dd-set-navlink"
                data-active={active === s.id ? "1" : undefined}
                onClick={() => goTo(s.id)}
              >
                <span className="dd-set-nav-num">{s.n}</span>
                <span className="dd-set-nav-label">{s.label}</span>
              </button>
            ))}
          </nav>
          <span className="dd-set-side-label" style={{ marginTop: 24 }}>Mon compte</span>
          <nav className="dd-set-nav">
            {sections.filter((s) => s.group === "Compte").map((s) => (
              <button
                key={s.id}
                className="dd-set-navlink"
                data-active={active === s.id ? "1" : undefined}
                onClick={() => goTo(s.id)}
              >
                <span className="dd-set-nav-num">{s.n}</span>
                <span className="dd-set-nav-label">{s.label}</span>
              </button>
            ))}
          </nav>
          <div className="dd-set-side-help">
            <span>Une question ?</span>
            <p>Notre équipe répond en moins d'une heure sur WhatsApp.</p>
            <WhatsAppButton label="Écrire maintenant" />
          </div>
        </aside>

        <div className="dd-set-main">
          {/* === BACK-OFFICE / Gestion du site ============================ */}
          <AdminProductsSection />
          <AdminCategoriesSection />
          <AdminContentSection />
          <AdminBrandSection />
          <AdminResetSection />

          {/* === Mon compte (utilisateur) ================================= */}
          <article id="sec-profil" className="dd-set-card">
            <header className="dd-set-card-head">
              <Eyebrow num={6}>Profil</Eyebrow>
              <h2>Votre <em>identité</em>.</h2>
              <p>Les informations que vous renseignez ici pré-remplissent vos commandes et nos échanges WhatsApp.</p>
            </header>

            <div className="dd-set-avatar-row">
              <div className="dd-set-avatar">
                <ImageFrame id="set-avatar" ratio="1 / 1" placeholder="Photo de profil" tone="warm" src="site/img/set-avatar.svg" />
              </div>
              <div className="dd-set-avatar-actions">
                <GhostButton>Changer la photo</GhostButton>
                <button className="dd-link-mute">Retirer</button>
                <p className="dd-form-meta">JPG, PNG ou WebP — 2 Mo max.</p>
              </div>
            </div>

            <form className="dd-form dd-set-form" onSubmit={(e) => { e.preventDefault(); flashSaved(); }}>
              <div className="dd-form-row">
                <label>
                  <span>Prénom</span>
                  <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                </label>
                <label>
                  <span>Nom</span>
                  <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                </label>
              </div>
              <div className="dd-form-row">
                <label>
                  <span>Email</span>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </label>
                <label>
                  <span>WhatsApp / Téléphone</span>
                  <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </label>
              </div>
              <div className="dd-form-row">
                <label>
                  <span>Date de naissance</span>
                  <input type="date" value={profile.birthday} onChange={(e) => setProfile({ ...profile, birthday: e.target.value })} />
                </label>
                <label>
                  <span>Genre</span>
                  <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                    <option value="femme">Femme</option>
                    <option value="homme">Homme</option>
                    <option value="autre">Autre / Non précisé</option>
                  </select>
                </label>
              </div>
              <div className="dd-form-foot">
                <span className="dd-form-meta">Vos données restent confidentielles — voir la section 04.</span>
                <PrimaryButton icon={<IconArrow size={16} />}>Enregistrer le profil</PrimaryButton>
              </div>
            </form>
          </article>

          {/* ── 02 Préférences ─────────────────────────────────────────── */}
          <article id="sec-preferences" className="dd-set-card">
            <header className="dd-set-card-head">
              <Eyebrow num={7}>Préférences</Eyebrow>
              <h2>Langue, <em>devise</em>, mesures.</h2>
              <p>L'expérience DiDallah s'adapte à votre lieu de vie et vos repères.</p>
            </header>

            <div className="dd-pref-grid">
              <PrefCard
                label="Langue d'affichage"
                value={prefs.language}
                onChange={(v) => { setPrefs({ ...prefs, language: v }); flashSaved(); }}
                options={[
                  { v: "fr", label: "Français", hint: "Par défaut" },
                  { v: "en", label: "English", hint: "International" },
                  { v: "wo", label: "Wolof", hint: "Bientôt" },
                ]}
              />
              <PrefCard
                label="Devise des prix"
                value={prefs.currency}
                onChange={(v) => { setPrefs({ ...prefs, currency: v }); flashSaved(); }}
                options={[
                  { v: "XOF", label: "F CFA", hint: "Sénégal" },
                  { v: "EUR", label: "Euro €", hint: "Europe" },
                  { v: "USD", label: "Dollar $", hint: "Diaspora" },
                ]}
              />
              <PrefCard
                label="Système de tailles"
                value={prefs.sizeSystem}
                onChange={(v) => { setPrefs({ ...prefs, sizeSystem: v }); flashSaved(); }}
                options={[
                  { v: "fr", label: "FR · 36–46", hint: "Standard" },
                  { v: "eu", label: "EU · 36–46", hint: "Europe" },
                  { v: "us", label: "US · 4–14", hint: "International" },
                ]}
              />
              <PrefCard
                label="Unités de mesure"
                value={prefs.measureUnit}
                onChange={(v) => { setPrefs({ ...prefs, measureUnit: v }); flashSaved(); }}
                options={[
                  { v: "cm",   label: "Centimètres", hint: "Par défaut" },
                  { v: "inch", label: "Pouces", hint: "US / UK" },
                ]}
              />
            </div>
          </article>

          {/* ── 03 Notifications ───────────────────────────────────────── */}
          <article id="sec-notifs" className="dd-set-card">
            <header className="dd-set-card-head">
              <Eyebrow num={8}>Notifications</Eyebrow>
              <h2>Choisissez ce que <em>vous entendez.</em></h2>
              <p>Nous n'écrivons que pour ce qui en vaut la peine.</p>
            </header>

            <div className="dd-set-group-head">Commandes & livraison</div>
            <div className="dd-set-rows">
              <SettingRow
                title="Confirmations par email"
                desc="Reçus de commande, mise à jour de statut, suivi colis."
                value={notif.orderEmail}
                onChange={(v) => { setNotif({ ...notif, orderEmail: v }); flashSaved(); }}
              />
              <SettingRow
                title="SMS de livraison"
                desc="Quand le livreur est en route ou à votre porte."
                value={notif.orderSms}
                onChange={(v) => { setNotif({ ...notif, orderSms: v }); flashSaved(); }}
              />
              <SettingRow
                title="WhatsApp — accusé personnel"
                desc="Un message manuscrit de notre équipe pour chaque commande."
                value={notif.orderWhatsapp}
                onChange={(v) => { setNotif({ ...notif, orderWhatsapp: v }); flashSaved(); }}
                pill="Recommandé"
              />
            </div>

            <div className="dd-set-group-head">Maison DiDallah</div>
            <div className="dd-set-rows">
              <SettingRow
                title="La Lettre du dimanche"
                desc="Une infolettre par semaine — récits, lancements, invitations privées."
                value={notif.newsletter}
                onChange={(v) => { setNotif({ ...notif, newsletter: v }); flashSaved(); }}
              />
              <SettingRow
                title="Lancements & éditions limitées"
                desc="Soyez prévenue avant tout le monde — 48 h avant l'ouverture publique."
                value={notif.drops}
                onChange={(v) => { setNotif({ ...notif, drops: v }); flashSaved(); }}
              />
              <SettingRow
                title="Nouveaux articles du Journal"
                desc="Récits d'ateliers, conseils beauté, coulisses."
                value={notif.journal}
                onChange={(v) => { setNotif({ ...notif, journal: v }); flashSaved(); }}
              />
              <SettingRow
                title="Programme Ambassadrices"
                desc="Opportunités de collaboration, codes promo personnalisés."
                value={notif.ambassadeur}
                onChange={(v) => { setNotif({ ...notif, ambassadeur: v }); flashSaved(); }}
              />
            </div>
          </article>

          {/* ── 04 Confidentialité ─────────────────────────────────────── */}
          <article id="sec-confid" className="dd-set-card">
            <header className="dd-set-card-head">
              <Eyebrow num={9}>Confidentialité</Eyebrow>
              <h2>Ce que <em>nous savons,</em> ce que nous gardons.</h2>
              <p>Aucune donnée ne sort de la maison DiDallah — vous décidez ce qu'elle voit.</p>
            </header>

            <div className="dd-set-rows">
              <SettingRow
                title="Profil visible publiquement"
                desc="Apparaître dans les avis clients avec votre prénom et initiale."
                value={privacy.profileVisible}
                onChange={(v) => { setPrivacy({ ...privacy, profileVisible: v }); flashSaved(); }}
              />
              <SettingRow
                title="Communications marketing"
                desc="Autoriser DiDallah à vous proposer des offres ciblées."
                value={privacy.marketing}
                onChange={(v) => { setPrivacy({ ...privacy, marketing: v }); flashSaved(); }}
              />
              <SettingRow
                title="Mesure d'audience anonyme"
                desc="Nous aide à améliorer la boutique — aucune donnée individuelle."
                value={privacy.analytics}
                onChange={(v) => { setPrivacy({ ...privacy, analytics: v }); flashSaved(); }}
              />
              <SettingRow
                title="Personnalisation des recommandations"
                desc="Suggestions produits basées sur votre historique d'achat."
                value={privacy.personalization}
                onChange={(v) => { setPrivacy({ ...privacy, personalization: v }); flashSaved(); }}
              />
            </div>

            <div className="dd-set-actions">
              <GhostButton>Télécharger mes données</GhostButton>
              <button className="dd-link-mute">Voir notre politique de confidentialité ↗</button>
            </div>
          </article>

          {/* ── 05 Adresses ────────────────────────────────────────────── */}
          <article id="sec-adresses" className="dd-set-card">
            <header className="dd-set-card-head">
              <Eyebrow num={10}>Adresses</Eyebrow>
              <h2>Où vous <em>livrer</em>.</h2>
              <p>Choisissez une adresse par défaut — modifiable à chaque commande.</p>
            </header>

            <div className="dd-addr-grid">
              {addresses.map((a) => (
                <article key={a.id} className="dd-addr-card" data-default={a.isDefault ? "1" : undefined}>
                  <header className="dd-addr-head">
                    <span className="dd-addr-label">{a.label}</span>
                    {a.isDefault && <span className="dd-addr-badge">Par défaut</span>}
                  </header>
                  <p className="dd-addr-name">{a.name}</p>
                  <p className="dd-addr-line">{a.line}</p>
                  <p className="dd-addr-line">{a.city} — {a.country}</p>
                  <p className="dd-addr-phone">{a.phone}</p>
                  <div className="dd-addr-foot">
                    <button className="dd-link">Modifier <IconArrow size={12} /></button>
                    {!a.isDefault && (
                      <button className="dd-link-mute" onClick={() => setDefaultAddress(a.id)}>
                        Définir par défaut
                      </button>
                    )}
                    <button className="dd-link-mute" onClick={() => removeAddress(a.id)}>Supprimer</button>
                  </div>
                </article>
              ))}
              <button
                className="dd-addr-add"
                onClick={() => {
                  const id = "a" + (addresses.length + 1);
                  setAddresses([...addresses, {
                    id, label: "Nouvelle adresse", name: profile.firstName + " " + profile.lastName,
                    line: "—", city: "Dakar", country: "Sénégal", phone: profile.phone, isDefault: false,
                  }]);
                  flashSaved();
                }}
              >
                <IconPlus size={18} />
                <span>Ajouter une adresse</span>
              </button>
            </div>
          </article>

          {/* ── 06 Sécurité ────────────────────────────────────────────── */}
          <article id="sec-securite" className="dd-set-card">
            <header className="dd-set-card-head">
              <Eyebrow num={11}>Sécurité</Eyebrow>
              <h2>Votre <em>compte,</em> bien gardé.</h2>
              <p>Mot de passe, vérification en deux étapes, sessions actives.</p>
            </header>

            <form className="dd-form dd-set-form" onSubmit={(e) => { e.preventDefault(); flashSaved(); }}>
              <div className="dd-form-row">
                <label>
                  <span>Mot de passe actuel</span>
                  <input type="password" placeholder="•••••••••" />
                </label>
                <label>
                  <span>Nouveau mot de passe</span>
                  <input type="password" placeholder="8 caractères minimum" />
                </label>
              </div>
              <div className="dd-form-foot">
                <span className="dd-form-meta">Dernière modification — il y a 3 mois</span>
                <PrimaryButton icon={<IconArrow size={16} />}>Mettre à jour</PrimaryButton>
              </div>
            </form>

            <div className="dd-set-rows" style={{ marginTop: 32 }}>
              <SettingRow
                title="Vérification en deux étapes"
                desc="Code à 6 chiffres envoyé par SMS lors de la connexion."
                value={false}
                onChange={() => flashSaved()}
                pill="Conseillé"
              />
            </div>

            <div className="dd-sessions">
              <h4>Sessions actives</h4>
              <div className="dd-session">
                <div>
                  <strong>iPhone 15 — Safari</strong>
                  <span>Dakar, Sénégal · maintenant</span>
                </div>
                <span className="dd-session-now">Cette session</span>
              </div>
              <div className="dd-session">
                <div>
                  <strong>MacBook — Chrome</strong>
                  <span>Dakar, Sénégal · il y a 4 jours</span>
                </div>
                <button className="dd-link-mute">Déconnecter</button>
              </div>
              <div className="dd-session">
                <div>
                  <strong>Samsung A54 — Chrome</strong>
                  <span>Paris, France · il y a 2 semaines</span>
                </div>
                <button className="dd-link-mute">Déconnecter</button>
              </div>
            </div>
          </article>

          {/* ── 07 Compte ──────────────────────────────────────────────── */}
          <article id="sec-compte" className="dd-set-card">
            <header className="dd-set-card-head">
              <Eyebrow num={12}>Compte</Eyebrow>
              <h2>Pause, <em>au revoir</em> ou départ définitif.</h2>
              <p>Vous pouvez quitter à tout moment, vos données vous appartiennent.</p>
            </header>

            <div className="dd-account-actions">
              <div className="dd-account-row">
                <div>
                  <strong>Se déconnecter de cet appareil</strong>
                  <span>Vous serez redirigée vers la page d'accueil.</span>
                </div>
                <GhostButton>Se déconnecter</GhostButton>
              </div>
              <div className="dd-account-row">
                <div>
                  <strong>Mettre le compte en pause</strong>
                  <span>Aucun email pendant 3 mois — réactivation automatique ensuite.</span>
                </div>
                <GhostButton>Mettre en pause</GhostButton>
              </div>
              <div className="dd-account-row dd-account-danger">
                <div>
                  <strong>Supprimer définitivement mon compte</strong>
                  <span>Suppression irréversible — vos commandes historiques restent archivées 5 ans (obligation légale).</span>
                </div>
                <button className="dd-btn dd-btn-danger" type="button">Supprimer mon compte</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Toast de sauvegarde */}
      <div className={"dd-set-toast " + (saved ? "is-on" : "")}>
        <IconCheck size={14} />
        <span>Modifications enregistrées</span>
      </div>
    </main>
  );
}

// ── Toggle ligne (titre + desc + interrupteur) ─────────────────────────
function SettingRow({ title, desc, value, onChange, pill }) {
  return (
    <div className="dd-set-row">
      <div className="dd-set-row-text">
        <div className="dd-set-row-title">
          <strong>{title}</strong>
          {pill && <span className="dd-set-pill">{pill}</span>}
        </div>
        <p>{desc}</p>
      </div>
      <button
        type="button"
        className="dd-switch"
        role="switch"
        aria-checked={value}
        data-on={value ? "1" : undefined}
        onClick={() => onChange(!value)}
      >
        <span className="dd-switch-knob" />
      </button>
    </div>
  );
}

// ── Carte de préférence (radio visuel) ─────────────────────────────────
function PrefCard({ label, value, onChange, options }) {
  return (
    <div className="dd-pref-card">
      <span className="dd-pref-label">{label}</span>
      <div className="dd-pref-opts">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            className="dd-pref-opt"
            data-on={value === o.v ? "1" : undefined}
            onClick={() => onChange(o.v)}
          >
            <span className="dd-pref-opt-label">{o.label}</span>
            <span className="dd-pref-opt-hint">{o.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SettingsPage });
