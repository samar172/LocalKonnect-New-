import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { format } from 'date-fns';

const HeroSection = () => {
  const { events } = useEvents();
  const featuredEvents = events.slice(0, 5); // Use first 5 events for the slider
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredEvents.length);
  }, [featuredEvents.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 5000); // Auto-play every 5 seconds
    return () => clearInterval(slideInterval);
  }, [nextSlide]);

  const currentEvent = featuredEvents[currentIndex];
  if (!currentEvent) return null;

  const eventDate = new Date(currentEvent.date);
  const formattedDate = `${format(eventDate, 'EEE, d MMM')} - ${currentEvent.time}`;

  const slideVariants = {
    hidden: (dir) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    visible: {
      x: '0%',
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    exit: (dir) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { duration: 0.5, ease: 'easeInOut' },
    }),
  };

  // Swipe handling using Framer Motion drag
  const swipeConfidenceThreshold = 800; // tune for sensitivity
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <section className="relative w-full h-[670px] bg-gray-900 text-white overflow-hidden">
      {/* Background Image */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center blur-0 md:blur-sm transform-none md:scale-105"
          style={{
            backgroundImage: `url(${currentEvent.image})`
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      {/* Bottom fade-out gradient
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent" /> */}

      {/* Slider Content */}
      <div className="relative z-10 h-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-full flex items-center">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  // Swiped left -> next
                  nextSlide();
                } else if (swipe > swipeConfidenceThreshold) {
                  // Swiped right -> prev
                  prevSlide();
                }
              }}
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {/* Left: Text Content */}
              <div className="md:max-w-md">
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="text-sm font-medium text-gray-300 mb-2"
                >
                  {formattedDate}
                </motion.p>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold leading-tight mb-3"
                >
                  {currentEvent.title}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-lg text-gray-200 mb-6"
                >
                  {currentEvent.venue}, {currentEvent.location}
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <span className="text-xl font-semibold">₹{currentEvent.price} onwards</span>
                  <Link
                    to={`/event/${currentEvent.id}`}
                    className="bg-gray-100 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg text-center text-sm w-fit"
                  >
                    Book tickets
                  </Link>
                </motion.div>
              </div>

              {/* Right: Image */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden md:flex justify-center"
              >
                <div className="w-[280px] h-[420px] rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={currentEvent.image}
                    alt={currentEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {/* <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button> */}

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {featuredEvents.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
