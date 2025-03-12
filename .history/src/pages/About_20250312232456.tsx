import React from 'react';
import { Star, Users, Globe, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About ReviewPro
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're on a mission to help businesses build better relationships with their customers through effective review management
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2023, ReviewPro emerged from a simple observation: businesses needed a better way to manage and leverage their customer reviews.
            </p>
            <p className="text-gray-600 mb-4">
              What started as a simple review management tool has evolved into a comprehensive platform that helps businesses transform their customer feedback into growth opportunities.
            </p>
            <p className="text-gray-600">
              Today, we serve thousands of businesses worldwide, helping them build stronger relationships with their customers and improve their online reputation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Stat icon={<Users />} number="10,000+" label="Active Users" />
            <Stat icon={<Star />} number="1M+" label="Reviews Managed" />
            <Stat icon={<Globe />} number="50+" label="Countries" />
            <Stat icon={<Award />} number="99%" label="Customer Satisfaction" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Value
              title="Customer First"
              description="We believe in putting our customers' needs at the center of everything we do."
            />
            <Value
              title="Innovation"
              description="We continuously push boundaries to deliver cutting-edge solutions."
            />
            <Value
              title="Transparency"
              description="We believe in being open and honest in all our dealings."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, number, label }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
    <div className="flex justify-center mb-2">
      {React.cloneElement(icon, { className: "h-8 w-8 text-blue-600" })}
    </div>
    <div className="text-2xl font-bold text-gray-900">{number}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

const Value = ({ title, description }) => (
  <div className="text-center">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default About;