/**
 * Home Page
 * Landing page with privacy banner, hero section, and feature cards
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PrivacyBanner } from '../components/PrivacyBanner';
import { FeatureCard } from '../components/FeatureCard';
import { MAIN_FEATURES, HERO_CONTENT } from '../constants/homeContent';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Privacy Banner */}
      <PrivacyBanner />

      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {HERO_CONTENT.title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-2 px-4">
          {HERO_CONTENT.subtitle}
        </p>
        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium px-4">
          {HERO_CONTENT.tagline}
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4 mt-8">
          <Link
            to="/browse-jobs"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-center min-h-[44px] flex items-center justify-center w-full sm:w-auto"
          >
            Browse Jobs
          </Link>
          <Link
            to="/create-job"
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center min-h-[44px] flex items-center justify-center w-full sm:w-auto"
          >
            Post a Job
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {MAIN_FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
}
