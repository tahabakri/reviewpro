import React from 'react';
import Card from '../components/ui/Card';

const Features: React.FC = () => {
  const features = [
    {
      category: 'Review Management',
      items: [
        {
          title: 'Smart Response Generation',
          description: 'AI generates personalized responses while maintaining your brand voice',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ),
          features: [
            'Automated response suggestions',
            'Brand voice consistency',
            'Multi-language support',
            'Sentiment-aware replies'
          ]
        },
        {
          title: 'Review Monitoring',
          description: 'Track and manage reviews across all major platforms in real-time',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          features: [
            'Real-time notifications',
            'Multi-platform integration',
            'Review aggregation',
            'Historical tracking'
          ]
        },
      ],
    },
    {
      category: 'Analytics & Insights',
      items: [
        {
          title: 'Sentiment Analysis',
          description: 'Advanced AI-powered sentiment analysis of customer feedback',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          features: [
            'Emotional analysis',
            'Trend identification',
            'Topic clustering',
            'Custom reports'
          ]
        },
        {
          title: 'Performance Metrics',
          description: 'Comprehensive analytics to track your review performance',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          features: [
            'Rating trends',
            'Response time metrics',
            'Customer satisfaction scores',
            'Review volume analysis'
          ]
        },
      ],
    },
    {
      category: 'Growth Tools',
      items: [
        {
          title: 'Review Generation',
          description: 'Automated campaigns to encourage customer reviews',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ),
          features: [
            'Smart timing optimization',
            'Custom email templates',
            'SMS campaigns',
            'QR code generation'
          ]
        },
        {
          title: 'Competitor Tracking',
          description: 'Monitor and analyze competitor review performance',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
          features: [
            'Competitive benchmarking',
            'Market position analysis',
            'Review gap identification',
            'Industry trends'
          ]
        },
      ],
    },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-indigo/20 to-primary-purple/20 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Every Tool You Need to
              <br />
              <span className="text-gradient">Master Review Management</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover our comprehensive suite of features designed to help you monitor,
              manage, and improve your online reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="space-y-24">
          {features.map((section) => (
            <div key={section.category}>
              <h2 className="text-3xl font-bold font-heading mb-12 text-center">
                <span className="text-gradient">{section.category}</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {section.items.map((feature) => (
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
                      <h3 className="text-xl font-bold font-heading mb-3">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">{feature.description}</p>
                      <ul className="space-y-3">
                        {feature.features.map((item) => (
                          <li key={item} className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-3 text-secondary-teal"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600 dark:text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-indigo/10 to-primary-purple/10 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="glass glass-dark p-8 md:p-12 rounded-2xl">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold font-heading mb-6">
                Seamless Integration with Review Platforms
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                ReviewPro works with all major review platforms to give you a complete view of your online reputation.
              </p>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                {['Google', 'Yelp', 'TripAdvisor', 'Facebook'].map((platform) => (
                  <div
                    key={platform}
                    className="h-12 rounded-lg glass flex items-center justify-center text-primary-indigo dark:text-primary-purple"
                  >
                    <span className="text-sm font-medium">{platform}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;