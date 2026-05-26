// DiDallah Shop — Store global (produits, catégories, contenu)
// Persisté en localStorage, abonnement React via useSiteVersion.

const SITE_STORE = (() => {
  const KEY = "dd:site-store:v1";

  const defaults = () => ({
    products: JSON.parse(JSON.stringify(window.DEFAULT_PRODUCTS || [])),
    categories: JSON.parse(JSON.stringify(window.DEFAULT_CATEGORIES || {})),
    content: JSON.parse(JSON.stringify(window.DEFAULT_CONTENT || {})),
    cart: [],
  });

  // Merge profond avec les défauts pour ramasser tout nouveau champ ajouté
  // au modèle entre deux versions sans perdre les édits utilisateur.
  function mergeContent(saved, def) {
    if (!saved || typeof saved !== "object") return def;
    const out = { ...def, ...saved };
    for (const k of ["hero", "founder", "brand"]) {
      if (def[k]) out[k] = { ...def[k], ...(saved[k] || {}) };
    }
    out.marquee = Array.isArray(saved.marquee) ? saved.marquee : def.marquee;
    return out;
  }

  let state = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.products) {
      const d = defaults();
      state = {
        products: Array.isArray(saved.products) ? saved.products : d.products,
        categories: saved.categories && typeof saved.categories === "object"
          ? { ...d.categories, ...saved.categories }
          : d.categories,
        content: mergeContent(saved.content, d.content),
        cart: Array.isArray(saved.cart) ? saved.cart : d.cart,
      };
    }
  } catch {}

  const subs = new Set();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  };
  const notify = () => subs.forEach((fn) => fn(state));

  return {
    get() { return state; },
    set(updater) {
      state = typeof updater === "function" ? updater(state) : { ...state, ...updater };
      save();
      notify();
    },
    // Patch une clé de premier niveau (products | categories | content) avec
    // soit un objet partiel (merge superficiel) soit une fn (state → newState).
    update(key, value) {
      const next = typeof value === "function" ? value(state[key]) : value;
      state = { ...state, [key]: next };
      save();
      notify();
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    reset() { state = defaults(); save(); notify(); },
    resetKey(key) {
      const d = defaults();
      state = { ...state, [key]: d[key] };
      save();
      notify();
    },
    // Cart functions
    addToCart(item) {
      const existing = state.cart.find((c) => c.id === item.id && c.size === item.size);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.cart.push(item);
      }
      save();
      notify();
    },
    removeFromCart(id, size) {
      state.cart = state.cart.filter((c) => !(c.id === id && c.size === size));
      save();
      notify();
    },
    updateCartItem(id, size, updates) {
      const item = state.cart.find((c) => c.id === id && c.size === size);
      if (item) {
        Object.assign(item, updates);
        save();
        notify();
      }
    },
    clearCart() {
      state.cart = [];
      save();
      notify();
    },
  };
})();

// Hook : force un re-render à chaque mutation du store.
function useSiteVersion() {
  const [, setV] = React.useState(0);
  React.useEffect(() => SITE_STORE.subscribe(() => setV((x) => x + 1)), []);
}

function useSiteStore() {
  useSiteVersion();
  return SITE_STORE.get();
}

// Helpers — toujours lus à l'instant T pour rester live.
const productsByUnivers = (u) =>
  SITE_STORE.get().products.filter((p) => p.univers === u);
const productById = (id) =>
  SITE_STORE.get().products.find((p) => p.id === id);
const getContent = () => SITE_STORE.get().content;
const getCategories = () => SITE_STORE.get().categories;
const getCart = () => SITE_STORE.get().cart;
const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const product = productById(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
};

// Rétro-compat : window.PRODUCTS / window.CATEGORIES sont remplacés par des
// getters qui retournent toujours l'état frais du store.
Object.defineProperty(window, "PRODUCTS", {
  configurable: true,
  get() { return SITE_STORE.get().products; },
});
Object.defineProperty(window, "CATEGORIES", {
  configurable: true,
  get() { return SITE_STORE.get().categories; },
});

Object.assign(window, {
  SITE_STORE, useSiteVersion, useSiteStore,
  productsByUnivers, productById, getContent, getCategories,
  getCart, getCartTotal,
});
