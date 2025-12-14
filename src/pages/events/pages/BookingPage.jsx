import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Users, Tag, Shield, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import DiscountDrawer from '@/components/utils/DiscountDrawer';
import {
  createBooking,
  getCategoryById,
  cancelBookingById,
  validateDiscountCode,
} from "@/api/apiUtils";
import { useRazorpay, verifyPayment } from '@/services/paymentService';
import { Skeleton, SkeletonOrderSummary } from '@/components/Skeleton';
import { toast } from 'react-hot-toast';
import { mergeDateTime } from '@/utils/formatdate';

const BookingPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { setBookingDetails } = useEvents();
  const location = useLocation();
  const { initiatePayment, isPaymentLoading } = useRazorpay();

  // Get data from navigation state
  const {
    event,
    selectedTickets = [],
    selectedDate,
    selectedTime
  } = location.state || {};

  const [bookingStatus, setBookingStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [bookingId, setBookingId] = useState(null);

  // Discount state - using array pattern for DiscountDrawer
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [platformFee, setPlatformFee] = useState(0);

  // Redirect back if no data is available
  useEffect(() => {
    if (!event || !selectedTickets || selectedTickets.length === 0) {
      navigate(`/tickets/${eventId}`);
    }
  }, [event, selectedTickets, eventId, navigate]);

  // Helper function to calculate total discount amount from all applied discounts
  const calculateTotalDiscount = () => {
    return appliedDiscounts.reduce((total, discount) => {
      if (discount.type === 'fixed' || discount.discountAmount) {
        return total + (discount.discountAmount || 0);
      }
      const percentSavings = (subtotal * (discount.discountPercent || 0)) / 100;
      if (discount.maxDiscountAmount && percentSavings > discount.maxDiscountAmount) {
        return total + discount.maxDiscountAmount;
      }
      return total + percentSavings;
    }, 0);
  };

  // Get the first applied discount code for booking payload
  const getAppliedDiscountCode = () => {
    return appliedDiscounts.length > 0 ? appliedDiscounts[0].code : undefined;
  };

  // Get cities from applied discount for booking payload
  const getAppliedDiscountCities = () => {
    return appliedDiscounts.length > 0 ? (appliedDiscounts[0].cities || ['Bikaner']) : ['Bikaner'];
  };

  // Fetch platform fee from category
  useEffect(() => {
    const fetchPlatformFee = async () => {
      if (event?.categoryId) {
        try {
          const response = await getCategoryById(event.categoryId);
          if (response?.success && response?.data?.platformFee) {
            setPlatformFee(Number(response.data.platformFee));
          }
        } catch (error) {
          console.error('Error fetching platform fee:', error);
        }
      }
    };
    fetchPlatformFee();
  }, [event?.categoryId]);

  useEffect(() => {
    if (!event) {
      navigate('/');
    }
  }, [event, navigate]);

  if (!event) return null;

  // Calculate totals from selected tickets
  const subtotal = selectedTickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0);

  // Calculate discount from applied discounts
  const promoDiscountAmount = appliedDiscounts.reduce((total, discount) => {
    if (discount.discountAmount) {
      return total + Number(discount.discountAmount || 0);
    }
    if (discount.savings) {
      return total + Number(discount.savings || 0);
    }
    if (discount.discountPercent || discount.value) {
      const percent = discount.discountPercent || discount.value || 0;
      const percentSavings = (subtotal * Number(percent)) / 100;
      if (discount.maxDiscountAmount && percentSavings > discount.maxDiscountAmount) {
        return total + Number(discount.maxDiscountAmount);
      }
      return total + percentSavings;
    }
    return total;
  }, 0);

  const finalTotal = subtotal - promoDiscountAmount + platformFee;

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
      openAuthModal();
      return;
    }

    setBookingStatus('processing');
    setIsProcessing(true);

    try {
      // Convert date from yyyy-MM-dd to dd-MM-yyyy format for mergeDateTime
      const convertDateFormat = (dateStr) => {
        if (!dateStr) throw new Error('Date is required');
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
      };

      // Get the event time (first time slot if multiple)
      const eventTime = selectedTime || '10:00 AM';

      // Use mergeDateTime utility to format scheduledTime
      // Format: "YYYY-MM-DD HH:mm:ss"
      const scheduledTime = mergeDateTime(
        convertDateFormat(selectedDate),
        eventTime
      );

      console.log('Formatted scheduledTime:', scheduledTime);

      // Build services array with proper variant structure
      const services = [{
        providerServiceId: event.providerServiceId || event.id,
        quantity: 1,
        variants: selectedTickets.map(ticket => ({
          spServiceVariantId: ticket.id,
          qty: ticket.quantity
        }))
      }];

      // Build booking payload per API requirements
      const bookingData = {
        categoryId: event.categoryId,
        providerId: event.providerId,
        bookingType: "store",
        scheduledTime,
        notes: "",
        kcoinAmountToUse: 0,
        paymentMode: "online",
        services,
        attributes: [],
        discountCode: getAppliedDiscountCode(),
        cities: getAppliedDiscountCities(),
      };

      console.log('Creating booking with payload:', bookingData);

      const bookingResponse = await createBooking(bookingData);
      console.log('Booking response:', bookingResponse);

      // Extract booking ID - handle different response structures
      const createdBookingId = bookingResponse?.data?.booking?.id ||
        bookingResponse?.data?.id ||
        bookingResponse?.id;
      const payment = bookingResponse?.data?.payment || bookingResponse?.payment;

      console.log('Created booking ID:', createdBookingId);
      console.log('Payment object:', payment);

      if (!createdBookingId) {
        throw new Error('Booking was created but ID was not returned');
      }

      setBookingId(createdBookingId);

      // 2. Initialize Razorpay payment
      if (!payment) {
        throw new Error('Payment order was not created');
      }

      const options = {
        handler: async function (response) {
          try {
            // Verify payment with your backend
            const verification = await verifyPayment(response);

            if (verification.success) {
              // Set booking details in context
              setBookingDetails({
                bookingId: createdBookingId,
                bookingCode: bookingResponse?.data?.bookingCode || createdBookingId,
                event: {
                  ...event,
                  date: selectedDate,
                  time: selectedTime
                },
                tickets: selectedTickets,
                subtotal: Number(subtotal || 0).toFixed(2),
                discount: Number(promoDiscountAmount || 0).toFixed(2),
                total: Number(finalTotal || 0).toFixed(2),
                promoCode: getAppliedDiscountCode(),
              });

              setBookingStatus('success');
              toast.success('Booking confirmed!');

              // Navigate to success page
              navigate('/booking/confirmation', {
                state: {
                  bookingId: createdBookingId,
                  bookingCode: bookingResponse?.data?.bookingCode || createdBookingId,
                  event: {
                    ...event,
                    date: selectedDate,
                    time: selectedTime
                  },
                  tickets: selectedTickets,
                  total: Number(finalTotal || 0).toFixed(2)
                }
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setBookingStatus('error');
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            // Handle modal dismissal (user closed the payment modal)
            try {
              await cancelBookingById(createdBookingId, { reason: 'Payment cancelled by user' });
            } catch (e) {
              console.error('Failed to cancel booking:', e);
            }
            setBookingStatus('idle');
            setIsProcessing(false);
            toast.error('Payment cancelled');
          }
        },
        onFailure: (error) => {
          handlePaymentFailure(error);
          setIsProcessing(false);
        }
      };

      // Initiate Razorpay payment with the payment order from response
      initiatePayment(payment, options);

    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus('error');
      toast.error(error.response?.data?.message || error.message || 'Failed to process booking');
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

            {/* Discount Drawer Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DiscountDrawer
                appliedDiscounts={appliedDiscounts}
                setAppliedDiscounts={setAppliedDiscounts}
                dataToFetchDiscount={{
                  providerId: event.providerId,
                  categoryId: event.categoryId,
                  bookingAmount: subtotal,
                  serviceIds: [event.providerServiceId || event.id],
                  paymentMode: 'online'
                }}
                loading={discountLoading}
                setLoading={setDiscountLoading}
              />
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

                {appliedDiscounts.length > 0 && (
                  <div className="space-y-2">
                    {appliedDiscounts.map((discount) => {
                      const savings = discount.type === 'fixed' || discount.discountAmount
                        ? discount.discountAmount
                        : Math.min(
                          (subtotal * (discount.discountPercent || 0)) / 100,
                          discount.maxDiscountAmount || Infinity
                        );
                      return (
                        <div key={discount.id} className="flex justify-between text-green-600">
                          <span className="flex items-center">
                            <Tag className="w-4 h-4 mr-1" />
                            {discount.code}
                            {discount.discountPercent > 0 && ` (-${discount.discountPercent}%)`}
                          </span>
                          <span>-₹{savings.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee</span>
                  <span>₹{platformFee.toLocaleString()}</span>
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
