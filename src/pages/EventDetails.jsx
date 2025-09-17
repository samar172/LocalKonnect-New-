import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Star, Share2, Heart, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { useEvents } from '../context/EventContext';
import Header from '../components/Header';

const EventDetails = () => {
  const { id } = useParams();
  const { events } = useEvents();
  const [selectedTickets, setSelectedTickets] = useState(1);

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <Link to="/" className="text-red-500 hover:text-red-600">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, 'EEEE, MMMM dd, yyyy');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to events</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-xl overflow-hidden mb-6"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              {event.discount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {event.discount}% OFF
                </div>
              )}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-gray-700 hover:text-red-500" />
                </button>
              </div>
            </motion.div>

            {/* Event Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-medium">
                  {event.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-700">{event.rating}</span>
                  <span className="text-gray-500">({event.reviews} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {event.artist && (
                <p className="text-lg text-gray-600 mb-6">by {event.artist}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{formattedDate}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{event.venue}</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">{event.capacity - event.booked} spots left</p>
                    <p className="text-sm text-gray-600">out of {event.capacity}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">3 hours</p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">About this event</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-24"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{event.price.toLocaleString()}
                  </span>
                  {event.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ₹{event.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">per ticket</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of tickets
                </label>
                <select
                  value={selectedTickets}
                  onChange={(e) => setSelectedTickets(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {Array.from({ length: Math.min(10, event.capacity - event.booked) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num} ticket{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-b py-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Tickets ({selectedTickets})</span>
                  <span className="font-medium">₹{(event.price * selectedTickets).toLocaleString()}</span>
                </div>
                {event.discount && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-600">Discount ({event.discount}%)</span>
                    <span className="font-medium text-green-600">
                      -₹{(((event.originalPrice || event.price) - event.price) * selectedTickets).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>₹{(event.price * selectedTickets).toLocaleString()}</span>
                </div>
              </div>

              <Link
                to={`/book/${event.id}?tickets=${selectedTickets}`}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold text-center block hover:bg-red-600 transition-colors"
              >
                Book Now
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                Free cancellation up to 24 hours before the event
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
