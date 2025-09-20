import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Tag, Shield, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useEvents } from '../context/EventContext';
import Header from '../components/Header';
import { Skeleton, SkeletonOrderSummary } from '../components/Skeleton';

const BookingPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { events, setBookingDetails, isLoading } = useEvents();
  
  const [tickets, setTickets] = useState(Number(searchParams.get('tickets')) || 1);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  // Removed contact info and payment method to streamline checkout UI
  const [isProcessing, setIsProcessing] = useState(false);

  const event = events.find(e => e.id === id);

  const promoCodes = {
    'FIRST20': 20,
    'WEEKEND10': 10,
    'STUDENT15': 15
  };

  useEffect(() => {
    if (!event) {
      navigate('/');
    }
  }, [event, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column skeletons */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-1" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Skeleton className="h-7 w-48 mb-6" />
                <div className="flex space-x-3">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-3 w-56" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
            {/* Right order summary skeleton */}
            <div className="lg:col-span-1">
              <SkeletonOrderSummary />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const basePrice = event.price * tickets;
  const eventDiscount = event.discount ? (((event.originalPrice || event.price) - event.price) * tickets) : 0;
  const promoDiscountAmount = (basePrice * promoDiscount) / 100;
  const totalAmount = basePrice - promoDiscountAmount;

  const handlePromoCode = () => {
    const discount = promoCodes[promoCode];
    if (discount) {
      setPromoDiscount(discount);
    } else {
      setPromoDiscount(0);
      alert('Invalid promo code');
    }
  };

  const handleBooking = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate simple booking identifiers
    const bookingId = `BK-${Date.now()}`;
    const bookingCode = Math.random().toString(36).slice(2, 8).toUpperCase();

    setBookingDetails({
      bookingId,
      bookingCode,
      eventId: event.id,
      tickets,
      totalAmount,
      discountApplied: eventDiscount + promoDiscountAmount,
      promoCode: promoCode || undefined,
      // Contact info removed from this simplified flow
    });

    setIsProcessing(false);
    navigate('/booking/confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to event</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="space-y-6">
            {/* Secure Checkout badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Secure Checkout</h2>
                  <p className="text-xs text-gray-500">256-bit encryption • PCI compliant</p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs text-gray-500">Need help? Contact support</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Promo Code</h2>
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                  placeholder="Enter promo code"
                />
                <button
                  onClick={handlePromoCode}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Apply
                </button>
              </div>
              
              {promoDiscount > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-700 font-medium">
                    Promo code applied! {promoDiscount}% discount
                  </span>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium mb-2">Available codes:</p>
                <ul className="space-y-1">
                  <li>• FIRST20 - 20% off for first-time users</li>
                  <li>• WEEKEND10 - 10% off weekend events</li>
                  <li>• STUDENT15 - 15% off with student ID</li>
                </ul>
              </div>
            </motion.div>

            {/* Payment methods removed in simplified UI. We can integrate at the gateway step. */}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-24"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Event Info */}
              <div className="border-b pb-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(eventDate, 'MMM dd, yyyy')} at {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue}, {event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{tickets} ticket{tickets !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Selection */}
              {/* Ticket selector hidden per request */}

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Tickets ({tickets})</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
                
                {event.discount && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Event Discount ({event.discount}%)
                    </span>
                    <span>-₹{eventDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount ({promoDiscount}%)</span>
                    <span>-₹{promoDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee</span>
                  <span>₹0</span>
                </div>
                
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={isProcessing}
                className="w-full mt-6 bg-brand-secondary text-white py-3 rounded-lg font-semibold hover:bg-brand-secondary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Pay ₹${totalAmount.toLocaleString()}`
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>100% secure payment</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
