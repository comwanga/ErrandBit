/**
 * Fedi Detection Utilities
 * Utilities for detecting Fedi wallet context
 */

/**
 * Check if app is running in Fedi wallet context
 */
export const detectFediContext = (): {
  isFedi: boolean;
  communityId: string | null;
} => {
  const urlParams = new URLSearchParams(window.location.search);
  const fediParam = urlParams.get('fedi');
  const communityParam = urlParams.get('community');

  const isFedi =
    !!fediParam ||
    !!communityParam ||
    window.location.hostname.includes('fedi') ||
    document.referrer.includes('fedi') ||
    !!document.querySelector('meta[name="fedi-miniapp"]');

  return {
    isFedi,
    communityId: communityParam,
  };
};

/**
 * Setup Fedi-specific viewport settings
 */
export const setupFediViewport = (): void => {
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  }

  const fediMeta = document.createElement('meta');
  fediMeta.name = 'fedi-miniapp';
  fediMeta.content = 'true';
  document.head.appendChild(fediMeta);
};

/**
 * Notify Fedi wallet that miniapp is ready
 */
export const notifyFediReady = (appName: string = 'errandbit'): void => {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'FEDI_MINIAPP_READY', app: appName }, '*');
  }
};

/**
 * Save community ID to localStorage
 */
export const saveFediCommunity = (communityId: string): void => {
  localStorage.setItem('fedi_community', communityId);
};

/**
 * Get saved community ID from localStorage
 */
export const getSavedFediCommunity = (): string | null => {
  return localStorage.getItem('fedi_community');
};
