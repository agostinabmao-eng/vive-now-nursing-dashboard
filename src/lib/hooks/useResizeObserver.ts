"use client";

import { useEffect, useState, type RefObject } from "react";

type Dimensions = { width: number; height: number };

export default function useResizeObserver(ref: RefObject<HTMLElement | null>): Dimensions | null {
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return dimensions;
}
