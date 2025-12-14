import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { format, parseISO, isValid } from 'date-fns';
import { SkeletonHero } from './Skeleton';
import { getAllServices } from '../api/apiutils';

const HeroSection = () => {
  const { events, isLoading } = useEvents();
  const [apiEvents, setApiEvents] = useState([]);
  const [processingData, setProcessingData] = useState(true);
  
  // Fetch services from API and enrich
  useEffect(() => {
    let cancelled = false;
    const fetchServices = async () => {
      try {
        const result = await getAllServices(7, 'active', 'approved');
        if (!cancelled && result?.success && Array.isArray(result?.data)) {
          const srv = result.data;
          // Enrich similar to EventsListPage
          const toRad = (value) => (value * Math.PI) / 180;
          const calcDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // KM
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 +
                      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                      Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return +(R * c).toFixed(2);
          };
          const parseIfJSON = (val) => {
            if (typeof val === 'object') return val;
            try { return JSON.parse(val); } catch { return {}; }
          };
          let currLocation = null;
          try {
            const locStr = localStorage.getItem('location');
            currLocation = locStr ? JSON.parse(locStr) : null;
          } catch {}
          if (!currLocation?.lat || !currLocation?.long) {
            currLocation = { lat: '28.031097', long: '73.319387' };
          }

          const enriched = [];
          srv.forEach((event) => {
            if (event?.provider?.isActive) {
              let eventDate = '';
              let eventTime = '';
              let eventLocation = {};
              let eventDistance = null;

              event?.attributes?.forEach((attribute) => {
                if (attribute?.categoryAttribute?.entity === 'service') {
                  switch (attribute?.categoryAttribute?.attributeKey) {
                    case 'event_date':
                      eventDate = attribute.value; break;
                    case 'event_time':
                      eventTime = attribute.value; break;
                    case 'event_location':
                      try {
                        eventLocation = parseIfJSON(attribute.value);
                        if (
                          eventLocation?.latitude && eventLocation?.longitude &&
                          currLocation?.lat && currLocation?.long
                        ) {
                          eventDistance = calcDistance(
                            Number(currLocation.lat),
                            Number(currLocation.long),
                            Number(eventLocation.latitude),
                            Number(eventLocation.longitude)
                          );
                        }
                      } catch {}
                      break;
                    default:
                      break;
                  }
                }
              });

              let min = { displayPriceMin: Infinity, overridePriceMin: Infinity };
              let max = { displayPriceMax: -Infinity, overridePriceMax: -Infinity };
              (event.variants || []).forEach((variant) => {
                const price = Number(variant?.price);
                const salePrice = Number(variant?.salePrice);
                if (salePrice) {
                  min.displayPriceMin = Math.min(min.displayPriceMin, salePrice);
                  max.displayPriceMax = Math.max(max.displayPriceMax, salePrice);
                  min.overridePriceMin = Math.min(min.overridePriceMin, price);
                  max.overridePriceMax = Math.max(max.overridePriceMax, price);
                } else if (!Number.isNaN(price)) {
                  min.displayPriceMin = Math.min(min.displayPriceMin, price);
                  max.displayPriceMax = Math.max(max.displayPriceMax, price);
                }
              });

              const mapped = {
                id: event.id,
                // title and image fallbacks
                title: event?.name || event?.title || 'Featured Event',
                image: event?.thumbnail || event?.image || (event?.provider?.images?.[0]) || '',
                // Map to HeroSection expected fields
                category: event?.category?.name,
                date: eventDate || event?.date,
                time: eventTime || event?.time,
                venue: event?.provider?.address || event?.venue || 'Venue',
                location: event?.provider?.city || event?.location || 'City',
                price: (min.displayPriceMin === Infinity ? (event?.price || 0) : min.displayPriceMin),
                originalPrice: (min.overridePriceMin === Infinity ? undefined : min.overridePriceMin),
                discount: undefined,
                eventDistance,
              };
              enriched.push(mapped);
            }
          });

          if (!cancelled) setApiEvents(enriched);
        }
      } catch (e) {
        // fail silently, fallback to context events
      } finally {
        if (!cancelled) {
          const t = setTimeout(() => setProcessingData(false), 400);
          return () => clearTimeout(t);
        }
      }
    };
    fetchServices();
    return () => { cancelled = true; };
  }, []);

  const featuredFromApi = apiEvents.slice(0, 5);
  const featuredEvents = (featuredFromApi.length > 0 ? featuredFromApi : events.slice(0, 5));
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

  if (isLoading || processingData) {
    return <SkeletonHero />;
  }

  const currentEvent = featuredEvents[currentIndex];
  if (!currentEvent) return null;

  // Robust date/time formatting with fallbacks
  let dateObj = null;
  if (currentEvent?.date) {
    // Try parse ISO first; fallback to Date constructor
    const tryIso = parseISO(currentEvent.date);
    dateObj = isValid(tryIso) ? tryIso : new Date(currentEvent.date);
    if (!isValid(dateObj)) {
      dateObj = null;
    }
  }

  const formattedDate = dateObj
    ? `${format(dateObj, 'EEE, d MMM')}${currentEvent?.time ? ` - ${currentEvent.time}` : ''}`
    : (currentEvent?.time ? `${currentEvent.time}` : 'Date TBA');

  // Use static images from context only (ignore API images)
  const fallbackImages = events.slice(0, 5).map(e => e.image);
  const displayImage = fallbackImages[currentIndex] || events[0]?.image || '';

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
            backgroundImage: `url(${displayImage})`
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
                    src={displayImage}
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
