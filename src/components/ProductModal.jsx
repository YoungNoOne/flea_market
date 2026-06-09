import { useEffect } from "react";

function priceLabel(product) {
  return product.priceLabel || `${product.price}${product.currency || "r"}`;
}

export default function ProductModal({ product, onClose, onAdd, quantity }) {
  useEffect(() => {
    if (!product) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [product]);

  if (!product) return null;

  const isAvailable = product.status === "available" && product.stock > 0;
  const isContact = product.status === "contact";
  const reachedLimit = quantity >= product.stock;
  const actionLabel = isContact
    ? "请询问摊主"
    : isAvailable
      ? reachedLimit
        ? "已加入清单"
        : "加入清单"
      : "暂不可加购";

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
          <h2 id="product-modal-title">{product.displayName || product.name}</h2>
          {product.displayName && product.displayName !== product.name && (
            <span className="display-name">{product.name}</span>
          )}
          <p className="modal-price">{priceLabel(product)}</p>

          <button
            className="primary-button full-width"
            type="button"
            disabled={isContact || !isAvailable || reachedLimit}
            onClick={() => onAdd(product.id)}
          >
            {actionLabel}
          </button>

          {product.detail && <p>{product.detail}</p>}
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
        </div>
      </section>
    </div>
  );
}
