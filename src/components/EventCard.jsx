import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const EventCard = ({ event, index }) => {
  const eventDate = new Date(`${event.date}T${event.time}`);
  const formattedDateTime = format(eventDate, 'EEE, d MMM, p');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group w-full"
    >
      <Link to={`/event/${event.id}`} className="block h-full">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border h-full flex flex-col">
          {/* Image */}
          <div className="relative overflow-hidden flex-grow">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ aspectRatio: '2/3' }}
            />
          </div>

          {/* Content */}
          <div className="p-3 lg:p-4">
            <p className="text-xs lg:text-sm font-semibold text-blue-700 truncate">
              {formattedDateTime}
            </p>

            <h3 className="text-sm lg:text-base font-semibold text-gray-800 truncate mt-1">
              {event.title}
            </h3>

            <p className="text-xs lg:text-sm text-gray-600 truncate">
              {event.venue}, {event.location}
            </p>

            <p className="text-xs lg:text-sm text-gray-600 mt-1">
              ₹{event.price} onwards
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
