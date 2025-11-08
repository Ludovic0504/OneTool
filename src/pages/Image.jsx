// src/pages/Image.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthProvider";

/* ---------- Crédit local (MVP) ---------- */
const DEFAULT_CREDITS = 20;         // gratuités initiales
const COST_PER_IMAGE = 1;           // 1 crédit par image

function userKey(uid) {
  return uid ? `u:${uid}` : "guest";
}
function loadCredits(uid) {
  try {
    const raw = localStorage.getItem(`credits:${userKey(uid)}`);
    if (raw == null) {
      localStorage.setItem(`credits:${userKey(uid)}`, String(DEFAULT_CREDITS));
      return DEFAULT_CREDITS;
    }
    return Number(raw) || 0;
  } catch {
    return 0;
  }
}
function saveCredits(uid, value) {
  try {
    localStorage.setItem(`credits:${userKey(uid)}`, String(value));
  } catch {}
}

/* ---------- Historique local (MVP) ---------- */
const LS_HISTORY = "history_v2";
function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveHistory(items) {
  try {
    localStorage.setItem(LS_HISTORY, JSON.stringify(items));
  } catch {}
}
function addImageHistory({ uid, prompt, urls, meta }) {
  const id = crypto.randomUUID?.() || String(Date.now());
  const createdAt = new Date().toISOString();
  const entry = {
    id,
    kind: "image",
    prompt,
    output: null,
    urls,
    meta,
    createdAt,
    pinned: false,
    owner: userKey(uid),
  };
  const items = loadHistory();
  saveHistory([entry, ...items]);
}
function getMyImages(uid) {
  const me = userKey(uid);
  return loadHistory().filter((i) => i.kind === "image" && i.owner === me);
}

