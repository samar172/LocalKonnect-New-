import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, MapPin } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import QRCode from 'qrcode';
import { useEvents } from '@/context/EventContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingDetails: contextBookingDetails } = useEvents();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  // Prefer navigation state, fallback to context
  const bookingDetails = location.state || contextBookingDetails;

  // Generate QR code as data URL
  const generateQRCode = async (bookingId) => {
    try {
      const data = await QRCode.toDataURL(String(bookingId));
      return data;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return '';
    }
  };

  useEffect(() => {
    // If there are no booking details, redirect to homepage
    if (!bookingDetails) {
      navigate('/');
      return;
    }

    // Generate QR code when booking details are available
    const generateQR = async () => {
      const bookingId = bookingDetails.bookingId;
      if (bookingId) {
        const qrData = await generateQRCode(bookingId);
        setQrCodeDataUrl(qrData);
      }
    };

    generateQR();
  }, [bookingDetails, navigate]);

  if (!bookingDetails) {
    return null; // Render nothing while redirecting
  }

  // Get event from navigation state
  const event = bookingDetails.event;

  if (!event) {
    // Handle case where event is not found
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <p className="text-gray-600 mb-4">Error: Event details not found.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse the date - handle both ISO string and custom format
  const parseEventDate = (dateStr) => {
    if (!dateStr) return null;
    // Try ISO format first
    const isoDate = parseISO(dateStr);
    if (isValid(isoDate)) return isoDate;
    // Try parsing as Date object
    const dateObj = new Date(dateStr);
    if (isValid(dateObj)) return dateObj;
    return null;
  };

  const eventDate = parseEventDate(event.date || bookingDetails.selectedDate);
  const formattedDateTime = eventDate
    ? `${format(eventDate, 'EEEE, d MMM yyyy')}${event.time ? ` | ${event.time}` : ''}`
    : 'Date not available';

  // Calculate total tickets
  const ticketCount = Array.isArray(bookingDetails.tickets)
    ? bookingDetails.tickets.reduce((sum, t) => sum + (t.quantity || 1), 0)
    : bookingDetails.tickets || 1;

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
              Booking Confirmed!
            </h1>
            <p className="text-gray-600 mt-2">Your tickets have been successfully booked</p>
          </div>

          {/* Event Summary */}
          <div className="flex items-center space-x-4 mb-8">
            {event.image && (
              <img src={event.image} alt={event.title} className="w-20 h-28 object-cover rounded-lg" />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{event.title || 'Event'}</h2>
              {event.venue && (
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="border-b border-gray-200 pb-4 mb-4">
              {bookingDetails.bookingId && (
                <p className="text-sm text-gray-500">Booking ID: {bookingDetails.bookingId}</p>
              )}
              {bookingDetails.bookingCode && (
                <p className="text-sm text-gray-500">Booking Code: {bookingDetails.bookingCode}</p>
              )}
            </div>

            <div className="flex items-center text-gray-700 mb-4">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <p className="font-semibold">{formattedDateTime}</p>
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="bg-white p-2 border rounded-lg">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Booking QR Code"
                    className="w-24 h-24"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center bg-gray-100">
                    <span className="text-xs text-gray-400">Loading...</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-600">{ticketCount} ticket{ticketCount > 1 ? 's' : ''}</p>
                {bookingDetails.total && (
                  <p className="text-lg font-bold text-gray-900 mt-1">Total: ₹{bookingDetails.total}</p>
                )}
              </div>
            </div>

            {event.venue && (
              <div className="flex items-start text-gray-700">
                <MapPin className="w-4 h-4 mr-2 mt-1 text-blue-500" />
                <p className="font-medium">{event.venue}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex-1 bg-white text-blue-600 font-bold py-3 px-6 rounded-lg shadow-md border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              View My Bookings
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
