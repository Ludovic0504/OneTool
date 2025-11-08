// src/pages/Lab.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";

/* ------------------ Statuts & styles ------------------ */
const STATUS = {
  ready: { badge: "Disponible", kind: "new", cta: "Ouvrir", disabled: false },
  improve: { badge: "Amélioration", kind: "new", cta: "Ouvrir", disabled: false },
  progress: { badge: "En cours", kind: "", cta: "Ouvrir la page", disabled: false },
  soon: { badge: "À venir", kind: "soon", cta: "Bientôt", disabled: true },
  concept: { badge: "Concept", kind: "", cta: "Bientôt", disabled: true },
};

function Badge({ kind = "", children }) {
  const styles =
    kind === "new"
      ? "bg-emerald-500/15 text-emerald-600 border-emerald-200"
      : kind === "soon"
      ? "bg-amber-500/15 text-amber-600 border-amber-200"
      : "bg-gray-500/15 text-gray-600 border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${styles}`}>
      {children}
    </span>
  );
}

function Card({ title, badge, desc, cta, to, disabled }) {
  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold">{title}</h3>
        {badge}
      </div>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
      <div className="mt-4">
        {disabled ? (
          <button
            disabled
            className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm opacity-60 cursor-not-allowed"
          >
            {cta}
          </button>
        ) : (
          <Link
            to={to}
            className="inline-flex items-center rounded-lg bg-black text-white px-3 py-1.5 text-sm hover:opacity-90"
          >
            {cta}
          </Link>
        )}
      </div>
    </div>
  );
}

/* ------------------ Données par défaut ------------------ */
const DEFAULT_FEATURES = [
  { key: "sora2", title: "Intégration Sora2", desc: "Structure identique à VEO3. Arrive très bientôt.", route: "/prompt?tab=sora2", status: "soon" },
  { key: "veo3", title: "Générateur VEO3 (amélioré)", desc: "Scene/Style/Camera/Lighting/Tone + dialogues FR.", route: "/prompt?tab=veo3", status: "improve" },
  { key: "images", title: "Images · Hailuo", desc: "UI prête. Il reste à brancher l’API pour lancer les générations.", route: "/image", status: "progress" },
  { key: "videos", title: "Vidéos — page refonte", desc: "Onglets en haut à droite, alignée sur la page Image.", route: "/video", status: "soon" },
  { key: "audio", title: "Audio", desc: "Génération et mix simple. En cours de spec.", route: "#", status: "soon" },
  { key: "projects", title: "Projets", desc: "Regrouper prompts, images et vidéos par projet. Structure et partage facilités.", route: "#", status: "concept" },
];

/* ------------------ Page ------------------ */
export default function Lab() {
  const [items, setItems] = useState(DEFAULT_FEATURES);

  // Fusion helper
  function merge(remote = []) {
    const byKey = new Map(remote.map((r) => [r.key, r]));

    const merged = DEFAULT_FEATURES.map((d) => {
      const r = byKey.get(d.key);
      return r ? { ...d, ...r } : d;
    });

    const defaultKeys = new Set(DEFAULT_FEATURES.map((d) => d.key));
    const extras = remote
      .filter((r) => !defaultKeys.has(r.key))
      .map((r) => ({
        key: r.key,
        title: r.title ?? r.key,
        desc: r.description ?? r.desc ?? "",
        route: r.route ?? "#",
        status: r.status ?? "progress",
        cta: r.cta ?? null,
        disabled: !!r.disabled,
      }));

    setItems([...merged, ...extras]);
  }

  // Charge depuis Supabase + écoute en temps réel
  useEffect(() => {
    const supabase = getBrowserSupabase();

    (async () => {
      try {
        const { data, error } = await supabase.from("features").select("*");
        if (!error && Array.isArray(data)) merge(normalizeRows(data));
      } catch {
        /* silencieux */
      }
    })();

    const channel = supabase
      .channel("features-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "features" }, () => {
        supabase.from("features").select("*").then(({ data, error }) => {
          if (!error && Array.isArray(data)) merge(normalizeRows(data));
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cards = useMemo(() => items.map(withComputed), [items]);

  return (
    <main className="safe-padded min-h-full">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Nouveautés · Bêta Lab</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Statuts mis à jour en temps réel (construction → amélioration → final).
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card
            key={c.key}
            title={c.title}
            badge={<Badge kind={c.kind}>{c.badge}</Badge>}
            desc={c.desc}
            cta={c.cta}
            to={c.disabled ? "#" : c.route}
            disabled={c.disabled}
          />
        ))}
      </section>
    </main>
  );
}

/* ------------------ Helpers ------------------ */
function withComputed(item) {
  const s = STATUS[item.status] ?? STATUS.progress;
  return {
    ...item,
    badge: s.badge,
    kind: s.kind,
    cta: item.cta ?? s.cta,
    disabled: s.disabled || item.disabled === true,
  };
}

function normalizeRows(rows) {
  return rows.map((r) => ({
    key: String(r.key),
    title: r.title ?? "",
    desc: r.desc ?? r.description ?? "",
    route: r.route ?? "#",
    status: r.status ?? "progress",
    cta: r.cta ?? null,
    disabled: !!r.disabled,
  }));
}
