import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Star, Share2, Heart, Clock, Tag, ChevronDown, Navigation, Languages, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useEvents } from '../context/EventContext';
import Header from '../components/Header';
import { SkeletonDetailHeader, SkeletonDetailInfo, SkeletonOrderSummary } from '../components/Skeleton';

const EventDetails = () => {
  const { id } = useParams();
  const { events, isLoading } = useEvents();
  const [selectedTickets, setSelectedTickets] = useState(1);
  const [showMore, setShowMore] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const event = events.find(e => e.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-8 md:pt-16 pb-24 md:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonDetailHeader />
              <SkeletonDetailInfo />
            </div>
            <div className="lg:col-span-1 hidden md:block">
              <SkeletonOrderSummary />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <Link to="/" className="text-brand-secondary hover:text-brand-secondary/90">
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
      
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-8 md:pt-16 pb-24 md:pb-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          {/* <ArrowLeft className="w-4 h-4" />
          <span>Back to events</span> */}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden mb-6 rounded-none lg:rounded-xl"
            >
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-64 md:h-96 object-cover"
              />
              {event.discount && (
                <div className="absolute top-4 left-4 bg-brand-secondary text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Tag className="w-4 h-4 mr-1" />
                  {event.discount}% OFF
                </div>
              )}
              {/* <div className="absolute top-4 right-4 flex space-x-2">
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 text-gray-700 hover:text-brand-secondary" />
                </button>
              </div> */}
            </motion.div>

            {/* Event Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block bg-brand-secondary/10 text-brand-secondary text-sm px-3 py-1 rounded-full font-medium">
                  {event.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-700">{event.rating}</span>
                  <span className="text-gray-500">({event.reviews} reviews)</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {event.artist && (
                <p className="text-lg text-gray-600 mb-6">by {event.artist}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-brand-secondary" />
                  <div>
                    <p className="font-medium text-gray-900">{formattedDate}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-brand-secondary" />
                  <div>
                    <p className="font-medium text-gray-900">{event.venue}</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-brand-secondary" />
                  <div>
                    <p className="font-medium text-gray-900">{event.capacity - event.booked} spots left</p>
                    <p className="text-sm text-gray-600">out of {event.capacity}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-brand-secondary" />
                  <div>
                    <p className="font-medium text-gray-900">3 hours</p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">About the Event</h3>
                <div className="text-gray-700 leading-relaxed mb-2">
                  <p className={`${showMore ? '' : 'line-clamp-3'} whitespace-pre-line`}>{event.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMore(!showMore)}
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {showMore ? 'Show less' : 'Show more'}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showMore ? 'rotate-180' : ''}`} />
                </button>

                {/* Event Guide */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base md:text-lg font-semibold text-gray-900">Event Guide</h4>
                    <span className="text-xs text-gray-500">See all</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                        <Languages className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Language</p>
                        <p className="text-sm font-medium text-gray-800">{event.language || 'Hindi, English'}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                        <Clock className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-800">{event.duration || '6 Hours'}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <div className="w-9 h-9 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                        <BadgeCheck className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Tickets Needed For</p>
                        <p className="text-sm font-medium text-gray-800">All ages</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venue */}
                <div className="mt-6">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Venue</h4>
                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <h5 className="font-semibold text-gray-900 mb-1">{event.venue}</h5>
                    <p className="text-sm text-gray-600 mb-3">{event.location}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.location}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                  </div>
                </div>

                {/* FAQs */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(!faqOpen)}
                    className="w-full flex items-center justify-between py-3 border-b"
                  >
                    <span className="text-sm font-semibold text-gray-900">Frequently Asked Questions</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${faqOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpen && (
                    <div className="py-3 text-sm text-gray-700 space-y-2">
                      <p>• Can I cancel my tickets? Yes, free cancellation up to 24 hours before the event.</p>
                      <p>• Is parking available? Please check venue details or contact the organizer.</p>
                    </div>
                  )}
                </div>

                {/* Terms */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setTermsOpen(!termsOpen)}
                    className="w-full flex items-center justify-between py-3 border-b"
                  >
                    <span className="text-sm font-semibold text-gray-900">Terms & Conditions</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${termsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {termsOpen && (
                    <div className="py-3 text-sm text-gray-700 space-y-2">
                      <p>• Please carry a valid ID proof.</p>
                      <p>• Entry is subject to security checks at the venue.</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
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
          <div className="lg:col-span-1 hidden md:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-24"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">
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

              {/* <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of tickets
                </label>
                <select
                  value={selectedTickets}
                  onChange={(e) => setSelectedTickets(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                >
                  {Array.from({ length: Math.min(10, event.capacity - event.booked) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num} ticket{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div> */}

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
                to={`/tickets/${event.id}`}
                className="w-full bg-brand-secondary text-white py-3 rounded-lg font-semibold text-center block hover:bg-brand-secondary/90 transition-colors text-sm sm:text-base"
              >
                Book Now
              </Link>

              <p className="text-xs text-gray-500 text-center mt-4">
                Free cancellation up to 24 hours before the event
              </p>
            </motion.div>
          </div>
        </div>

        {/* Sticky mobile bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-3 flex items-center justify-between z-40">
          <div>
            <p className="text-xs text-gray-500">Starts from</p>
            <p className="text-lg font-bold text-gray-900">₹{event.price.toLocaleString()}</p>
          </div>
          <Link
            to={`/tickets/${event.id}`}
            className="px-5 py-3 rounded-lg bg-brand-secondary text-white font-semibold hover:bg-brand-secondary/90"
          >
            BOOK TICKETS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
