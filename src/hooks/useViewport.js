import { useState, useEffect } from "react";

// Breakpoints (px)
export const BP = { mobile: 720, tablet: 1024 };

/**
 * Tracks the viewport width and exposes responsive flags.
 *  • mobile  : < 720   (single column, drawer nav)
 *  • tablet  : 720–1023 (condensed multi-column)
 *  • desktop : ≥ 1024
 */
export function useViewport() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return {
    width,
    isMobile:  width < BP.mobile,
    isTablet:  width >= BP.mobile && width < BP.tablet,
    isDesktop: width >= BP.tablet,
  };
}
