/**
 * Payment Service
 * 
 * Manages Lightning Network payment operations including invoice creation,
 * payment status tracking, and currency conversion.
 * 
 * @module services/payment
 */

import { httpClient } from './http.client';
import { LIGHTNING_CONFIG } from '../config/app.config';

/**
 * Lightning Network invoice
 */
export interface LightningInvoice {
  payment_hash: string;
  paymentHash?: string;
  payment_request: string;
  paymentRequest?: string;
  amount_sats: number;
  amountSats?: number;
  amount_usd?: number;
  amountUsd?: number;
  expires_at: string;
  expiresAt?: string;
  description?: string;
}

/**
 * Payment status information
 */
export interface PaymentStatus {
  payment_hash: string;
  paymentHash?: string;
  paid: boolean;
  amount_sats: number;
  amountSats?: number;
  paid_at?: string;
  paidAt?: string;
  status?: 'pending' | 'paid' | 'expired' | 'failed';
}

/**
 * BTC to USD conversion rate
 */
export interface ConversionRate {
  btc_usd: number;
  btcUsd?: number;
  timestamp: string;
  source?: string;
}

/**
 * Normalize Lightning invoice data
 */
function normalizeInvoice(invoice: any): LightningInvoice {
  return {
    payment_hash: invoice.payment_hash ?? invoice.paymentHash,
    paymentHash: invoice.paymentHash ?? invoice.payment_hash,
    payment_request: invoice.payment_request ?? invoice.paymentRequest,
    paymentRequest: invoice.paymentRequest ?? invoice.payment_request,
    amount_sats: invoice.amount_sats ?? invoice.amountSats,
    amountSats: invoice.amountSats ?? invoice.amount_sats,
    amount_usd: invoice.amount_usd ?? invoice.amountUsd,
    amountUsd: invoice.amountUsd ?? invoice.amount_usd,
    expires_at: invoice.expires_at ?? invoice.expiresAt,
    expiresAt: invoice.expiresAt ?? invoice.expires_at,
    description: invoice.description,
  };
}

/**
 * Normalize payment status data
 */
function normalizePaymentStatus(status: any): PaymentStatus {
  return {
    payment_hash: status.payment_hash ?? status.paymentHash,
    paymentHash: status.paymentHash ?? status.payment_hash,
    paid: status.paid,
    amount_sats: status.amount_sats ?? status.amountSats,
    amountSats: status.amountSats ?? status.amount_sats,
    paid_at: status.paid_at ?? status.paidAt,
    paidAt: status.paidAt ?? status.paid_at,
    status: status.status,
  };
}

/**
 * Payment Service
 * 
 * Handles Lightning Network payment operations, invoice generation,
 * and currency conversion between USD and satoshis.
 */
class PaymentService {
  private readonly endpoint = '/payments';
  private cachedRate: ConversionRate | null = null;
  private readonly RATE_CACHE_DURATION_MS = 5 * 60 * 1000;

  /**
   * Create a Lightning invoice for a job payment
   */
  public async createInvoice(jobId: number | string, amountSats: number, description?: string): Promise<LightningInvoice> {
    this.validateAmount(amountSats);
    
    const response = await httpClient.post<any>(this.endpoint, {
      jobId,
      amountSats,
      description: description || LIGHTNING_CONFIG.DEFAULT_MEMO,
    });
    
    const invoice = response.data || response.invoice;
    return normalizeInvoice(invoice);
  }

  /**
   * Get payment status by payment hash
   */
  public async getPaymentStatus(paymentHash: string): Promise<PaymentStatus> {
    const response = await httpClient.get<any>(`${this.endpoint}/hash/${paymentHash}`);
    const status = response.data || response.status;
    return normalizePaymentStatus(status);
  }

  /**
   * Get payment details by payment hash
   */
  public async getPaymentByHash(paymentHash: string): Promise<any> {
    const response = await httpClient.get<any>(`${this.endpoint}/hash/${paymentHash}`);
    return response.data || response.payment;
  }

  /**
   * Get all payments for a specific job
   */
  public async getPaymentsByJob(jobId: number | string): Promise<any[]> {
    const response = await httpClient.get<any>(`${this.endpoint}/job/${jobId}`);
    return response.data || response.payments || [];
  }

  /**
   * Get current BTC to USD conversion rate
   */
  public async getBtcUsdRate(): Promise<ConversionRate> {
    if (this.cachedRate && this.isCacheValid()) {
      return this.cachedRate;
    }

    try {
      const response = await httpClient.get<any>(`${this.endpoint}/rate`);
      this.cachedRate = {
        btc_usd: response.btc_usd ?? response.btcUsd ?? response.rate?.btc_usd,
        btcUsd: response.btcUsd ?? response.btc_usd,
        timestamp: response.timestamp || new Date().toISOString(),
        source: response.source,
      };
      return this.cachedRate;
    } catch (error) {
      console.warn('[Payment Service] Failed to fetch BTC rate, using fallback');
      return {
        btc_usd: 50000,
        btcUsd: 50000,
        timestamp: new Date().toISOString(),
        source: 'fallback',
      };
    }
  }

  /**
   * Convert USD amount to satoshis
   */
  public async convertUsdToSats(amountUsd: number): Promise<number> {
    if (amountUsd <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const rate = await this.getBtcUsdRate();
    const btcAmount = amountUsd / rate.btc_usd;
    const sats = Math.round(btcAmount * 100000000);
    
    this.validateAmount(sats);
    return sats;
  }

  /**
   * Convert satoshis to USD amount
   */
  public async convertSatsToUsd(amountSats: number): Promise<number> {
    if (amountSats <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const rate = await this.getBtcUsdRate();
    const btcAmount = amountSats / 100000000;
    return btcAmount * rate.btc_usd;
  }

  /**
   * Validate payment amount against Lightning Network limits
   */
  private validateAmount(amountSats: number): void {
    if (amountSats < LIGHTNING_CONFIG.MIN_AMOUNT_SATS) {
      throw new Error(`Amount too small. Minimum: ${LIGHTNING_CONFIG.MIN_AMOUNT_SATS} sats`);
    }
    
    if (amountSats > LIGHTNING_CONFIG.MAX_AMOUNT_SATS) {
      throw new Error(`Amount too large. Maximum: ${LIGHTNING_CONFIG.MAX_AMOUNT_SATS} sats`);
    }
  }

  /**
   * Check if cached rate is still valid
   */
  private isCacheValid(): boolean {
    if (!this.cachedRate) return false;
    
    const cacheAge = Date.now() - new Date(this.cachedRate.timestamp).getTime();
    return cacheAge < this.RATE_CACHE_DURATION_MS;
  }

  /**
   * Format satoshis for display
   */
  public formatSats(sats: number): string {
    if (sats >= 100000000) {
      const btc = sats / 100000000;
      return `${btc.toFixed(8)} BTC`;
    }
    return `${sats.toLocaleString()} sats`;
  }

  /**
   * Format USD amount for display
   */
  public formatUsd(usd: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usd);
  }
}

/**
 * Singleton instance of PaymentService
 */
export const paymentService = new PaymentService();
