import { useEffect, useMemo, useState } from "react";
import CartDrawer from "./components/CartDrawer.jsx";
import ProductImage from "./components/ProductImage.jsx";
import ProductModal from "./components/ProductModal.jsx";
import WishWall from "./components/WishWall.jsx";
import products from "./data/products.json";

const CART_KEY = "flea-market-cart";
const TABS = [
  { id: "home", label: "首页", en: "Home" },
  { id: "products", label: "商品", en: "Products" },
  { id: "wishes", label: "许愿墙", en: "Wish Wall" }
];

function readStoredCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function priceLabel(product) {
  return product.priceLabel || `${product.price}${product.currency || "r"}`;
}

function formatPrice(value) {
  const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  return String(rounded);
}

function searchableText(product) {
  return [
    product.name,
    product.displayName,
    product.category,
    product.shortDesc,
    product.detail,
    product.condition,
    product.spec,
    product.note,
    product.priceLabel
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(readStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = useMemo(
    () => ["全部", ...Array.from(new Set(products.map((product) => product.category)))],
    []
  );

  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) => product.featured)
        .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999)),
    []
  );

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    const categoryProducts =
      activeCategory === "全部"
        ? products
        : products.filter((product) => product.category === activeCategory);

    if (!keyword) return categoryProducts;

    return categoryProducts.filter((product) => searchableText(product).includes(keyword));
  }, [activeCategory, searchQuery]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((groups, product) => {
      const groupName = product.category;
      return {
        ...groups,
        [groupName]: [...(groups[groupName] || []), product]
      };
    }, {});
  }, [filteredProducts]);

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
  const hasSearch = searchQuery.trim().length > 0;

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

  function showProducts(category = activeCategory) {
    setActiveCategory(category);
    setActiveTab("products");
  }

  return (
    <main className="phone-shell">
      {activeTab === "home" && (
        <section className="screen home-screen">
          <header className="screen-header">
            <div>
              <p className="kicker">Selected Products</p>
              <h1>精选商品</h1>
              <span>BUPT 跳蚤市场</span>
            </div>
            <button className="round-button" type="button" onClick={() => showProducts("全部")}>
              全部
            </button>
          </header>

          <div className="feature-rail" aria-label="Featured products">
            {featuredProducts.map((product) => (
              <button
                className="feature-card"
                type="button"
                key={product.id}
                onClick={() => setSelectedProduct(product)}
              >
                <ProductImage src={product.images[0]} alt={product.name} />
                <div>
                  <strong>{product.displayName || product.name}</strong>
                  <span>{product.shortDesc}</span>
                </div>
              </button>
            ))}
          </div>

          <button className="wide-promo" type="button" onClick={() => showProducts("数码配件")}>
            <span>校园精选</span>
            <strong>Digital picks</strong>
          </button>

          <section className="home-block">
            <div className="block-title">
              <p>Quick Browse</p>
              <h2>按分类浏览</h2>
            </div>
            <div className="category-pills">
              {categories.slice(1).map((category) => (
                <button type="button" key={category} onClick={() => showProducts(category)}>
                  {category}
                </button>
              ))}
            </div>
          </section>

          <section className="home-block">
            <div className="block-title">
              <p>How it works</p>
              <h2>现场确认付款</h2>
            </div>
            <div className="steps">
              <span>1. 先看商品详情</span>
              <span>2. 加入清单看总价</span>
              <span>3. 到摊位现场付款</span>
            </div>
          </section>
        </section>
      )}

      {activeTab === "products" && (
        <section className="screen product-screen">
          <header className="compact-header">
            <div>
              <p className="kicker">Products</p>
              <h1>商品列表</h1>
              <span>左侧分类，右侧加购</span>
            </div>
          </header>

          <div className="product-search">
            <label htmlFor="product-search">搜索商品</label>
            <div className="search-field">
              <input
                id="product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索商品、分类或描述"
              />
              {hasSearch && (
                <button type="button" onClick={() => setSearchQuery("")} aria-label="清除搜索">
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="product-layout">
            <aside className="side-categories" aria-label="Product categories">
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
            </aside>

            <section className="product-list" aria-label="Products">
              {filteredProducts.length === 0 && (
                <div className="empty-products">
                  <strong>没有找到相关商品</strong>
                  <span>{hasSearch ? `当前搜索：${searchQuery.trim()}` : "换个分类看看"}</span>
                  {hasSearch && (
                    <button type="button" onClick={() => setSearchQuery("")}>
                      清除搜索
                    </button>
                  )}
                </div>
              )}

              {filteredProducts.length > 0 &&
                Object.entries(groupedProducts).map(([groupName, groupProducts]) => (
                <div className="product-group" key={groupName}>
                  <h2>{groupName}</h2>
                  {groupProducts.map((product) => {
                    const quantity = cart[product.id] || 0;
                    const isAvailable = product.status === "available" && product.stock > 0;
                    const isContact = product.status === "contact";
                    const reachedLimit = quantity >= product.stock;

                    return (
                      <article className="menu-item" key={product.id}>
                        <button
                          className="menu-image"
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          aria-label={`View ${product.name}`}
                        >
                          <ProductImage src={product.images[0]} alt={product.name} />
                        </button>
                        <button
                          className="menu-info"
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <strong>{product.displayName || product.name}</strong>
                          <span>{product.shortDesc}</span>
                          <em>{priceLabel(product)}</em>
                        </button>
                        <button
                          className={`plus-button ${isContact ? "contact-button" : ""}`}
                          type="button"
                          disabled={!isAvailable || reachedLimit}
                          onClick={() => addToCart(product.id)}
                          aria-label={`Add ${product.name}`}
                        >
                          {isContact ? "问" : quantity > 0 ? quantity : "+"}
                        </button>
                      </article>
                    );
                  })}
                </div>
                ))}
            </section>
          </div>

          <button className="checkout-bar" type="button" onClick={() => setIsCartOpen(true)}>
            <span>{cartCount > 0 ? `${cartCount} 件商品` : "清单为空"}</span>
            <strong>{formatPrice(total)}r</strong>
            <em>确认</em>
          </button>
        </section>
      )}

      {activeTab === "wishes" && <WishWall />}

      <nav className="bottom-tabs" aria-label="Main navigation">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "active" : ""}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={`tab-icon ${tab.id}`} aria-hidden="true" />
            <strong>{tab.label}</strong>
            <small>{tab.en}</small>
          </button>
        ))}
      </nav>

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
