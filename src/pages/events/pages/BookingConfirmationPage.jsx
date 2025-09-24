import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { useEvents } from '@/context/EventContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const { bookingDetails, events } = useEvents();

  useEffect(() => {
    // If there are no booking details, redirect to homepage
    if (!bookingDetails) {
      navigate('/');
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails) {
    return null; // Render nothing while redirecting
  }

  const event = events.find(e => e.id === bookingDetails.eventId);

  if (!event) {
    // Handle case where event is not found (should not happen in normal flow)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p>Error: Event details not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const formattedDateTime = format(eventDate, 'EEEE, d MMM | p');
  
  const qrValue = JSON.stringify({
    bookingId: bookingDetails.bookingId,
    eventId: event.id,
    name: bookingDetails?.contactInfo?.name,
    tickets: bookingDetails.tickets
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 pt-20 pb-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Confirmation Header */}
          <div className="text-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">
              Booking confirmed
            </h1>
          </div>

          {/* Event Summary */}
          <div className="flex items-center space-x-4 mb-8">
            <img src={event.image} alt={event.title} className="w-20 h-28 object-cover rounded-lg" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
              <p className="text-gray-600">{event.tags?.join(' | ')}</p>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <p className="text-sm text-gray-500">Booking ID: {bookingDetails.bookingId}</p>
              <p className="text-sm text-gray-500">Booking code: {bookingDetails.bookingCode}</p>
            </div>
            
            <p className="font-semibold text-gray-800 mb-6">{formattedDateTime}</p>

            <div className="flex items-center space-x-6 mb-6">
              <div className="bg-white p-2 border rounded-lg">
                <QRCode value={qrValue} size={80} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">SCREEN 2</h3>
                <p className="text-gray-600">{bookingDetails.tickets} ticket{bookingDetails.tickets > 1 ? 's' : ''}</p>
                <p className="text-gray-600">CL-G8</p>
              </div>
            </div>

            <p className="text-gray-700 font-medium">{event.venue}</p>
          </div>

          {/* Download App Banner */}
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Next steps</p>
              <h3 className="text-xl font-bold">To view your tickets, download the app</h3>
            </div>
            <button className="mt-4 sm:mt-0 bg-white text-purple-700 font-bold py-2 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
              Download App
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
