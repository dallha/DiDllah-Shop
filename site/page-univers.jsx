// DiDallah Shop — Page Univers (catalogue avec filtres)

function UniversPage({ route, navigate, wishlist, toggleWishlist, cardVariant }) {
  const universParam = route.params?.u || null; // 'beaute' | 'mode' | null (tout)
  const [activeUniv, setActiveUniv] = useState(universParam);
  const [activeCats, setActiveCats] = useState(new Set());
  const [maxPrice, setMaxPrice] = useState(80000);
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");

  useEffect(() => setActiveUniv(universParam), [universParam]);

  const all = PRODUCTS;
  const filtered = useMemo(() => {
    let list = all;
    if (activeUniv) list = list.filter((p) => p.univers === activeUniv);
    if (activeCats.size) list = list.filter((p) => activeCats.has(p.category));
    if (maxPrice) list = list.filter((p) => p.price <= maxPrice);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.short.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    return list;
  }, [activeUniv, activeCats, maxPrice, sort, query]);

  const toggleCat = (c) => {
    const next = new Set(activeCats);
    next.has(c) ? next.delete(c) : next.add(c);
    setActiveCats(next);
  };

  const clearAll = () => {
    setActiveCats(new Set());
    setMaxPrice(80000);
    setQuery("");
  };

  const cats =
    activeUniv === "beaute"
      ? CATEGORIES.beaute
      : activeUniv === "mode"
      ? CATEGORIES.mode
      : [...CATEGORIES.beaute, ...CATEGORIES.mode];

  const title =
    activeUniv === "beaute"
      ? "Univers Beauté"
      : activeUniv === "mode"
      ? "Univers Mode & Textiles"
      : "Tous les produits";

  const num =
    activeUniv === "beaute" ? "01" : activeUniv === "mode" ? "02" : "03";

  return (
    <main className="dd-page dd-univers">
      {/* ── Header de section ─────────────────────────────────────────── */}
      <section className="dd-univers-header">
        <div className="dd-univers-crumb">
          <button onClick={() => navigate({ name: "home" })}>Accueil</button>
          <span>—</span>
          <span>Boutique</span>
          {activeUniv && (
            <>
              <span>—</span>
              <span>{activeUniv === "beaute" ? "Beauté" : "Mode"}</span>
            </>
          )}
        </div>
        <div className="dd-univers-titlerow">
          <div>
            <span className="dd-univers-num">N° {num}</span>
            <h1 className="dd-univers-title">{title}</h1>
            <p className="dd-univers-lede">
              {activeUniv === "beaute" &&
                "Le soin, l'élégance et le bien-être quotidien — quatre familles."}
              {activeUniv === "mode" &&
                "Tendances actuelles et élégance traditionnelle, dans un même vestiaire."}
              {!activeUniv &&
                "Beauté & Mode réunis — l'intégralité de notre sélection saisonnière."}
            </p>
          </div>
          <div className="dd-univers-toggle">
            <button
              className="dd-pill"
              data-on={activeUniv === null ? "1" : undefined}
              onClick={() => { setActiveUniv(null); setActiveCats(new Set()); }}
            >Tout</button>
            <button
              className="dd-pill"
              data-on={activeUniv === "beaute" ? "1" : undefined}
              onClick={() => { setActiveUniv("beaute"); setActiveCats(new Set()); }}
            >Beauté</button>
            <button
              className="dd-pill"
              data-on={activeUniv === "mode" ? "1" : undefined}
              onClick={() => { setActiveUniv("mode"); setActiveCats(new Set()); }}
            >Mode</button>
          </div>
        </div>
      </section>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <section className="dd-toolbar">
        <div className="dd-search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Rechercher : parfum, huile de ricin, boubou, wax…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="dd-search-clear" onClick={() => setQuery("")} aria-label="Effacer"><IconClose size={14} /></button>
          )}
        </div>
        <div className="dd-toolbar-right">
          <span className="dd-result-count">
            {filtered.length} <em>{filtered.length > 1 ? "articles" : "article"}</em>
          </span>
          <div className="dd-sort">
            <label>Trier</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Sélection maison</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="name">Nom A → Z</option>
            </select>
            <IconChevron size={12} />
          </div>
        </div>
      </section>

      {/* ── Filtres + Grille ──────────────────────────────────────────── */}
      <section className="dd-cat-layout">
        <aside className="dd-filters">
          <div className="dd-filter-block">
            <h4>Catégories</h4>
            <ul>
              {cats.map((c) => (
                <li key={c.id}>
                  <button
                    className="dd-filter-pill"
                    data-on={activeCats.has(c.id) ? "1" : undefined}
                    onClick={() => toggleCat(c.id)}
                  >
                    <span className="dd-filter-box">{activeCats.has(c.id) && <IconCheck size={11} />}</span>
                    <span>{c.label}</span>
                    <span className="dd-filter-count">
                      {all.filter((p) => p.category === c.id && (!activeUniv || p.univers === activeUniv)).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="dd-filter-block">
            <h4>Prix maximum</h4>
            <div className="dd-price-range">
              <input
                type="range"
                min={5000}
                max={80000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />
              <div className="dd-price-row">
                <span>0 F</span>
                <span><strong>{fmtPrice(maxPrice)}</strong></span>
              </div>
            </div>
          </div>

          <div className="dd-filter-block">
            <h4>Tags</h4>
            <div className="dd-tag-list">
              {["Bestseller", "Nouveauté", "Édition limitée"].map((t) => (
                <button key={t} className="dd-filter-tag">{t}</button>
              ))}
            </div>
          </div>

          <button className="dd-filter-clear" onClick={clearAll}>
            Effacer les filtres <IconClose size={12} />
          </button>
        </aside>

        <div className="dd-cat-grid">
          {filtered.length === 0 ? (
            <div className="dd-empty">
              <Eyebrow>Aucun résultat</Eyebrow>
              <h3>Rien à vous proposer pour le moment.</h3>
              <p>Élargissez vos filtres ou essayez un autre mot-clé.</p>
              <PrimaryButton onClick={clearAll}>Tout réinitialiser</PrimaryButton>
            </div>
          ) : (
            <div className="dd-grid dd-grid-3">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpen={(prod) => navigate({ name: "produit", params: { id: prod.id } })}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                  variant={cardVariant}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { UniversPage });
