import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Tag, Shield, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { createBooking } from "@/api/apiUtils";
import { useRazorpay } from '@/services/paymentService';
import { Skeleton, SkeletonOrderSummary } from '@/components/Skeleton';
import { toast } from 'react-hot-toast';

const BookingPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBookingDetails } = useEvents();
  const location = useLocation();
  const { initiatePayment, isPaymentLoading } = useRazorpay();
  
  // Get data from navigation state
  const { 
    event,
    selectedTickets = [],
    totalAmount = 0,
    totalItems = 0,
    selectedDate,
    selectedTime
  } = location.state || {};
  
  const [bookingStatus, setBookingStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [bookingId, setBookingId] = useState(null);
  
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect back if no data is available
  useEffect(() => {
    if (!event || !selectedTickets || selectedTickets.length === 0) {
      navigate(`/tickets/${eventId}`);
    }
  }, [event, selectedTickets, eventId, navigate]);

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

  if (!event) return null;

  // Calculate totals from selected tickets
  const subtotal = selectedTickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);
  const promoDiscountAmount = (subtotal * promoDiscount) / 100;
  const finalTotal = subtotal - promoDiscountAmount;

  const handlePromoCode = () => {
    const discount = promoCodes[promoCode];
    if (discount) {
      setPromoDiscount(discount);
      toast.success(`Promo code applied! ${discount}% discount`);
    } else {
      setPromoDiscount(0);
      toast.error('Invalid promo code');
    }
  };
  
  const updateBookingStatus = async (bookingId, status) => {
    try {
      // TODO: Implement actual API call to update booking status
      console.log(`Updating booking ${bookingId} status to:`, status);
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
      return false;
    }
  };
  
  const handlePaymentFailure = async (error) => {
    console.error('Payment failed:', error);
    setBookingStatus('error');
    
    // Update booking status to failed
    if (bookingId) {
      await updateBookingStatus(bookingId, 'payment_failed');
    }
    
    toast.error('Payment failed. Please try again.');
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate('/login', { state: { from: location.pathname, state: location.state } });
      return;
    }

    setBookingStatus('processing');
    
    try {
      // 1. Create a booking record in your backend
      const bookingData = {
        eventId: event._id,
        userId: user._id,
        tickets: selectedTickets.map(ticket => ({
          ticketTypeId: ticket.id,
          quantity: ticket.quantity,
          price: ticket.price,
          totalPrice: ticket.totalPrice,
        })),
        eventDate: selectedDate,
        eventTime: selectedTime,
        promoCode: promoCode || undefined,
        subtotal,
        discount: promoDiscountAmount,
        total: finalTotal,
      };

      const bookingResponse = await createBooking(bookingData);
      const { bookingId, orderId } = bookingResponse.data;
      
      setBookingId(bookingId);

      // 2. Initialize Razorpay payment
      const options = {
        amount: Math.round(finalTotal * 100), // Convert to paise
        currency: 'INR',
        order_id: orderId,
        name: event.title,
        description: `Booking for ${event.title} on ${selectedDate}`,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        handler: async function (response) {
          try {
            // Verify payment with your backend
            const verification = await verifyPayment(response);
            
            if (verification.success) {
              // Update booking status to confirmed
              await updateBookingStatus(bookingId, 'confirmed');
              
              // Set booking details in context
              setBookingDetails({
                bookingId,
                bookingCode: bookingResponse.data.bookingCode,
                event: {
                  ...event,
                  date: selectedDate,
                  time: selectedTime
                },
                tickets: selectedTickets,
                subtotal: subtotal.toFixed(2),
                discount: promoDiscountAmount.toFixed(2),
                total: finalTotal.toFixed(2),
                promoCode: promoCode || undefined,
              });

              // Navigate to success page
              navigate(`/booking-confirmation/${bookingId}`, {
                state: {
                  bookingId,
                  bookingCode: bookingResponse.data.bookingCode,
                  event: {
                    ...event,
                    date: selectedDate,
                    time: selectedTime
                  },
                  tickets: selectedTickets,
                  total: finalTotal.toFixed(2)
                }
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            await updateBookingStatus(bookingId, 'payment_failed');
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: async () => {
            // Handle modal dismissal (user closed the payment modal)
            await updateBookingStatus(bookingId, 'cancelled');
            setBookingStatus('idle');
          }
        }
      };

      // Initiate Razorpay payment
      initiatePayment(bookingResponse.data.order, options);
      
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus('error');
      toast.error(error.response?.data?.message || 'Failed to process booking');
    } finally {
      setBookingStatus('idle');
      setIsProcessing(false);
    }
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
                    <Calendar className="w-4 h-4 text-brand-secondary" />
                    <span>{format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')} • {selectedTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-brand-secondary" />
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>

              {/* Selected Tickets */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Your Tickets</h4>
                <div className="space-y-3">
                  {selectedTickets.map((ticket, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{ticket.name} × {ticket.quantity}</p>
                        <p className="text-xs text-gray-500">₹{ticket.pricePerTicket} each</p>
                      </div>
                      <span className="font-medium">₹{ticket.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket Selection */}
              {/* Ticket selector hidden per request */}

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      Promo Code ({promoCode}) -{promoDiscount}%
                    </span>
                    <span>-₹{promoDiscountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee</span>
                  <span>₹0</span>
                </div>

                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Book Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={handleBooking}
                disabled={isProcessing || isPaymentLoading}
              >
                {(isProcessing || isPaymentLoading) ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : 'Confirm & Pay'}
              </motion.button>

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
