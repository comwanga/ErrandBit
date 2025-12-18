/**
 * Privacy Banner Component
 * Displays non-KYC and privacy features prominently
 */

import React from 'react';
import { LockIcon, CheckIcon } from './icons/Icons';
import { PRIVACY_FEATURES, HERO_CONTENT } from '../constants/homeContent';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
            <LockIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-1">
            {HERO_CONTENT.banner.title}
          </h3>
          <p className="text-sm text-green-800 dark:text-green-200 mb-3">
            <strong>{HERO_CONTENT.banner.subtitle}</strong> {HERO_CONTENT.banner.description}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {PRIVACY_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-center gap-1 text-green-700 dark:text-green-300">
                <CheckIcon />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
