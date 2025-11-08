// src/pages/Video.jsx
import { useMemo, useState, useRef, useEffect } from "react";

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
  const [tab, setTab] = useState("veo3"); // 'veo3' | 'sora2' | 'history'

  return (
    <main className="min-h-full text-gray-900">
      {/* Titre + onglets en haut à droite (comme tu aimes) */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold">Vidéo Generation</h2>
        <div className="inline-flex rounded-lg overflow-hidden border">
          <TabButton active={tab === "veo3"} onClick={() => setTab("veo3")}>VEO3</TabButton>
          <TabButton active={tab === "sora2"} onClick={() => setTab("sora2")}>Sora2</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>📜 Historique</TabButton>
        </div>
      </div>

      {/* Grille à la manière de la page Image : gros panneau gauche + panneau “Mes créations” à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2">
          {tab === "veo3" && (
            <Card>
              <SectionTitle>Idée (prompt)</SectionTitle>
              <VEO3VideoForm />
            </Card>
          )}
          {tab === "sora2" && (
            <Card>
              <SectionTitle>Idée (prompt) — Sora2</SectionTitle>
              <Sora2VideoForm />
            </Card>
          )}
          {tab === "history" && (
            <Card>
              <SectionTitle>Historique (vidéo)</SectionTitle>
              <VideoHistoryFull />
            </Card>
          )}
        </div>

        {/* Colonne droite (1/3) */}
        <div className="lg:col-span-1">
          <RightPanel />
        </div>
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
        body: JSON.stringify({ idea }),
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
        className="w-full border rounded p-3 min-h-[140px] outline-none focus:ring"
        placeholder="Décris la vidéo (scène, style, ambiance…) — ex : vlog nerveux sous la pluie dans un fast-food néon."
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />

      {/* options (placeholder si tu veux ajouter format/durée comme sur l'image) */}
      <div className="mt-2 text-xs text-gray-500">
        Optionnel — on pourra ajouter “Format, Durée, Modèle” ici si besoin.
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

      {/* sortie */}
      <div className="mt-4">
        <div className="text-sm font-medium mb-1">Script (VEO3)</div>
        <textarea
          readOnly
          className="w-full border rounded p-3 min-h-[320px] bg-gray-50 font-mono text-sm"
          value={output}
          placeholder="Le résultat apparaîtra ici…"
        />
        <div className="flex justify-end mt-2">
          <button onClick={copy} disabled={!output.trim()} className="px-3 py-2 rounded border hover:bg-gray-50 disabled:opacity-60">
            Copier
          </button>
        </div>
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
        body: JSON.stringify({ idea }),
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
      <div className="mt-4">
        <div className="text-sm font-medium mb-1">Prompt vidéo (Sora2)</div>
        <textarea
          readOnly
          className="w-full border rounded p-3 min-h-[320px] bg-gray-50 font-mono text-sm"
          value={output}
          placeholder="Le résultat apparaîtra ici…"
        />
      </div>
    </>
  );
}

/* --------------------------- Panneau droit “Mes créations” --------------------------- */

function RightPanel() {
  const [items, setItems] = useState(() => getVideoHistory());

  useEffect(() => {
    const refresh = () => setItems(getVideoHistory());
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, []);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Mes créations</div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // bascule l’onglet global sur Historique si présent dans la page
            const btn = document.querySelector('button:contains("Historique")');
            // fallback: on simule un clic sur l’onglet via un event custom si tu préfères
          }}
          className="text-xs underline"
        >
          Voir tout →
        </a>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-500">Aucune vidéo pour l’instant.</div>
      ) : (
        <ul className="space-y-2 max-h-[420px] overflow-auto pr-1">
          {items.slice(0, 8).map((i) => (
            <li key={i.id} className="p-2 rounded border hover:bg-gray-50">
              <div className="text-sm font-medium line-clamp-2">
                {(i.output || i.input || "Sans titre").slice(0, 140)}
                {(i.output || i.input || "").length > 140 ? "…" : ""}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(i.createdAt).toLocaleString()} · {i.model?.toUpperCase?.()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------- Historique “plein format” (onglet) --------------------------- */

function VideoHistoryFull() {
  const [items, setItems] = useState(() => getVideoHistory());
  const [q, setQ] = useState("");

  useEffect(() => {
    const refresh = () => setItems(getVideoHistory());
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return !t
      ? items
      : items.filter(
          (i) =>
            (i.input || "").toLowerCase().includes(t) ||
            (i.output || "").toLowerCase().includes(t)
        );
  }, [items, q]);

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
