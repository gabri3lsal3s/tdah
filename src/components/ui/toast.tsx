import { useState, useCallback } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
let counter = 0;

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

export function toast(message: string, type: "success" | "error" = "success") {
  const id = ++counter;
  toasts = [...toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function useToasts() {
  const [items, setItems] = useState<Toast[]>([]);
  const register = useCallback((fn: (t: Toast[]) => void) => {
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  }, []);
  return { items, register, setItems };
}

export function Toaster() {
  const { items, register, setItems } = useToasts();
  useState(() => { register(setItems); });
  if (!items.length) return null;
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2 ${
            t.type === "success"
              ? "bg-green-500/90 text-white"
              : "bg-destructive/90 text-destructive-foreground"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
