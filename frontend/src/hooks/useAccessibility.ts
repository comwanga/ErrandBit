// @ts-nocheck
import { useEffect, useRef } from 'react';
import { FocusTrap, liveAnnouncer } from '../utils/accessibility';

/**
 * Custom hook for managing focus trap in modals/dialogs
 * 
 * Usage:
 * ```tsx
 * function Modal({ isOpen }) {
 *   const modalRef = useFocusTrap(isOpen);
 *   return <div ref={modalRef}>...</div>;
 * }
 * ```
 */
export function useFocusTrap(isActive: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (isActive) {
      focusTrapRef.current = new FocusTrap(ref.current);
      focusTrapRef.current.activate();
    }

    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
        focusTrapRef.current = null;
      }
    };
  }, [isActive]);

  return ref;
}

/**
 * Custom hook for announcing content changes to screen readers
 * 
 * Usage:
 * ```tsx
 * function SearchResults({ results }) {
 *   const announce = useLiveAnnounce();
 *   
 *   useEffect(() => {
 *     announce(`Found ${results.length} results`);
 *   }, [results]);
 * }
 * ```
 */
export function useLiveAnnounce() {
  return (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    liveAnnouncer.announce(message, priority);
  };
}

/**
 * Custom hook for keyboard navigation in lists
 * 
 * Usage:
 * ```tsx
 * function Menu({ items }) {
 *   const { containerRef, handleKeyDown } = useKeyboardNav(items.length);
 *   
 *   return (
 *     <ul ref={containerRef} onKeyDown={handleKeyDown}>
 *       {items.map(item => <li key={item.id}>{item.name}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useKeyboardNav(itemCount: number, orientation: 'horizontal' | 'vertical' = 'vertical') {
  const containerRef = useRef<HTMLElement>(null);
  const currentIndexRef = useRef(0);

  const focusItem = (index: number) => {
    if (!containerRef.current) return;
    
    const items = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('[role="menuitem"], [role="option"], button, a')
    );
    
    if (items[index]) {
      items[index].focus();
      currentIndexRef.current = index;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { key } = e;
    const isVertical = orientation === 'vertical';
    let handled = false;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        if ((isVertical && key === 'ArrowDown') || (!isVertical && key === 'ArrowRight')) {
          focusItem((currentIndexRef.current + 1) % itemCount);
          handled = true;
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        if ((isVertical && key === 'ArrowUp') || (!isVertical && key === 'ArrowLeft')) {
          focusItem((currentIndexRef.current - 1 + itemCount) % itemCount);
          handled = true;
        }
        break;

      case 'Home':
        focusItem(0);
        handled = true;
        break;

      case 'End':
        focusItem(itemCount - 1);
        handled = true;
        break;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return { containerRef, handleKeyDown };
}

/**
 * Custom hook for managing document title (important for screen readers)
 * 
 * Usage:
 * ```tsx
 * function JobDetailsPage() {
 *   useDocumentTitle('Job Details - ErrandBit');
 * }
 * ```
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

/**
 * Custom hook for auto-focusing an element on mount
 * 
 * Usage:
 * ```tsx
 * function Dialog() {
 *   const inputRef = useAutoFocus<HTMLInputElement>();
 *   return <input ref={inputRef} />;
 * }
 * ```
 */
export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}

/**
 * Custom hook for detecting escape key press
 * 
 * Usage:
 * ```tsx
 * function Modal({ onClose }) {
 *   useEscapeKey(onClose);
 * }
 * ```
 */
export function useEscapeKey(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}

/**
 * Custom hook for managing ARIA attributes
 * 
 * Usage:
 * ```tsx
 * function Accordion() {
 *   const [expanded, setExpanded] = useState(false);
 *   const buttonRef = useAriaExpanded(expanded);
 *   
 *   return <button ref={buttonRef} onClick={() => setExpanded(!expanded)}>Toggle</button>;
 * }
 * ```
 */
export function useAriaExpanded(expanded: boolean) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('aria-expanded', String(expanded));
    }
  }, [expanded]);

  return ref;
}

/**
 * Custom hook to detect if user prefers reduced motion
 * 
 * Usage:
 * ```tsx
 * function AnimatedComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *   
 *   return (
 *     <motion.div
 *       animate={prefersReducedMotion ? {} : { x: 100 }}
 *     />
 *   );
 * }
 * ```
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}
