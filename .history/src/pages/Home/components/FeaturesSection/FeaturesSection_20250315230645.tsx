import React from 'react';
import { motion } from 'framer-motion';
import FeatureCard from '../FeatureCard';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const slideUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
};

const features = [
  {
    title: 'Smart Responses',
    description: 'AI-powered response suggestions that maintain your brand voice.',
    stats: { value: '60%', label: 'Time saved on responses' },
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
    stats: { value: '89%', label: 'Customer satisfaction' },
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
    stats: { value: '2.5x', label: 'Competitive advantage' },
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
    stats: { value: '3x', label: 'More reviews' },
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

const FeaturesSection: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div 
        className="text-center mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <span className="inline-block px-4 py-2 rounded-full bg-primary-purple/10 text-primary-purple dark:bg-primary-purple/20 text-sm font-medium mb-6">
          Powerful Features
        </span>
        <h2 className="text-4xl font-bold font-heading mb-4">
          Everything You Need for <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-indigo to-primary-purple">Better Reviews</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Comprehensive tools to manage and improve your online reputation
        </p>
      </motion.div>
      
      <motion.div 
        className="grid md:grid-cols-2 gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {features.map((feature, index) => (
          <FeatureCard 
            key={feature.title}
            {...feature}
            delay={index * 0.1}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default FeaturesSection;