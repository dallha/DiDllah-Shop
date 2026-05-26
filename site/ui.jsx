// DiDallah Shop — atomes UI (icônes, logo, boutons, etc.)
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Icônes (1.5px stroke, style fin éditorial) ──────────────────────────
const Icon = ({ d, size = 18, fill = "none", stroke = "currentColor", style }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={fill}
    stroke={stroke}
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);

const IconSearch = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></>} />;
const IconHeart  = (p) => <Icon {...p} d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />;
const IconHeartFilled = (p) => <Icon {...p} fill="currentColor" stroke="currentColor" d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z" />;
const IconUser   = (p) => <Icon {...p} d={<><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></>} />;
const IconBag    = (p) => <Icon {...p} d={<><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/></>} />;
const IconMenu   = (p) => <Icon {...p} d={<><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>} />;
const IconClose  = (p) => <Icon {...p} d={<><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>} />;
const IconArrow  = (p) => <Icon {...p} d={<><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>} />;
const IconArrowLeft = (p) => <Icon {...p} d={<><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></>} />;
const IconPlus  = (p) => <Icon {...p} d={<><path d="M12 5v14"/><path d="M5 12h14"/></>} />;
const IconMinus = (p) => <Icon {...p} d="M5 12h14" />;
const IconChevron = (p) => <Icon {...p} d="m9 6 6 6-6 6" />;
const IconStar = (p) => <Icon {...p} fill="currentColor" stroke="none" d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3Z" />;
const IconCheck = (p) => <Icon {...p} d="m5 12 4 4 10-10" />;
const IconWhatsApp = (p) => (
  <Icon {...p} fill="currentColor" stroke="none"
    d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1l-.8 1c-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.4c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.6 7.6c-.2-.4-.3-.3-.5-.4h-.4c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3 0 1.4 1 2.7 1.2 2.9.1.2 2 3.1 4.8 4.3.7.3 1.2.4 1.6.5.7.2 1.3.2 1.8.1.6-.1 1.6-.7 1.9-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.5-.3Zm-5.4 7.4h0c-1.6 0-3.1-.4-4.5-1.2L4 21.6l1-3.6c-.9-1.5-1.4-3.2-1.4-5C3.6 8.3 7.5 4.5 12.1 4.5c2.3 0 4.4.9 6 2.5 1.6 1.6 2.5 3.7 2.5 6 0 4.6-3.8 8.4-8.5 8.4Zm7.2-15.6c-1.9-1.9-4.4-3-7.2-3-5.6 0-10.2 4.5-10.2 10.1 0 1.8.5 3.5 1.4 5L2 23l3.6-.9c1.4.8 3 1.2 4.5 1.2h0c5.6 0 10.2-4.5 10.2-10.1 0-2.7-1.1-5.2-3-7.1Z" />
);
const IconTikTok = (p) => (
  <Icon {...p} fill="currentColor" stroke="none"
    d="M16.5 4c.7 1.4 1.8 2.4 3.3 2.7v2.7c-1.2 0-2.4-.3-3.5-.9v6.3a5.8 5.8 0 1 1-5.8-5.8c.3 0 .5 0 .8.1v2.8a3 3 0 1 0 2.2 2.9V4h3Z" />
);
const IconFacebook = (p) => (
  <Icon {...p} fill="currentColor" stroke="none"
    d="M14 4.5h2.5V8H14c-.6 0-.8.4-.8 1v2h3.3L16 14.5h-2.8V21h-3.4v-6.5H7V11h2.8V8.6c0-2.4 1.4-4.1 4.2-4.1Z" />
);

// ── Brand wordmark (slot pour logo client + fallback typo) ─────────────
function Wordmark({ size = 22, color, slotW = 110, slotH = 32 }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
        color: color || "currentColor",
      }}
      aria-label="DiDallah Shop"
    >
      <image-slot
        id="brand-logo"
        placeholder="Logo DiDallah Shop"
        shape="rect"
        style={{
          width: slotW,
          height: slotH,
          display: "inline-block",
        }}
      ></image-slot>
    </div>
  );
}

