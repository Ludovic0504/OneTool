import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PromptContext = createContext();

// charge + migre v1 -> v2
function load() {
  try {
    const v2 = localStorage.getItem("history_v2");
    if (v2) return JSON.parse(v2);

    const v1 = localStorage.getItem("prompt_history_v1");
    if (v1) {
      const itemsV1 = JSON.parse(v1);
      // migration: on ajoute kind: "prompt"
      return itemsV1.map(i => ({ ...i, kind: "prompt" }));
    }
  } catch {}
  return [];
}

export function PromptProvider({ children }) {
  const [items, setItems] = useState(load); // items globaux (toutes pages)
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    localStorage.setItem("history_v2", JSON.stringify(items));
  }, [items]);

  const selected = useMemo(
    () => items.find(i => i.id === selectedId) || null,
    [items, selectedId]
  );

  const addItem = ({ kind, input, output, model = "gpt-4o-mini" }) => {
    const id = crypto.randomUUID?.() || String(Date.now());
    const createdAt = new Date().toISOString();
    const item = { id, kind, input, output, model, createdAt, pinned: false };
    setItems(prev => [item, ...prev]);
    setSelectedId(id);
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const togglePin = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i));
  const clearAll = (kind) =>
    setItems(prev => prev.filter(i => i.pinned || (kind ? i.kind !== kind : true)));

  const getByKind = (kind) => items.filter(i => i.kind === kind);

  return (
    <PromptContext.Provider
      value={{ items, selected, selectedId, setSelectedId, addItem, removeItem, togglePin, clearAll, getByKind }}
    >
      {children}
    </PromptContext.Provider>
  );
}

export const usePromptCtx = () => useContext(PromptContext);
