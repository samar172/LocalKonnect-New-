import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Minus, Plus } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import Header from '../components/Header';
import { format } from 'date-fns';
import { Skeleton, SkeletonTicketTiers } from '../components/Skeleton';

// CalendarView removed; using simple date chips instead

const TicketTierCard = ({ tier, quantity, onAdd, onIncrement, onDecrement }) => {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <h4 className="font-bold text-gray-800">{tier.name}</h4>
        <p className="text-sm text-gray-600">{tier.description}</p>
        <p className="font-semibold text-brand-secondary mt-1">₹{tier.price.toLocaleString()}</p>
      </div>
      {quantity > 0 ? (
        <div className="flex items-center space-x-3 bg-brand-secondary text-white rounded-lg px-3 py-1">
          <button onClick={onDecrement}><Minus className="w-4 h-4" /></button>
          <span className="font-bold text-base md:text-lg">{quantity}</span>
          <button onClick={onIncrement}><Plus className="w-4 h-4" /></button>
        </div>
      ) : (
        <button 
          onClick={onAdd}
          className="px-5 md:px-6 py-1.5 md:py-2 border border-brand-secondary text-brand-secondary font-semibold rounded-lg hover:bg-brand-secondary/10 transition-colors text-xs sm:text-sm md:text-base"
        >
          ADD
        </button>
      )}
    </div>
  );
};

const TicketSelectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();

  // Fallback static data to avoid blank screens if context lacks detailed fields
  const fallbackEvent = {
    id: id || 'sample-1',
    title: 'Sample Concert Night',
    venue: 'Grand Arena, Mumbai',
    availableDates: [
      { date: format(new Date(), 'yyyy-MM-dd'), times: ['18:00', '20:00'] },
      { date: format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), times: ['17:00', '19:30'] },
      { date: format(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), times: ['16:00', '21:00'] },
    ],
    ticketTiers: [
      { id: 'general', name: 'General', description: 'Entry + Standing', price: 799 },
      { id: 'vip', name: 'VIP', description: 'Premium seating close to stage', price: 1499 },
      { id: 'vvip', name: 'VVIP', description: 'Front row + lounge access', price: 2499 },
    ],
  };

  const eventFromContext = events.find(e => e.id === id) || {};
  // Merge to ensure required fields exist; context values override fallback where present
  const event = { ...fallbackEvent, ...eventFromContext };

  const [selectedDate, setSelectedDate] = useState(event?.availableDates[0].date);
  const [selectedTime, setSelectedTime] = useState(event?.availableDates[0].times[0]);
  const [ticketQuantities, setTicketQuantities] = useState({});

  const { totalItems, totalAmount } = useMemo(() => {
    let items = 0;
    let amount = 0;
    for (const tierId in ticketQuantities) {
      const quantity = ticketQuantities[tierId];
      if (quantity > 0) {
        const tier = event.ticketTiers.find(t => t.id === tierId);
        items += quantity;
        amount += tier.price * quantity;
      }
    }
    return { totalItems: items, totalAmount: amount };
  }, [ticketQuantities, event]);

  // With fallback, event will always exist with required fields
  
  const availableTimes = event.availableDates.find(d => d.date === selectedDate)?.times || [];

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
    
    const selectedTickets = Object.entries(ticketQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([tierId, quantity]) => {
        const tier = event.ticketTiers.find(t => t.id === tierId);
        return { ...tier, quantity };
      });
      
    navigate(`/book/${id}`, {
      state: {
        selectedTickets,
        totalAmount,
        selectedDate,
        selectedTime,
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            {/* <ArrowLeft className="w-4 h-4" />
            <span>Back</span> */}
          </button>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600 mt-1">{event.venue}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><Calendar className="w-5 h-5 mr-2 text-brand-secondary" /> Select Date</h2>
                <div className="flex flex-wrap gap-2">
                  {event.availableDates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => {
                        setSelectedDate(d.date);
                        // reset time when date changes
                        if (d.times && d.times.length > 0) {
                          setSelectedTime(d.times[0]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors text-xs sm:text-sm md:text-base ${
                        selectedDate === d.date ? 'bg-brand-secondary border-brand-secondary text-white' : 'border-gray-300 hover:border-brand-secondary'
                      }`}
                    >
                      {format(new Date(d.date), 'EEE, d MMM')}
                    </button>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center"><Clock className="w-5 h-5 mr-2 text-brand-secondary" /> Select Time</h2>
                <div className="flex flex-wrap gap-2">
                  {availableTimes.map(time => (
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
            </div>

            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-xl font-bold text-gray-800 mb-3">Select Tickets</h2>
                <div className="space-y-4">
                  {event.ticketTiers.map(tier => (
                    <TicketTierCard
                      key={tier.id}
                      tier={tier}
                      quantity={ticketQuantities[tier.id] || 0}
                      onAdd={() => handleSetQuantity(tier.id, 1)}
                      onIncrement={() => handleSetQuantity(tier.id, (ticketQuantities[tier.id] || 0) + 1)}
                      onDecrement={() => handleSetQuantity(tier.id, (ticketQuantities[tier.id] || 0) - 1)}
                    />
                  ))}
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
