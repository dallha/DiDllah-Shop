// DiDallah Shop — Page Paramètres : sections d'administration (back-office)
// Permet de modifier en direct produits, catégories, contenu, marque.

// ─── Section 01 : CATALOGUE PRODUITS ────────────────────────────────────
function AdminProductsSection() {
  const store = useSiteStore();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState("");

  const products = store.products;
  const filtered = products
    .filter((p) => filter === "all" || p.univers === filter)
    .filter((p) =>
      !query.trim() ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(query.toLowerCase())
    );

  const update = (id, patch) =>
    SITE_STORE.update("products", (list) =>
      list.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );

  const remove = (id, name) => {
    if (!window.confirm(`Supprimer définitivement "${name}" ?`)) return;
    SITE_STORE.update("products", (list) => list.filter((p) => p.id !== id));
  };

  const duplicate = (p) => {
    const newId = slugify(p.name) + "-" + Math.random().toString(36).slice(2, 5);
    SITE_STORE.update("products", (list) => [
      ...list,
      { ...p, id: newId, name: p.name + " (copie)", tag: undefined },
    ]);
    setExpanded(newId);
    scrollToExpanded(newId);
  };

  const add = (univers) => {
    const newId = "produit-" + Math.random().toString(36).slice(2, 7);
    const firstCat = (store.categories[univers] || [])[0];
    const newP = {
      id: newId,
      name: "Nouveau produit",
      univers,
      category: firstCat ? firstCat.id : "",
      price: 10000,
      short: "Description courte du produit.",
      long: "Description complète, à compléter ici.",
      details: ["—"],
    };
    SITE_STORE.update("products", (list) => [newP, ...list]);
    setExpanded(newId);
    setFilter(univers);
    setTimeout(() => scrollToExpanded(newId), 100);
  };

  function scrollToExpanded(id) {
    const el = document.querySelector(`[data-pid="${id}"]`);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  const counts = {
    all: products.length,
    beaute: products.filter((p) => p.univers === "beaute").length,
    mode: products.filter((p) => p.univers === "mode").length,
  };

  return (
    <article id="sec-produits" className="dd-set-card">
      <header className="dd-set-card-head">
        <Eyebrow num={1}>Catalogue produits</Eyebrow>
        <h2>Toute la <em>boutique</em>, à portée de clic.</h2>
        <p>
          Ajoutez, modifiez, dupliquez ou supprimez les produits du site —
          les changements sont enregistrés automatiquement et visibles
          immédiatement sur toutes les pages.
        </p>
      </header>

      <div className="dd-admin-toolbar">
        <div className="dd-admin-filters">
          <button data-on={filter === "all" ? "1" : undefined} onClick={() => setFilter("all")}>
            Tout <span>{counts.all}</span>
          </button>
          <button data-on={filter === "beaute" ? "1" : undefined} onClick={() => setFilter("beaute")}>
            Beauté <span>{counts.beaute}</span>
          </button>
          <button data-on={filter === "mode" ? "1" : undefined} onClick={() => setFilter("mode")}>
            Mode <span>{counts.mode}</span>
          </button>
        </div>
        <div className="dd-admin-search">
          <IconSearch size={14} />
          <input
            type="text"
            placeholder="Rechercher dans le catalogue…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="dd-admin-add-row">
        <button className="dd-admin-add" onClick={() => add("beaute")}>
          <IconPlus size={14} /> Nouveau produit Beauté
        </button>
        <button className="dd-admin-add" onClick={() => add("mode")}>
          <IconPlus size={14} /> Nouveau produit Mode
        </button>
      </div>

      <div className="dd-admin-list">
        {filtered.length === 0 && (
          <div className="dd-admin-empty">
            Aucun produit ne correspond à votre recherche.
          </div>
        )}
        {filtered.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            expanded={expanded === p.id}
            onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
            onUpdate={(patch) => update(p.id, patch)}
            onDelete={() => remove(p.id, p.name)}
            onDuplicate={() => duplicate(p)}
            categories={store.categories[p.univers] || []}
          />
        ))}
      </div>
    </article>
  );
}

