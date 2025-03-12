import React from 'react';
import { Check } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your business
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <PricingTier
            name="Starter"
            price="49"
            description="Perfect for small businesses just getting started"
            features={[
              "Up to 100 reviews/month",
              "Basic analytics",
              "Email support",
              "1 user account"
            ]}
          />

          <PricingTier
            name="Professional"
            price="99"
            description="Ideal for growing businesses"
            features={[
              "Up to 500 reviews/month",
              "Advanced analytics",
              "Priority support",
              "5 user accounts",
              "Competitor tracking",
              "Custom reports"
            ]}
            highlighted={true}
          />

          <PricingTier
            name="Enterprise"
            price="249"
            description="For large organizations with complex needs"
            features={[
              "Unlimited reviews",
              "Custom analytics",
              "24/7 phone support",
              "Unlimited users",
              "API access",
              "Custom integration",
              "Dedicated account manager"
            ]}
          />
        </div>
      </div>
    </div>
  );
};

const PricingTier = ({ name, price, description, features, highlighted = false }) => (
  <div className={`
    rounded-lg p-8
    ${highlighted 
      ? 'bg-white shadow-lg border-2 border-blue-500 relative' 
      : 'bg-white shadow-sm border border-gray-100'}
  `}>
    {highlighted && (
      <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
        Most Popular
      </div>
    )}
    <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
    <div className="mb-4">
      <span className="text-4xl font-bold">${price}</span>
      <span className="text-gray-600">/month</span>
    </div>
    <p className="text-gray-600 mb-6">{description}</p>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-700">
          <Check className="h-5 w-5 text-green-500 mr-3" />
          {feature}
        </li>
      ))}
    </ul>
    <button className={`
      w-full py-2 px-4 rounded-md font-medium
      ${highlighted
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
      transition-colors
    `}>
      Get Started
    </button>
  </div>
);

export default Pricing;