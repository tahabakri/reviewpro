import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses just getting started with review management',
      price: {
        monthly: 29,
        annual: 290,
      },
      features: [
        'Up to 100 reviews/month',
        'Basic AI response suggestions',
        'Single location management',
        '5 review platforms',
        'Email support',
        'Basic analytics',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      description: 'Ideal for growing businesses with multiple locations',
      price: {
        monthly: 99,
        annual: 990,
      },
      features: [
        'Unlimited reviews',
        'Advanced AI responses',
        'Up to 10 locations',
        'All review platforms',
        'Priority support',
        'Advanced analytics',
        'Competitor tracking',
        'Custom templates',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      description: 'Advanced features for large organizations',
      price: {
        monthly: 299,
        annual: 2990,
      },
      features: [
        'Unlimited everything',
        'Custom AI training',
        'Unlimited locations',
        'API access',
        '24/7 phone support',
        'Custom reporting',
        'White-label options',
        'Dedicated success manager',
        'SLA guarantee',
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-indigo/20 to-primary-purple/20 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Simple, Transparent <span className="text-gradient">Pricing</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose the perfect plan for your review management needs. Save up to 20% with annual billing.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="mt-12 flex justify-center items-center space-x-3">
            <span className={`text-sm ${!isAnnual ? 'text-primary-indigo dark:text-primary-purple font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none focus-ring
                ${isAnnual ? 'bg-primary-indigo' : 'bg-gray-300'}
              `}
            >
              <span className="sr-only">Toggle billing period</span>
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${isAnnual ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-primary-indigo dark:text-primary-purple font-medium' : 'text-gray-500'}`}>
              Annual (Save 20%)
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              variant={plan.highlighted ? 'gradient' : 'glass'}
              className={`
                flex flex-col
                ${plan.highlighted ? 'md:-mt-8' : ''}
              `}
            >
              <div className="p-8 flex-1">
                <h3 className={`text-2xl font-bold font-heading mb-2 ${plan.highlighted ? 'text-white' : ''}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <div className={`text-4xl font-bold font-heading ${plan.highlighted ? 'text-white' : ''}`}>
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </div>
                  <div className={plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}>
                    per {isAnnual ? 'year' : 'month'}
                  </div>
                </div>
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <svg
                        className={`w-5 h-5 mr-2 ${plan.highlighted ? 'text-white' : 'text-secondary-teal'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.highlighted ? 'text-white' : ''}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-8 pt-0">
                <Link to="/get-started">
                  <Button
                    variant={plan.highlighted ? 'glass' : 'primary'}
                    fullWidth
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-indigo/10 to-primary-purple/10 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="glass glass-dark p-8 md:p-12 rounded-2xl">
            <h2 className="text-3xl font-bold font-heading mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  q: 'How does the 14-day trial work?',
                  a: 'Start with full access to all Professional plan features. No credit card required until you\'re ready to subscribe.',
                },
                {
                  q: 'Can I switch plans later?',
                  a: 'Yes, upgrade or downgrade anytime. Changes take effect on your next billing cycle.',
                },
                {
                  q: 'What review platforms do you support?',
                  a: 'We support all major platforms including Google, Yelp, TripAdvisor, Facebook, and many more.',
                },
                {
                  q: 'Is there a limit to review responses?',
                  a: 'Starter plan has a monthly limit. Professional and Enterprise plans include unlimited reviews.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="space-y-2">
                  <h3 className="text-lg font-bold">{q}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;