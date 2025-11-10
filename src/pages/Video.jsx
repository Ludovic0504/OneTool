// src/pages/Video.jsx
import { useMemo, useState, useRef, useEffect } from "react";
const FORMAT_OPTIONS = ["16:9", "9:16", "1:1", "21:9", "4:5"];
const DURATION_OPTIONS = {
  veo3: ["8s"],
  sora2: ["10s", "15s"],
};

/* ----------------- utils historique (localStorage, même clé que le reste) ----------------- */
const LS_KEY = "history_v2";
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function saveHistory(items) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {}
}
function addHistoryEntry(entry) {
  const items = loadHistory();
  saveHistory([{ ...entry, pinned: false }, ...items]);
  window.dispatchEvent(new Event("onetool:history:changed"));
}
function getVideoHistory() {
  return loadHistory().filter(i => i.kind === "video");
}

/* ----------------------------------- Page ----------------------------------- */
export default function Video() {
  const [tab, setTab] = useState("veo3"); // 'veo3' | 'sora2'
  const [showHistory, setShowHistory] = useState(false);

  return (
    <main className="min-h-full text-gray-900">
      {/* Titre + onglets en haut à droite (comme tu aimes) */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold">Vidéo Generation</h2>
        <div className="inline-flex rounded-lg overflow-hidden border">
          <TabButton active={tab === "veo3"} onClick={() => { setTab("veo3"); setShowHistory(false); }}>VEO3</TabButton>
          <TabButton active={tab === "sora2"} onClick={() => { setTab("sora2"); setShowHistory(false); }}>Sora2</TabButton>

        </div>
      </div>

      {/* Grille à la manière de la page Image : gros panneau gauche + panneau “Mes créations” à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[50vh]">
  {/* Colonne gauche */}
  {!showHistory ? (
    <>
      {tab === "veo3" && (
        <Card>
          <SectionTitle>Idée (prompt) — VEO3</SectionTitle>
          <VEO3VideoForm />
        </Card>
      )}
      {tab === "sora2" && (
        <Card>
          <SectionTitle>Idée (prompt) — Sora2</SectionTitle>
          <Sora2VideoForm />
        </Card>
      )}
    </>
  ) : (
    <Card>
      <div className="flex items-center justify-between">
        <SectionTitle>Historique — {tab.toUpperCase()}</SectionTitle>
        <button onClick={() => setShowHistory(false)} className="text-xs underline">
          Fermer
        </button>
      </div>
      <VideoHistoryFull model={tab} />
    </Card>
  )}

  {/* Colonne droite */}
  {!showHistory && (
    <div>
      <RightPanel model={tab} onOpenHistory={() => setShowHistory(true)} />
    </div>
  )}
</div>
    </main>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-4 py-2 text-sm " +
        (active ? "bg-black text-white" : "bg-white hover:bg-gray-50")
      }
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return <div className="bg-white border rounded-xl p-4 shadow-sm">{children}</div>;
}
function SectionTitle({ children }) {
  return <h3 className="text-sm font-medium mb-2">{children}</h3>;
}

/* --------------------------- Forms (même UX que Image) --------------------------- */

function VEO3VideoForm() {
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = useMemo(() => idea.trim().length < 8, [idea]);
  const abortRef = useRef(null);

  const generate = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setOutput("");

    // stoppe un stream précédent
    abortRef.current?.abort?.();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let finalOutput = "";

    try {
      const res = await fetch("/api/veo3-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, format, duration }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        setOutput(`⚠️ Erreur serveur : ${text || "Impossible de générer"}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const chunk of parts) {
          const lines = chunk.split("\n");
          for (const raw of lines) {
            const line = raw.trim();
            if (!line || line.startsWith(":")) continue;
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") {
                try { await reader.cancel(); } catch {}
                if (finalOutput.trim()) {
                  addHistoryEntry({
                    id: crypto.randomUUID?.() || String(Date.now()),
                    kind: "video",
                    input: idea,
                    output: finalOutput,
                    model: "veo3",
                    createdAt: new Date().toISOString(),
                  });
                }
                return;
              }
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.text ?? "";
                if (delta) {
                  setOutput((p) => p + delta);
                  finalOutput += delta;
                }
              } catch {
                setOutput((p) => p + data);
                finalOutput += data;
              }
            }
          }
        }
      }

      // fin sans [DONE]
      if (finalOutput.trim()) {
        addHistoryEntry({
          id: crypto.randomUUID?.() || String(Date.now()),
          kind: "video",
          input: idea,
          output: finalOutput,
          model: "veo3",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      setOutput("Erreur réseau : " + (e?.message || String(e)));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const reset = () => {
    abortRef.current?.abort?.();
    setIdea("");
    setOutput("");
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(output); alert("Copié ✅"); }
    catch { alert("Impossible de copier"); }
  };

  return (
    <>
      {/* zone de saisie */}
      <textarea
        className="w-full border rounded p-3 min-h-[30vh] outline-none focus:ring"
        placeholder="Décris la vidéo (scène, style, ambiance…) — ex : vlog nerveux sous la pluie dans un fast-food néon."
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />
      {/* options Format / Durée */}
        <div className="mt-3 flex gap-3">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="flex-1 border rounded p-2 bg-white text-sm outline-none focus:ring"
         >
            <option value="">Format (ex: 16:9)</option>
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="flex-1 border rounded p-2 bg-white text-sm outline-none focus:ring"
         >
            {DURATION_OPTIONS.veo3.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

      {/* actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={generate}
          disabled={disabled || loading}
          className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-60"
        >
          {loading ? "Génération…" : "Générer"}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded border hover:bg-gray-50"
        >
          Réinitialiser
        </button>
      </div>
    </>
  );
}

function Sora2VideoForm() {
  // même UX que VEO3, mais API dédiée
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const disabled = useMemo(() => idea.trim().length < 8, [idea]);
  const abortRef = useRef(null);
  const [format, setFormat] = useState("");
  const [duration, setDuration] = useState(DURATION_OPTIONS.sora2[0]); // "10s"


  const generate = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setOutput("");
    abortRef.current?.abort?.();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let finalOutput = "";

    try {
      const res = await fetch("/api/sora2-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, format, duration }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        setOutput(`⚠️ Erreur serveur : ${text || "Impossible de générer"}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const chunk of parts) {
          for (const raw of chunk.split("\n")) {
            const line = raw.trim();
            if (!line || line.startsWith(":")) continue;
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") {
                try { await reader.cancel(); } catch {}
                if (finalOutput.trim()) {
                  addHistoryEntry({
                    id: crypto.randomUUID?.() || String(Date.now()),
                    kind: "video",
                    input: idea,
                    output: finalOutput,
                    model: "sora2",
                    createdAt: new Date().toISOString(),
                  });
                }
                return;
              }
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.text ?? "";
                if (delta) {
                  setOutput((p) => p + delta);
                  finalOutput += delta;
                }
              } catch {
                setOutput((p) => p + data);
                finalOutput += data;
              }
            }
          }
        }
      }

      if (finalOutput.trim()) {
        addHistoryEntry({
          id: crypto.randomUUID?.() || String(Date.now()),
          kind: "video",
          input: idea,
          output: finalOutput,
          model: "sora2",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      setOutput("Erreur réseau : " + (e?.message || String(e)));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const reset = () => { abortRef.current?.abort?.(); setIdea(""); setOutput(""); };

 return (
  <>
    <textarea
      className="w-full border rounded p-3 min-h-[140px] outline-none focus:ring"
      placeholder="Décris la vidéo pour Sora2 (format / plans / ambiance)…"
      value={idea}
      onChange={(e) => setIdea(e.target.value)}
    />

    {/* options Format / Durée */}
    <div className="mt-3 flex gap-3">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="flex-1 border rounded p-2 bg-white text-sm outline-none focus:ring"
      >
        <option value="">Format (ex: 16:9)</option>
        {FORMAT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="flex-1 border rounded p-2 bg-white text-sm outline-none focus:ring"
      >
        {DURATION_OPTIONS.sora2.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

    </div>

    {/* actions */}
    <div className="mt-3 flex gap-2">
      <button
        onClick={generate}
        disabled={disabled || loading}
        className="px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-60"
      >
        {loading ? "Génération…" : "Générer"}
      </button>
      <button onClick={reset} className="px-4 py-2 rounded border hover:bg-gray-50">
        Réinitialiser
      </button>
    </div>
  </>
);
}
/* --------------------------- Panneau droit “Mes créations” --------------------------- */

function RightPanel({ model, onOpenHistory }) {
  const [items, setItems] = useState(() => getVideoHistory());
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    const refresh = () => {
      const all = getVideoHistory();
      const filtered = all.filter(i => i.model === model);
      setItems(filtered);
      setLatest(filtered[0] || null);
    };
    refresh();
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, [model]);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-4 h-full">
      {/* Dernière création */}
      {latest ? (
        <div className="border rounded-xl overflow-hidden shadow-sm">
          <div className="p-2 text-sm font-medium bg-gray-50 border-b">
            Dernière création ({model.toUpperCase()})
          </div>
          <div className="p-3 text-sm">
            <div className="font-medium mb-2 line-clamp-3">
              {latest.output || latest.input}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(latest.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">Aucune création pour {model.toUpperCase()}.</div>
      )}

      {/* Historique */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Historique</div>
        <a href="#" onClick={(e) => { e.preventDefault(); onOpenHistory?.(); }} className="text-xs underline">
          Voir tout →
        </a>
      </div>

      <ul className="space-y-2 overflow-auto max-h-[420px] pr-1">
        {items.slice(1, 8).map((i) => (
          <li key={i.id} className="p-2 rounded border hover:bg-gray-50">
            <div className="text-sm line-clamp-2">
              {i.output || i.input || "Sans titre"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(i.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


/* --------------------------- Historique “plein format” (onglet) --------------------------- */

function VideoHistoryFull({ model }) { // 'veo3' | 'sora2'
  const [items, setItems] = useState(() => getVideoHistory());
  const [q, setQ] = useState("");

  useEffect(() => {
    const refresh = () => setItems(getVideoHistory());
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    const base = model ? items.filter(i => (i.model || "").toLowerCase() === model) : items;
    return !t
      ? base
      : base.filter(
          (i) =>
            (i.input || "").toLowerCase().includes(t) ||
            (i.output || "").toLowerCase().includes(t)
        );
  }, [q, items, model]);

  const clearAll = () => {
    const all = loadHistory();
    const keep = all.filter((i) => i.kind !== "video" || i.pinned);
    saveHistory(keep);
    setItems(getVideoHistory());
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher…"
          className="w-full border rounded-xl px-3 py-2 outline-none"
        />
        <button onClick={clearAll} className="text-xs px-3 py-2 rounded-xl border hover:bg-gray-50">
          Nettoyer
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-gray-500">Aucun élément</div>
      ) : (
        <ul className="divide-y">
          {filtered.map((i) => (
            <li key={i.id} className="py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-left">
                  <div className="text-sm font-medium line-clamp-1">
                    {(i.output || i.input || "Sans titre").slice(0, 100)}
                    {(i.output || i.input || "").length > 100 ? "…" : ""}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(i.createdAt).toLocaleString()} · {i.model?.toUpperCase?.()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const all = loadHistory();
                    saveHistory(all.filter((x) => x.id !== i.id));
                    setItems(getVideoHistory());
                  }}
                  className="text-xs px-2 py-1 rounded bg-red-100 hover:bg-red-200"
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
