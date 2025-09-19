import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-700">These are placeholder terms. Replace with your actual Terms & Conditions content.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
