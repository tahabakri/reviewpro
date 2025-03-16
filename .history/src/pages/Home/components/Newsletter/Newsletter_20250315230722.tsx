import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import Input from '../../../../components/ui/Input';

interface NewsletterProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const Newsletter: React.FC<NewsletterProps> = ({
  email,
  onEmailChange,
  onSubmit
}) => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-indigo/20 to-primary-purple/20 backdrop-blur-xl" />
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <Card variant="glass" className="p-8 md:p-12 shadow-xl border-primary-indigo/30">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block animate-pulse px-4 py-2 rounded-full bg-primary-purple/20 text-primary-purple text-sm font-medium mb-6">
              Limited Time Offer
            </span>
            <h2 className="text-4xl font-bold font-heading mb-4">
              Get <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-indigo to-primary-purple">20% Off</span> Your First Month
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
              Sign up for our newsletter and receive an exclusive discount code.
            </p>
            <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="Enter your email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required
                  placeholder="you@company.com"
                />
              </div>
              <Button type="submit" className="group relative overflow-hidden">
                <span className="relative z-10">Claim Your Discount</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary-indigo to-primary-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </form>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              By signing up, you agree to our Privacy Policy
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your data is secure
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No spam, ever
              </span>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
};

export default Newsletter;