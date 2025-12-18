/**
 * useFediDetection Hook
 * Custom React hook for detecting and managing Fedi wallet context
 */

import { useState, useEffect } from 'react';
import {
  detectFediContext,
  setupFediViewport,
  notifyFediReady,
  saveFediCommunity,
} from '../utils/fediDetection';

interface FediContextState {
  isFediContext: boolean;
  communityId: string | null;
}

interface FediMessageEvent {
  type: string;
  theme?: string;
  communityId?: string;
}

export const useFediDetection = (appName: string = 'errandbit'): FediContextState => {
  const [state, setState] = useState<FediContextState>(() => {
    // Detect Fedi context on initialization
    const { isFedi, communityId } = detectFediContext();
    return {
      isFediContext: isFedi,
      communityId,
    };
  });

  useEffect(() => {
    if (state.isFediContext) {
      // Setup Fedi-specific settings
      setupFediViewport();

      // Save community ID if present
      if (state.communityId) {
        saveFediCommunity(state.communityId);
      }

      // Notify Fedi wallet that miniapp is ready
      notifyFediReady(appName);
    }

    // Listen for messages from Fedi wallet
    const handleMessage = (event: MessageEvent<FediMessageEvent>) => {
      if (event.data.type === 'FEDI_THEME') {
        // Handle theme changes from Fedi
        document.documentElement.setAttribute('data-theme', event.data.theme || 'light');
      } else if (event.data.type === 'FEDI_COMMUNITY_UPDATE' && event.data.communityId) {
        setState((prev) => ({
          ...prev,
          communityId: event.data.communityId || null,
        }));
        saveFediCommunity(event.data.communityId);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [appName]);

  return state;
};
