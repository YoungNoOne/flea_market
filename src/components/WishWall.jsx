import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const LOCAL_WISH_KEY = "flea-market-demo-wishes";

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

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function WishWall() {
  const [wishes, setWishes] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    item_name: "",
    budget: "",
    description: "",
    nickname: "",
    contact: ""
  });

  const sortedWishes = useMemo(
    () =>
      [...wishes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [wishes]
  );

  useEffect(() => {
    async function fetchWishes() {
      if (!isSupabaseConfigured) {
        setWishes(loadLocalWishes());
        return;
      }

      const { data, error } = await supabase
        .from("public_wishes")
        .select("id,item_name,budget,description,nickname,is_public,created_at")
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
      setMessage("请先填写想要的商品。");
      return;
    }

    const wish = {
      item_name: itemName,
      budget: form.budget.trim(),
      description: form.description.trim(),
      nickname: form.nickname.trim() || "匿名同学",
      contact: form.contact.trim(),
      is_public: true
    };

    setStatus("submitting");
    setMessage("");

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("wishes")
        .insert(wish);

      if (error) {
        setStatus("idle");
        setMessage("提交失败，请检查网络后再试。");
        return;
      }

      const { data: latestWishes, error: fetchError } = await supabase
        .from("public_wishes")
        .select("id,item_name,budget,description,nickname,is_public,created_at")
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
      budget: "",
      description: "",
      nickname: "",
      contact: ""
    });
    setStatus("idle");
    setMessage("已提交到许愿墙。");
  }

  return (
    <section className="wish-section" id="wishes">
      <div className="section-heading">
        <p className="eyebrow">Wish Wall</p>
        <h2>许愿墙</h2>
        <p>没有看到想要的东西，可以直接告诉摊主。联系方式只给摊主后台查看。</p>
      </div>

      <form className="wish-form" onSubmit={submitWish}>
        <label>
          想要什么
          <input
            name="item_name"
            value={form.item_name}
            onChange={updateField}
            placeholder="例如：计算器、台灯、教材"
            maxLength={80}
            required
          />
        </label>
        <label>
          预算
          <input
            name="budget"
            value={form.budget}
            onChange={updateField}
            placeholder="例如：10r-20r"
            maxLength={40}
          />
        </label>
        <label className="full-field">
          详细说明
          <textarea
            name="description"
            value={form.description}
            onChange={updateField}
            placeholder="品牌、型号、课程名、可接受成色等"
            rows="3"
            maxLength={240}
          />
        </label>
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
          联系方式
          <input
            name="contact"
            value={form.contact}
            onChange={updateField}
            placeholder="微信/邮箱，可选"
            maxLength={80}
          />
        </label>
        <button className="primary-button full-field" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "提交中..." : "提交许愿"}
        </button>
        {message && <p className="form-message full-field">{message}</p>}
      </form>

      <div className="wish-list" aria-live="polite">
        {sortedWishes.length === 0 ? (
          <p className="empty-state">还没有公开许愿内容。</p>
        ) : (
          sortedWishes.map((wish) => (
            <article className="wish-item" key={wish.id}>
              <div>
                <h3>{wish.item_name}</h3>
                <p>{wish.description || "暂未补充详细说明。"}</p>
              </div>
              <div className="wish-meta">
                <span>{wish.budget || "预算待定"}</span>
                <span>{wish.nickname || "匿名同学"}</span>
                <span>{formatDate(wish.created_at)}</span>
              </div>
            </article>
          ))
        )}
      </div>

      {!isSupabaseConfigured && (
        <p className="config-note">
          当前为本地演示模式。部署时配置 Supabase 环境变量后，许愿内容会写入后台数据库。
        </p>
      )}
    </section>
  );
}
