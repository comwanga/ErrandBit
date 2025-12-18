/**
 * Fedi Miniapp Wrapper
 * Detects Fedi wallet context and provides appropriate UI wrapper
 */

import React, { useEffect } from 'react';
import { Shield, Smartphone, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFediDetection } from '../hooks/useFediDetection';

interface FediMiniappWrapperProps {
  children: React.ReactNode;
}

export const FediMiniappWrapper: React.FC<FediMiniappWrapperProps> = ({ children }) => {
  const { isFediContext, communityId } = useFediDetection('errandbit');

  useEffect(() => {
    if (isFediContext) {
      toast.success('🟣 Running in Fedi Community', { duration: 2000 });
    }
  }, [isFediContext]);

  if (isFediContext) {
    return (
      <div className="fedi-miniapp-container min-h-screen bg-gray-50">
        {/* Fedi Miniapp Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 shadow-md">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">ErrandBit</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>Fedi Protected</span>
            </div>
          </div>
        </div>

        {/* Non-KYC Privacy Badge */}
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-green-800">
            <span className="font-medium">Non-KYC Marketplace</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">No ID Required • Fully Private • Lightning Only</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4">{children}</div>

        {/* Community Info Footer (if in community) */}
        {communityId && (
          <div className="fixed bottom-0 left-0 right-0 bg-purple-100 border-t border-purple-200 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-purple-800">
              <Smartphone className="w-3 h-3" />
              <span>Community: {communityId}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard web view
  return <>{children}</>;
};
