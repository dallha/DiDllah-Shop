// DiDallah Shop — Product cards & grid

function ProductCard({ product, onOpen, wishlist, toggleWishlist, variant = "default", index = 0 }) {
  const liked = wishlist.has(product.id);
  const tone = product.univers === "beaute" ? "warm" : "deep";

  // variant: 'default' | 'editorial' | 'minimal'
  if (variant === "editorial") {
    return (
      <article className="dd-card dd-card-editorial" onClick={() => onOpen(product)}>
        <div className="dd-card-imgwrap">
          <ImageFrame
            id={"prod-" + product.id}
            ratio="4 / 5"
            placeholder={product.name}
            tone={tone}
            src={"site/img/" + product.id + ".svg"}
          />
          {product.tag && <span className="dd-tag">{product.tag}</span>}
          <button
            className="dd-card-heart"
            aria-label="Ajouter aux favoris"
            data-on={liked ? "1" : undefined}
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          >
            {liked ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
          </button>
        </div>
        <div className="dd-card-body">
          <div className="dd-card-meta">
            <span className="dd-card-num">{String(index + 1).padStart(2, "0")}</span>
            <span className="dd-card-cat">{product.category}</span>
          </div>
          <h3 className="dd-card-title">{product.name}</h3>
          <div className="dd-card-foot">
            <span className="dd-card-price">{fmtPrice(product.price)}</span>
            <span className="dd-card-cta">
              Découvrir <IconArrow size={14} />
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "minimal") {
    return (
      <article className="dd-card dd-card-minimal" onClick={() => onOpen(product)}>
        <div className="dd-card-imgwrap">
          <ImageFrame
            id={"prod-" + product.id}
            ratio="1 / 1"
            placeholder={product.name}
            tone={tone}
            src={"site/img/" + product.id + ".svg"}
          />
          <button
            className="dd-card-heart"
            aria-label="Ajouter aux favoris"
            data-on={liked ? "1" : undefined}
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          >
            {liked ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
          </button>
        </div>
        <div className="dd-card-body">
          <h3 className="dd-card-title">{product.name}</h3>
          <div className="dd-card-foot">
            <span className="dd-card-price">{fmtPrice(product.price)}</span>
            {product.tag && <span className="dd-card-tag-inline">{product.tag}</span>}
          </div>
        </div>
      </article>
    );
  }

  // default
  return (
    <article className="dd-card dd-card-default" onClick={() => onOpen(product)}>
      <div className="dd-card-imgwrap">
        <ImageFrame
          id={"prod-" + product.id}
          ratio="3 / 4"
          placeholder={product.name}
          tone={tone}
          src={"site/img/" + product.id + ".svg"}
        />
        {product.tag && <span className="dd-tag">{product.tag}</span>}
        <button
          className="dd-card-heart"
          aria-label="Ajouter aux favoris"
          data-on={liked ? "1" : undefined}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        >
          {liked ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
        </button>
        <div className="dd-card-quick">
          <span>Voir le produit <IconArrow size={14} /></span>
        </div>
      </div>
      <div className="dd-card-body">
        <div className="dd-card-cat">{product.category}</div>
        <h3 className="dd-card-title">{product.name}</h3>
        <div className="dd-card-foot">
          <span className="dd-card-price">{fmtPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
}

Object.assign(window, { ProductCard });
