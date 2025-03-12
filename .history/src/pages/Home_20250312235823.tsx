import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const Home: React.FC = () => {
  const stats = [
    { label: 'Time saved on responses', value: '60%' },
    { label: 'Customer satisfaction', value: '89%' },
    { label: 'Competitive advantage', value: '2.5x' },
    { label: 'More reviews', value: '3x' },
  ];

  const features = [
    {
      title: 'Smart Responses',
      description: 'AI-powered response suggestions that maintain your brand voice.',
      stats: {
        value: '60%',
        label: 'Time saved on responses',
      },
      points: [
        'Save time with automated responses',
        'Maintain consistent brand voice',
        'Personalize at scale',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      title: 'Real-time Analytics',
      description: 'Track review performance and customer sentiment in real-time.',
      stats: {
        value: '89%',
        label: 'Customer satisfaction',
      },
      points: [
        'Monitor review trends',
        'Track sentiment analysis',
        'Identify improvement areas',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Competitor Analysis',
      description: 'Benchmark your performance against competitors.',
      stats: {
        value: '2.5x',
        label: 'Competitive advantage',
      },
      points: [
        'Track competitor ratings',
        'Analyze market position',
        'Identify opportunities',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Review Generation',
      description: 'Actively grow your review count with smart request campaigns.',
      stats: {
        value: '3x',
        label: 'More reviews',
      },
      points: [
        'Automated review requests',
        'Custom review campaigns',
        'Higher response rates',
      ],
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-indigo/20 to-primary-purple/20 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6">
              Transform Your <span className="text-gradient">Reviews</span> into Growth
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              AI-powered review management platform that helps businesses monitor, respond, and improve their online reputation efficiently.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-started">
                <Button size="lg">Start Free Trial</Button>
              </Link>
              <Button variant="glass" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Banner */}
      <div className="border-y border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-8">
            Trusted by leading businesses worldwide
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
            {/* Add company logos here */}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-heading mb-4">
            Powerful Features for <span className="text-gradient">Better Reviews</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Everything you need to manage and improve your online reputation
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <Card
              key={feature.title}
              variant="glass"
              className="hover-lift"
              hoverable
            >
              <div className="p-8">
                <div className="w-12 h-12 rounded-lg glass flex items-center justify-center text-primary-indigo dark:text-primary-purple mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold font-heading mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{feature.description}</p>
                <div className="mb-6">
                  <div className="text-4xl font-bold text-primary-indigo dark:text-primary-purple">
                    {feature.stats.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.stats.label}
                  </div>
                </div>
                <ul className="space-y-3">
                  {feature.points.map((point) => (
                    <li key={point} className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-secondary-teal"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-indigo/10 to-primary-purple/10 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card variant="glass" className="p-8 md:p-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-4">
                Wait! Don't Miss Out
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Get 20% off your first month when you sign up for our newsletter.
              </p>
              <form className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    label="Enter your email"
                    type="email"
                    name="email"
                    required
                  />
                </div>
                <Button type="submit">
                  Claim Your Discount
                </Button>
              </form>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                By signing up, you agree to our Privacy Policy
              </div>
              <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Your data is secure
                </span>
                <span>•</span>
                <span>No spam, ever</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;