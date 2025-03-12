import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { env } from '../config/env';

const GetStarted = () => {
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: generateSecurePassword(), // In production, you'd want the user to set their own password
        options: {
          data: {
            business_name: businessName,
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      // You might want to redirect the user or show a success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const generateSecurePassword = () => {
    // This is a simple example - in production, you'd want a more secure method
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).toUpperCase().slice(-4);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Start Your Free Trial
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Set up your ReviewPro account in minutes
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
              Success! Check your email to complete registration.
            </div>
            <p className="text-gray-600">
              Need help? Contact us at {env.VITE_SUPPORT_EMAIL}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Business name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-medium ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Start Free Trial'}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-gray-500 text-center">
          By signing up, you agree to our Terms and Privacy Policy
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>4.9/5 rating</span>
          </div>
          <p className="text-center text-sm text-gray-600">
            128 businesses signed up today
          </p>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;