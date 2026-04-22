import { useEffect, useState } from "react";

export function useStartGate(key: string) {
  const storageKey = `iqStarted:${key}`;
  const [started, setStarted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(storageKey) === "1";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setStarted(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function start() {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "1");
    }
    setStarted(true);
  }

  return { started, start };
}
