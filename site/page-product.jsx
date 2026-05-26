// DiDallah Shop — Page Produit (détail)

function ProductPage({ route, navigate, wishlist, toggleWishlist }) {
  const product = productById(route.params?.id);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(null);

  if (!product) {
    return (
      <main className="dd-page" style={{ padding: "120px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40 }}>Produit introuvable</h2>
        <PrimaryButton onClick={() => navigate({ name: "univers", params: {} })}>
          Retour à la boutique
        </PrimaryButton>
      </main>
    );
  }

  const liked = wishlist.has(product.id);
  const tone = product.univers === "beaute" ? "warm" : "deep";
  const related = PRODUCTS.filter((p) => p.univers === product.univers && p.id !== product.id).slice(0, 4);

  const sizeOptions = product.univers === "mode" && !product.category.includes("Tissus") && !product.category.includes("Accessoires")
    ? (product.category.includes("Tenues") ? ["S", "M", "L", "XL", "Sur mesure"] : ["36", "38", "40", "42", "44"])
    : null;

  return (
    <main className="dd-page dd-product">
      {/* Breadcrumb */}
      <div className="dd-univers-crumb dd-prod-crumb">
        <button onClick={() => navigate({ name: "home" })}>Accueil</button>
        <span>—</span>
        <button onClick={() => navigate({ name: "univers", params: { u: product.univers } })}>
          {product.univers === "beaute" ? "Beauté" : "Mode"}
        </button>
        <span>—</span>
        <span>{product.category}</span>
      </div>

      <section className="dd-prod-layout">
        {/* Gallery */}
        <div className="dd-prod-gallery">
          <div className="dd-prod-thumbs">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                className="dd-prod-thumb"
                data-on={activeImg === i ? "1" : undefined}
                onClick={() => setActiveImg(i)}
                aria-label={"Vue " + (i + 1)}
              >
                <ImageFrame
                  id={"prod-thumb-" + product.id + "-" + i}
                  ratio="1 / 1"
                  placeholder={"Vue " + (i + 1)}
                  tone={tone}
                  src={"site/img/" + product.id + ".svg"}
                />
              </button>
            ))}
          </div>
          <div className="dd-prod-main-img">
            <ImageFrame
              id={"prod-main-" + product.id + "-" + activeImg}
              ratio="4 / 5"
              placeholder={product.name + " · Vue principale"}
              tone={tone}
              src={"site/img/" + product.id + ".svg"}
            />
            {product.tag && <span className="dd-tag dd-tag-large">{product.tag}</span>}
          </div>
        </div>

        {/* Info */}
        <div className="dd-prod-info">
          <Eyebrow>{product.category}</Eyebrow>
          <h1 className="dd-prod-title">{product.name}</h1>

          <div className="dd-prod-rating">
            {[1,2,3,4,5].map((i) => <IconStar key={i} size={13} />)}
            <span>4,8 · 124 avis</span>
          </div>

          <div className="dd-prod-price">
            <span className="dd-prod-price-now">{fmtPrice(product.price)}</span>
            <span className="dd-prod-price-meta">TVA incluse · livraison calculée à la commande</span>
          </div>

          <p className="dd-prod-short">{product.short}</p>
          <p className="dd-prod-long">{product.long}</p>

          {sizeOptions && (
            <div className="dd-prod-block">
              <div className="dd-prod-block-head">
                <h4>Taille</h4>
                <button className="dd-link" style={{ fontSize: 12 }}>Guide des tailles <IconArrow size={12} /></button>
              </div>
              <div className="dd-size-row">
                {sizeOptions.map((s) => (
                  <button
                    key={s}
                    className="dd-size-btn"
                    data-on={size === s ? "1" : undefined}
                    onClick={() => setSize(s)}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          <div className="dd-prod-actions">
            <div className="dd-qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Moins"><IconMinus size={14} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} aria-label="Plus"><IconPlus size={14} /></button>
            </div>
            <PrimaryButton full icon={<IconArrow size={16} />} onClick={() => {
              if (sizeOptions && !size) {
                alert("Veuillez sélectionner une taille.");
                return;
              }
              SITE_STORE.addToCart({ id: product.id, quantity, size });
              alert("Ajouté au panier !");
            }}>
              Ajouter au panier
            </PrimaryButton>
          </div>

          <WhatsAppButton product={product} full />

          <button
            className="dd-prod-wish"
            onClick={() => toggleWishlist(product.id)}
            data-on={liked ? "1" : undefined}
          >
            {liked ? <IconHeartFilled size={15} /> : <IconHeart size={15} />}
            {liked ? "Retiré des favoris" : "Ajouter aux favoris"}
          </button>

          <ul className="dd-prod-details">
            {product.details.map((d, i) => (
              <li key={i}><IconCheck size={13} /> {d}</li>
            ))}
          </ul>

          <div className="dd-prod-reassure">
            <div>
              <span className="dd-r-num">01</span>
              <div>
                <strong>Livraison Dakar</strong>
                <span>24–48 h ouvrées · gratuite dès 35 000 F</span>
              </div>
            </div>
            <div>
              <span className="dd-r-num">02</span>
              <div>
                <strong>Régions & Diaspora</strong>
                <span>Devis sur demande · WhatsApp</span>
              </div>
            </div>
            <div>
              <span className="dd-r-num">03</span>
              <div>
                <strong>Authenticité</strong>
                <span>Origine et confection garanties</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="dd-related">
        <header className="dd-section-head">
          <div>
            <Eyebrow num={1}>Compositions associées</Eyebrow>
            <h2 className="dd-section-title">
              On porte aussi <em>avec</em>.
            </h2>
          </div>
        </header>
        <div className="dd-grid dd-grid-4">
          {related.map((p, i) => (
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
    </main>
  );
}

Object.assign(window, { ProductPage });
