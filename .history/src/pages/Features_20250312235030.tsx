import React from 'react';
import Card from '../components/ui/Card';

const Features: React.FC = () => {
  const features = [
    {
      category: 'Productivity',
      items: [
        {
          title: 'Smart Automation',
          description: 'Automate repetitive tasks with AI-powered workflows',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          title: 'Team Collaboration',
          description: 'Work together seamlessly with real-time updates',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Security',
      items: [
        {
          title: 'End-to-End Encryption',
          description: 'Your data is secured with military-grade encryption',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
        },
        {
          title: 'Advanced Permissions',
          description: 'Granular access controls for your team',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Analytics',
      items: [
        {
          title: 'Real-time Insights',
          description: 'Monitor performance with live dashboards',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
        {
          title: 'Custom Reports',
          description: 'Generate detailed reports tailored to your needs',
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
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
              Powerful Features for the
              <br />
              <span className="text-gradient">Modern Workspace</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover all the tools you need to streamline your workflow and boost productivity.
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
                <span className="text-gradient">{section.category}</span> Features
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
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
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
                Seamless Integration with Your Workflow
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Connect with your favorite tools and services to create a unified workspace that works for you.
              </p>
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Add integration logos here */}
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg glass flex items-center justify-center text-primary-indigo dark:text-primary-purple"
                  >
                    <span className="text-sm font-medium">Integration {i + 1}</span>
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