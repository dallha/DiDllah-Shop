// DiDallah Shop — Navigation, Footer, and shared chrome

function TopBar({ route, navigate, wishlistCount, density }) {
  const cart = getCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const el = document.querySelector(".dd-scroll");
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 24);
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const NavLink = ({ to, children }) => (
    <button
      type="button"
      className="dd-navlink"
      data-active={route.name === to.name && (!to.params || JSON.stringify(to.params) === JSON.stringify(route.params)) ? "1" : undefined}
      onClick={() => { setMenuOpen(false); navigate(to); }}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* Marquee — petite annonce */}
      <div className="dd-marquee">
        <div className="dd-marquee-track">
          {(() => {
            const items = getContent().marquee || [];
            // duplique pour boucler le défilement
            const looped = [...items, ...items];
            return looped.map((m, i) => (
              <React.Fragment key={i}>
                <span>{m}</span>
                {i < looped.length - 1 && <span className="dd-dot" />}
              </React.Fragment>
            ));
          })()}
        </div>
      </div>

      <header className={"dd-topbar " + (scrolled ? "is-scrolled" : "")}>
        <div className="dd-topbar-inner">
          <button className="dd-iconbtn dd-menubtn" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <IconMenu size={20} />
          </button>

          <nav className="dd-nav-left">
            <NavLink to={{ name: "univers", params: { u: "beaute" } }}>Beauté</NavLink>
            <NavLink to={{ name: "univers", params: { u: "mode" } }}>Mode</NavLink>
            <NavLink to={{ name: "univers", params: {} }}>Tout</NavLink>
          </nav>

          <button className="dd-brand" onClick={() => navigate({ name: "home" })} aria-label="Accueil">
            <Wordmark />
          </button>

          <nav className="dd-nav-right">
            <NavLink to={{ name: "journal" }}>Journal</NavLink>
            <NavLink to={{ name: "contact" }}>Contact</NavLink>
          </nav>

          <div className="dd-nav-icons">
            <button className="dd-iconbtn" aria-label="Recherche">
              <IconSearch size={19} />
            </button>
            <button
              className="dd-iconbtn"
              aria-label="Favoris"
              onClick={() => navigate({ name: "wishlist" })}
              data-count={wishlistCount > 0 ? wishlistCount : undefined}
            >
              <IconHeart size={19} />
              {wishlistCount > 0 && <span className="dd-iconbtn-pill">{wishlistCount}</span>}
            </button>
            <button
              className="dd-iconbtn"
              aria-label="Panier"
              onClick={() => navigate({ name: "cart" })}
              data-count={cartCount > 0 ? cartCount : undefined}
            >
              <IconBag size={19} />
              {cartCount > 0 && <span className="dd-iconbtn-pill">{cartCount}</span>}
            </button>
            <button className="dd-iconbtn" aria-label="Compte" onClick={() => navigate({ name: "settings" })}>
              <IconUser size={19} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="dd-drawer" onClick={() => setMenuOpen(false)}>
          <aside className="dd-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="dd-drawer-head">
              <Wordmark />
              <button className="dd-iconbtn" onClick={() => setMenuOpen(false)} aria-label="Fermer">
                <IconClose size={20} />
              </button>
            </div>
            <div className="dd-drawer-body">
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "home" }); }}>Accueil</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "univers", params: { u: "beaute" } }); }}>Univers Beauté</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "univers", params: { u: "mode" } }); }}>Univers Mode</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "univers", params: {} }); }}>Tous les produits</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "cart" }); }}>Panier ({cartCount})</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "wishlist" }); }}>Favoris ({wishlistCount})</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "journal" }); }}>Journal</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "contact" }); }}>Contact & Livraison</button>
              <button className="dd-drawer-link" onClick={() => { setMenuOpen(false); navigate({ name: "settings" }); }}>Mon compte & paramètres</button>
            </div>
            <div className="dd-drawer-foot">
              <WhatsAppButton full label="Écrire sur WhatsApp" />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="dd-footer">
      <div className="dd-footer-top">
        <div className="dd-footer-brand">
          <div style={{ marginBottom: 18 }}>
            <Wordmark slotW={140} slotH={42} />
          </div>
          <p className="dd-footer-tag">
            Beauté & élégance,<br/>
            <em>directement de Dakar</em>.
          </p>
          <div className="dd-social">
            <a className="dd-social-btn" href="#" aria-label="WhatsApp"><IconWhatsApp size={16} /></a>
            <a className="dd-social-btn" href="#" aria-label="TikTok"><IconTikTok size={16} /></a>
            <a className="dd-social-btn" href="#" aria-label="Facebook"><IconFacebook size={16} /></a>
          </div>
        </div>

        <div className="dd-footer-cols">
          <div>
            <h4>Boutique</h4>
            <button onClick={() => navigate({ name: "univers", params: { u: "beaute" } })}>Beauté</button>
            <button onClick={() => navigate({ name: "univers", params: { u: "mode" } })}>Mode</button>
            <button onClick={() => navigate({ name: "univers", params: {} })}>Nouveautés</button>
            <button onClick={() => navigate({ name: "univers", params: {} })}>Édition limitée</button>
          </div>
          <div>
            <h4>Maison</h4>
            <button onClick={() => navigate({ name: "home" })}>Notre histoire</button>
            <button onClick={() => navigate({ name: "journal" })}>Journal</button>
            <button>Carrières</button>
            <button>Presse</button>
          </div>
          <div>
            <h4>Service</h4>
            <button onClick={() => navigate({ name: "contact" })}>Livraison</button>
            <button onClick={() => navigate({ name: "contact" })}>Commande WhatsApp</button>
            <button onClick={() => navigate({ name: "settings" })}>Mon compte</button>
            <button>Retours</button>
            <button>FAQ</button>
          </div>
          <div className="dd-footer-news">
            <h4>Lettre</h4>
            <p>Avant-premières, lancements et invitations privées.</p>
            <form className="dd-news" onSubmit={(e) => { e.preventDefault(); alert("Merci !"); }}>
              <input type="email" placeholder="votre@email.com" />
              <button type="submit" aria-label="S'inscrire"><IconArrow size={16} /></button>
            </form>
          </div>
        </div>
      </div>

      <div className="dd-footer-bot">
        <div className="dd-footer-mark">
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, letterSpacing: ".02em" }}>
            Maison fondée à Dakar — Liberté 6 Extension
          </span>
        </div>
        <div className="dd-footer-legal">
          <span>© 2026 DiDallah Shop</span>
          <span>·</span>
          <a href="#">Mentions légales</a>
          <span>·</span>
          <a href="#">CGV</a>
          <span>·</span>
          <a href="#">Confidentialité</a>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { TopBar, Footer });
