import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// WebLN types
interface WebLNProvider {
  enable(): Promise<void>;
  getInfo(): Promise<{ node: { alias: string; pubkey: string } }>;
  sendPayment(invoice: string): Promise<{ preimage: string }>;
  makeInvoice(args: { amount?: number; defaultMemo?: string }): Promise<{ paymentRequest: string }>;
  signMessage(message: string): Promise<{ signature: string }>;
  verifyMessage(signature: string, message: string): Promise<void>;
}

declare global {
  interface Window {
    webln?: WebLNProvider;
  }
}

interface WebLNContextType {
  isEnabled: boolean;
  isAvailable: boolean;
  provider: WebLNProvider | null;
  walletInfo: { alias: string; pubkey: string } | null;
  enable: () => Promise<boolean>;
  sendPayment: (invoice: string) => Promise<{ preimage: string } | null>;
  createInvoice: (amount: number, memo?: string) => Promise<string | null>;
  isFediWallet: boolean;
}

const WebLNContext = createContext<WebLNContextType | undefined>(undefined);

export const useWebLN = () => {
  const context = useContext(WebLNContext);
  if (!context) {
    throw new Error('useWebLN must be used within WebLNProvider');
  }
  return context;
};

interface WebLNProviderProps {
  children: ReactNode;
  required?: boolean;
}

export const WebLNProvider: React.FC<WebLNProviderProps> = ({ 
  children, 
  required = false 
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isAvailable] = useState(() => {
    // Initialize availability check
    return typeof window !== 'undefined' && !!window.webln;
  });
  const [provider, setProvider] = useState<WebLNProvider | null>(() => {
    // Initialize provider reference
    return typeof window !== 'undefined' && window.webln ? window.webln : null;
  });
  const [walletInfo, setWalletInfo] = useState<{ alias: string; pubkey: string } | null>(null);
  const [isFediWallet] = useState(() => {
    // Check if in Fedi context on initialization
    if (typeof window !== 'undefined') {
      return window.location.search.includes('fedi=') || 
             window.location.hostname.includes('fedi') ||
             document.referrer.includes('fedi');
    }
    return false;
  });

  useEffect(() => {
    // Auto-enable if in Fedi miniapp context
    if (isAvailable && isFediWallet) {
      // Auto-enable wallet asynchronously
      (async () => {
        try {
          if (window.webln) {
            await window.webln.enable();
            setIsEnabled(true);
          }
        } catch (error) {
          console.error('Failed to auto-enable WebLN:', error);
        }
      })();
    } else if (!isAvailable && required) {
      toast.error('WebLN wallet not detected. Please use Fedi wallet or a Lightning-enabled browser.');
    }
  }, [required, isAvailable]);

  const enable = async (): Promise<boolean> => {
    if (!window.webln) {
      toast.error('No Lightning wallet detected');
      return false;
    }

    try {
      await window.webln.enable();
      setProvider(window.webln);
      setIsEnabled(true);

      // Get wallet info
      try {
        const info = await window.webln.getInfo();
        setWalletInfo({ alias: info.node.alias, pubkey: info.node.pubkey });
        toast.success(`Connected to ${info.node.alias || 'Lightning Wallet'}`);
      } catch (error) {
        console.warn('Could not get wallet info:', error);
      }

      return true;
    } catch (error) {
      console.error('Failed to enable WebLN:', error);
      toast.error('Failed to connect to Lightning wallet');
      return false;
    }
  };

  const sendPayment = async (invoice: string): Promise<{ preimage: string } | null> => {
    if (!isEnabled || !provider) {
      toast.error('Please connect your Lightning wallet first');
      return null;
    }

    try {
      toast.loading('Processing payment...', { id: 'payment' });
      const response = await provider.sendPayment(invoice);
      toast.success('Payment successful!', { id: 'payment' });
      return response;
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error.message || 'Payment failed', { id: 'payment' });
      return null;
    }
  };

  const createInvoice = async (amount: number, memo?: string): Promise<string | null> => {
    if (!isEnabled || !provider) {
      toast.error('Please connect your Lightning wallet first');
      return null;
    }

    try {
      const response = await provider.makeInvoice({
        amount: amount,
        defaultMemo: memo || 'ErrandBit Payment'
      });
      return response.paymentRequest;
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
      return null;
    }
  };

  return (
    <WebLNContext.Provider
      value={{
        isEnabled,
        isAvailable,
        provider,
        walletInfo,
        enable,
        sendPayment,
        createInvoice,
        isFediWallet
      }}
    >
      {children}
    </WebLNContext.Provider>
  );
};
