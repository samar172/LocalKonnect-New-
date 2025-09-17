import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, SortAsc } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import EventCard from './EventCard';

// Sample data for other services matching the EventContext structure
const otherServices = [
  {
    id: 's1',
    title: 'Badminton Court Booking',
    category: 'Sports',
    date: '2025-04-20',
    time: '10:00',
    venue: 'City Sports Complex',
    location: 'Mumbai',
    price: 500,
    originalPrice: 800,
    discount: 38,
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Book our premium badminton courts for an hour of intense gameplay. All equipment provided.',
    tags: ['Badminton', 'Sports', 'Fitness'],
    capacity: 4,
    booked: 1,
    rating: 4.7,
    reviews: 56
  },
  {
    id: 's2',
    title: 'Royal Spa Experience',
    category: 'Salon',
    date: '2025-04-18',
    time: '11:00',
    venue: 'Serenity Spa & Salon',
    location: 'Mumbai',
    price: 3500,
    originalPrice: 5000,
    discount: 30,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Indulge in our signature spa treatments including massage, facial, and body therapy.',
    tags: ['Spa', 'Wellness', 'Pampering'],
    capacity: 10,
    booked: 3,
    rating: 4.9,
    reviews: 124
  },
  {
    id: 's3',
    title: 'Swimming Pool Day Pass',
    category: 'Sports',
    date: '2025-04-22',
    time: '14:00',
    venue: 'Aqua World',
    location: 'Mumbai',
    price: 800,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Enjoy full day access to our Olympic-sized swimming pool and other aquatic facilities.',
    tags: ['Swimming', 'Sports', 'Fitness'],
    capacity: 50,
    booked: 12,
    rating: 4.5,
    reviews: 89
  },
];

const EventGrid = () => {
  const { events, selectedLocation, searchQuery, selectedCategory } = useEvents();

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesLocation = event.location === selectedLocation;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (event.artist && event.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          event.venue.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;

      return matchesLocation && matchesSearch && matchesCategory;
    });
  }, [events, selectedLocation, searchQuery, selectedCategory]);

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    return otherServices.filter(service => {
      const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <section id="event-grid-section" className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Events Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Trending in {selectedLocation}
              </h2>
              <p className="text-gray-600">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <SortAsc className="w-4 h-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
            </div>
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
          <div className="relative">
            {/* Mobile Horizontal Slider */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex space-x-4 w-max">
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="w-48 flex-shrink-0">
                    <EventCard event={event} index={index} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or explore different categories.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-brand-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-accent transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Other Services Section */}
        <div className="mt-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Other Services
            </h2>
            <p className="text-gray-600">
              Discover our premium sports and salon services
            </p>
          </div>

          {/* Services Grid */}
          <div className="relative">
            {/* Mobile Horizontal Slider */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex space-x-4 w-max">
                {filteredServices.map((service, index) => (
                  <div key={service.id} className="w-48 flex-shrink-0">
                    <EventCard event={service} index={index} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map((service, index) => (
                <EventCard key={service.id} event={service} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventGrid;
