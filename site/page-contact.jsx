// DiDallah Shop — Page Contact & Livraison

function ContactPage({ navigate }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Question produit", message: "" });
  const [sent, setSent] = useState(false);

  const content = getContent();
  const rawWhatsapp = (content && content.brand && content.brand.whatsapp) || "+221 76 305 05 05";
  const whatsappLink = `https://wa.me/${rawWhatsapp.replace(/\D/g, "")}`;
  const rawTikTok = (content && content.brand && content.brand.tiktok) || "@didallah.shop";
  const rawFacebook = (content && content.brand && content.brand.facebook) || "fb.com/didallah.shop";
  const tiktokLink = `https://www.tiktok.com/${rawTikTok.replace(/^@/, "")}`;
  const facebookLink = rawFacebook.startsWith("http") ? rawFacebook : `https://${rawFacebook}`;

  return (
    <main className="dd-page dd-contact">
      <section className="dd-contact-hero">
        <div className="dd-contact-hero-text">
          <Eyebrow num={1}>Une expérience 100 % digitale</Eyebrow>
          <h1 className="dd-contact-title">
            Commandez<br/>
            <em>où que vous soyez,</em><br/>
            quand vous voulez.
          </h1>
          <p className="dd-contact-lede">
            Pas de boutique physique — uniquement le meilleur de Dakar, à portée de message.
            Nous échangeons par WhatsApp, TikTok et Facebook, puis livrons à votre porte.
          </p>
          <div className="dd-contact-hero-cta">
            <WhatsAppButton label="Écrire sur WhatsApp" />
            <GhostButton>Voir la FAQ</GhostButton>
          </div>
        </div>
        <div className="dd-contact-hero-img">
          <ImageFrame
            id="contact-hero"
            ratio="3 / 4"
            placeholder="Photo équipe ou packaging soigné"
            tone="warm"
            src="site/img/contact-hero.svg"
          />
          <div className="dd-stamp-card">
            <span className="dd-stamp-num">N° 04</span>
            <span className="dd-stamp-title">Service client<br/>signature</span>
          </div>
        </div>
      </section>

      {/* Canaux */}
      <section className="dd-channels">
        <header className="dd-section-head">
          <div>
            <Eyebrow num={2}>Nos canaux</Eyebrow>
            <h2 className="dd-section-title">
              Choisissez votre <em>conversation</em>.
            </h2>
          </div>
        </header>
        <div className="dd-channels-grid">
          <article className="dd-channel dd-channel-wa">
            <div className="dd-channel-head">
              <IconWhatsApp size={22} />
              <span>Le plus rapide</span>
            </div>
            <h3>WhatsApp Business</h3>
            <p>Conseil, devis, confection sur mesure et passage de commande. Réponse en moins d'une heure (9h–20h).</p>
            <a className="dd-channel-cta" href={whatsappLink} target="_blank" rel="noreferrer">
              {rawWhatsapp} <IconArrow size={14} />
            </a>
          </article>
          <article className="dd-channel">
            <div className="dd-channel-head">
              <IconTikTok size={22} />
              <span>Nouveautés & try-on</span>
            </div>
            <h3>TikTok</h3>
            <p>Lancements, coulisses des ateliers et collaborations influenceurs. <em>{rawTikTok}</em></p>
            <a className="dd-channel-cta" href={tiktokLink} target="_blank" rel="noreferrer">
              Voir nos vidéos <IconArrow size={14} />
            </a>
          </article>
          <article className="dd-channel">
            <div className="dd-channel-head">
              <IconFacebook size={22} />
              <span>Communauté</span>
            </div>
            <h3>Facebook</h3>
            <p>Toutes les collections, les avis clients et nos événements ponctuels. <em>{rawFacebook}</em></p>
            <a className="dd-channel-cta" href={facebookLink} target="_blank" rel="noreferrer">
              Rejoindre la page <IconArrow size={14} />
            </a>
          </article>
        </div>
      </section>

      {/* Influenceurs */}
      <section className="dd-collab">
        <div className="dd-collab-img">
          <ImageFrame
            id="collab-photo"
            ratio="4 / 5"
            placeholder="Photo collaboration influenceuse"
            tone="deep"
            src="site/img/collab-photo.svg"
          />
        </div>
        <div className="dd-collab-text">
          <Eyebrow num={3}>Programme Ambassadrices</Eyebrow>
          <h2 className="dd-section-title">
            Vous créez<br/>
            <em>du contenu mode ou beauté ?</em>
          </h2>
          <p>
            DiDallah collabore avec des voix sénégalaises pour présenter ses nouveautés
            et renforcer la visibilité de la maison en ligne. Envoyez-nous votre kit média —
            nous étudions chaque dossier avec attention.
          </p>
          <ul className="dd-collab-list">
            <li><span>01</span> Produits offerts à tester avant lancement</li>
            <li><span>02</span> Code promotionnel personnalisé pour votre audience</li>
            <li><span>03</span> Commission sur chaque vente attribuée</li>
          </ul>
          <PrimaryButton icon={<IconArrow size={16} />}>Postuler comme ambassadrice</PrimaryButton>
        </div>
      </section>

      {/* Livraison */}
      <section className="dd-shipping">
        <header className="dd-section-head">
          <div>
            <Eyebrow num={4}>Livraison & suivi</Eyebrow>
            <h2 className="dd-section-title">
              Une logistique <em>structurée,</em><br/>
              pensée pour vous.
            </h2>
          </div>
          <div className="dd-section-aside">
            <p>
              Notre suivi des stocks et des commandes nous permet d'éviter les ruptures,
              d'organiser des livraisons fiables, et de tenir nos clients informés à chaque étape.
            </p>
          </div>
        </header>

        <div className="dd-ship-grid">
          {[
            { n: "01", z: "Dakar & banlieue", d: "24 – 48 h", p: "2 000 F · gratuit dès 35 000 F" },
            { n: "02", z: "Régions du Sénégal", d: "3 – 5 jours", p: "À partir de 4 500 F" },
            { n: "03", z: "Afrique de l'Ouest", d: "5 – 9 jours", p: "Devis WhatsApp" },
            { n: "04", z: "Diaspora (UE / US)", d: "7 – 14 jours", p: "Devis WhatsApp" },
          ].map((s) => (
            <article key={s.n} className="dd-ship-card">
              <span className="dd-ship-num">{s.n}</span>
              <h3>{s.z}</h3>
              <div className="dd-ship-row">
                <span>Délai</span>
                <span><em>{s.d}</em></span>
              </div>
              <div className="dd-ship-row">
                <span>Tarif</span>
                <span><em>{s.p}</em></span>
              </div>
            </article>
          ))}
        </div>

        <div className="dd-ship-timeline">
          <h3>Le parcours de votre commande</h3>
          <ol>
            <li>
              <span className="dd-tl-num">01</span>
              <strong>Conversation</strong>
              <span>Échange WhatsApp · confirmation du produit, taille, adresse.</span>
            </li>
            <li>
              <span className="dd-tl-num">02</span>
              <strong>Préparation</strong>
              <span>Préparation soignée, packaging signature, contrôle qualité.</span>
            </li>
            <li>
              <span className="dd-tl-num">03</span>
              <strong>Envoi</strong>
              <span>Mise en livreur dédié — vous recevez un lien de suivi.</span>
            </li>
            <li>
              <span className="dd-tl-num">04</span>
              <strong>Livraison</strong>
              <span>Remise en main propre. Paiement à la livraison disponible à Dakar.</span>
            </li>
          </ol>
        </div>
      </section>

      {/* Formulaire */}
      <section className="dd-form-section">
        <header className="dd-section-head">
          <div>
            <Eyebrow num={5}>Écrivez-nous</Eyebrow>
            <h2 className="dd-section-title">
              Une question, <em>une commande ?</em>
            </h2>
          </div>
          <div className="dd-section-aside">
            <p>
              Préférez le formulaire ? Aucun souci.
              Notre équipe vous répond sous 24 h ouvrées, par e-mail ou WhatsApp.
            </p>
            <div className="dd-contact-info">
              <div>
                <span className="dd-ci-k">Siège</span>
                <span className="dd-ci-v">Liberté 6 Extension, Dakar — Sénégal</span>
              </div>
              <div>
                <span className="dd-ci-k">Horaires</span>
                <span className="dd-ci-v">Lun – Sam · 9 h – 20 h</span>
              </div>
              <div>
                <span className="dd-ci-k">Email</span>
                <span className="dd-ci-v">bonjour@didallah.sn</span>
              </div>
            </div>
          </div>
        </header>

        <form
          className="dd-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            setTimeout(() => setSent(false), 5000);
            setForm({ name: "", email: "", phone: "", subject: "Question produit", message: "" });
          }}
        >
          <div className="dd-form-row">
            <label>
              <span>Nom complet</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Madina Ba" />
            </label>
            <label>
              <span>Email</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" />
            </label>
          </div>
          <div className="dd-form-row">
            <label>
              <span>WhatsApp</span>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 …" />
            </label>
            <label>
              <span>Sujet</span>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option>Question produit</option>
                <option>Commande sur mesure</option>
                <option>Livraison diaspora</option>
                <option>Collaboration influenceuse</option>
                <option>Autre</option>
              </select>
            </label>
          </div>
          <label className="dd-form-block">
            <span>Message</span>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Dites-nous tout — produits, tailles, dates, livraison…"
            />
          </label>
          <div className="dd-form-foot">
            <span className="dd-form-meta">
              Nous ne partageons jamais vos coordonnées.
            </span>
            <PrimaryButton icon={<IconArrow size={16} />}>
              {sent ? "Message envoyé ✓" : "Envoyer le message"}
            </PrimaryButton>
          </div>
          {sent && (
            <div className="dd-form-toast">
              <IconCheck size={14} /> Merci ! Nous revenons vers vous sous 24 h.
            </div>
          )}
        </form>
      </section>
    </main>
  );
}

Object.assign(window, { ContactPage });
