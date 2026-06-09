import { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const LOCAL_WISH_KEY = "flea-market-demo-wishes";
const SAMPLE_WISHES = [
  { id: "sample-1", nickname: "Mia", item_name: "Desk lamp", created_at: "2026-06-09T08:00:00.000Z" },
  { id: "sample-2", nickname: "Alex", item_name: "Scientific calculator", created_at: "2026-06-09T08:03:00.000Z" },
  { id: "sample-3", nickname: "Yuki", item_name: "Course textbooks", created_at: "2026-06-09T08:06:00.000Z" }
];

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
  return `${wish.nickname || "Anonymous"}: ${wish.item_name}`;
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
    const source = wishes.length > 0 ? wishes : SAMPLE_WISHES;
    return [...source].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [wishes]);

  const rows = useMemo(() => {
    const repeated = [...visibleWishes, ...visibleWishes, ...visibleWishes];
    return [
      repeated.filter((_, index) => index % 3 === 0),
      repeated.filter((_, index) => index % 3 === 1),
      repeated.filter((_, index) => index % 3 === 2)
    ];
  }, [visibleWishes]);

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
        setMessage("Wish wall is temporarily unavailable.");
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
      setMessage("Please enter what you want.");
      return;
    }

    const wish = {
      item_name: itemName,
      budget: "",
      description: "",
      nickname: form.nickname.trim() || "Anonymous",
      contact: form.contact.trim(),
      is_public: true
    };

    setStatus("submitting");
    setMessage("");

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("wishes").insert(wish);

      if (error) {
        setStatus("idle");
        setMessage("Submit failed. Please try again.");
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
    setMessage("Wish submitted.");
    setIsFormOpen(false);
  }

  return (
    <section className="screen wish-screen">
      <header className="wish-header">
        <div>
          <p className="kicker">Wish Wall</p>
          <h1>Make a wish</h1>
          <span>许愿墙</span>
        </div>
      </header>

      <div className="wish-flow" aria-label="Current wishes">
        {rows.map((row, rowIndex) => (
          <div className={`wish-row row-${rowIndex + 1}`} key={`row-${rowIndex + 1}`}>
            {row.map((wish, wishIndex) => (
              <span className="wish-chip" key={`${wish.id}-${wishIndex}`}>
                <span className="heart-dot" aria-hidden="true" />
                {displayWish(wish)}
              </span>
            ))}
          </div>
        ))}
      </div>

      <p className="wish-note">
        Public wall only shows name and item. Contact details are visible to the seller in Supabase.
      </p>

      <button className="wish-cta" type="button" onClick={() => setIsFormOpen(true)}>
        I want to wish
        <span>我要许愿</span>
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
            <h2>What are you looking for?</h2>

            <label>
              Name
              <input
                name="nickname"
                value={form.nickname}
                onChange={updateField}
                placeholder="Anonymous is OK"
                maxLength={40}
              />
            </label>
            <label>
              Item
              <input
                name="item_name"
                value={form.item_name}
                onChange={updateField}
                placeholder="Desk lamp, calculator, textbook..."
                maxLength={80}
                required
              />
            </label>
            <label>
              Contact
              <input
                name="contact"
                value={form.contact}
                onChange={updateField}
                placeholder="WeChat / email, optional"
                maxLength={80}
              />
            </label>

            <button className="primary-button full-width" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting..." : "Submit wish"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
