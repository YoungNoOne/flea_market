function priceLabel(item) {
  return item.priceLabel || `${item.price}${item.currency || "r"}`;
}

export default function CartDrawer({
  isOpen,
  items,
  total,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onClear
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop cart-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <p className="kicker">On-site checkout</p>
            <h2 id="cart-title">Confirm Cart</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="empty-state">Cart is empty.</p>
        ) : (
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.images[0]} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{priceLabel(item)} / item</p>
                  <div className="quantity-control" aria-label={`${item.name} quantity`}>
                    <button type="button" onClick={() => onDecrease(item.id)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.stock}
                      onClick={() => onIncrease(item.id)}
                    >
                      +
                    </button>
                    <button className="text-button" type="button" onClick={() => onRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <strong>{item.price * item.quantity}r</strong>
              </article>
            ))}
          </div>
        )}

        <div className="cart-summary">
          <div>
            <span>Total</span>
            <strong>{total}r</strong>
          </div>
          <p>Show this page to the seller. Payment is confirmed on site by WeChat, Alipay or cash.</p>
          <button className="primary-button full-width" type="button" onClick={onClose}>
            Back to products
          </button>
          {items.length > 0 && (
            <button className="ghost-button full-width" type="button" onClick={onClear}>
              Clear cart
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
