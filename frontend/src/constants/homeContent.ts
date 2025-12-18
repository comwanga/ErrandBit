/**
 * Home Page Content Constants
 * Centralized content for the home page
 */

export interface PrivacyFeature {
  icon: string;
  text: string;
}

export interface Feature {
  id: string;
  icon: 'lightning' | 'lock' | 'globe';
  title: string;
  description: string;
}

/**
 * Privacy banner features
 */
export const PRIVACY_FEATURES: PrivacyFeature[] = [
  { icon: 'check', text: 'No KYC' },
  { icon: 'check', text: 'Pseudonymous' },
  { icon: 'check', text: 'Lightning Only' },
];

/**
 * Main feature cards
 */
export const MAIN_FEATURES: Feature[] = [
  {
    id: 'instant-settlement',
    icon: 'lightning',
    title: 'Instant Settlement',
    description: 'Lightning payments settle instantly. No waiting for ACH or platform holds.',
  },
  {
    id: 'privacy-first',
    icon: 'lock',
    title: 'Privacy-First',
    description: 'No ID verification. No KYC. Fully pseudonymous profiles. Your data stays yours.',
  },
  {
    id: 'global-local',
    icon: 'globe',
    title: 'Global & Local',
    description: 'Bitcoin works everywhere. Your reputation travels with you.',
  },
];

/**
 * Hero section content
 */
export const HERO_CONTENT = {
  title: 'Welcome to ErrandBit',
  subtitle: 'Privacy-first local services marketplace',
  tagline: 'Powered by Bitcoin Lightning • Built for Communities',
  banner: {
    title: 'Non-KYC Marketplace',
    subtitle: 'Your privacy matters.',
    description:
      'No ID verification, no real names, no surveillance. Just pseudonymous profiles, Lightning payments, and reputation-based trust.',
  },
};
