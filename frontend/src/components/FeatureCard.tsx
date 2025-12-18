/**
 * Feature Card Component
 * Reusable card for displaying features on the home page
 */

import React from 'react';
import { LightningIcon, LockIcon, GlobeIcon } from './icons/Icons';

interface FeatureCardProps {
  icon: 'lightning' | 'lock' | 'globe';
  title: string;
  description: string;
}

const iconMap = {
  lightning: LightningIcon,
  lock: LockIcon,
  globe: GlobeIcon,
};

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  const IconComponent = iconMap[icon];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all">
      <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mb-4">
        <IconComponent className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
  );
};
