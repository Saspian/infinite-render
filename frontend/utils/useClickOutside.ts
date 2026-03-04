import { useEffect, RefObject } from "react";

type UseClickOutsideOptions = {
  enabled?: boolean;
  eventType?: "pointerdown" | "mousedown" | "click";
};

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: () => void,
  options?: UseClickOutsideOptions
) {
  const { enabled = true, eventType = "pointerdown" } = options || {};

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: Event) => {
      const target = event.target as Node;

      if (!ref.current || ref.current.contains(target)) return;

      callback();
    };

    document.addEventListener(eventType, handler);

    return () => {
      document.removeEventListener(eventType, handler);
    };
  }, [ref, callback, enabled, eventType]);
}