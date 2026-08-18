"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import type { LiveEvent } from "@/lib/live-events";

type Listener = (event: LiveEvent) => void;

const LiveEventsContext = createContext<{
  subscribe: (listener: Listener) => () => void;
} | null>(null);

export function LiveEventsProvider({ children }: { children: ReactNode }) {
  const listeners = useRef(new Set<Listener>());

  useEffect(() => {
    const es = new EventSource("/api/events");

    es.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data) as LiveEvent;
        listeners.current.forEach((fn) => fn(event));
      } catch {
        /* ignore malformed frames */
      }
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        window.location.href = "/auth";
      }
    };

    return () => es.close();
  }, []);

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  return (
    <LiveEventsContext.Provider value={{ subscribe }}>
      {children}
    </LiveEventsContext.Provider>
  );
}

export function useLiveEvent(handler: Listener) {
  const ctx = useContext(LiveEventsContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!ctx) return;
    return ctx.subscribe((event) => handlerRef.current(event));
  }, [ctx]);
}
