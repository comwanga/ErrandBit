import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFediDetection } from '../useFediDetection';

describe('useFediDetection hook', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();

    // Reset location with proper hostname
    delete (window as any).location;
    (window as any).location = { search: '', hostname: 'localhost' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect Fedi context from URL parameters', () => {
    (window as any).location = { search: '?fedi=true&community=test-123', hostname: 'localhost' };

    const { result } = renderHook(() => useFediDetection());

    expect(result.current.isFediContext).toBe(true);
    expect(result.current.communityId).toBe('test-123');
  });

  it('should return false when not in Fedi context', () => {
    // Clear any existing fedi-miniapp meta tags
    document.querySelectorAll('meta[name="fedi-miniapp"]').forEach((el) => el.remove());
    (window as any).location = { search: '', hostname: 'localhost' };

    const { result } = renderHook(() => useFediDetection());

    expect(result.current.isFediContext).toBe(false);
    expect(result.current.communityId).toBeNull();
  });

  it('should handle FEDI_COMMUNITY_UPDATE message from parent', async () => {
    (window as any).location = { search: '?fedi=true', hostname: 'localhost' };

    const { result } = renderHook(() => useFediDetection());

    expect(result.current.communityId).toBeNull();

    // Simulate message from parent - note the correct message type
    act(() => {
      const messageEvent = new MessageEvent('message', {
        data: { type: 'FEDI_COMMUNITY_UPDATE', communityId: 'new-community-456' },
        origin: window.location.origin,
      });
      window.dispatchEvent(messageEvent);
    });

    await waitFor(() => {
      expect(result.current.communityId).toBe('new-community-456');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('fedi_community', 'new-community-456');
  });

  it('should handle community ID from URL', () => {
    (window as any).location = { search: '?fedi=true&community=saved-community-789', hostname: 'localhost' };

    const { result } = renderHook(() => useFediDetection());

    expect(result.current.isFediContext).toBe(true);
    expect(result.current.communityId).toBe('saved-community-789');
  });

  it('should set up viewport when in Fedi context', () => {
    document.querySelectorAll('meta[name="fedi-miniapp"]').forEach((el) => el.remove());
    (window as any).location = { search: '?fedi=true', hostname: 'localhost' };

    renderHook(() => useFediDetection());

    const fediMeta = document.querySelector('meta[name="fedi-miniapp"]');
    expect(fediMeta).toBeTruthy();
  });

  it('should notify parent when ready', () => {
    const postMessageSpy = vi.fn();
    window.parent = { postMessage: postMessageSpy } as any;
    (window as any).location = { search: '?fedi=true', hostname: 'localhost' };

    renderHook(() => useFediDetection());

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: 'FEDI_MINIAPP_READY', app: 'errandbit' },
      '*'
    );
  });

  it('should ignore messages with wrong type', async () => {
    (window as any).location = { search: '?fedi=true&community=original-123', hostname: 'localhost' };

    const { result } = renderHook(() => useFediDetection());

    expect(result.current.communityId).toBe('original-123');

    // Simulate message with wrong type
    act(() => {
      const messageEvent = new MessageEvent('message', {
        data: { type: 'WRONG_TYPE', communityId: 'should-not-update' },
        origin: window.location.origin,
      });
      window.dispatchEvent(messageEvent);
    });

    // Community ID should not change
    expect(result.current.communityId).toBe('original-123');
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    (window as any).location = { search: '?fedi=true', hostname: 'localhost' };

    const { unmount } = renderHook(() => useFediDetection());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    );
  });
});
