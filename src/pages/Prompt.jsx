// src/pages/Prompt.jsx
import { useMemo, useState } from "react";
import { useMemo, useState, useRef } from "react";

const abortRef = useRef(null);


export default function PromptAssistant() {
  const [tab, setTab] = useState("veo3"); // 'veo3' | 'sora2'
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Prompt Assistant</h1>
        <div className="inline-flex rounded-lg overflow-hidden border">
          <TabButton active={tab === "veo3"} onClick={() => setTab("veo3")}>VEO3</TabButton>
          <TabButton active={tab === "sora2"} onClick={() => setTab("sora2")}>Sora2</TabButton>
        </div>
      </div>
      {tab === "veo3" ? <VEO3Generator /> : <Sora2Placeholder />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={"px-4 py-2 text-sm " + (active ? "bg-black text-white" : "bg-white hover:bg-gray-50")}
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

  const generate = async () => {
  if (idea.trim().length < 8 || loading) return;
  setLoading(true);
  setOutput("");

  const API_BASE = import.meta.env.DEV ? "" : "https://onetool-three.vercel.app";

  // Permet de stopper un flux en cours
  abortRef.current?.abort();
  abortRef.current = new AbortController();

  try {
    const res = await fetch(`${API_BASE}/api/veo3-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
      signal: abortRef.current.signal,
    });

    if (!res.ok || !res.body) {
      const text = await res.text().catch(() => "");
      setOutput(`⚠️ Erreur serveur : ${text || "impossible de générer le prompt"}`);
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);

        if (!line || line.startsWith(":")) continue; // ignore les keep-alive

        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            reader.cancel().catch(() => {});
            break;
          }
          try {
            const json = JSON.parse(data);
            const delta =
              json?.choices?.[0]?.delta?.content ??
              json?.choices?.[0]?.text ?? "";
            if (delta) setOutput((prev) => prev + delta);
          } catch {
            // ignore les lignes non-JSON
          }
        }
      }
    }
  } catch (e) {
    if (e?.name === "AbortError") {
      setOutput((p) => p || "⏹️ Génération stoppée");
    } else {
      setOutput("Erreur réseau : " + (e?.message || String(e)));
    }
  } finally {
    setLoading(false);
  }
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
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Décris ton idée en 2–3 lignes. Le générateur produit un prompt VEO3 détaillé
        comme dans ta capture 2 : scène en anglais, sections, et dialogues en français.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Ton idée (2–3 lignes)</label>
        <textarea
          className="w-full border rounded p-3 min-h-[120px] outline-none focus:ring"
          placeholder={`Ex : Un ado rentre sous la pluie, se parle à la caméra façon vlog, passe par un fast-food néon. Ambiance nocturne, ton nerveux.`}
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
          onClick={() => { setIdea(""); setOutput(""); }}
          className="border rounded px-4 py-2 hover:bg-gray-50"
        >
          Réinitialiser
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Prompt (VEO3)</label>
        <textarea
          readOnly
          className="w-full border rounded p-3 min-h-[520px] bg-gray-50 font-mono text-sm"
          value={output}
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

/* ---------------- Logic ---------------- */

// Transforme 2–3 lignes en un contexte "riche"
function analyzeIdea(raw) {
  const text = raw.toLowerCase().replace(/[!?]/g, ""); // retire ! et ?
  const en = roughEN(raw).replace(/[!?]/g, "").trim();

  // Sujet / âge (très basique)
  let subject = "character";
  if (/ado|teen|jeune/.test(text)) subject = "teenager";
  else if (/femme|girl|woman/.test(text)) subject = "woman";
  else if (/homme|boy|man/.test(text)) subject = "man";

  // Environnement
  let environment = "urban street";
  if (/fast-?food|diner|kebab|snack|neon/.test(text)) environment = "neon fast-food interior";
  if (/bed(room)?|chambre/.test(text)) environment = "bedroom interior";
  if (/forest|forêt/.test(text)) environment = "forest trail";
  if (/beach|plage/.test(text)) environment = "beach shoreline";

  // Météo / moment
  const rainy = /rain|pluie|orage|storm/.test(text);
  const night = /night|nuit/.test(text);
  const morning = /morning|matin|sunrise|golden/.test(text);

  // Camera / mouvement
  let camera = "handheld medium shot, vlog framing, subject often close to the lens";
  if (/run|court|course/.test(text)) camera = "handheld wide, running with subject, dynamic shake";
  if (/driv|voiture|car|conduit/.test(text)) camera = "in-car handheld, passenger angle, lens close to face";
  if (/assis|sit/.test(text)) camera = "handheld medium close-up, static, eye level";

  // Lumière
  let lighting = "available light, soft diffusion";
  if (night) lighting = "neon highlights, high contrast, practicals";
  if (morning) lighting = "golden hour, warm directional light";
  if (rainy) lighting += ", wet surfaces and specular reflections";

  // Style et ton
  const style = "ultra realistic, cinematic vlog energy, film grain, shallow depth of field, natural skin tones";
  let tone = "intimate and candid";
  if (/nerveux|tense|stress|angoisse|urgent|intense/.test(text)) tone = "nervous and urgent";
  if (/joy|heureux|fun|drôle|comique/.test(text)) tone = "playful and light";
  if (/triste|melan|sad/.test(text)) tone = "melancholic and reflective";

  // Adresse de parole
  const addressesCamera = /(cam(éra)?|camera|vlog|regarde la cam|parle à la caméra)/.test(text);
  const addressing = addressesCamera ? "addresses the camera directly" : "interacts with another character off screen";

  // Actions simples
  let action = "the character moves and narrates the moment";
  if (/walk|marche/.test(en)) action = "the character walks towards the camera";
  if (/run|course|court/.test(en)) action = "the character runs past the camera";
  if (/enter|entre|rentre/.test(text)) action = "the character enters the location while filming";
  if (/drive|voiture|car|conduit/.test(text)) action = "the character drives and talks to the camera";

  return {
    subject,
    environment,
    rainy,
    night,
    morning,
    camera,
    lighting,
    style,
    tone,
    addressing,
    action,
    ideaEN: en,
    ideaFR: raw,
  };
}

// “FR -> EN” simple pour MVP
function roughEN(s) {
  const map = [
    [/pluie/gi, "rain"],
    [/nuit/gi, "night"],
    [/forêt/gi, "forest"],
    [/plage|mer/gi, "beach"],
    [/fast-?food/gi, "fast-food"],
    [/vlog/gi, "vlog"],
    [/marche(r)?/gi, "walks"],
    [/court|course/gi, "runs"],
    [/cam(éra)?/gi, "camera"],
    [/parle/gi, "speaks"],
    [/objectif/gi, "lens"],
    [/chambre/gi, "bedroom"],
    [/voiture/gi, "car"],
    [/ado/gi, "teenager"],
    [/homme/gi, "man"],
    [/femme/gi, "woman"],
    [/entre|rentre/gi, "enters"],
  ];
  let out = s;
  map.forEach(([re, en]) => (out = out.replace(re, en)));
  return out;
}

// Construit un paragraphe “Scene:” développé, + sections et dialogues FR
function buildVEO3RichPrompt(ctx) {
  const header = "Ultra realistic cinematic chaotic vlog shot";

  // SCENE — paragraphe riche (en anglais)
  const bits = [];
  // extérieur ville
  if (ctx.environment.includes("urban") || ctx.environment === "urban street") {
    bits.push(
      `A ${ctx.subject} walks through a city street ${ctx.night ? "at night" : "in the open air"}, holding a small camera close to the face`,
      `rain beads on the lens and the pavement shimmers` // visuels propres au vlog
    );
  }
  if (ctx.environment.includes("fast-food")) {
    bits.push(
      `neon signs glow above a fast food counter`,
      `the camera follows as the ${ctx.subject} enters, then swings back to face the lens while speaking`
    );
  }
  if (ctx.environment.includes("bedroom")) {
    bits.push(
      `a small bedroom lit by practical lights`,
      `the ${ctx.subject} sits on the edge of a bed and speaks directly to the lens`
    );
  }
  if (ctx.environment.includes("forest")) {
    bits.push(
      `a narrow forest path with damp leaves underfoot`,
      `the ${ctx.subject} moves forward, breathing visible in the cool air`
    );
  }
  if (ctx.environment.includes("beach")) {
    bits.push(
      `a windy beach with foamy waves`,
      `the ${ctx.subject} films while walking along the shoreline`
    );
  }
  // défaut si pas assez décrit
  if (bits.length < 2) {
    bits.push(
      `the ${ctx.subject} films a chaotic vlog while moving`,
      `they ${ctx.addressing.includes("camera") ? "speak to the camera" : "react to someone off screen"}`
    );
  }

  const sceneParagraph =
    `Scene:\n` +
    `${capitalize(joinSentences(bits))}.\n`;

  // Sections standard
  const style = `Style:\n${ctx.style}.`;
  const camera = `Camera:\n${ctx.camera}${ctx.addressing.includes("camera") ? ", frequent eye contact with the lens" : ""}.`;
  const lighting = `Lighting:\n${ctx.lighting}.`;
  const environment = `Environment:\n${ctx.environment}${ctx.rainy ? ", puddles and reflections" : ""}.`;
  const tone = `Tone:\n${ctx.tone}.`;

  // Important (rappels + action claire + destinataire)
  const important = [
    "Important:",
    `- Clearly describe the action (e.g., "the character walks towards the camera"): ${ctx.action}`,
    `- Specify who the character addresses: ${ctx.addressing}`,
    `- Describe the ambience (night, fast-food, bedroom, rain, etc.)`,
    `- No exclamation marks and no question marks`,
  ].join("\n");

  // Dialogues FR (générés à partir de l’idée, neutres, sans ! ni ?)
  const dialogues = buildFrenchDialog(ctx);

  return [
    header,
    "",
    sceneParagraph,
    style,
    "",
    camera,
    "",
    lighting,
    "",
    environment,
    "",
    tone,
    "",
    important,
    "",
    `Dialogue (in French):\n${dialogues}`
  ].join("\n");
}

function buildFrenchDialog(ctx) {
  // Mini générateur de répliques FR “naturelles”, sans ! ni ?
  const lines = [];
  if (ctx.night && ctx.rainy) {
    lines.push("(il parle vers la caméra, souffle court)", "J avance sous la pluie", "Je voulais juste garder une trace de ce moment");
  } else if (ctx.night) {
    lines.push("(regard caméra)", "La ville est calme ce soir", "On dirait que tout tourne au ralenti");
  } else if (ctx.morning) {
    lines.push("(voix basse)", "Le matin a une odeur particulière", "Je crois que ça me donne du courage");
  } else {
    lines.push("(ton posé)", "Je filme pour ne pas oublier", "Ça m aide à clarifier les idées");
  }

  if (ctx.environment.includes("fast-food")) {
    lines.push("(regarde le menu)", "Je vais prendre quelque chose de simple", "Et je repars");
  }
  if (ctx.environment.includes("bedroom")) {
    lines.push("(assis sur le lit)", "Ici je me sens à l abri", "Je parle comme si je parlais à un ami");
  }
  if (ctx.environment.includes("forest")) {
    lines.push("(il écoute un instant)", "La forêt étouffe les bruits de la ville", "Ça me calme");
  }
  if (ctx.environment.includes("beach")) {
    lines.push("(il observe l horizon)", "Le vent porte l odeur du sel", "Je respire et je continue");
  }

  // Nettoyage: pas de ! ni ? et pas de ponctuation forte
  return lines.map(l => l.replace(/[!?]/g, "")).map(l => `- ${l}`).join("\n");
}

/* ---------------- Utils ---------------- */
function joinSentences(parts) {
  return parts
    .map(p => p.trim().replace(/[!?]/g, ""))
    .filter(Boolean)
    .join(", ")
    .replace(/\s+,/g, ",");
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------------- Sora2 (placeholder à définir) ---------------- */
function Sora2Placeholder() {
  return (
    <div className="rounded border p-4 bg-white">
      <p className="text-sm text-gray-600">
        Spécialisation <strong>Sora2</strong> — dis-moi le format exact voulu, je reproduis la même génération riche.
      </p>
    </div>
  );
}
