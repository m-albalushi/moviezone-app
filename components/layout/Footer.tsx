
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-8 text-center mt-auto">
      <div className="container mx-auto px-6">
        <p>&copy; {new Date().getFullYear()} MovieZone. All rights reserved (simulated).</p>
        <p className="text-sm mt-2">Powered by React, Tailwind CSS, and Supabase.</p>
      </div>
    </footer>
  );
};

export default Footer;