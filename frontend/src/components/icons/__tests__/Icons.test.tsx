import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LockIcon, CheckIcon, LightningIcon, GlobeIcon } from '../Icons';

describe('Icon components', () => {
  describe('LockIcon', () => {
    it('should render with default className', () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('class')).toContain('w-6 h-6');
    });

    it('should render with custom className', () => {
      const { container } = render(<LockIcon className="w-8 h-8 text-blue-500" />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('class')).toContain('w-8 h-8 text-blue-500');
    });

    it('should have correct viewBox', () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('should have proper SVG attributes', () => {
      const { container } = render(<LockIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('fill')).toBe('none');
      expect(svg?.getAttribute('stroke')).toBe('currentColor');
    });
  });

  describe('CheckIcon', () => {
    it('should render with default className', () => {
      const { container } = render(<CheckIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('class')).toContain('w-3 h-3');
    });

    it('should render with custom className', () => {
      const { container } = render(<CheckIcon className="w-10 h-10" />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('class')).toContain('w-10 h-10');
    });

    it('should have correct viewBox', () => {
      const { container } = render(<CheckIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('viewBox')).toBe('0 0 20 20');
    });
  });

  describe('LightningIcon', () => {
    it('should render with default className', () => {
      const { container } = render(<LightningIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('class')).toContain('w-6 h-6');
    });

    it('should render with custom className', () => {
      const { container } = render(<LightningIcon className="custom-class" />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('class')).toContain('custom-class');
    });

    it('should have correct viewBox', () => {
      const { container } = render(<LightningIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });
  });

  describe('GlobeIcon', () => {
    it('should render with default className', () => {
      const { container } = render(<GlobeIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('class')).toContain('w-6 h-6');
    });

    it('should render with custom className', () => {
      const { container } = render(<GlobeIcon className="text-red-500" />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('class')).toContain('text-red-500');
    });

    it('should have correct viewBox', () => {
      const { container } = render(<GlobeIcon />);
      const svg = container.querySelector('svg');
      
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });
  });
});
