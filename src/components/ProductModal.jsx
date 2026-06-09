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
        <button className="icon-button modal-close" type="button" onClick={onClose}>
          ×
        </button>

        <img className="modal-image" src={product.images[0]} alt={product.name} />

        <div className="modal-content">
          <p className="product-category">{product.category}</p>
          <h2 id="product-modal-title">{product.name}</h2>
          <p className="modal-price">
            {product.priceLabel || `${product.price}${product.currency || "r"}`}
          </p>
          <p>{product.detail}</p>

          <dl className="detail-list">
            <div>
              <dt>成色</dt>
              <dd>{product.condition}</dd>
            </div>
            <div>
              <dt>规格</dt>
              <dd>{product.spec}</dd>
            </div>
            <div>
              <dt>备注</dt>
              <dd>{product.note}</dd>
            </div>
          </dl>

          <button
            className="primary-button full-width"
            type="button"
            disabled={!isAvailable || reachedLimit}
            onClick={() => onAdd(product.id)}
          >
            {isAvailable ? (reachedLimit ? "已加入清单" : "加入清单") : "已售出"}
          </button>
        </div>
      </section>
    </div>
  );
}
