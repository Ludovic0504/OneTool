// src/pages/Prompt.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { saveHistory, listHistory } from "@/lib/supabase/history";
import { useAuth } from "@/context/AuthProvider";
import PageTitle from "../components/PageTitle";

/* ----------------- utils historique (localStorage) ----------------- */
const LS_KEY = "history_v2";
function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveLocalHistory(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}
function addHistoryEntry(entry) {
  const items = loadHistory();
  saveLocalHistory([{ ...entry, pinned: false }, ...items]);
}
function getPromptHistory() {
  return loadHistory().filter((i) => i.kind === "prompt");
}

/* ---------------- Page ---------------- */
export default function PromptAssistant() {
  const [tab, setTab] = useState("veo3"); // 'veo3' | 'sora2' | 'history'

  return (
    <div className="w-full pt-3 pb-8 px-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] text-slate-200 selection:bg-accent/30">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">

      {/* ⭐️ NOUVEAU TITRE REMPLACE <h1> */}
      <PageTitle
        green="Prompts"
        white="Assistant"
        subtitle="Décris ton idée en 2–3 lignes et génère un prompt VEO3 complet."
      />

      {/* tes onglets */}
        <div className="inline-flex rounded-lg overflow-hidden border border-white/10 bg-surface/60 self-end sm:self-auto">
          <TabButton active={tab === "veo3"} onClick={() => setTab("veo3")}>
            VEO3
          </TabButton>
          <TabButton active={tab === "sora2"} onClick={() => setTab("sora2")}>
            Sora2
          </TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>
            Historique
          </TabButton>
        </div>
      </div>

      {tab === "veo3" ? <VEO3Generator /> : tab === "sora2" ? <Sora2Placeholder /> : <PromptHistory />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 text-sm transition " +
        (active
          ? "bg-accent text-black shadow-[0_0_18px_rgba(33,243,185,.35)]"
          : "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white")
      }
    >
      {children}
    </button>
  );
}

/* ---------------- VEO3 ---------------- */
function VEO3Generator() {
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const disabled = useMemo(() => idea.trim().length < 8, [idea]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const reset = () => {
    try {
      abortRef.current?.abort();
    } catch {}
    setLoading(false);
    setIdea("");
    setOutput("");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert("Prompt copié ✅");
    } catch {
      alert("Impossible de copier 😅");
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Décris ton idée en 2–3 lignes. Le générateur produit un prompt VEO3 détaillé (scène en anglais, sections,
        dialogues en français).
      </p>

      {/* Bloc "Ton idée" sans cadre intérieur */}
      <div>
  <label className="block text-sm font-medium mb-1 text-emerald-400">
  Ton idée (2–3 lignes)
</label>
<textarea
  value={idea}
  onChange={(e) => setIdea(e.target.value)}
  className="w-full rounded-2xl border border-white/10 p-4 min-h-[160px]
             text-gray-100 placeholder:text-slate-500
             focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400
             bg-slate-900"   // même bleu que la page Images / Beta Lab
  placeholder="Ex : Un ado rentre sous la pluie, se parle à la caméra façon vlog..."
/>

</div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => alert("Simulation de génération (API désactivée)")}
          disabled={disabled || loading}
          className="rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] px-4 py-2 disabled:opacity-60
                     bg-gradient-to-r from-emerald-500 to-emerald-400 text-black hover:brightness-110"
        >
          {loading ? "Génération..." : "Générer"}
        </button>
        <button
          onClick={reset}
          className="rounded-xl border border-white/10 px-4 py-2 text-gray-200 bg-[#0e1419] hover:border-emerald-400/50"
        >
          Réinitialiser
        </button>
      </div>

      {/* Bloc "Prompt (VEO3)" agrandi */}
      <section>
  <label className="block text-sm font-medium mb-1 text-emerald-400">Prompt (VEO3)</label>
<div className="rounded-2xl border border-white/10 bg-slate-900 p-4">   {/* fond bleu nuit */}
  <pre className="whitespace-pre-wrap text-gray-100 text-sm bg-transparent">
    {output || "..."}
  </pre>
</div>
<div className="text-right mt-2">
  <button
    onClick={copy}
    className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-gray-200
               bg-[#0e1419] hover:border-emerald-400/50"
  >
    Copier
  </button>
</div>
</section>

    </div>
  );
}


/* ---------------- Historique ---------------- */
function PromptHistory() {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      if (session) {
        const rows = await listHistory({ kind: "prompt", limit: 50 });
        setItems(rows);
      } else {
        setItems(getPromptHistory());
      }
      setLoading(false);
    })();
  }, [session]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter(
      (i) => (i.input || "").toLowerCase().includes(t) || (i.output || "").toLowerCase().includes(t)
    );
  }, [items, q]);

  const clearAll = () => {
    const all = loadHistory();
    saveLocalHistory(all.filter((i) => i.kind !== "prompt" || i.pinned));
    setItems(getPromptHistory());
  };
  const loadIntoEditor = (i) => {
    window.dispatchEvent(new CustomEvent("onetool:prompt:load", { detail: { input: i.input, output: i.output } }));
    alert("Chargé dans l’éditeur ✅ (onglet VEO3)");
  };
  const removeOne = (id) => {
    const all = loadHistory();
    saveLocalHistory(all.filter((i) => i.id !== id));
    setItems(getPromptHistory());
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher…"
          className="w-full border border-white/10 rounded-xl px-3 py-2 outline-none
                     bg-black/30 text-slate-200 placeholder:text-slate-500
                     focus:ring-1 focus:ring-accent/40"
        />
        <button
          onClick={clearAll}
          className="text-xs px-3 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
          title="Effacer l'historique des prompts"
        >
          Nettoyer
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-slate-400">Aucun prompt enregistré pour l’instant.</div>
      ) : (
        <ul className="divide-y divide-white/5">
          {filtered.map((i) => (
            <li key={i.id} className="py-2">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => loadIntoEditor(i)} className="text-left" title="Charger dans l’éditeur">
                  <div className="text-sm font-medium line-clamp-1 text-slate-200">
                    {(i.output || i.input || "Sans titre").slice(0, 100)}
                    {(i.output || i.input || "").length > 100 ? "…" : ""}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(i.created_at || i.createdAt).toLocaleString()} · {i.model?.toUpperCase?.()}
                  </div>
                </button>
                <button
                  onClick={() => removeOne(i.id)}
                  className="text-xs px-2 py-1 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] bg-red-500/10 hover:bg-red-500/20 text-red-300"
                  title="Supprimer"
                >
                  Suppr.
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Sora2 (placeholder sombre) ---------------- */
function Sora2Placeholder() {
  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-[#0b111a] text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-sm text-slate-300">
        Spécialisation <strong className="text-white">Sora2</strong> — dis-moi le format exact voulu, je reproduis la
        même génération riche.
      </p>
    </div>
  );
}
