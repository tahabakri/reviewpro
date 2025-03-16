import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../../../components/ui/Button';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const slideUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const stats = [
  { value: '+400%', label: 'Review response rate' },
  { value: '4.8/5', label: 'Average rating' },
  { value: '5,000+', label: 'Businesses helped' }
];

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-indigo/30 to-primary-purple/30 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div className="text-center" variants={fadeIn}>
          <span className="inline-block px-4 py-2 rounded-full bg-primary-purple/10 text-primary-purple dark:bg-primary-purple/20 text-sm font-medium mb-6">
            AI-Powered Reputation Management
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading mb-6 tracking-tight">
            Transform Your <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-indigo to-primary-purple">Reviews</span> into Growth
          </h1>
          <motion.p 
            className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            AI-powered review management platform that helps businesses monitor, respond, and improve their online reputation efficiently.
          </motion.p>
          <motion.div 
            className="mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center"
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <Link to="/get-started">
              <Button size="lg" className="group relative overflow-hidden">
                <span className="relative z-10">Start 14-Day Free Trial</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary-indigo to-primary-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
            <Button variant="glass" size="lg" className="group">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </span>
            </Button>
          </motion.div>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
            variants={slideUp}
            transition={{ delay: 0.6 }}
          >
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-indigo">{value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;