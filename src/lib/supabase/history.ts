import { getBrowserSupabase } from "./browser-client";

export type HistoryKind = "prompt" | "image" | "video";

/**
 * Enregistre une entrée d'historique liée à l'utilisateur connecté.
 * @example await saveHistory({ kind: "prompt", input, output, model: "veo3" })
 */
export async function saveHistory({
  kind,
  input,
  output,
  model,
}: {
  kind: HistoryKind;
  input?: string;
  output?: string;
  model?: string;
}) {
  const supabase = getBrowserSupabase();

  // Vérifie que l'utilisateur est connecté
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) return console.warn("⏭️ Aucun utilisateur connecté, historique non sauvegardé.");

  const { error } = await supabase.from("history").insert({
    user_id: user.id,
    kind,
    input: input ?? null,
    output: output ?? null,
    model: model ?? null,
  });

  if (error) console.error("❌ Erreur d'enregistrement historique:", error);
  else console.log("✅ Enregistré dans Supabase:", kind, model);
}

/**
 * Liste les entrées d'historique de l'utilisateur connecté.
 * @param kind Filtre optionnel (prompt, image, video)
 * @param limit Nombre maximum de lignes
 */
export async function listHistory({
  kind,
  limit = 20,
}: {
  kind?: HistoryKind;
  limit?: number;
}) {
  const supabase = getBrowserSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (kind) query = query.eq("kind", kind);

  const { data, error } = await query;
  if (error) {
    console.error("Erreur listHistory:", error);
    return [];
  }

  return data ?? [];
}
