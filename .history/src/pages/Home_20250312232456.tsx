import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, BarChart2, Users, Star } from 'lucide-react';

const Home = () => {
  const [email, setEmail] = useState('');
  const [showNewsletter, setShowNewsletter] = useState(true);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Transform Your Reviews into Growth
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              AI-powered review management platform that helps businesses monitor, respond, and improve their online reputation efficiently.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/get-started"
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
              >
                Start Free Trial
              </Link>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors text-lg font-medium">
                Watch Demo
              </button>
            </div>
            <p className="mt-6 text-gray-600">Trusted by leading businesses worldwide</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Powerful Features for Better Reviews
        </h2>
        <p className="text-center text-gray-600 mb-16">
          Everything you need to manage and improve your online reputation
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-blue-600" />}
            title="Smart Responses"
            description="AI-powered response suggestions that maintain your brand voice."
            stat="60%"
            statLabel="Time saved on responses"
            benefits={[
              "Save time with automated responses",
              "Maintain consistent brand voice",
              "Personalize at scale"
            ]}
          />
          <FeatureCard
            icon={<BarChart2 className="h-8 w-8 text-blue-600" />}
            title="Real-time Analytics"
            description="Track review performance and customer sentiment in real-time."
            stat="89%"
            statLabel="Customer satisfaction"
            benefits={[
              "Monitor review trends",
              "Track sentiment analysis",
              "Identify improvement areas"
            ]}
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-600" />}
            title="Competitor Analysis"
            description="Benchmark your performance against competitors."
            stat="2.5x"
            statLabel="Competitive advantage"
            benefits={[
              "Track competitor ratings",
              "Analyze market position",
              "Identify opportunities"
            ]}
          />
          <FeatureCard
            icon={<Star className="h-8 w-8 text-blue-600" />}
            title="Review Generation"
            description="Actively grow your review count with smart request campaigns."
            stat="3x"
            statLabel="More reviews"
            benefits={[
              "Automated review requests",
              "Custom review campaigns",
              "Higher response rates"
            ]}
          />
        </div>
      </section>

      {/* Newsletter Modal */}
      {showNewsletter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Wait! Don't Miss Out
            </h3>
            <p className="text-gray-600 mb-6">
              Get 20% off your first month when you sign up for our newsletter.
            </p>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Claim Your Discount
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-500 text-center">
              By signing up, you agree to our Privacy Policy
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>🔒 Your data is secure</span>
              <span>•</span>
              <span>No spam, ever</span>
            </div>
            <button
              onClick={() => setShowNewsletter(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description, stat, statLabel, benefits }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <div className="mb-4">
      <div className="text-2xl font-bold text-blue-600">{stat}</div>
      <div className="text-sm text-gray-500">{statLabel}</div>
    </div>
    <ul className="space-y-2">
      {benefits.map((benefit, index) => (
        <li key={index} className="text-sm text-gray-600 flex items-center">
          <Star className="h-4 w-4 text-blue-600 mr-2" />
          {benefit}
        </li>
      ))}
    </ul>
  </div>
);

export default Home;