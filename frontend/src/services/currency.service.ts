/**
 * Currency Service
 * Handles currency conversion and exchange rates
 * Uses CoinGecko API for real-time BTC rates
 * 
 * @module services/currency
 */

import { CURRENCY_CONFIG, STORAGE_KEYS } from '../config/app.config';

/**
 * Supported currencies
 */
export type Currency = 'USD' | 'KSH' | 'BTC';

/**
 * Exchange rates structure (BTC as base currency)
 */
export interface ExchangeRates {
  USD: number; // How many USD per 1 BTC
  KSH: number; // How many KSH per 1 BTC
  BTC: number; // Always 1 (base currency)
  timestamp: number;
}

/**
 * Currency metadata
 */
export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Currency information constants
 */
export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
  },
  KSH: {
    code: 'KSH',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    decimals: 2,
  },
  BTC: {
    code: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
  },
};

/**
 * Currency Service
 * Professional service for currency conversion and exchange rate management
 */
class CurrencyService {
  private rates: ExchangeRates | null = null;
  private lastFetch: number = 0;

  /**
   * Load cached rates from localStorage
   * 
   * @returns Cached rates or null if not found/invalid
   */
  private loadCachedRates(): ExchangeRates | null {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
      if (!cached) return null;

      const rates = JSON.parse(cached) as ExchangeRates;
      
      // Validate cached data structure
      if (!rates.timestamp || !rates.USD || !rates.KSH || !rates.BTC) {
        return null;
      }

      // Check if cache is still valid
      const now = Date.now();
      if (now - rates.timestamp > CURRENCY_CONFIG.CACHE_DURATION_MS) {
        return null;
      }

      return rates;
    } catch (error) {
      console.error('Failed to load cached rates:', error);
      return null;
    }
  }

  /**
   * Save rates to localStorage
   * 
   * @param rates - Exchange rates to cache
   */
  private saveCachedRates(rates: ExchangeRates): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATES, JSON.stringify(rates));
    } catch (error) {
      console.error('Failed to save cached rates:', error);
    }
  }

  /**
   * Create fallback rates when API is unavailable
   * 
   * @returns Default exchange rates
   */
  private createFallbackRates(): ExchangeRates {
    return {
      BTC: 1,
      USD: CURRENCY_CONFIG.FALLBACK_BTC_TO_USD,
      KSH: CURRENCY_CONFIG.FALLBACK_BTC_TO_KSH,
      timestamp: Date.now(),
    };
  }

  /**
   * Fetch latest exchange rates from CoinGecko API
   * 
   * @returns Promise resolving to current exchange rates
   */
  async fetchRates(): Promise<ExchangeRates> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CURRENCY_CONFIG.API_TIMEOUT_MS);

      const response = await fetch(CURRENCY_CONFIG.COINGECKO_API_URL, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      // Extract rates with fallbacks
      const btcToUsd = data.bitcoin?.usd || CURRENCY_CONFIG.FALLBACK_BTC_TO_USD;
      const btcToKes = data.bitcoin?.kes || CURRENCY_CONFIG.FALLBACK_BTC_TO_KSH;

      // Build rates object with BTC as base (1 BTC = X currency)
      this.rates = {
        BTC: 1, // Base currency
        USD: btcToUsd, // How many USD per 1 BTC
        KSH: btcToKes, // How many KSH per 1 BTC
        timestamp: Date.now(),
      };

      this.lastFetch = Date.now();
      this.saveCachedRates(this.rates);

      return this.rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);

      // Try to use cached rates from localStorage
      const cached = this.loadCachedRates();
      if (cached) {
        this.rates = cached;
        this.lastFetch = cached.timestamp;
        return cached;
      }

      // Use fallback rates as last resort
      this.rates = this.createFallbackRates();
      return this.rates;
    }
  }

  /**
   * Get current exchange rates (with intelligent caching)
   * 
   * @returns Promise resolving to current exchange rates
   */
  async getRates(): Promise<ExchangeRates> {
    const now = Date.now();

    // Return cached rates if still valid
    if (this.rates && (now - this.lastFetch) < CURRENCY_CONFIG.CACHE_DURATION_MS) {
      return this.rates;
    }

    // Attempt to load from localStorage if in-memory cache is stale
    const cached = this.loadCachedRates();
    if (cached) {
      this.rates = cached;
      this.lastFetch = cached.timestamp;
      return cached;
    }

    // Fetch new rates from API
    return this.fetchRates();
  }

  /**
   * Convert amount from one currency to another
   * Uses BTC as intermediary base currency
   * 
   * @param amount - Amount to convert
   * @param from - Source currency
   * @param to - Target currency
   * @returns Promise resolving to converted amount
   * 
   * @example
   * // Convert $100 USD to KSH
   * const ksh = await currencyService.convert(100, 'USD', 'KSH');
   */
  async convert(amount: number, from: Currency, to: Currency): Promise<number> {
    // No conversion needed for same currency
    if (from === to) return amount;

    const rates = await this.getRates();

    // Step 1: Convert to BTC (base currency)
    // Formula: amount / rate[from] = amountInBTC
    // Example: $65,000 / 65000 = 1 BTC
    const amountInBTC = amount / rates[from];

    // Step 2: Convert from BTC to target currency
    // Formula: amountInBTC * rate[to] = convertedAmount
    // Example: 1 BTC * 9750000 = 9,750,000 KSH
    const convertedAmount = amountInBTC * rates[to];

    return convertedAmount;
  }

  /**
   * Convert amount to USD cents (for backend storage)
   * Backend stores amounts as integer cents to avoid floating point issues
   * 
   * @param amount - Amount in source currency
   * @param currency - Source currency
   * @returns Promise resolving to amount in USD cents
   */
  async toCents(amount: number, currency: Currency): Promise<number> {
    const amountInUSD = await this.convert(amount, currency, 'USD');
    return Math.round(amountInUSD * 100);
  }

  /**
   * Convert USD cents to specified currency
   * 
   * @param cents - Amount in USD cents
   * @param currency - Target currency
   * @returns Promise resolving to amount in target currency
   */
  async fromCents(cents: number, currency: Currency): Promise<number> {
    const amountInUSD = cents / 100;
    return this.convert(amountInUSD, 'USD', currency);
  }

  /**
   * Format amount with currency symbol and thousands separators
   * 
   * @param amount - Amount to format
   * @param currency - Currency code
   * @returns Formatted currency string
   * 
   * @example
   * currencyService.format(1234.56, 'USD'); // "$1,234.56"
   * currencyService.format(0.00012345, 'BTC'); // "BTC0.00012345"
   */
  format(amount: number, currency: Currency): string {
    const info = CURRENCIES[currency];
    const formatted = amount.toFixed(info.decimals);

    // Add thousands separator to integer part
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${info.symbol}${parts.join('.')}`;
  }

  /**
   * Get currency metadata
   * 
   * @param currency - Currency code
   * @returns Currency information object
   */
  getCurrencyInfo(currency: Currency): CurrencyInfo {
    return CURRENCIES[currency];
  }

  /**
   * Get all supported currencies
   * 
   * @returns Array of all supported currency info
   */
  getSupportedCurrencies(): CurrencyInfo[] {
    return Object.values(CURRENCIES);
  }

  /**
   * Force refresh exchange rates (bypass cache)
   * Useful for manual refresh or when rates are known to be stale
   * 
   * @returns Promise resolving to fresh exchange rates
   */
  async refresh(): Promise<ExchangeRates> {
    this.lastFetch = 0; // Invalidate in-memory cache
    localStorage.removeItem(STORAGE_KEYS.EXCHANGE_RATES); // Clear localStorage cache
    return this.fetchRates();
  }

  /**
   * Check if current rates are from cache or live
   * 
   * @returns True if rates are fresh (< 30 seconds old)
   */
  areRatesFresh(): boolean {
    if (!this.rates) return false;
    const age = Date.now() - this.lastFetch;
    return age < 30000; // Consider rates fresh if < 30 seconds old
  }

  /**
   * Get the age of current rates in seconds
   * 
   * @returns Age in seconds, or null if no rates loaded
   */
  getRatesAge(): number | null {
    if (!this.rates) return null;
    return Math.floor((Date.now() - this.lastFetch) / 1000);
  }

  /**
   * Clear all cached rates
   */
  clearCache(): void {
    this.rates = null;
    this.lastFetch = 0;
    localStorage.removeItem(STORAGE_KEYS.EXCHANGE_RATES);
  }
}

export const currencyService = new CurrencyService();
