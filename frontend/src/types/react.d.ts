/**
 * Type augmentation to fix React 18/19 compatibility with Lucide icons
 * This resolves the ForwardRefExoticComponent type issues with bigint in ReactNode
 */

import 'react';

declare module 'react' {
  // Extend ReactNode to include bigint for compatibility with newer React types
  type ReactNode =
    | React.ReactElement
    | string
    | number
    | bigint  // Add bigint support
    | boolean
    | null
    | undefined
    | Iterable<ReactNode>
    | React.ReactPortal;
}
