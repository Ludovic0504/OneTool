// src/pages/Prompt.jsx
import { useMemo, useState, useRef, useEffect } from "react";
import { saveHistory, listHistory } from "@/lib/supabase/history";
import { useAuth } from "@/context/AuthProvider";

/* ----------------- utils historique (localStorage) ----------------- */
const LS_KEY = "history_v2";
function loadHistory() { try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function saveLocalHistory(items) { try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch {} }
function addHistoryEntry(entry) { const items = loadHistory(); saveLocalHistory([{ ...entry, pinned:false }, ...items]); }
function getPromptHistory() { return loadHistory().filter((i) => i.kind === "prompt"); }

/* ---------------- Page ---------------- */
export default function PromptAssistant() {
  const [tab, setTab] = useState("veo3"); // 'veo3' | 'sora2' | 'history'
  return (
    <div className="w-full pt-3 pb-8 px-[max(8px,env(safe-area-inset-left))] pr-[max(8px,env(safe-area-inset-right))] md:max-w-screen-lg md:mx-auto text-slate-200 selection:bg-accent/30">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Prompt Assistant</h1>
        <div className="inline-flex rounded-lg overflow-hidden border border-white/10 bg-surface/60">
          <TabButton active={tab === "veo3"} onClick={() => setTab("veo3")}>VEO3</TabButton>
          <TabButton active={tab === "sora2"} onClick={() => setTab("sora2")}>Sora2</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>📜 Historique</TabButton>
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

  useEffect(() => {
    function onLoadFromHistory(e) {
      const { input, output } = e.detail || {};
      if (input != null) setIdea(input);
      if (output != null) setOutput(output);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.addEventListener("onetool:prompt:load", onLoadFromHistory);
    return () => window.removeEventListener("onetool:prompt:load", onLoadFromHistory);
  }, []);

  const generate = async () => {
    if (idea.trim().length < 8 || loading) return;
    setLoading(true); setOutput("");
    const API_BASE = "";
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    let finalOutput = "";
    try {
      const res = await fetch(`${API_BASE}/api/veo3-stream`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea }), signal: ctrl.signal,
      });
      if (!res.ok || !res.body) { const text = await res.text().catch(() => ""); setOutput(`⚠️ Erreur serveur : ${text || "impossible de générer le prompt"}`); return; }
      const reader = res.body.getReader(); const decoder = new TextDecoder("utf-8"); let buffer = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n"); buffer = parts.pop() ?? "";
        for (const chunk of parts) {
          for (const raw of chunk.split("\n")) {
            const line = raw.trim(); if (!line || line.startsWith(":")) continue;
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") {
                try { await reader.cancel(); } catch {}
                if (finalOutput.trim()) {
                  const entry = { id: (crypto.randomUUID?.() || String(Date.now())), kind:"prompt", input: idea, output: finalOutput, model: "veo3", createdAt: new Date().toISOString() };
                  addHistoryEntry(entry);
                  await saveHistory({ kind:"prompt", input: idea, output: finalOutput, model:"veo3" });
                }
                window.dispatchEvent(new Event("onetool:history:changed")); return;
              }
              try {
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.text ?? "";
                if (delta) { setOutput((p) => p + delta); finalOutput += delta; }
              } catch { setOutput((p) => p + data); finalOutput += data; }
            }
          }
        }
      }
      if (finalOutput.trim()) {
        addHistoryEntry({ id:(crypto.randomUUID?.() || String(Date.now())), kind:"prompt", input: idea, output: finalOutput, model:"veo3", createdAt:new Date().toISOString() });
        window.dispatchEvent(new Event("onetool:history:changed"));
      }
    } catch (e) {
      if (e?.name === "AbortError") setOutput((p) => p || "⏹️ Génération stoppée");
      else setOutput("Erreur réseau : " + (e?.message || String(e)));
    } finally { setLoading(false); abortRef.current = null; }
  };

  const copy = async () => { try { await navigator.clipboard.writeText(output); alert("Prompt copié ✅"); } catch { alert("Impossible de copier 😅"); } };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Décris ton idée en 2–3 lignes. Le générateur produit un prompt VEO3 détaillé
        (scène en anglais, sections, dialogues en français).
      </p>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Ton idée (2–3 lignes)</label>
        <textarea
          className="w-full rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] p-3 min-h-[120px] outline-none font-mono text-sm
                     bg-black/30 border border-white/10 text-slate-200
                     placeholder:text-slate-500 focus:ring-1 focus:ring-accent/40"
          placeholder="Ex : Un ado rentre sous la pluie, se parle à la caméra façon vlog, passe par un fast-food néon. Ambiance nocturne, ton nerveux."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={generate}
          disabled={disabled || loading}
          className="rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] px-4 py-2 disabled:opacity-60
                     bg-gradient-to-r from-accent/90 to-emerald-400 text-black
                     shadow-[0_0_25px_rgba(33,243,185,.45)] hover:brightness-110"
        >
          {loading ? "Génération..." : "Générer"}
        </button>

        <button
          onClick={() => { abortRef.current?.abort(); setIdea(""); setOutput(""); }}
          className="border border-white/10 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] px-4 py-2 hover:bg-white/5 text-slate-300"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Prompt (VEO3)</label>
        <textarea
          readOnly
          className="w-full border border-white/10 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] p-3 min-h-[520px]
                     bg-gradient-to-b from-black/40 via-black/20 to-transparent font-mono text-slate-200 text-sm"
          value={output}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={copy}
            disabled={!output.trim()}
            className="border border-white/10 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.3)] px-4 py-2 hover:bg-white/5 text-slate-300 disabled:opacity-60"
          >
            Copier
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Historique ---------------- */
function PromptHistory() {
  const { session } = useAuth();
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  useEffect(() => { (async () => {
    if (session) { const rows = await listHistory({ kind:"prompt", limit:50 }); setItems(rows); }
    else { setItems(getPromptHistory()); }
    setLoading(false);
  })(); }, [session]);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter((i) => (i.input || "").toLowerCase().includes(t) || (i.output || "").toLowerCase().includes(t));
  }, [items, q]);

  const clearAll = () => { const all = loadHistory(); saveLocalHistory(all.filter((i) => i.kind !== "prompt" || i.pinned)); setItems(getPromptHistory()); };
  const loadIntoEditor = (i) => { window.dispatchEvent(new CustomEvent("onetool:prompt:load", { detail:{ input:i.input, output:i.output } })); alert("Chargé dans l’éditeur ✅ (onglet VEO3)"); };
  const removeOne = (id) => { const all = loadHistory(); saveLocalHistory(all.filter((i) => i.id !== id)); setItems(getPromptHistory()); };

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
    <div className="rounded-xl border border-white/10 p-4 bg-surface/70 backdrop-blur-md text-slate-200">
      <p className="text-sm text-slate-300">
        Spécialisation <strong className="text-white">Sora2</strong> — dis-moi le format exact voulu,
        je reproduis la même génération riche.
      </p>
    </div>
  );
}

/* ---------------- Logic existante (inchangée)… ---------------- */
// … le reste de tes fonctions (analyzeIdea, roughEN, buildVEO3RichPrompt, etc.) restent identiques.
// __TEST_SAVE__ 15:14:29
