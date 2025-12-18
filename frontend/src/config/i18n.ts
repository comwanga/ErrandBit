/**
 * i18next Configuration
 * Multi-language support with automatic language detection
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import translation files
import enTranslations from '../locales/en/translation.json';
import esTranslations from '../locales/es/translation.json';

i18n
  // Load translations from HTTP (for lazy loading)
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Fallback language
    fallbackLng: 'en',
    
    // Supported languages
    supportedLngs: ['en', 'es', 'fr', 'de', 'zh', 'ja'],
    
    // Debug mode (disable in production)
    debug: import.meta.env.DEV,

    // Inline translations (can be moved to separate files)
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
    },

    // Backend configuration for lazy loading
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Detection order and caches
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
    },

    // React specific options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      formatSeparator: ',',
    },

    // Namespace options
    ns: ['translation'],
    defaultNS: 'translation',

    // Keep translations in memory
    load: 'languageOnly', // Load 'en' instead of 'en-US'
    
    // Preload languages
    preload: ['en'],

    // Key separator
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;
