import React from 'react';
import { motion } from 'framer-motion';

const companyLogos = [
  { name: 'Microsoft', logo: '/logos/microsoft.svg' },
  { name: 'Adobe', logo: '/logos/adobe.svg' },
  { name: 'Shopify', logo: '/logos/shopify.svg' },
  { name: 'Slack', logo: '/logos/slack.svg' },
  { name: 'Spotify', logo: '/logos/spotify.svg' },
];

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

interface TrustBannerProps {
  className?: string;
}

const TrustBanner: React.FC<TrustBannerProps> = ({ className = '' }) => {
  return (
    <motion.section 
      className={`border-y border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-10">
          Trusted by leading businesses worldwide
        </p>
        <div className="grid grid-cols-3 gap-8 md:grid-cols-5">
          {companyLogos.map((company) => (
            <motion.div 
              key={company.name}
              className="flex justify-center items-center grayscale hover:grayscale-0 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={company.logo} 
                alt={company.name} 
                className="h-8 md:h-10" 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default TrustBanner;