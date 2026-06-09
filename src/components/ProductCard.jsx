export default function ProductCard({ product, quantity, onAdd, onSelect }) {
  const isAvailable = product.status === "available" && product.stock > 0;
  const reachedLimit = quantity >= product.stock;

  return (
    <article className="product-card">
      <button
        className="product-image-button"
        type="button"
        onClick={() => onSelect(product)}
        aria-label={`查看${product.name}详情`}
      >
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {!isAvailable && <span className="sold-badge">已售出</span>}
      </button>

      <div className="product-content">
        <div>
          <p className="product-category">{product.category}</p>
          <h3>{product.name}</h3>
          <p className="product-description">{product.shortDesc}</p>
        </div>

        <div className="product-row">
          <strong>{product.priceLabel || `${product.price}${product.currency || "r"}`}</strong>
          <button
            className="add-button"
            type="button"
            disabled={!isAvailable || reachedLimit}
            onClick={() => onAdd(product.id)}
          >
            {quantity > 0 ? `已选 ${quantity}` : "加入清单"}
          </button>
        </div>
      </div>
    </article>
  );
}
