// src/pages/Video.jsx
import { useMemo, useState, useRef, useEffect } from "react";

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
function saveHistory(items) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}
function addHistoryEntry(entry) {
  const items = loadHistory();
  const withNew = [{ ...entry, pinned: false }, ...items];
  saveHistory(withNew);
}
function getVideoHistory() {
  return loadHistory().filter((i) => i.kind === "video");
}

/* ---------------- Page ---------------- */
export default function Video() {
  const [tab, setTab] = useState("veo3"); // 'veo3' | 'sora2' | 'history'
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Générateur vidéo</h1>
        <div className="inline-flex rounded-lg overflow-hidden border">
          <TabButton active={tab === "veo3"} onClick={() => setTab("veo3")}>VEO3</TabButton>
          <TabButton active={tab === "sora2"} onClick={() => setTab("sora2")}>Sora2</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>📜 Historique</TabButton>
        </div>
      </div>

      {tab === "veo3" ? (
        <VEO3VideoGenerator />
      ) : tab === "sora2" ? (
        <Sora2VideoGenerator />
      ) : (
        <VideoHistory />
      )}
    </div>
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

/* ---------------- VEO3 ---------------- */
function VEO3VideoGenerator() {
  return (
    <GenericVideoGenerator
      modelId="veo3"
      titleHelp="Décris ton concept : scène, ambiance, style. VEO3 renverra un script riche."
      placeholderIdea="Ex : Un ado traverse un fast-food néon sous la pluie, ton nerveux façon vlog."
      apiPath="/api/veo3-stream"
      outputLabel="Script (VEO3)"
    />
  );
}

/* ---------------- Sora2 (même logique, API dédiée) ---------------- */
function Sora2VideoGenerator() {
  return (
    <GenericVideoGenerator
      modelId="sora2"
      titleHelp="Décris ton concept pour Sora2 (format vidéo). Le prompt sera structuré pour Sora2."
      placeholderIdea="Ex : Lever de soleil sur plage ventée, voix off inspirante, plans progressifs."
      apiPath="/api/sora2-stream"
      outputLabel="Prompt vidéo (Sora2)"
    />
  );
}

/* ---------------- Générateur générique (stream SSE) ---------------- */
function GenericVideoGenerator({ modelId, titleHelp, placeholderIdea, apiPath, outputLabel }) {
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const disabled = useMemo(() => idea.trim().length < 8, [idea]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  // Permettre le “recharger depuis l’historique” si on l'ajoute plus tard
  useEffect(() => {
    function onLoad(e) {
      const { input, output } = e.detail || {};
      if (input != null) setIdea(input);
      if (output != null) setOutput(output);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.addEventListener(`onetool:video:${modelId}:load`, onLoad);
    return () => window.removeEventListener(`onetool:video:${modelId}:load`, onLoad);
  }, [modelId]);

  const generate = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setOutput("");

    // Stopper un flux existant
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    let finalOutput = "";

    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        setOutput(`⚠️ Erreur serveur : ${text || "impossible de générer le prompt"}`);
        return;
      }

      // SSE-like parse (compatible avec ta page Prompt.jsx)
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
                    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
                    kind: "video",
                    input: idea,
                    output: finalOutput,
                    model: modelId,
                    createdAt: new Date().toISOString(),
                  });
                  window.dispatchEvent(new Event("onetool:history:changed"));
                }
                return;
              }

              try {
                const json = JSON.parse(data);
                const delta =
                  json?.choices?.[0]?.delta?.content ??
                  json?.choices?.[0]?.text ?? "";
                if (delta) {
                  setOutput((prev) => prev + delta);
                  finalOutput += delta;
                }
              } catch {
                setOutput((prev) => prev + data);
                finalOutput += data;
              }
            }
          }
        }
      }

      // Fin propre sans [DONE]
      if (finalOutput.trim()) {
        addHistoryEntry({
          id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()),
          kind: "video",
          input: idea,
          output: finalOutput,
          model: modelId,
          createdAt: new Date().toISOString(),
        });
        window.dispatchEvent(new Event("onetool:history:changed"));
      }
    } catch (e) {
      if (e?.name === "AbortError") {
        setOutput((p) => p || "⏹️ Génération stoppée");
      } else {
        setOutput("Erreur réseau : " + (e?.message || String(e)));
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      alert("Copié ✅");
    } catch {
      alert("Impossible de copier 😅");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{titleHelp}</p>

      <div>
        <label className="block text-sm font-medium mb-1">Ton idée (2–3 lignes)</label>
        <textarea
          className="w-full border rounded p-3 min-h-[120px] outline-none focus:ring"
          placeholder={placeholderIdea}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={generate}
          disabled={disabled || loading}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {loading ? "Génération..." : "Générer"}
        </button>

        <button
          onClick={() => { abortRef.current?.abort(); setIdea(""); setOutput(""); }}
          className="border rounded px-4 py-2 hover:bg-gray-50"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{outputLabel}</label>
        <textarea
          readOnly
          className="w-full border rounded p-3 min-h={[modelId === 'sora2' ? '520px' : '520px'].join(' ')} bg-gray-50 font-mono text-sm"
          value={output}
          placeholder="Le résultat apparaîtra ici…"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={copy}
            disabled={!output.trim()}
            className="border rounded px-4 py-2 hover:bg-gray-50 disabled:opacity-60"
          >
            Copier
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Historique vidéo ---------------- */
function VideoHistory() {
  const [items, setItems] = useState(() => getVideoHistory());
  const [q, setQ] = useState("");

  useEffect(() => {
    function refresh() {
      setItems(getVideoHistory());
    }
    window.addEventListener("onetool:history:changed", refresh);
    return () => window.removeEventListener("onetool:history:changed", refresh);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const t = q.toLowerCase();
    return items.filter(
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
        <button
          onClick={clearAll}
          className="text-xs px-3 py-2 rounded-xl border hover:bg-gray-50"
          title="Effacer l'historique vidéo (garde les éléments épinglés)"
        >
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
                {/* Option: boutons charger/épingler/suppr — à ajouter si tu veux */}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
