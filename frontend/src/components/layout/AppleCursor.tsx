import React, { useEffect } from 'react';

/**
 * Tracks mouse position for glossy card/icon sheen effects
 * while keeping the default system arrow cursor clean with no trailing circles.
 */
export const AppleCursor: React.FC = () => {
  useEffect(() => {
    // Check if device is touch-primary
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Update CSS variables --mouse-x and --mouse-y on hovered glossy cards/icons/rows
      const glossyParent = target.closest(
        '[data-apple-cursor], .apple-gloss-card, .apple-gloss-icon, .apple-gloss-row, .apple-gloss-label, .group'
      ) as HTMLElement | null;

      if (glossyParent) {
        const rect = glossyParent.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        const pctX = ((relX / rect.width) * 100).toFixed(1);
        const pctY = ((relY / rect.height) * 100).toFixed(1);

        glossyParent.style.setProperty('--mouse-x', `${relX}px`);
        glossyParent.style.setProperty('--mouse-y', `${relY}px`);
        glossyParent.style.setProperty('--mouse-pct-x', `${pctX}%`);
        glossyParent.style.setProperty('--mouse-pct-y', `${pctY}%`);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Removed the circular cursor follower/dot so only the clean system arrow cursor is shown
  return null;
};
