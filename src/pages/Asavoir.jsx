import { useMemo, useState } from "react";

const TIPS = [
  { cat: "Création vidéo", title: "1. Ta vidéo doit accrocher dès les 3 premières secondes",
    text: "Les 3 premières secondes déterminent si ton viewer scrolle ou reste. Commence par une action, une émotion, une phrase choc — pas une intro plate." },
  { cat: "Réseaux sociaux", title: "2. Les algorithmes aiment les vidéos qui retiennent, pas celles qui buzzent",
    text: "Les plateformes priorisent la rétention. Si ton audience regarde jusqu’à la fin, l’algo testera ta vidéo sur plus de gens." },
  { cat: "Storytelling", title: "3. Chaque vidéo doit raconter une mini-histoire",
    text: "Structure simple : contexte → tension → résolution. Même pour un tuto ou un vlog, ton spectateur doit sentir une progression." },
  { cat: "Tournage", title: "4. La lumière fait 80 % du rendu",
    text: "Tournage en lumière naturelle = ton meilleur allié. Oriente-toi face à une fenêtre, ou ajoute une source latérale douce pour éviter les ombres dures." },
  { cat: "Montage", title: "5. Coupe tout ce qui ne sert pas ton propos",
    text: "Chaque seconde doit avoir une utilité. Si tu hésites à garder un plan, supprime-le. Le rythme compte plus que la durée." },
  { cat: "Croissance", title: "6. Mieux vaut 10 vidéos cohérentes qu’un buzz isolé",
    text: "L’algorithme détecte la constance et la cohérence de ton contenu. Crée un univers identifiable au lieu de courir après les tendances." },
  { cat: "Mindset", title: "7. Les gens ne veulent pas ton contenu, ils veulent ton énergie",
    text: "Ton authenticité crée la fidélité. Le ton, la vibe, les émotions font la différence entre un créateur et un copier-coller." },
];

/* ---- Tuile au style Bêta Lab ---- */
function Tile({ children, className = "" }) {
  return (
    <article
      className={
        "group rounded-2xl border border-white/10 bg-[#0b111a] p-5 " +
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] " +
        "hover:border-emerald-500/40 hover:shadow-[0_0_22px_#10b98125] " +
        "transition-colors duration-200 " +
        className
      }
    >
      {children}
    </article>
  );
}

export default function Asavoir() {
  const [filter, setFilter] = useState("Tout");
  const cats = useMemo(() => ["Tout", ...new Set(TIPS.map(t => t.cat))], []);
  const tips = useMemo(() => (filter === "Tout" ? TIPS : TIPS.filter(t => t.cat === filter)), [filter]);

  return (
    <main className="min-h-full relative text-gray-100">
      {/* fond global bleu identique au Lab */}
      <div className="absolute inset-0 -z-10 bg-[#0a0f14]" />

      {/* ✅ suppression du max-width pour occuper toute la largeur */}
      <div className="px-6 pb-12">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-emerald-300 drop-shadow-[0_0_3px_#10b98125]">
            À savoir
          </h2>
          <p className="mt-2 text-gray-400">
            Des conseils concrets pour mieux créer, mieux comprendre les plateformes
            et faire grandir ton contenu sans te perdre.
          </p>
        </header>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`shrink-0 rounded-full border px-3 py-1 text-sm transition
                ${
                  filter === c
                    ? "border-emerald-400 text-emerald-300 bg-[#0e1419]"
                    : "border-white/10 text-gray-300 bg-[#0e1419] hover:border-emerald-400 hover:text-emerald-300"
                }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ✅ cartes pleine largeur */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {tips.map((t, i) => (
            <Tile key={i}>
              <div className="text-[11px] uppercase tracking-wide text-emerald-400/90 mb-1">
                {t.cat}
              </div>
              <h3 className="text-white font-semibold transition">{t.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{t.text}</p>
            </Tile>
          ))}
        </div>

        <footer className="mt-10 text-center text-sm text-gray-500">
          ✦ Ces tips t’aident à progresser sans prise de tête. D’autres arrivent via Skool ↗︎
        </footer>
      </div>
    </main>
  );
}
