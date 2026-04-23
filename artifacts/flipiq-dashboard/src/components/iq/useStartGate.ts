import { useEffect, useState } from "react";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useStartGate(key: string) {
  const storageKey = `iqStarted:${key}`;
  const today = todayStr();

  const [started, setStarted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (window.location.search.includes("start=1")) return true;
    return localStorage.getItem(storageKey) === today;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.search.includes("start=1")) {
      setStarted(true);
      return;
    }
    setStarted(localStorage.getItem(storageKey) === today);
  }, [storageKey, today]);

  function start() {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, today);
    }
    setStarted(true);
  }

  return { started, start };
}
