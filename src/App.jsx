import { useEffect, useMemo, useState } from "react";
import CartDrawer from "./components/CartDrawer.jsx";
import ProductCard from "./components/ProductCard.jsx";
import ProductModal from "./components/ProductModal.jsx";
import WishWall from "./components/WishWall.jsx";
import products from "./data/products.json";

const CART_KEY = "flea-market-cart";

function readStoredCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(readStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(products.map((product) => product.category)))],
    []
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === "全部") return products;
    return products.filter((product) => product.category === activeCategory);
  }, [activeCategory]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = products.find((item) => item.id === id);
          return product ? { ...product, quantity } : null;
        })
        .filter(Boolean),
    [cart]
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product || product.status !== "available" || product.stock <= 0) return;

    setCart((current) => {
      const currentQuantity = current[productId] || 0;
      const nextQuantity = Math.min(currentQuantity + 1, product.stock);
      return {
        ...current,
        [productId]: nextQuantity
      };
    });
  }

  function decreaseItem(productId) {
    setCart((current) => {
      const currentQuantity = current[productId] || 0;
      if (currentQuantity <= 1) {
        const next = { ...current };
        delete next[productId];
        return next;
      }

      return {
        ...current,
        [productId]: currentQuantity - 1
      };
    });
  }

  function removeItem(productId) {
    setCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <a className="brand" href="#shop" aria-label="回到商品区">
          Flea Market
        </a>
        <nav>
          <a href="#shop">商品</a>
          <a href="#wishes">许愿墙</a>
        </nav>
      </header>

      <section className="hero" id="shop">
        <div className="hero-copy">
          <p className="eyebrow">Queen Mary 校园跳蚤市场</p>
          <h1>
            <span>扫码看货</span>
            <span>现场确认</span>
          </h1>
          <p>
            浏览摊位商品、加入清单并查看总金额。付款不在网页内完成，请现场和摊主确认。
          </p>
          <button className="primary-button" type="button" onClick={() => setIsCartOpen(true)}>
            查看清单 {total}r
          </button>
        </div>
        <div className="hero-product" aria-label="今日示例商品">
          <img src="/products/logitech-k380.jpg" alt="罗技 K380 蓝牙键盘" />
          <div>
            <span>今日商品</span>
            <strong>罗技 K380</strong>
            <p>70r</p>
          </div>
        </div>
      </section>

      <section className="shop-section">
        <div className="section-heading">
          <p className="eyebrow">Products</p>
          <h2>商品列表</h2>
          <p>点击图片查看详情，加入清单后底部会自动计算总金额。</p>
        </div>

        <div className="category-tabs" role="tablist" aria-label="商品分类">
          {categories.map((category) => (
            <button
              key={category}
              className={category === activeCategory ? "active" : ""}
              type="button"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={cart[product.id] || 0}
              onAdd={addToCart}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      </section>

      <WishWall />

      <button className="cart-bar" type="button" onClick={() => setIsCartOpen(true)}>
        <span>{cartCount > 0 ? `${cartCount} 件商品` : "清单为空"}</span>
        <strong>合计 {total}r</strong>
      </button>

      <ProductModal
        product={selectedProduct}
        quantity={selectedProduct ? cart[selectedProduct.id] || 0 : 0}
        onClose={() => setSelectedProduct(null)}
        onAdd={addToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        total={total}
        onClose={() => setIsCartOpen(false)}
        onIncrease={addToCart}
        onDecrease={decreaseItem}
        onRemove={removeItem}
        onClear={() => setCart({})}
      />
    </main>
  );
}
