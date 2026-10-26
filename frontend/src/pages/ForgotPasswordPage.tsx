import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="py-16 bg-ivory min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-travel-border p-8 shadow-card space-y-6">
        
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-lime-accent flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-serif text-2xl font-bold text-forest-900">TravelBuddy</span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-forest-900 pt-2">
            Reset Password
          </h1>
          <p className="text-xs text-travel-muted">
            Enter your email and we'll send a password recovery reset link.
          </p>
        </div>

        {submitted ? (
          <div className="p-5 rounded-2xl bg-forest-50 border border-forest-100 text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-forest-700 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-forest-900">Recovery Link Sent</h4>
            <p className="text-xs text-travel-muted leading-relaxed">
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
            </p>
            <Link
              to="/login"
              className="inline-block pt-2 text-xs font-semibold text-forest-800 hover:underline"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-travel-muted block mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-travel-border bg-ivory text-sm text-travel-text focus:outline-none focus:ring-2 focus:ring-forest-700 focus:bg-white"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-travel-muted absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-forest-800 hover:bg-forest-900 text-lime-accent font-semibold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Send Reset Instructions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-travel-border text-xs text-travel-muted">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-forest-800 hover:underline">
            Back to sign in
          </Link>
        </div>

      </div>
    </div>
  );
};