function ProductRow({ product: p, expanded, onToggle, onUpdate, onDelete, onDuplicate, categories }) {
  return (
    <div className="dd-prod-row" data-pid={p.id} data-expanded={expanded ? "1" : undefined}>
      <div className="dd-prod-row-head">
        <button className="dd-prod-row-toggle-area" onClick={onToggle}>
          <div className="dd-prod-row-thumb">
            <image-slot
              id={"prod-" + p.id}
              placeholder={p.name.charAt(0)}
              shape="rect"
              style={{ width: "100%", height: "100%" }}
            ></image-slot>
          </div>
          <div className="dd-prod-row-info">
            <span className="dd-prod-row-cat">
              {p.univers === "beaute" ? "Beauté" : "Mode"} · {p.category || "Sans catégorie"}
            </span>
            <strong>{p.name}</strong>
            {p.tag && <span className="dd-prod-row-tag">{p.tag}</span>}
          </div>
        </button>
        <div className="dd-prod-row-price-cell">
          <input
            type="number"
            className="dd-prod-row-price-input"
            value={p.price}
            onChange={(e) => onUpdate({ price: +e.target.value || 0 })}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="dd-prod-row-currency">F CFA</span>
        </div>
        <button className="dd-prod-row-edit" onClick={onToggle} title={expanded ? "Réduire" : "Modifier"}>
          {expanded ? <IconMinus size={16} /> : <IconChevron size={16} style={{ transform: "rotate(90deg)" }} />}
        </button>
      </div>

      {expanded && (
        <div className="dd-prod-row-body">
          <div className="dd-prod-edit-layout">
            <div className="dd-prod-edit-img">
              <span className="dd-form-label">Image principale</span>
              <div className="dd-prod-edit-img-frame">
                <image-slot
                  id={"prod-" + p.id}
                  placeholder="Glisser une photo"
                  shape="rect"
                ></image-slot>
              </div>
              <span className="dd-form-meta">Glisser-déposer ou cliquer.</span>
            </div>

            <div className="dd-prod-edit-fields">
              <div className="dd-form-row">
                <label>
                  <span>Nom du produit</span>
                  <input value={p.name} onChange={(e) => onUpdate({ name: e.target.value })} />
                </label>
                <label>
                  <span>Étiquette (optionnel)</span>
                  <input
                    value={p.tag || ""}
                    placeholder="Bestseller, Nouveauté…"
                    onChange={(e) => onUpdate({ tag: e.target.value || undefined })}
                  />
                </label>
              </div>

              <div className="dd-form-row">
                <label>
                  <span>Univers</span>
                  <select
                    value={p.univers}
                    onChange={(e) => {
                      const u = e.target.value;
                      const cats = SITE_STORE.get().categories[u] || [];
                      onUpdate({ univers: u, category: cats[0] ? cats[0].id : "" });
                    }}
                  >
                    <option value="beaute">Beauté & Cosmétique</option>
                    <option value="mode">Mode & Textiles</option>
                  </select>
                </label>
                <label>
                  <span>Catégorie</span>
                  <select value={p.category} onChange={(e) => onUpdate({ category: e.target.value })}>
                    {categories.length === 0 && <option value="">(aucune catégorie)</option>}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="dd-form-row">
                <label>
                  <span>Prix (F CFA)</span>
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => onUpdate({ price: +e.target.value || 0 })}
                  />
                </label>
                <label>
                  <span>Identifiant URL</span>
                  <input
                    value={p.id}
                    disabled
                    title="L'identifiant ne peut pas être modifié — dupliquez pour recréer."
                  />
                </label>
              </div>

              <label className="dd-form-block">
                <span>Description courte</span>
                <input
                  value={p.short || ""}
                  onChange={(e) => onUpdate({ short: e.target.value })}
                  placeholder="Une ligne accrocheuse, visible sur la fiche."
                />
              </label>

              <label className="dd-form-block">
                <span>Description longue</span>
                <textarea
                  rows={4}
                  value={p.long || ""}
                  onChange={(e) => onUpdate({ long: e.target.value })}
                  placeholder="Histoire du produit, composition, conseils…"
                />
              </label>

              <DetailsEditor
                details={p.details || []}
                onChange={(details) => onUpdate({ details })}
              />

              <div className="dd-form-foot">
                <span className="dd-form-meta">✓ Enregistré automatiquement</span>
                <div className="dd-prod-row-actions">
                  <button className="dd-link-mute" onClick={onDuplicate}>Dupliquer</button>
                  <button className="dd-btn dd-btn-danger" onClick={onDelete}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsEditor({ details, onChange }) {
  return (
    <div className="dd-detail-editor">
      <span className="dd-form-label">Détails (apparaissent sur la fiche produit)</span>
      <div className="dd-detail-list">
        {details.map((d, i) => (
          <div key={i} className="dd-detail-row">
            <span className="dd-detail-num">{String(i + 1).padStart(2, "0")}</span>
            <input
              value={d}
              onChange={(e) => onChange(details.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder="Ex. 250 ml — Pression à froid"
            />
            <button
              className="dd-detail-del"
              onClick={() => onChange(details.filter((_, j) => j !== i))}
              title="Supprimer cette ligne"
            >
              <IconClose size={14} />
            </button>
          </div>
        ))}
        <button className="dd-detail-add" onClick={() => onChange([...details, ""])}>
          <IconPlus size={12} /> Ajouter un détail
        </button>
      </div>
    </div>
  );
}

// ─── Section 02 : CATÉGORIES ───────────────────────────────────────────
function AdminCategoriesSection() {
  const store = useSiteStore();

  const update = (univers, cats) =>
    SITE_STORE.update("categories", (c) => ({ ...c, [univers]: cats }));

  return (
    <article id="sec-categories" className="dd-set-card">
      <header className="dd-set-card-head">
        <Eyebrow num={2}>Catégories</Eyebrow>
        <h2>L'<em>arborescence</em> de votre boutique.</h2>
        <p>
          Renommer, réordonner ou supprimer une catégorie. Renommer met
          automatiquement à jour les produits qui l'utilisaient.
        </p>
      </header>

      <div className="dd-cat-admin-grid">
        <CategoryUniverseEditor
          title="Beauté & Cosmétique"
          univers="beaute"
          cats={store.categories.beaute || []}
          onChange={(c) => update("beaute", c)}
        />
        <CategoryUniverseEditor
          title="Mode & Textiles"
          univers="mode"
          cats={store.categories.mode || []}
          onChange={(c) => update("mode", c)}
        />
      </div>
    </article>
  );
}

function CategoryUniverseEditor({ title, univers, cats, onChange }) {
  const [newLabel, setNewLabel] = useState("");

  const addCat = () => {
    const v = newLabel.trim();
    if (!v) return;
    if (cats.some((c) => c.id === v)) return;
    onChange([...cats, { id: v, label: v }]);
    setNewLabel("");
  };

  const renameCat = (i, label) => {
    const oldId = cats[i].id;
    const newId = label;
    const next = cats.map((c, j) => (j === i ? { id: newId, label } : c));
    onChange(next);
    // Re-tag les produits qui utilisaient l'ancien id
    if (oldId !== newId) {
      SITE_STORE.update("products", (list) =>
        list.map((p) => (p.univers === univers && p.category === oldId ? { ...p, category: newId } : p))
      );
    }
  };

  const removeCat = (i) => {
    const cat = cats[i];
    const used = SITE_STORE.get().products.filter(
      (p) => p.univers === univers && p.category === cat.id
    ).length;
    if (used > 0 && !window.confirm(`${used} produit(s) utilisent "${cat.label}". Continuer ?`)) return;
    onChange(cats.filter((_, j) => j !== i));
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= cats.length) return;
    const next = [...cats];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="dd-cat-univers">
      <h4 className="dd-cat-univers-title">{title}</h4>
      <div className="dd-cat-list">
        {cats.map((c, i) => (
          <div key={c.id} className="dd-cat-row">
            <span className="dd-cat-num">{String(i + 1).padStart(2, "0")}</span>
            <input
              value={c.label}
              onChange={(e) => renameCat(i, e.target.value)}
            />
            <div className="dd-cat-actions">
              <button onClick={() => move(i, -1)} disabled={i === 0} title="Monter">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === cats.length - 1} title="Descendre">↓</button>
              <button onClick={() => removeCat(i)} className="dd-cat-del" title="Supprimer">
                <IconClose size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="dd-cat-add">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCat()}
          placeholder="Nouvelle catégorie…"
        />
        <button onClick={addCat}><IconPlus size={12} /> Ajouter</button>
      </div>
    </div>
  );
}

// ─── Section 03 : CONTENU DU SITE ──────────────────────────────────────
function AdminContentSection() {
  const store = useSiteStore();
  const c = store.content;

  const updateHero = (patch) =>
    SITE_STORE.update("content", (s) => ({ ...s, hero: { ...s.hero, ...patch } }));
  const updateFounder = (patch) =>
    SITE_STORE.update("content", (s) => ({ ...s, founder: { ...s.founder, ...patch } }));
  const updateMarquee = (next) =>
    SITE_STORE.update("content", (s) => ({ ...s, marquee: next }));

  return (
    <article id="sec-contenu" className="dd-set-card">
      <header className="dd-set-card-head">
        <Eyebrow num={3}>Contenu du site</Eyebrow>
        <h2>Ce que <em>lisent</em> vos visiteurs.</h2>
        <p>Hero de l'accueil, citation, bandeau d'annonces — tous les textes éditables.</p>
      </header>

      <div className="dd-set-group-head">Bandeau d'annonces (haut du site)</div>
      <div className="dd-marquee-edit">
        {c.marquee.map((m, i) => (
          <div key={i} className="dd-detail-row">
            <span className="dd-detail-num">{String(i + 1).padStart(2, "0")}</span>
            <input
              value={m}
              onChange={(e) => updateMarquee(c.marquee.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <button
              className="dd-detail-del"
              onClick={() => updateMarquee(c.marquee.filter((_, j) => j !== i))}
            >
              <IconClose size={14} />
            </button>
          </div>
        ))}
        <button className="dd-detail-add" onClick={() => updateMarquee([...c.marquee, "Nouvelle annonce"])}>
          <IconPlus size={12} /> Ajouter une annonce
        </button>
      </div>

      <div className="dd-set-group-head">Hero — bandeau d'accueil</div>
      <div className="dd-form dd-set-form">
        <label className="dd-form-block">
          <span>Eyebrow (petit texte au-dessus du titre)</span>
          <input value={c.hero.eyebrow} onChange={(e) => updateHero({ eyebrow: e.target.value })} />
        </label>
        <div className="dd-form-row">
          <label>
            <span>Titre — ligne 1</span>
            <input value={c.hero.title1} onChange={(e) => updateHero({ title1: e.target.value })} />
          </label>
          <label>
            <span>Titre — ligne 2 (italique)</span>
            <input value={c.hero.title2} onChange={(e) => updateHero({ title2: e.target.value })} />
          </label>
        </div>
        <label className="dd-form-block">
          <span>Titre — ligne 3</span>
          <input value={c.hero.title3} onChange={(e) => updateHero({ title3: e.target.value })} />
        </label>
        <label className="dd-form-block">
          <span>Texte d'introduction</span>
          <textarea rows={3} value={c.hero.lede} onChange={(e) => updateHero({ lede: e.target.value })} />
        </label>
        <div className="dd-form-row">
          <label>
            <span>Saison (libellé)</span>
            <input value={c.hero.seasonLabel} onChange={(e) => updateHero({ seasonLabel: e.target.value })} />
          </label>
          <label>
            <span>Saison (valeur)</span>
            <input value={c.hero.season} onChange={(e) => updateHero({ season: e.target.value })} />
          </label>
        </div>
        <div className="dd-form-row">
          <label>
            <span>Édition (libellé)</span>
            <input value={c.hero.editionLabel} onChange={(e) => updateHero({ editionLabel: e.target.value })} />
          </label>
          <label>
            <span>Édition (valeur)</span>
            <input value={c.hero.edition} onChange={(e) => updateHero({ edition: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="dd-set-group-head">Citation de la fondatrice</div>
      <div className="dd-form dd-set-form">
        <label className="dd-form-block">
          <span>Citation</span>
          <textarea rows={5} value={c.founder.quote} onChange={(e) => updateFounder({ quote: e.target.value })} />
        </label>
        <div className="dd-form-row">
          <label>
            <span>Nom</span>
            <input value={c.founder.name} onChange={(e) => updateFounder({ name: e.target.value })} />
          </label>
          <label>
            <span>Rôle</span>
            <input value={c.founder.role} onChange={(e) => updateFounder({ role: e.target.value })} />
          </label>
        </div>
      </div>
    </article>
  );
}

// ─── Section 04 : MARQUE & CONTACT ─────────────────────────────────────
function AdminBrandSection() {
  const store = useSiteStore();
  const b = store.content.brand;

  const updateBrand = (patch) =>
    SITE_STORE.update("content", (s) => ({ ...s, brand: { ...s.brand, ...patch } }));

  const whatsappHref = `https://wa.me/${(b.whatsapp || "+221 76 305 05 05").replace(/\D/g, "")}`;
  const tiktokHandle = b.tiktok || "@didallah.shop";
  const tiktokHref = `https://www.tiktok.com/${tiktokHandle.replace(/^@/, "")}`;
  const facebookHref = b.facebook?.startsWith("http")
    ? b.facebook
    : `https://${b.facebook || "fb.com/didallah.shop"}`;

  return (
    <article id="sec-marque" className="dd-set-card">
      <header className="dd-set-card-head">
        <Eyebrow num={4}>Marque & contact</Eyebrow>
        <h2>Vos <em>coordonnées</em> et identité.</h2>
        <p>WhatsApp, email, adresse — tout est affiché sur la page Contact, dans le footer et dans le bouton "Commander".</p>
      </header>

      <div className="dd-form dd-set-form">
        <div className="dd-form-row">
          <label>
            <span>Nom de la maison</span>
            <input value={b.name} onChange={(e) => updateBrand({ name: e.target.value })} />
          </label>
          <label>
            <span>Slogan / tagline</span>
            <input value={b.tagline} onChange={(e) => updateBrand({ tagline: e.target.value })} />
          </label>
        </div>
        <div className="dd-form-row">
          <label>
            <span>Numéro WhatsApp</span>
            <input value={b.whatsapp} onChange={(e) => updateBrand({ whatsapp: e.target.value })} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={b.email} onChange={(e) => updateBrand({ email: e.target.value })} />
          </label>
        </div>
        <div className="dd-form-row">
          <label>
            <span>Adresse</span>
            <input value={b.address} onChange={(e) => updateBrand({ address: e.target.value })} />
          </label>
          <label>
            <span>Horaires</span>
            <input value={b.hours} onChange={(e) => updateBrand({ hours: e.target.value })} />
          </label>
        </div>
        <div className="dd-form-row">
          <label>
            <span>TikTok</span>
            <input value={b.tiktok} onChange={(e) => updateBrand({ tiktok: e.target.value })} />
          </label>
          <label>
            <span>Facebook</span>
            <input value={b.facebook} onChange={(e) => updateBrand({ facebook: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="dd-set-preview">
        <div className="dd-set-preview-card">
          <div className="dd-set-preview-card-head">
            <strong>{b.name}</strong>
            <span>{b.tagline}</span>
          </div>
          <div className="dd-set-preview-card-body">
            <p>WhatsApp : <a href={whatsappHref} target="_blank" rel="noreferrer">{b.whatsapp}</a></p>
            <p>Email : <a href={`mailto:${b.email}`}>{b.email}</a></p>
            <p>Adresse : {b.address}</p>
            <p>Horaires : {b.hours}</p>
          </div>
          <div className="dd-set-preview-card-actions">
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="dd-btn dd-btn-whatsapp">Commander sur WhatsApp</a>
            <a href={tiktokHref} target="_blank" rel="noreferrer" className="dd-btn dd-btn-ghost">TikTok</a>
            <a href={facebookHref} target="_blank" rel="noreferrer" className="dd-btn dd-btn-ghost">Facebook</a>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Section RESET ─────────────────────────────────────────────────────
function AdminResetSection() {
  return (
    <article id="sec-reset" className="dd-set-card">
      <header className="dd-set-card-head">
        <Eyebrow num={5}>Réinitialisation</Eyebrow>
        <h2>Revenir aux <em>valeurs d'origine</em>.</h2>
        <p>
          Restaure le catalogue de démonstration livré avec le site. Toutes
          vos modifications produits, catégories et textes seront perdues.
        </p>
      </header>

      <div className="dd-account-actions">
        <div className="dd-account-row">
          <div>
            <strong>Réinitialiser le catalogue produits</strong>
            <span>Restaure les {window.DEFAULT_PRODUCTS.length} produits par défaut.</span>
          </div>
          <button
            className="dd-btn dd-btn-danger"
            onClick={() => {
              if (window.confirm("Réinitialiser le catalogue ?")) SITE_STORE.resetKey("products");
            }}
          >Réinitialiser</button>
        </div>
        <div className="dd-account-row">
          <div>
            <strong>Réinitialiser les catégories</strong>
            <span>Restaure les catégories Beauté & Mode par défaut.</span>
          </div>
          <button
            className="dd-btn dd-btn-danger"
            onClick={() => {
              if (window.confirm("Réinitialiser les catégories ?")) SITE_STORE.resetKey("categories");
            }}
          >Réinitialiser</button>
        </div>
        <div className="dd-account-row">
          <div>
            <strong>Réinitialiser le contenu (textes, hero, marque)</strong>
            <span>Restaure tous les textes éditoriaux et coordonnées.</span>
          </div>
          <button
            className="dd-btn dd-btn-danger"
            onClick={() => {
              if (window.confirm("Réinitialiser le contenu ?")) SITE_STORE.resetKey("content");
            }}
          >Réinitialiser</button>
        </div>
        <div className="dd-account-row dd-account-danger">
          <div>
            <strong>Tout réinitialiser</strong>
            <span>Restaure l'intégralité du site à son état d'usine.</span>
          </div>
          <button
            className="dd-btn dd-btn-danger"
            onClick={() => {
              if (window.confirm("Tout réinitialiser ? Cette action est irréversible.")) SITE_STORE.reset();
            }}
          >Tout réinitialiser</button>
        </div>
      </div>
    </article>
  );
}

// ─── Utils ─────────────────────────────────────────────────────────────
function slugify(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

Object.assign(window, {
  AdminProductsSection, AdminCategoriesSection,
  AdminContentSection, AdminBrandSection, AdminResetSection,
  slugify,
});
