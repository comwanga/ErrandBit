import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrivacyBanner } from '../PrivacyBanner';
import { PRIVACY_FEATURES } from '../../constants/homeContent';

describe('PrivacyBanner component', () => {
  it('should render the main heading', () => {
    render(<PrivacyBanner />);

    expect(screen.getByText('Non-KYC Marketplace')).toBeInTheDocument();
  });

  it('should render all privacy features', () => {
    render(<PrivacyBanner />);

    PRIVACY_FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.text)).toBeInTheDocument();
    });
  });

  it('should render correct number of check icons and features', () => {
    const { container } = render(<PrivacyBanner />);
    
    const svgs = container.querySelectorAll('svg');
    // Should have at least one icon per privacy feature (plus the lock icon)
    expect(svgs.length).toBeGreaterThanOrEqual(PRIVACY_FEATURES.length);
  });

  it('should have proper styling structure', () => {
    const { container } = render(<PrivacyBanner />);

    // Check for background styling
    const banner = container.querySelector('.bg-gradient-to-r');
    expect(banner).toBeTruthy();

    // Check for rounded corners
    const roundedElement = container.querySelector('.rounded-lg');
    expect(roundedElement).toBeTruthy();
  });

  it('should render features in a grid', () => {
    const { container } = render(<PrivacyBanner />);

    const features = container.querySelectorAll('.grid > div');
    expect(features.length).toBe(PRIVACY_FEATURES.length);
  });

  it('should render heading with proper styling', () => {
    render(<PrivacyBanner />);

    const heading = screen.getByText('Non-KYC Marketplace');
    expect(heading.tagName).toBe('H3');
    expect(heading.className).toContain('font-bold');
  });

  it('should display features with check icons', () => {
    const { container } = render(<PrivacyBanner />);

    const features = container.querySelectorAll('.grid > div');
    features.forEach((feature) => {
      // Each feature should have an SVG icon
      const svg = feature.querySelector('svg');
      expect(svg).toBeTruthy();

      // Each feature should have text
      const text = feature.textContent;
      expect(text).toBeTruthy();
      expect(text?.length).toBeGreaterThan(0);
    });
  });

  it('should have responsive design classes', () => {
    const { container } = render(<PrivacyBanner />);

    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toContain('p-');
  });

  it('should match snapshot', () => {
    const { container } = render(<PrivacyBanner />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
