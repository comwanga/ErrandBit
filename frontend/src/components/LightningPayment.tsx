import React, { useState } from 'react';
import { Zap, Copy, Check, QrCode } from 'lucide-react';
import { useWebLN } from '../contexts/WebLNContext';
import toast from 'react-hot-toast';
import QRCodeReact from 'qrcode.react';

interface LightningPaymentProps {
  amount: number;
  invoice?: string;
  description?: string;
  onPaymentSuccess?: (preimage: string) => void;
  onPaymentError?: (error: Error) => void;
}

export const LightningPayment: React.FC<LightningPaymentProps> = ({
  amount,
  invoice,
  description,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { isEnabled, sendPayment } = useWebLN();
  const [isPaying, setIsPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handlePayment = async () => {
    if (!invoice) {
      toast.error('No invoice available');
      return;
    }

    setIsPaying(true);
    try {
      const result = await sendPayment(invoice);
      if (result && result.preimage) {
        toast.success('Payment successful!');
        onPaymentSuccess?.(result.preimage);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
      onPaymentError?.(error);
    } finally {
      setIsPaying(false);
    }
  };

  const handleCopyInvoice = async () => {
    if (!invoice) return;
    
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      toast.success('Invoice copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy invoice');
    }
  };

  const formatAmount = (sats: number) => {
    return new Intl.NumberFormat('en-US').format(sats);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Lightning Payment
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatAmount(amount)} <span className="text-sm text-gray-500">sats</span>
          </div>
          <div className="text-xs text-gray-500">
            ≈ ${(amount * 0.00055).toFixed(2)} USD
          </div>
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      {invoice && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="lightning-invoice" className="text-sm font-medium text-gray-700">
                Lightning Invoice
              </label>
              <button
                onClick={() => setShowQR(!showQR)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <QrCode className="w-4 h-4" />
                {showQR ? 'Hide' : 'Show'} QR
              </button>
            </div>
            
            {showQR && (
              <div className="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg mb-3">
                <QRCodeReact 
                  value={invoice.toUpperCase()} 
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            )}

            <div className="flex gap-2">
              <input
                id="lightning-invoice"
                type="text"
                value={invoice}
                readOnly
                className="flex-1 px-3 py-2 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleCopyInvoice}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {isEnabled ? (
            <button
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPaying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Pay with Lightning
                </>
              )}
            </button>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              Connect your Lightning wallet to pay
            </div>
          )}
        </>
      )}

      {!invoice && (
        <div className="text-center py-8 text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Waiting for invoice...</p>
        </div>
      )}
    </div>
  );
};
