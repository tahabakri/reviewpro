import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const GetStarted: React.FC = () => {
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add registration logic here
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="relative w-full max-w-md">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl">
          <div
            className="relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-purple to-primary-indigo opacity-30"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <Card variant="glass" className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading">
              Create Your Account
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Start your 3-day free trial
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Full access to all features. After trial ends, choose a plan to continue.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-between">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full
                    ${
                      step >= num
                        ? 'gradient-primary text-white'
                        : 'bg-white dark:bg-dark-navy text-gray-400 border border-gray-300 dark:border-gray-700'
                    }
                  `}
                >
                  {step > num ? (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Account</span>
              <span>Profile</span>
              <span>Settings</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    name="firstName"
                    required
                    autoComplete="given-name"
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    name="lastName"
                    required
                    autoComplete="family-name"
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  required
                  autoComplete="new-password"
                />
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="Company Name"
                  type="text"
                  name="company"
                  required
                  autoComplete="organization"
                />
                <Input
                  label="Role"
                  type="text"
                  name="role"
                  required
                  autoComplete="organization-title"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                />
              </>
            )}

            {step === 3 && (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Choose your notification preferences:
                  </p>
                  {['Email Updates', 'Product News', 'Feature Announcements'].map((pref) => (
                    <label key={pref} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary-indigo focus:ring-primary-purple"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{pref}</span>
                    </label>
                  ))}
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Select your time zone:
                  </p>
                  <select
                    id="timezone"
                    name="timezone"
                    aria-label="Time Zone"
                    className="block w-full rounded-lg bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-gray-700 px-4 py-3"
                  >
                    <option>UTC-8 (Pacific Time)</option>
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC+0 (GMT)</option>
                    <option>UTC+1 (Central European Time)</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="glass"
                  fullWidth
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                type={step === 3 ? 'submit' : 'button'}
                fullWidth
                onClick={() => step < 3 && setStep(step + 1)}
              >
                {step === 3 ? 'Create Account' : 'Continue'}
              </Button>
            </div>

            {step === 1 && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-dark-navy text-gray-500">
                      Or sign up with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="glass" fullWidth>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="glass" fullWidth>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </>
            )}

            {step === 1 && (
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="font-medium text-primary-indigo hover:text-primary-purple"
                >
                  Sign in
                </Link>
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default GetStarted;