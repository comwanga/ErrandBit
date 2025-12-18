import React from 'react';
import { Zap, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { useWebLN } from '../contexts/WebLNContext';

interface WalletConnectionProps {
  showStatus?: boolean;
  compact?: boolean;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  showStatus = true,
  compact = false 
}) => {
  const { isEnabled, isAvailable, enable, walletInfo, isFediWallet } = useWebLN();

  const handleConnect = async () => {
    await enable();
  };

  if (compact) {
    return (
      <button
        onClick={handleConnect}
        disabled={!isAvailable || isEnabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isEnabled
            ? 'bg-green-600 text-white cursor-default'
            : isAvailable
            ? 'bg-orange-600 text-white hover:bg-orange-700'
            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
        }`}
      >
        {isEnabled ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>{isFediWallet ? 'Fedi' : 'Wallet'} Connected</span>
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Lightning Wallet
        </h3>
        {isFediWallet && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Fedi Wallet
          </span>
        )}
      </div>

      {!isAvailable && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-800 font-medium">No Lightning Wallet Detected</p>
            <p className="text-sm text-yellow-700 mt-1">
              Please install Fedi wallet or use a Lightning-enabled browser to make payments.
            </p>
          </div>
        </div>
      )}

      {isAvailable && !isEnabled && (
        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Zap className="w-5 h-5" />
          Connect Lightning Wallet
        </button>
      )}

      {isEnabled && showStatus && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800 font-medium">Wallet Connected</p>
            {walletInfo && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Node:</span> {walletInfo.alias || 'Unknown'}
                </p>
                <p className="text-xs text-green-600 font-mono break-all">
                  {walletInfo.pubkey.slice(0, 16)}...{walletInfo.pubkey.slice(-16)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
