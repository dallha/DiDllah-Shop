// DiDallah Shop — pages secondaires (Wishlist, Journal)

function WishlistPage({ navigate, wishlist, toggleWishlist }) {
  const items = PRODUCTS.filter((p) => wishlist.has(p.id));
  return (
    <main className="dd-page dd-wishlist">
      <section className="dd-univers-header">
        <div className="dd-univers-crumb">
          <button onClick={() => navigate({ name: "home" })}>Accueil</button>
          <span>—</span>
          <span>Mes favoris</span>
        </div>
        <div className="dd-univers-titlerow">
          <div>
            <span className="dd-univers-num">N° 05</span>
            <h1 className="dd-univers-title">Mes <em>favoris</em></h1>
            <p className="dd-univers-lede">
              {items.length === 0
                ? "Votre carnet de désirs est encore vierge. Promenez-vous dans la boutique."
                : items.length + " article" + (items.length > 1 ? "s" : "") + " conservé" + (items.length > 1 ? "s" : "") + " pour plus tard."}
            </p>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="dd-empty" style={{ margin: "60px auto", maxWidth: 540 }}>
          <h3>Rien à voir ici… pour l'instant.</h3>
          <p>Cliquez sur le ♡ d'un produit pour le retrouver ici.</p>
          <PrimaryButton onClick={() => navigate({ name: "univers", params: {} })}>
            Explorer la boutique
          </PrimaryButton>
        </div>
      ) : (
        <section style={{ padding: "0 var(--page-pad) 80px" }}>
          <div className="dd-grid dd-grid-4">
            {items.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={(prod) => navigate({ name: "produit", params: { id: prod.id } })}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                variant="editorial"
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function JournalPage({ navigate }) {
  const articles = [
    {
      n: "01",
      cat: "Récit",
      title: "Comment naît un boubou de cérémonie",
      lede: "Trois semaines, sept mains, un fil d'or — visite à l'atelier de la maison.",
      tone: "deep",
    },
    {
      n: "02",
      cat: "Beauté",
      title: "Karité brut : la routine 3-étapes",
      lede: "De la douche au coucher — le soin signature DiDallah, expliqué.",
      tone: "warm",
    },
    {
      n: "03",
      cat: "Tendance",
      title: "Le Bazin moderne, mode d'emploi",
      lede: "Comment porter le bazin riche tous les jours, pas seulement les jours de fête.",
      tone: "deep",
    },
    {
      n: "04",
      cat: "Tabaski",
      title: "Calendrier des commandes 2026",
      lede: "Anticipez votre confection — les dates clés pour être prête.",
      tone: "warm",
    },
  ];

  return (
    <main className="dd-page dd-journal">
      <section className="dd-univers-header">
        <div className="dd-univers-crumb">
          <button onClick={() => navigate({ name: "home" })}>Accueil</button>
          <span>—</span>
          <span>Journal</span>
        </div>
        <div className="dd-univers-titlerow">
          <div>
            <span className="dd-univers-num">N° 06</span>
            <h1 className="dd-univers-title">Le <em>Journal</em></h1>
            <p className="dd-univers-lede">
              Récits, conseils et coulisses — la voix de la maison DiDallah.
            </p>
          </div>
        </div>
      </section>

      <section className="dd-journal-grid">
        {articles.map((a, i) => (
          <article key={a.n} className={"dd-journal-card " + (i === 0 ? "dd-journal-feat" : "")}>
            <div className="dd-journal-img">
              <ImageFrame id={"journal-" + a.n} ratio={i === 0 ? "16 / 10" : "4 / 5"} placeholder={a.title} tone={a.tone} src={"site/img/journal-" + a.n + ".svg"} />
            </div>
            <div className="dd-journal-body">
              <div className="dd-journal-meta">
                <span className="dd-journal-num">{a.n}</span>
                <span className="dd-journal-cat">{a.cat}</span>
              </div>
              <h3>{a.title}</h3>
              <p>{a.lede}</p>
              <button className="dd-link">Lire l'article <IconArrow size={14} /></button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

Object.assign(window, { WishlistPage, JournalPage });
