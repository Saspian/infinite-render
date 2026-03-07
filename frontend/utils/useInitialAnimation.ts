import { useState, useEffect } from "react";

type Options = {
  itemCount: number;
  perItemDelay?: number;   // ms between each item  (default: 150)
  duration?: number;       // ms for one animation  (default: 300)
};

export function useInitialAnimation(
  isReady: boolean,
  {
    itemCount,
    perItemDelay = 200,
    duration = 300,
  }: Options,
) {

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!isReady || animated) return;

    // Total time = last item's delay + one full animation duration
    const total = itemCount * perItemDelay + duration;

    const timer = setTimeout(() => {
      setAnimated(true);
    }, total);

    return () => clearTimeout(timer);
  }, [isReady]);

  // Helper to spread onto each list item — returns nothing once animated
  const getItemProps = (index: number) =>
    animated
      ? {}
      : {
          className: "animate-slide-up",
          style: { animationDelay: `${index * perItemDelay}ms` },
        };

  return { animated, getItemProps };
}