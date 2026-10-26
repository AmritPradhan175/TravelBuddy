import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { ExplorePage } from '../pages/ExplorePage';
import { DestinationDetailPage } from '../pages/DestinationDetailPage';
import { PlanTripPage } from '../pages/PlanTripPage';
import { ManualPlannerPage } from '../pages/ManualPlannerPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MyTripsPage } from '../pages/MyTripsPage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { HistoryPage } from '../pages/HistoryPage';
import { AIAssistantPage } from '../pages/AIAssistantPage';
import { AboutPage } from '../pages/AboutPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';

export const AppRouter: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-ivory text-travel-text">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/destinations/:id" element={<DestinationDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Authenticated / Planning Pages */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/plan-trip" element={<PlanTripPage />} />
          <Route path="/manual-planner" element={<ManualPlannerPage />} />
          <Route path="/build-trip" element={<ManualPlannerPage />} />
          <Route path="/my-trips" element={<MyTripsPage />} />
          <Route path="/my-trips/:id" element={<PlanTripPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/ai-assistant" element={<AIAssistantPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};
