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
            <p className="eyebrow">现场确认清单</p>
            <h2 id="cart-title">已选商品</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <p className="empty-state">还没有选择商品。</p>
        ) : (
          <div className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.images[0]} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.priceLabel || `${item.price}${item.currency || "r"}`} / 件</p>
                  <div className="quantity-control" aria-label={`${item.name}数量`}>
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
                      删除
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
            <span>合计</span>
            <strong>{total}r</strong>
          </div>
          <p>请将此页面给摊主确认，现场使用微信、支付宝或现金付款。</p>
          <button className="primary-button full-width" type="button" onClick={onClose}>
            回到商品页
          </button>
          {items.length > 0 && (
            <button className="ghost-button full-width" type="button" onClick={onClear}>
              清空清单
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
