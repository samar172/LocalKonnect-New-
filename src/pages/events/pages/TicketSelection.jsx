import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Minus, Plus, MapPin } from 'lucide-react';
import { useEvents } from '@/context/EventContext';
import Header from '@/components/Header';
import { format, parseISO, isValid, addDays } from 'date-fns';
import { Skeleton, SkeletonTicketTiers } from '@/components/Skeleton';
import { getServiceById } from '@/api/apiutils';

// CalendarView removed; using simple date chips instead

const TicketSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [urlVariant, setUrlVariant] = useState(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const response = await getServiceById(id);
        if (response.success) {
          setEvent(response.data);
        } else {
          setError('Failed to load event details');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('An error occurred while loading the event');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Get variant from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const variantId = params.get('variant');
    if (variantId) {
      setUrlVariant(variantId);
    }
  }, []);

  // Parse event data if available
  const parsedEvent = useMemo(() => {
    if (!event) return null;

    // Extract date and time from attributes
    const dateRangeAttr = event.attributes?.find(attr =>
      attr.categoryAttribute?.attributeKey === 'event_date'
    );
    
    // Get time range from attributes
    const timeRange = event.attributes?.find(attr =>
      attr.categoryAttribute?.attributeKey === 'event_time'
    )?.value?.split(',').map(t => t.trim()) || [];
    
    const location = event.attributes?.find(attr =>
      attr.categoryAttribute?.attributeKey === 'event_location'
    )?.value;
    
    let availableDates = [];
    if (dateRangeAttr?.value) {
      try {
        const [startDateStr, endDateStr] = dateRangeAttr.value.split(',').map(s => s.trim());
        console.log('Date range from API:', { startDateStr, endDateStr });
        
        // Parse the dates in day-month-year format
        const parseCustomDate = (dateStr) => {
          const [day, month, year] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          console.log('Parsed date:', { input: dateStr, output: date });
          return date;
        };
        
        const startDate = parseCustomDate(startDateStr);
        const endDate = parseCustomDate(endDateStr);
        
        if (isValid(startDate) && isValid(endDate)) {
          let currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            availableDates.push({
              date: dateStr,
              times: timeRange.length > 0 ? timeRange : ['2:34 PM', '5:50 PM']
            });
            console.log('Added date:', dateStr);
            currentDate = addDays(currentDate, 1);
          }
        } else {
          console.error('Invalid date range:', { startDate, endDate });
        }
      } catch (error) {
        console.error('Error parsing date range:', error);
      }
    }

    let locationData = {};
    try {
      locationData = location ? JSON.parse(location) : {};
    } catch (e) {
      console.error('Error parsing location data:', e);
    }

    return {
      title: event.name,
      venue: locationData.address || 'Venue not specified',
      description: event.attributes?.find(attr =>
        attr.categoryAttribute?.attributeKey === 'event_description'
      )?.value || 'No description available',
      availableDates,
      ticketTiers: event.variants?.map(variant => ({
        id: variant.id.toString(),
        name: variant.name,
        description: variant.description,
        price: parseFloat(variant.salePrice || variant.price),
        originalPrice: variant.salePrice ? parseFloat(variant.price) : null,
        available: variant.qty - variant.soldQty,
        status: variant.status,
        maxQuantity: variant.qty - variant.soldQty
      })) || []
    };
  }, [event]);

  // Set initial selected date, time, and variant when parsedEvent changes
  useEffect(() => {
    if (parsedEvent?.availableDates?.length > 0) {
      const firstDate = parsedEvent.availableDates[0].date;
      setSelectedDate(firstDate);
      if (parsedEvent.availableDates[0].times?.length > 0) {
        setSelectedTime(parsedEvent.availableDates[0].times[0]);
      }

      // If URL has a variant parameter, pre-select that variant
      if (urlVariant && parsedEvent.ticketTiers?.length > 0) {
        const variantExists = parsedEvent.ticketTiers.some(tier => tier.id === urlVariant);
        if (variantExists) {
          setTicketQuantities(prev => ({
            ...prev,
            [urlVariant]: 1 // Set quantity to 1 for the specified variant
          }));
        }
      }
    }
  }, [parsedEvent, urlVariant]);

  const { totalItems, totalAmount } = useMemo(() => {
    let items = 0;
    let amount = 0;
    for (const tierId in ticketQuantities) {
      const quantity = ticketQuantities[tierId];
      if (quantity > 0 && parsedEvent?.ticketTiers) {
        const tier = parsedEvent.ticketTiers.find(t => t.id === tierId);
        if (tier) {
          items += quantity;
          amount += tier.price * quantity;
        }
      }
    }
    return { totalItems: items, totalAmount: amount };
  }, [ticketQuantities, parsedEvent]);

  const availableTimes = parsedEvent?.availableDates?.find(d => d.date === selectedDate)?.times || [];

  const handleSetQuantity = (tierId, newQuantity) => {
    setTicketQuantities(prev => ({
      ...prev,
      [tierId]: Math.max(0, newQuantity)
    }));
  };

  const handleContinue = () => {
    if (totalItems === 0) {
      alert("Please select at least one ticket.");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date for the event.");
      return;
    }

    if (!selectedTime) {
      alert("Please select a time slot for the event.");
      return;
    }

    const selectedTickets = Object.entries(ticketQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([tierId, quantity]) => {
        const tier = parsedEvent.ticketTiers.find(t => t.id === tierId);
        return { 
          ...tier, 
          quantity,
          pricePerTicket: parseFloat(tier.price),
          totalPrice: parseFloat(tier.price) * quantity
        };
      });

    navigate(`/book/${id}`, {
      state: {
        event: {
          id: parsedEvent.id,
          title: parsedEvent.title,
          venue: parsedEvent.venue,
          date: selectedDate,
          time: selectedTime,
          image: parsedEvent.thumbnail || parsedEvent.image,
          description: parsedEvent.description
        },
        selectedTickets,
        totalAmount,
        totalItems,
        selectedDate,
        selectedTime
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Skeleton className="w-32 h-8" />
          </div>
          <Skeleton className="w-full h-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="w-48 h-6 mb-4" />
              <SkeletonTicketTiers count={3} />
            </div>
            <div>
              <Skeleton className="w-full h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}. <button onClick={() => window.location.reload()} className="font-medium text-red-700 underline hover:text-red-600">Try again</button></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!parsedEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Event not found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to event</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">{parsedEvent.title}</h1>
            <div className="flex items-center text-gray-600 mt-2">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{parsedEvent.venue}</span>
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              {selectedDate && isValid(parseISO(selectedDate)) ? (
                <>
                  <Calendar className="w-4 h-4 mr-2 text-brand-secondary" />
                  <span>{format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</span>
                  {selectedTime && (
                    <>
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4 mr-2 text-brand-secondary" />
                      <span>{selectedTime}</span>
                    </>
                  )}
                </>
              ) : (
                <span>Date not available</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-brand-secondary" />
                  Select Date
                </h2>
                <div className="flex flex-wrap gap-2">
                  {parsedEvent?.availableDates?.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => {
                        setSelectedDate(d.date);
                        // reset time when date changes
                        if (d.times?.length > 0) {
                          setSelectedTime(d.times[0]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors text-xs sm:text-sm md:text-base ${selectedDate === d.date ? 'bg-brand-secondary border-brand-secondary text-white' : 'border-gray-300 hover:border-brand-secondary'
                        }`}
                    >
                      {d.date && isValid(parseISO(d.date))
                        ? format(parseISO(d.date), 'EEE, d MMM yyyy')
                        : 'No date'}
                    </button>
                  ))}
                </div>
              </motion.div>

              {availableTimes.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-brand-secondary" />
                    Select Time
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors text-xs sm:text-sm md:text-base
                          ${selectedTime === time ? 'bg-brand-secondary border-brand-secondary text-white' : 'border-gray-300 hover:border-brand-secondary'}
                        `}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Select Tickets</h2>
                <div className="space-y-4">
                  {parsedEvent.ticketTiers.length === 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            No ticket tiers available for this event.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    parsedEvent.ticketTiers.map(tier => {
                      const available = tier.available > 0 && tier.status !== 'sold';
                      const soldOut = tier.status === 'sold' || tier.available <= 0;

                      return (
                        <div
                          key={tier.id}
                          className={`border rounded-lg p-4 mb-4 ${soldOut ? 'opacity-60' : ''} ${!available ? 'cursor-not-allowed' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-800">
                                {tier.name}
                                {soldOut && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                                    Sold Out
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">{tier.description}</p>
                              <p className="font-semibold text-brand-secondary mt-1">
                                ₹{tier.price.toLocaleString()}
                                {tier.originalPrice && tier.originalPrice > tier.price && (
                                  <span className="ml-2 text-sm text-gray-500 line-through">
                                    ₹{tier.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </p>
                              {available && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {tier.available} tickets remaining
                                </p>
                              )}
                            </div>

                            {!soldOut && available && (
                              <div className="flex items-center">
                                {ticketQuantities[tier.id] > 0 ? (
                                  <div className="flex items-center space-x-3 bg-brand-secondary text-white rounded-lg px-3 py-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetQuantity(tier.id, (ticketQuantities[tier.id] || 0) - 1);
                                      }}
                                      className="hover:bg-brand-secondary/80 rounded-full p-1"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-base md:text-lg">
                                      {ticketQuantities[tier.id] || 0}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if ((ticketQuantities[tier.id] || 0) < tier.available) {
                                          handleSetQuantity(tier.id, (ticketQuantities[tier.id] || 0) + 1);
                                        }
                                      }}
                                      className={`hover:bg-brand-secondary/80 rounded-full p-1 ${(ticketQuantities[tier.id] || 0) >= tier.available ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                      disabled={(ticketQuantities[tier.id] || 0) >= tier.available}
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetQuantity(tier.id, 1);
                                    }}
                                    className="px-5 md:px-6 py-1.5 md:py-2 border border-brand-secondary text-brand-secondary font-semibold rounded-lg hover:bg-brand-secondary/10 transition-colors text-xs sm:text-sm md:text-base"
                                  >
                                    ADD
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {totalItems > 0 && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ ease: 'easeInOut' }}
          className="sticky bottom-0 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.1)] p-4"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-bold text-base md:text-lg">{totalItems} Item{totalItems > 1 ? 's' : ''}</p>
              <p className="font-bold text-lg md:text-xl text-brand-secondary">₹{totalAmount.toLocaleString()}</p>
            </div>
            <button
              onClick={handleContinue}
              className="bg-brand-secondary text-white px-8 py-3 md:px-10 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-brand-secondary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default TicketSelectionPage;
