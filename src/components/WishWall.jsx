import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const LOCAL_WISH_KEY = "flea-market-demo-wishes";
const WISH_LANES = 6;

function loadLocalWishes() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_WISH_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalWishes(wishes) {
  localStorage.setItem(LOCAL_WISH_KEY, JSON.stringify(wishes));
}

function displayWish(wish) {
  return `${wish.nickname || "匿名"}: ${wish.item_name}`;
}

export default function WishWall() {
  const [wishes, setWishes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    item_name: "",
    nickname: "",
    contact: ""
  });

  const visibleWishes = useMemo(() => {
    return [...wishes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [wishes]);

  const animationDuration = Math.max(24, visibleWishes.length * 4);

  useEffect(() => {
    if (!isFormOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFormOpen]);

  useEffect(() => {
    async function fetchWishes() {
      if (!isSupabaseConfigured) {
        setWishes(loadLocalWishes());
        return;
      }

      const { data, error } = await supabase
        .from("public_wishes")
        .select("id,item_name,nickname,created_at")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage("许愿墙暂时读取失败，请稍后再试。");
        return;
      }

      setWishes(data || []);
    }

    fetchWishes();
  }, []);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function submitWish(event) {
    event.preventDefault();
    const itemName = form.item_name.trim();

    if (!itemName) {
      setMessage("请填写想要的物品。");
      return;
    }

    const wish = {
      item_name: itemName,
      budget: "",
      description: "",
      nickname: form.nickname.trim() || "匿名",
      contact: form.contact.trim(),
      is_public: true
    };

    setStatus("submitting");
    setMessage("");

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("wishes").insert(wish);

      if (error) {
        setStatus("idle");
        setMessage("提交失败，请稍后再试。");
        return;
      }

      const { data: latestWishes, error: fetchError } = await supabase
        .from("public_wishes")
        .select("id,item_name,nickname,created_at")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setWishes((current) => [
          {
            ...wish,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
          },
          ...current
        ]);
      } else {
        setWishes(latestWishes || []);
      }
    } else {
      const localWish = {
        ...wish,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      const nextWishes = [localWish, ...loadLocalWishes()];
      saveLocalWishes(nextWishes);
      setWishes(nextWishes);
    }

    setForm({
      item_name: "",
      nickname: "",
      contact: ""
    });
    setStatus("idle");
    setMessage("许愿已提交。");
    setIsFormOpen(false);
  }

  return (
    <section className="screen wish-screen">
      <header className="wish-header">
        <div>
          <p className="kicker">Wish Wall</p>
          <h1>许愿墙</h1>
          <span>Make a wish</span>
        </div>
      </header>

      <div className="wish-flow" aria-label="Current wishes">
        {visibleWishes.length === 0 ? (
          <p className="wish-empty">还没有许愿内容，写下第一个想要的东西吧。</p>
        ) : (
          visibleWishes.map((wish, index) => (
            <span
              className="wish-chip"
              key={wish.id}
              style={{
                "--lane": index % WISH_LANES,
                "--delay": `${-(index * (animationDuration / Math.max(visibleWishes.length, 1)) + 2)}s`,
                "--duration": `${animationDuration}s`
              }}
            >
              <span className="heart-dot" aria-hidden="true" />
              {displayWish(wish)}
            </span>
          ))
        )}
      </div>

      <p className="wish-note">
        页面只展示“姓名: 物品”。联系方式只会在后台给摊主查看，不会公开显示。
      </p>

      <button className="wish-cta" type="button" onClick={() => setIsFormOpen(true)}>
        我要许愿
        <span>Make a wish</span>
      </button>

      {message && <p className="inline-message">{message}</p>}

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsFormOpen(false)}>
          <form
            className="wish-modal"
            aria-label="Submit a wish"
            onSubmit={submitWish}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              type="button"
              onClick={() => setIsFormOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <p className="kicker">New Wish</p>
            <h2>想要什么？</h2>

            <label>
              昵称
              <input
                name="nickname"
                value={form.nickname}
                onChange={updateField}
                placeholder="可匿名"
                maxLength={40}
              />
            </label>
            <label>
              想要的物品
              <input
                name="item_name"
                value={form.item_name}
                onChange={updateField}
                placeholder="台灯、计算器、教材..."
                maxLength={80}
                required
              />
            </label>
            <label>
              联系方式
              <input
                name="contact"
                value={form.contact}
                onChange={updateField}
                placeholder="微信 / 邮箱，可选"
                maxLength={80}
              />
            </label>

            <button className="primary-button full-width" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "提交中..." : "提交许愿"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
