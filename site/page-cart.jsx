// DiDallah Shop — Page Panier

function CartPage({ navigate }) {
  const cart = getCart();
  const total = getCartTotal();
  const content = getContent();
  const rawWhatsapp = (content && content.brand && content.brand.whatsapp) || "+221 76 305 05 05";
  const phone = rawWhatsapp.replace(/\D/g, "");

  const orderMessage = () => {
    const lines = cart
      .map((item) => {
        const product = productById(item.id);
        if (!product) return null;
        const size = item.size ? ` (${item.size})` : "";
        return `• ${item.quantity}× ${product.name}${size} — ${fmtPrice(product.price * item.quantity)}`;
      })
      .filter(Boolean);
    return `Bonjour DiDallah Shop, je souhaite commander :\n${lines.join("\n")}\n\nTotal : ${fmtPrice(total)}.`;
  };

  const checkoutHref = `https://wa.me/${phone}?text=${encodeURIComponent(orderMessage())}`;

  const updateQuantity = (id, size, newQty) => {
    if (newQty <= 0) {
      SITE_STORE.removeFromCart(id, size);
    } else {
      SITE_STORE.updateCartItem(id, size, { quantity: newQty });
    }
  };

  const removeItem = (id, size) => {
    SITE_STORE.removeFromCart(id, size);
  };

  if (cart.length === 0) {
    return (
      <main className="dd-page" style={{ padding: "120px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 40 }}>Votre panier est vide</h2>
        <PrimaryButton onClick={() => navigate({ name: "univers", params: {} })}>
          Continuer les achats
        </PrimaryButton>
      </main>
    );
  }

  return (
    <main className="dd-page dd-cart">
      <Eyebrow>Panier</Eyebrow>
      <h1 className="dd-section-title">Votre sélection</h1>

      <div className="dd-cart-items">
        {cart.map((item) => {
          const product = productById(item.id);
          if (!product) return null;
          return (
            <div key={`${item.id}-${item.size}`} className="dd-cart-item">
              <ImageFrame
                id={`cart-${item.id}`}
                ratio="1 / 1"
                placeholder={product.name}
                tone={product.univers === "beaute" ? "warm" : "deep"}
                src={`site/img/${item.id}.svg`}
              />
              <div className="dd-cart-info">
                <h3>{product.name}</h3>
                <p>{product.category}</p>
                {item.size && <p>Taille: {item.size}</p>}
                <div className="dd-cart-qty">
                  <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>+</button>
                </div>
                <p>{fmtPrice(product.price * item.quantity)}</p>
              </div>
              <button className="dd-cart-remove" onClick={() => removeItem(item.id, item.size)}>
                <IconClose size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="dd-cart-total">
        <h2>Total: {fmtPrice(total)}</h2>
        <a
          href={checkoutHref}
          target="_blank"
          rel="noopener noreferrer"
          className="dd-btn dd-btn-primary"
          data-dark="1"
          aria-label="Commander via WhatsApp"
        >
          <IconWhatsApp size={18} />
          <span>Commander via WhatsApp</span>
        </a>
      </div>
    </main>
  );
}