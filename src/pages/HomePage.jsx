import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CategoryFilter from '../components/CategoryFilter';
import EventGrid from '../components/EventGrid';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <CategoryFilter />
        <EventGrid />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
