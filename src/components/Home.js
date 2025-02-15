import React from 'react';

const Home = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to TokenForge </h2>
        <p className="text-gray-600 text-lg">
          Your secure platform for creating and managing custom tokens on the blockchain.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Create Tokens"
            description="Launch your own custom tokens with just a few clicks"
            icon="✨"
          />
          <FeatureCard
            title="Manage Assets"
            description="Track, transfer, and burn tokens easily"
            icon="💼"
          />
          <FeatureCard
            title="Secure Platform"
            description="Built with industry-standard security practices"
            icon="🔒"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Home;