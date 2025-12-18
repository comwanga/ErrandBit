// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from '../FeatureCard';

describe('FeatureCard component', () => {
  it('should render with lightning icon', () => {
    render(
      <FeatureCard
        icon="lightning"
        title="Bitcoin Lightning"
        description="Fast and cheap transactions"
      />
    );

    expect(screen.getByText('Bitcoin Lightning')).toBeInTheDocument();
    expect(screen.getByText('Fast and cheap transactions')).toBeInTheDocument();
  });

  it('should render with lock icon', () => {
    render(
      <FeatureCard
        icon="lock"
        title="Private & Secure"
        description="Your data is encrypted"
      />
    );

    expect(screen.getByText('Private & Secure')).toBeInTheDocument();
    expect(screen.getByText('Your data is encrypted')).toBeInTheDocument();
  });

  it('should render with globe icon', () => {
    render(
      <FeatureCard
        icon="globe"
        title="Global Network"
        description="Connect worldwide"
      />
    );

    expect(screen.getByText('Global Network')).toBeInTheDocument();
    expect(screen.getByText('Connect worldwide')).toBeInTheDocument();
  });

  it('should have proper styling structure', () => {
    const { container } = render(
      <FeatureCard
        icon="lightning"
        title="Test Title"
        description="Test Description"
      />
    );

    // Check for feature card container with proper styling
    const card = container.querySelector('.bg-white');
    expect(card).toBeTruthy();

    // Check for icon container
    const iconContainer = container.querySelector('.w-12.h-12');
    expect(iconContainer).toBeTruthy();
  });

  it('should render title with correct styling', () => {
    render(
      <FeatureCard
        icon="lightning"
        title="Feature Title"
        description="Feature Description"
      />
    );

    const title = screen.getByText('Feature Title');
    expect(title.tagName).toBe('H3');
    expect(title.className).toContain('font-semibold');
    expect(title.className).toContain('mb-2');
  });

  it('should render description with correct styling', () => {
    render(
      <FeatureCard
        icon="lock"
        title="Title"
        description="This is a description"
      />
    );

    const description = screen.getByText('This is a description');
    expect(description.tagName).toBe('P');
    expect(description.className).toContain('text-gray-600');
  });

  it('should handle long text content', () => {
    const longTitle = 'This is a very long title that might wrap to multiple lines';
    const longDescription = 'This is a very long description that definitely should wrap to multiple lines and test how the component handles extended text content';

    render(
      <FeatureCard
        icon="globe"
        title={longTitle}
        description={longDescription}
      />
    );

    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should render different icons for different props', () => {
    const { rerender, container } = render(
      <FeatureCard icon="lightning" title="Title 1" description="Desc 1" />
    );

    let svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    rerender(<FeatureCard icon="lock" title="Title 2" description="Desc 2" />);
    svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    rerender(<FeatureCard icon="globe" title="Title 3" description="Desc 3" />);
    svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
