import { useEffect, useState } from "react";

export const ACTION_KEYS = ["call", "text", "email", "notes"] as const;
export type ActionKey = (typeof ACTION_KEYS)[number];
export type ChecklistState = Record<ActionKey, boolean>;

const EMPTY: ChecklistState = { call: false, text: false, email: false, notes: false };

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function keyFor(propertyId: number): string {
  return `iqRowActions:${propertyId}:${todayStr()}`;
}

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

function readState(propertyId: number): ChecklistState {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(keyFor(propertyId));
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...EMPTY };
}

function writeState(propertyId: number, state: ChecklistState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(propertyId), JSON.stringify(state));
  notify();
}

export function isPropertyComplete(propertyId: number): boolean {
  const s = readState(propertyId);
  return ACTION_KEYS.every((k) => s[k]);
}

/** Mark every action done (or undo) for a property in one shot. */
export function setPropertyComplete(propertyId: number, complete: boolean) {
  const next: ChecklistState = {
    call: complete,
    text: complete,
    email: complete,
    notes: complete,
  };
  writeState(propertyId, next);
}

export function useDailyChecklist(propertyId: number) {
  const [state, setState] = useState<ChecklistState>(() => readState(propertyId));

  useEffect(() => {
    setState(readState(propertyId));
    const listener = () => setState(readState(propertyId));
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [propertyId]);

  function toggle(k: ActionKey) {
    const next = { ...state, [k]: !state[k] };
    writeState(propertyId, next);
    setState(next);
  }

  const allDone = ACTION_KEYS.every((k) => state[k]);
  return { done: state, toggle, allDone };
}

/** Subscribe component to checklist changes. Returns a stable counter that bumps on each toggle. */
export function useChecklistVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const listener = () => setVersion((v) => v + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return version;
}