// fallback wordmark text version
function WordmarkText({ size = 22, color }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: size,
        fontWeight: 500,
        letterSpacing: "0.04em",
        color: color || "currentColor",
        lineHeight: 1,
      }}
    >
      Di<span style={{ fontStyle: "italic" }}>D</span>allah
      <span style={{ opacity: 0.55, marginLeft: 6, letterSpacing: "0.12em", fontSize: "0.6em", fontFamily: "var(--font-sans)", fontStyle: "normal", textTransform: "uppercase", verticalAlign: "middle" }}>
        Shop
      </span>
    </span>
  );
}

// ── Boutons ─────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, icon, full, dark = true, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dd-btn dd-btn-primary"
      data-full={full ? "1" : undefined}
      data-dark={dark ? "1" : undefined}
      style={style}
    >
      <span>{children}</span>
      {icon}
    </button>
  );
}

function GhostButton({ children, onClick, icon, full, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dd-btn dd-btn-ghost"
      data-full={full ? "1" : undefined}
      style={style}
    >
      <span>{children}</span>
      {icon}
    </button>
  );
}

function WhatsAppButton({ product, full, label }) {
  // Récupère le numéro WhatsApp depuis le store (modifiable dans Paramètres → Marque & contact)
  const content = getContent();
  const rawNumber = (content && content.brand && content.brand.whatsapp) || "+221 76 305 05 05";
  const phone = rawNumber.replace(/\D/g, ""); // 221763050505

  const text = product
    ? `Bonjour DiDallah Shop, je suis intéressé(e) par : ${product.name} (${fmtPrice(product.price)}). Pouvez-vous confirmer la disponibilité ?`
    : `Bonjour DiDallah Shop, j'aimerais passer commande.`;

  const href = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="dd-btn dd-btn-whatsapp"
      data-full={full ? "1" : undefined}
      aria-label={
        product
          ? `Commander ${product.name} sur WhatsApp`
          : "Commander sur WhatsApp"
      }
    >
      <IconWhatsApp size={18} />
      <span>{label || "Commander sur WhatsApp"}</span>
    </a>
  );
}

// ── Eyebrow / Section label ─────────────────────────────────────────────
function Eyebrow({ children, num, style }) {
  return (
    <div className="dd-eyebrow" style={style}>
      {num != null && <span className="dd-eyebrow-num">{String(num).padStart(2, "0")}</span>}
      <span className="dd-eyebrow-line" />
      <span className="dd-eyebrow-text">{children}</span>
    </div>
  );
}

// ── Image slot wrapper with a tone hint ─────────────────────────────────
function ImageFrame({ id, ratio = "3 / 4", placeholder = "Photo", className, style, children, tone = "warm", src }) {
  return (
    <div
      className={"dd-img-frame " + (className || "")}
      data-tone={tone}
      style={{ aspectRatio: ratio, ...(style || {}) }}
    >
      <image-slot id={id} placeholder={placeholder} shape="rect" {...(src ? { src } : {})}></image-slot>
      {children}
    </div>
  );
}

// ── Wishlist (heart) — local state utility ──────────────────────────────
function useWishlist() {
  const [w, setW] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("dd:wishlist") || "[]")); }
    catch { return new Set(); }
  });
  const toggle = useCallback((id) => {
    setW((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem("dd:wishlist", JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);
  return [w, toggle];
}

Object.assign(window, {
  Icon, IconSearch, IconHeart, IconHeartFilled, IconUser, IconBag, IconMenu,
  IconClose, IconArrow, IconArrowLeft, IconPlus, IconMinus, IconChevron,
  IconStar, IconCheck, IconWhatsApp, IconTikTok, IconFacebook,
  Wordmark, WordmarkText, PrimaryButton, GhostButton, WhatsAppButton,
  Eyebrow, ImageFrame, useWishlist,
});
