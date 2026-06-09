function priceLabel(product) {
  return product.priceLabel || `${product.price}${product.currency || "r"}`;
}

export default function ProductModal({ product, onClose, onAdd, quantity }) {
  if (!product) return null;

  const isAvailable = product.status === "available" && product.stock > 0;
  const reachedLimit = quantity >= product.stock;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Close">
          ×
        </button>

        <img className="modal-image" src={product.images[0]} alt={product.name} />

        <div className="modal-content">
          <p className="kicker">{product.category}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          {product.displayName && <span className="display-name">{product.displayName}</span>}
          <p className="modal-price">{priceLabel(product)}</p>

          <button
            className="primary-button full-width"
            type="button"
            disabled={!isAvailable || reachedLimit}
            onClick={() => onAdd(product.id)}
          >
            {isAvailable ? (reachedLimit ? "Added to cart" : "Add to cart") : "Sold out"}
          </button>

          <p>{product.detail}</p>
          <dl className="detail-list">
            <div>
              <dt>Condition</dt>
              <dd>{product.condition}</dd>
            </div>
            <div>
              <dt>Spec</dt>
              <dd>{product.spec}</dd>
            </div>
            <div>
              <dt>Note</dt>
              <dd>{product.note}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