/* ---------- UI ---------- */
export default function ImagePage() {
  const { session } = useAuth();
  const uid = session?.user?.id;

  // Gauche (panneau génération)
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("16:9");
  const [quantity, setQuantity] = useState(4);
  const [model] = useState("Image-01"); // pour l’instant fixe
  const [refCharDataUrl, setRefCharDataUrl] = useState(null); // image de référence (facultatif)
  const [busy, setBusy] = useState(false);

  // Droite (galerie)
  const [items, setItems] = useState(() => getMyImages(uid));

  // Crédits
  const [credits, setCredits] = useState(() => loadCredits(uid));
  useEffect(() => {
    // quand l’utilisateur change (connecte/déconnecte), on recharge les crédits + galerie
    setCredits(loadCredits(uid));
    setItems(getMyImages(uid));
  }, [uid]);

  const totalCost = useMemo(() => COST_PER_IMAGE * Number(quantity || 0), [quantity]);
  const canGenerate = useMemo(() => {
    return !!prompt.trim() && !busy && credits >= totalCost;
  }, [prompt, busy, credits, totalCost]);

  // Upload “personnage de référence” -> dataURL en mémoire (MVP)
  const fileInputRef = useRef(null);
  const onPickRefImage = () => fileInputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => setRefCharDataUrl(String(rd.result));
    rd.readAsDataURL(f);
  };

  // Appel API (placeholder Hailuo)
  async function generate() {
    if (!canGenerate) return;

    setBusy(true);
    try {
      // Exemple d’appel — à connecter quand ton endpoint /api/hailuo sera prêt
      // Attendu: { urls: string[] } (1..quantity)
      const res = await fetch("/api/hailuo-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          ratio,             // "16:9" | "1:1" | "9:16"…
          quantity,          // 1..4
          model,             // "Image-01"
          // On peut envoyer refCharDataUrl si l’API supporte une image de référence:
          refCharacter: refCharDataUrl, // base64 dataURL (optionnel)
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Erreur de génération");
      }

      const data = await res.json().catch(() => null);
      const urls = Array.isArray(data?.urls) ? data.urls : [];

      if (urls.length === 0) {
        throw new Error("Aucune image reçue");
      }

      // Historiser (par utilisateur)
      addImageHistory({
        uid,
        prompt,
        urls,
        meta: { ratio, model, quantity },
      });
      setItems(getMyImages(uid));

      // Décrémenter les crédits (1/image)
      const newCredits = credits - urls.length * COST_PER_IMAGE;
      setCredits(newCredits);
      saveCredits(uid, newCredits);

      // UI feedback rapide
      setPrompt("");
    } catch (err) {
      alert(err?.message || "Erreur inconnue");
    } finally {
      setBusy(false);
    }
  }

  const resetRef = () => setRefCharDataUrl(null);

  const removeOne = (id) => {
    const all = loadHistory();
    saveHistory(all.filter((i) => i.id !== id));
    setItems(getMyImages(uid));
  };

  const clearAllMine = () => {
    const me = userKey(uid);
    const all = loadHistory();
    saveHistory(all.filter((i) => !(i.kind === "image" && i.owner === me && !i.pinned)));
    setItems(getMyImages(uid));
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Image Generation</h1>

        {/* Crédit badge */}
        <div className="inline-flex items-center gap-2 text-sm">
          <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1">
            Crédits : <strong>{credits}</strong>
          </span>
          <button
            className="text-xs underline"
            onClick={() => {
              // Petit reset manuel (utile en dev)
              const val = prompt("Définir les crédits (dev) :", String(credits));
              if (val == null) return;
              const n = Math.max(0, Number(val) || 0);
              setCredits(n);
              saveCredits(uid, n);
            }}
            title="Débogage crédits (dev)"
          >
            ajuster
          </button>
        </div>
      </div>

      {/* Deux colonnes : éditeur à gauche, galerie à droite */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Panneau gauche */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Idée (prompt)</label>
            <textarea
              className="w-full border rounded p-3 min-h-[140px] outline-none focus:ring"
              placeholder="Décris l'image que tu veux générer…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Sois naturel, précis et cohérent (style, sujet, lumière, ambiance).
            </p>
          </div>

          {/* Personnage de référence (facultatif) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">Personnage de référence (optionnel)</label>
              {refCharDataUrl && (
                <button className="text-xs underline" onClick={resetRef}>
                  Retirer
                </button>
              )}
            </div>

            {refCharDataUrl ? (
              <div className="relative w-full overflow-hidden rounded-lg border">
                <img src={refCharDataUrl} alt="Référence" className="w-full object-cover max-h-64" />
              </div>
            ) : (
              <button
                type="button"
                onClick={onPickRefImage}
                className="w-full border-2 border-dashed rounded-lg p-6 text-sm text-gray-600 hover:bg-gray-50"
              >
                + Ajouter une image de référence
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500">
              Optionnel — sera envoyé à l’API si supporté (guidage de style/visage).
            </p>
          </div>

          {/* Paramètres rapides */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Format</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
              >
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
                <option value="9:16">9:16</option>
                <option value="4:5">4:5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Quantité</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              disabled={!canGenerate}
              className="bg-black text-white rounded px-4 py-2 disabled:opacity-60"
              title={credits < totalCost ? "Crédits insuffisants" : ""}
            >
              {busy ? "Génération…" : `Générer (${totalCost} crédit${totalCost > 1 ? "s" : ""})`}
            </button>
            <button
              onClick={() => { setPrompt(""); setRefCharDataUrl(null); }}
              className="border rounded px-4 py-2 hover:bg-gray-50"
            >
              Réinitialiser
            </button>
          </div>

          <div className="text-xs text-gray-500">
            Modèle : <span className="font-medium">{model}</span> · Ratio : {ratio} · Quantité : {quantity}
          </div>
        </div>

        {/* Galerie droite */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Mes créations</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={clearAllMine}
                className="text-xs px-3 py-1.5 rounded border hover:bg-gray-50"
                title="Effacer l'historique (non épinglé) de mes images"
              >
                Nettoyer
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune image générée pour l’instant.</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => (
                <li key={item.id} className="group">
                  <div className="relative overflow-hidden rounded-lg border">
                    {/* on prend la première comme cover */}
                    <img
                      src={item.urls?.[0]}
                      alt="Création"
                      className="w-full h-36 object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={() => removeOne(item.id)}
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-white/90 hover:bg-white border"
                      title="Supprimer"
                    >
                      Suppr.
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] text-gray-500 flex items-center justify-between">
                    <span className="truncate" title={item.prompt}>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <span>{(item.meta?.ratio) || ""}</span>
                  </div>

                  {/* mini-mosaïque si plusieurs urls */}
                  {Array.isArray(item.urls) && item.urls.length > 1 && (
                    <div className="mt-1 grid grid-cols-4 gap-1">
                      {item.urls.slice(0, 4).map((u, idx) => (
                        <img key={idx} src={u} className="w-full h-12 object-cover rounded border" alt="" />
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
