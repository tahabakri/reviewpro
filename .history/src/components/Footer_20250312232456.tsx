import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">ReviewPro</span>
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          © 2025 ReviewPro. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;