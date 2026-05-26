// DiDallah Shop — Page Accueil (Home)

function HomePage({ navigate, wishlist, toggleWishlist, focus }) {
  // 'focus' can be 'balanced' | 'beaute' | 'mode'
  const featuredBeaute = productsByUnivers("beaute").slice(0, 4);
  const featuredMode = productsByUnivers("mode").slice(0, 4);
  const content = getContent();
  const hero = content.hero;
  const founder = content.founder;

  return (
    <main className="dd-page dd-home">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="dd-hero">
        <div className="dd-hero-cols">
          <div className="dd-hero-text">
            <Eyebrow num={1}>{hero.eyebrow}</Eyebrow>
            <h1 className="dd-hero-title">
              {hero.title1}<br/>
              <span className="dd-hero-title-em">{hero.title2}</span>,<br/>
              <span className="dd-hero-title-thin">{hero.title3}</span>
            </h1>
            <p className="dd-hero-lede">{hero.lede}</p>
            <div className="dd-hero-cta">
              <PrimaryButton icon={<IconArrow size={16} />} onClick={() => navigate({ name: "univers", params: {} })}>
                Découvrir la maison
              </PrimaryButton>
              <GhostButton onClick={() => navigate({ name: "univers", params: { u: "mode" } })}>
                Collection Korité
              </GhostButton>
            </div>

            <div className="dd-hero-rule" />

            <div className="dd-hero-credits">
              <div>
                <div className="dd-credit-k">{hero.seasonLabel}</div>
                <div className="dd-credit-v">{hero.season}</div>
              </div>
              <div>
                <div className="dd-credit-k">{hero.editionLabel}</div>
                <div className="dd-credit-v">{hero.edition}</div>
              </div>
              <div>
                <div className="dd-credit-k">Livraison</div>
                <div className="dd-credit-v">Dakar · Régions · Diaspora</div>
              </div>
            </div>
          </div>

          <div className="dd-hero-visual">
            <div className="dd-hero-img dd-hero-img-main">
              <ImageFrame
                id="hero-main"
                ratio="3 / 4"
                placeholder="Photo modèle principale — boubou doré, fond noir"
                tone="deep"
                src="site/img/hero-main.svg"
              />
              <div className="dd-hero-img-cap">
                <span className="dd-hero-img-num">N°01</span>
                <span>Boubou Soirée d'Or — Édition limitée</span>
              </div>
            </div>
            <div className="dd-hero-img dd-hero-img-mini">
              <ImageFrame
                id="hero-mini"
                ratio="3 / 4"
                placeholder="Flacon de parfum, huile précieuse…"
                tone="warm"
                src="site/img/hero-mini.svg"
              />
            </div>
            <div className="dd-hero-stamp">
              <svg viewBox="0 0 200 200" width="100%" height="100%">
                <defs>
                  <path id="circle" d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
                </defs>
                <text fontSize="14" letterSpacing="3" fill="currentColor" fontFamily="var(--font-sans)">
                  <textPath href="#circle">DIDALLAH · DAKAR · 2026 · LIBERTÉ 6 EXTENSION · </textPath>
                </text>
                <text x="100" y="92" textAnchor="middle" fontFamily="var(--font-display)" fontStyle="italic" fontSize="22" fill="currentColor">Maison</text>
                <text x="100" y="118" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fill="currentColor">Madina Ba</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bandeau valeurs ───────────────────────────────────────────── */}
      <section className="dd-strip">
        <div className="dd-strip-item">
          <span className="dd-strip-num">01</span>
          <span>Sélection<br/>signée Dakar</span>
        </div>
        <div className="dd-strip-item">
          <span className="dd-strip-num">02</span>
          <span>Confection<br/>sur mesure</span>
        </div>
        <div className="dd-strip-item">
          <span className="dd-strip-num">03</span>
          <span>Commande<br/>sur WhatsApp</span>
        </div>
        <div className="dd-strip-item">
          <span className="dd-strip-num">04</span>
          <span>Livraison<br/>Sénégal & Diaspora</span>
        </div>
      </section>

      {/* ── Univers Beauté ────────────────────────────────────────────── */}
      <section className="dd-section dd-univers-section" data-univ="beaute">
        <header className="dd-section-head">
          <div>
            <Eyebrow num={2}>Univers Beauté & Cosmétique</Eyebrow>
            <h2 className="dd-section-title">
              Le soin <em>comme un rituel</em><br/>
              du quotidien.
            </h2>
          </div>
          <div className="dd-section-aside">
            <p>
              Une gamme pensée pour le soin, l'élégance et le bien-être au quotidien.
              Parfums signature, huiles précieuses, soins corps & visage et
              maquillage — l'art de la beauté sénégalaise réuni.
            </p>
            <button className="dd-link" onClick={() => navigate({ name: "univers", params: { u: "beaute" } })}>
              Explorer la beauté <IconArrow size={14} />
            </button>
          </div>
        </header>
        <div className="dd-grid dd-grid-4">
          {featuredBeaute.map((p, i) => (
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

      {/* ── Editorial split — Founder ─────────────────────────────────── */}
      <section className="dd-founder">
        <div className="dd-founder-img">
          <ImageFrame
            id="founder-portrait"
            ratio="4 / 5"
            placeholder="Portrait Mme Madina Ba — fondatrice"
            tone="deep"
            src="site/img/founder-portrait.svg"
          />
        </div>
        <div className="dd-founder-text">
          <Eyebrow num={3}>Lettre de la fondatrice</Eyebrow>
          <p className="dd-founder-quote">
            <span className="dd-quote-mark">“</span>
            {founder.quote}
          </p>
          <div className="dd-founder-sig">
            <div className="dd-founder-name">{founder.name}</div>
            <div className="dd-founder-role">{founder.role}</div>
          </div>
        </div>
      </section>

      {/* ── Univers Mode ──────────────────────────────────────────────── */}
      <section className="dd-section dd-univers-section" data-univ="mode">
        <header className="dd-section-head">
          <div>
            <Eyebrow num={4}>Univers Mode & Textiles</Eyebrow>
            <h2 className="dd-section-title">
              Le <em>vestiaire</em><br/>
              de la cérémonie au quotidien.
            </h2>
          </div>
          <div className="dd-section-aside">
            <p>
              Tendances actuelles et élégance traditionnelle s'y rencontrent.
              Prêt-à-porter, boubous & jallabas, wax & bazin, accessoires —
              de la pièce contemporaine au coupon pour confection.
            </p>
            <button className="dd-link" onClick={() => navigate({ name: "univers", params: { u: "mode" } })}>
              Explorer la mode <IconArrow size={14} />
            </button>
          </div>
        </header>
        <div className="dd-grid dd-grid-4">
          {featuredMode.map((p, i) => (
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

      {/* ── Lookbook bande ────────────────────────────────────────────── */}
      <section className="dd-lookbook">
        <header className="dd-lookbook-head">
          <Eyebrow num={5}>Lookbook — Édition Korité</Eyebrow>
          <h2 className="dd-section-title" style={{ marginTop: 6 }}>
            Une garde-robe <em>de fête</em>,<br/>
            cousue à la main.
          </h2>
        </header>
        <div className="dd-lookbook-grid">
          <div className="dd-lookbook-frame dd-look-1">
            <ImageFrame id="look-1" ratio="3 / 4" placeholder="Look 1 — Boubou doré" tone="deep" src="site/img/look-1.svg" />
            <span className="dd-look-cap"><em>01</em> — Boubou Soirée d'Or</span>
          </div>
          <div className="dd-lookbook-frame dd-look-2">
            <ImageFrame id="look-2" ratio="1 / 1" placeholder="Détail broderie" tone="warm" src="site/img/look-2.svg" />
            <span className="dd-look-cap"><em>02</em> — Broderie main, fils dorés</span>
          </div>
          <div className="dd-lookbook-frame dd-look-3">
            <ImageFrame id="look-3" ratio="3 / 4" placeholder="Look 3 — Jallaba ivoire" tone="warm" src="site/img/look-3.svg" />
            <span className="dd-look-cap"><em>03</em> — Jallaba Cérémonie</span>
          </div>
          <div className="dd-lookbook-quote">
            <p>
              « La cérémonie commence par le geste de s'habiller ;
              tout est dans le tombé du tissu. »
            </p>
            <button className="dd-link" onClick={() => navigate({ name: "univers", params: { u: "mode" } })}>
              Voir la collection <IconArrow size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Influenceurs / TikTok ─────────────────────────────────────── */}
      <section className="dd-tiktok">
        <header className="dd-section-head">
          <div>
            <Eyebrow num={6}>Vu sur les réseaux</Eyebrow>
            <h2 className="dd-section-title">
              DiDallah <em>sur TikTok</em><br/>
              & au-delà.
            </h2>
          </div>
          <div className="dd-section-aside">
            <p>
              Nos collaborations avec les voix de la mode et de la beauté à Dakar.
              Suivez les coulisses, les lancements et les routines beauté.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <a className="dd-social-btn dd-social-lg" href="#"><IconTikTok size={18} /></a>
              <a className="dd-social-btn dd-social-lg" href="#"><IconWhatsApp size={18} /></a>
              <a className="dd-social-btn dd-social-lg" href="#"><IconFacebook size={18} /></a>
            </div>
          </div>
        </header>
        <div className="dd-tiktok-grid">
          {[
            { h: "@aida.dakar", v: "412k", c: "Routine soin Karité" },
            { h: "@maman.binta", v: "238k", c: "Korité 2026 — try-on" },
            { h: "@oumar.fits", v: "165k", c: "Jallaba ivoire — fit check" },
            { h: "@lipstick.lou", v: "98k", c: "Terracotta · swatch test" },
          ].map((t, i) => (
            <article key={i} className="dd-tt-card">
              <div className="dd-tt-frame">
                <ImageFrame id={"tt-" + i} ratio="9 / 16" placeholder={t.c} tone={i % 2 ? "deep" : "warm"} src={"site/img/tt-" + i + ".svg"} />
                <span className="dd-tt-play">▶</span>
                <span className="dd-tt-views"><IconTikTok size={11} /> {t.v}</span>
              </div>
              <div className="dd-tt-cap">
                <span className="dd-tt-handle">{t.h}</span>
                <span className="dd-tt-desc">{t.c}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA finale ─────────────────────────────────────────────── */}
      <section className="dd-finale">
        <div className="dd-finale-bg" aria-hidden="true" />
        <div className="dd-finale-inner">
          <Eyebrow num={7}>Une question, une commande</Eyebrow>
          <h2 className="dd-finale-title">
            Parlez-nous<br/>
            <em>sur WhatsApp.</em>
          </h2>
          <p className="dd-finale-lede">
            Conseil personnalisé, disponibilité, confection sur mesure, livraison —
            notre équipe répond du lundi au samedi, 9h–20h.
          </p>
          <WhatsAppButton label="Démarrer une conversation" />
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { HomePage });
