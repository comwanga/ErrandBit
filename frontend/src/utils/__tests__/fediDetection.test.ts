import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectFediContext,
  setupFediViewport,
  notifyFediReady,
  saveFediCommunity,
  getSavedFediCommunity,
} from '../fediDetection';

describe('fediDetection utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Reset location with proper hostname
    delete (window as any).location;
    (window as any).location = { search: '', hostname: 'localhost' };
  });

  describe('detectFediContext', () => {
    it('should detect Fedi context from URL parameters - using "community" param', () => {
      (window as any).location = { search: '?community=test-community-123', hostname: 'localhost' };

      const result = detectFediContext();

      expect(result.isFedi).toBe(true);
      expect(result.communityId).toBe('test-community-123');
    });

    it('should return false when no Fedi parameters present', () => {
      (window as any).location = { search: '', hostname: 'localhost' };

      const result = detectFediContext();

      expect(result.isFedi).toBe(false);
      expect(result.communityId).toBeNull();
    });

    it('should detect Fedi context with fedi parameter', () => {
      (window as any).location = { search: '?fedi=true', hostname: 'localhost' };

      const result = detectFediContext();

      expect(result.isFedi).toBe(true);
      expect(result.communityId).toBeNull();
    });

    it('should handle other URL parameters', () => {
      (window as any).location = { search: '?page=home&community=abc&lang=en', hostname: 'localhost' };

      const result = detectFediContext();

      expect(result.isFedi).toBe(true);
      expect(result.communityId).toBe('abc');
    });

    it('should detect Fedi from hostname', () => {
      (window as any).location = { search: '', hostname: 'fedi.app' };

      const result = detectFediContext();

      expect(result.isFedi).toBe(true);
    });
  });

  describe('setupFediViewport', () => {
    it('should modify existing viewport and add fedi-miniapp meta', () => {
      // Clear and add viewport tag
      document.querySelectorAll('meta[name="viewport"]').forEach((el) => el.remove());
      const existingMeta = document.createElement('meta');
      existingMeta.name = 'viewport';
      existingMeta.content = 'width=device-width';
      document.head.appendChild(existingMeta);

      setupFediViewport();

      const viewportMeta = document.querySelector('meta[name="viewport"]');
      expect(viewportMeta).toBeTruthy();
      expect(viewportMeta?.getAttribute('content')).toContain('user-scalable=no');

      const fediMeta = document.querySelector('meta[name="fedi-miniapp"]');
      expect(fediMeta).toBeTruthy();
      expect(fediMeta?.getAttribute('content')).toBe('true');
    });
  });

  describe('notifyFediReady', () => {
    it('should post message to parent window in Fedi context', () => {
      const postMessageSpy = vi.fn();
      window.parent = { postMessage: postMessageSpy } as any;

      notifyFediReady('errandbit');

      expect(postMessageSpy).toHaveBeenCalledWith(
        { type: 'FEDI_MINIAPP_READY', app: 'errandbit' },
        '*'
      );
    });

    it('should not post message if window.parent is same as window', () => {
      const postMessageSpy = vi.fn();
      window.parent = window;

      expect(() => notifyFediReady()).not.toThrow();
    });
  });

  describe('saveFediCommunity', () => {
    it('should save community ID to localStorage with correct key', () => {
      const communityId = 'test-community-456';

      saveFediCommunity(communityId);

      expect(localStorage.setItem).toHaveBeenCalledWith('fedi_community', communityId);
    });

    it('should handle empty community ID', () => {
      saveFediCommunity('');

      expect(localStorage.setItem).toHaveBeenCalledWith('fedi_community', '');
    });
  });

  describe('getSavedFediCommunity', () => {
    it('should retrieve saved community ID from localStorage', () => {
      const communityId = 'test-community-789';
      localStorage.setItem('fedi_community', communityId);
      (localStorage.getItem as any).mockReturnValue(communityId);

      const result = getSavedFediCommunity();

      expect(result).toBe(communityId);
      expect(localStorage.getItem).toHaveBeenCalledWith('fedi_community');
    });

    it('should return null when no community ID is saved', () => {
      (localStorage.getItem as any).mockReturnValue(null);

      const result = getSavedFediCommunity();

      expect(result).toBeNull();
    });
  });
});
