import React from 'react';
import { MessageSquare, BarChart2, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../config/env';

const Features = () => {
  const enableAI = env.VITE_ENABLE_AI_RESPONSES;
  const enableCompetitor = env.VITE_ENABLE_COMPETITOR_TRACKING;
  const enableAnalytics = env.VITE_ENABLE_ANALYTICS;

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Features that Drive Results
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover how ReviewPro helps you manage and improve your online reputation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {enableAI && (
            <FeatureSection
              icon={<MessageSquare className="h-8 w-8 text-blue-600" />}
              title="Smart Response Management"
              description="AI-powered response suggestions that help you respond to reviews quickly while maintaining your brand voice."
              features={[
                "Automated response suggestions",
                "Sentiment analysis",
                "Brand voice customization",
                "Multi-language support"
              ]}
              link="/get-started"
            />
          )}

          {enableAnalytics && (
            <FeatureSection
              icon={<BarChart2 className="h-8 w-8 text-blue-600" />}
              title="Advanced Analytics"
              description="Comprehensive analytics and reporting to track your review performance and customer sentiment."
              features={[
                "Real-time monitoring",
                "Trend analysis",
                "Sentiment tracking",
                "Custom reports"
              ]}
              link="/get-started"
            />
          )}

          {enableCompetitor && (
            <FeatureSection
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Competitor Insights"
              description="Stay ahead of the competition with detailed competitor analysis and benchmarking."
              features={[
                "Competitor tracking",
                "Market position analysis",
                "Industry benchmarks",
                "Strategic recommendations"
              ]}
              link="/get-started"
            />
          )}

          <FeatureSection
            icon={<Star className="h-8 w-8 text-blue-600" />}
            title="Review Generation"
            description="Proactively grow your reviews with smart campaigns and automated requests."
            features={[
              "Review request automation",
              "Custom email campaigns",
              "SMS integration",
              "QR code generation"
            ]}
            link="/get-started"
          />
        </div>
      </div>
    </div>
  );
};

interface FeatureSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  link: string;
}

const FeatureSection = ({ icon, title, description, features, link }: FeatureSectionProps) => (
  <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <ul className="space-y-3 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-700">
          <Star className="h-5 w-5 text-blue-600 mr-3" />
          {feature}
        </li>
      ))}
    </ul>
    <Link
      to={link}
      className="inline-block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
    >
      Get Started
    </Link>
  </div>
);

export default Features;