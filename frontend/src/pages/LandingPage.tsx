import React from 'react';
import { HeroSection } from '../features/landing/HeroSection';
import { CuratedSections } from '../features/landing/CuratedSections';
import { HowItWorksSection } from '../features/landing/HowItWorksSection';
import { AIAssistantShowcase } from '../features/landing/AIAssistantShowcase';
import { DashboardPreviewSection } from '../features/landing/DashboardPreviewSection';
import { CTASection } from '../features/landing/CTASection';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <CuratedSections />
      <HowItWorksSection />
      <AIAssistantShowcase />
      <DashboardPreviewSection />
      <CTASection />
    </div>
  );
};
