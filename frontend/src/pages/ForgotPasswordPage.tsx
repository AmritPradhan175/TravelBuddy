import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { apiClient } from '../lib/api-client';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: cleanEmail });
      setSubmitted(true);
    } catch {
      // Regardless of error to prevent email enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-20 bg-ivory min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-travel-border p-8 md:p-10 shadow-elevated space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold text-forest-900">TravelBuddy</span>
          </Link>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-800 text-[10px] font-bold uppercase tracking-wider">
              Account Recovery
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 pt-1">
            Reset Your Password
          </h1>
          <p className="text-xs text-travel-muted max-w-xs mx-auto">
            Enter your account email address and we&apos;ll send recovery instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-6 rounded-2xl bg-forest-50 border border-forest-100 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 text-forest-700" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-bold text-forest-900">Recovery Instructions Sent</h4>
              <p className="text-xs text-travel-muted leading-relaxed">
                If an account exists for <strong className="text-forest-900">{email}</strong>, you will receive password reset instructions within a few minutes.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="forgot-email" 
                className="text-xs font-semibold text-travel-text block"
              >
                Registered Email Address
              </label>
              <div className="relative">
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-travel-border bg-ivory text-sm text-travel-text placeholder-travel-muted focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white transition-all shadow-subtle"
                />
                <Mail className="w-4 h-4 text-travel-muted absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-forest-800 hover:bg-forest-900 active:scale-[0.99] text-lime-accent font-semibold text-xs tracking-wide shadow-md hover:shadow-lime-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-lime-accent/40 border-t-lime-accent rounded-full animate-spin" />
                  <span>Sending Instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-travel-border text-xs text-travel-muted">
          Remembered your credentials?{' '}
          <Link to="/login" className="font-semibold text-forest-800 hover:text-forest-900 hover:underline">
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
