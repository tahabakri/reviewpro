import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

// Animation variants
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

// Company logos for trust banner
const companyLogos = [
  { name: 'Microsoft', logo: '/logos/microsoft.svg' },
  { name: 'Adobe', logo: '/logos/adobe.svg' },
  { name: 'Shopify', logo: '/logos/shopify.svg' },
  { name: 'Slack', logo: '/logos/slack.svg' },
  { name: 'Spotify', logo: '/logos/spotify.svg' },
];

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

const mockGooglePlacesData = {
  "ChIJ...": {
    overallRating: 4.2,
    reviewCount: 852,
    sentimentAnalysis: {
      positive: 0.75,
      negative: 0.15,
      neutral: 0.10,
    },
  },
};

interface GooglePlacesData {
  overallRating: number;
  reviewCount: number;
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [googlePlacesId, setGooglePlacesId] = useState('');
  const [googlePlacesData, setGooglePlacesData] = useState<GooglePlacesData | null>(null);

  const handleAnalyzeReviews = () => {
    const data = mockGooglePlacesData[googlePlacesId as keyof typeof mockGooglePlacesData];
    setGooglePlacesData(data || null);
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-indigo/30 to-primary-purple/30 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <motion.div 
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            className="text-center"
            variants={fadeIn}
          >
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
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-indigo">+400%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review response rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-indigo">4.8/5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-indigo">5,000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Businesses helped</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Banner */}
      <motion.section 
        className="border-y border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
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
                <img src={company.logo} alt={company.name} className="h-8 md:h-10" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
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
            <motion.div 
              key={feature.title}
              variants={slideUp}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="glass"
                className="h-full hover:shadow-xl transition-all duration-300 hover:border-primary-indigo/30"
                hoverable
              >
                <div className="p-8 md:p-10 h-full flex flex-col">
                  <div className="w-14 h-14 rounded-xl glass flex items-center justify-center text-primary-indigo dark:text-primary-purple bg-primary-indigo/10 dark:bg-primary-purple/20 mb-8">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-heading mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{feature.description}</p>
                  <div className="mb-8 bg-gradient-to-r from-primary-indigo/5 to-primary-purple/5 p-4 rounded-lg">
                    <div className="text-4xl font-bold text-primary-indigo dark:text-primary-purple">
                      {feature.stats.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.stats.label}
                    </div>
                  </div>
                  <ul className="space-y-4 mt-auto">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-secondary-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-secondary-teal"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Google Places Review Analysis Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary-purple/10 text-primary-purple dark:bg-primary-purple/20 text-sm font-medium mb-6">
            Google Places Review Analysis
          </span>
          <h2 className="text-4xl font-bold font-heading mb-4">
            Analyze Your <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-indigo to-primary-purple">Google Places Reviews</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Get insights into your customer reviews and improve your online reputation.
          </p>
        </motion.div>

        {/* Input Field for Google Places ID */}
        <motion.div
          className="max-w-md mx-auto mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={slideUp}
        >
          <Input
            label="Enter Google Places ID"
            type="text"
            placeholder="ChIJ..."
            className="mb-4"
            value={googlePlacesId}
            onChange={(e) => setGooglePlacesId(e.target.value)}
          />
          <Button onClick={handleAnalyzeReviews}>Analyze Reviews</Button>
        </motion.div>

        {/* Dashboard Component */}
        {googlePlacesData ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={slideUp}>
              <Card variant="glass" className="p-8 h-full">
                <h3 className="text-2xl font-bold font-heading mb-4">Overall Rating</h3>
                <div className="text-5xl font-bold text-primary-indigo">{googlePlacesData?.overallRating}</div>
                <div className="text-gray-600 dark:text-gray-300">Based on {googlePlacesData?.reviewCount} reviews</div>
              </Card>
            </motion.div>

            <motion.div variants={slideUp}>
              <Card variant="glass" className="p-8 h-full">
                <h3 className="text-2xl font-bold font-heading mb-4">Sentiment Analysis</h3>
                {/* Add sentiment analysis chart here */}
                <div className="text-gray-600 dark:text-gray-300">Sentiment analysis chart will be displayed here.</div>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideUp}
          >
            <p className="text-xl text-gray-600 dark:text-gray-300">Enter a Google Places ID to analyze reviews.</p>
          </motion.div>
        )}
      </section>

      {/* Newsletter Section */}
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
              <form className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    label="Enter your email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
    </div>
  );
};

export default Home;