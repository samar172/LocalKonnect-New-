import React, { createContext, useContext, useState } from 'react';
import Garba1 from '../assets/images/Garba1.png';
import Garba2 from '../assets/images/Garba2.png';
import Garba3 from '../assets/images/Garba3.png';
import GarbaMain from '../assets/images/garba.jpg';

// Placeholder image URLs
const sports1 = 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
const sports2 = 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
const salon1 = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Grk4kJw329mLPXkCv-XuxnP1U-PZOIMbSQ&s';
const salon2 = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXlq_P8_6TY0AopxHsy0Z4qIVzSX5KNLdSlw&s';

const EventContext = createContext();

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

export const EventProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookingDetails, setBookingDetails] = useState(null);

  const events = [
    // Sports Events
    
    {
      id: '1',
      title: 'Sunburn Arena ft. Martin Garrix',
      category: 'Music',
      date: '2025-02-15',
      time: '20:00',
      venue: 'Phoenix Marketcity',
      location: 'Mumbai',
      price: 2500,
      originalPrice: 3000,
      discount: 17,
      image: GarbaMain,
      description: 'Get ready for an electrifying night with Martin Garrix live in Mumbai. Experience the best of electronic dance music.',
      tags: ['EDM', 'Electronic', 'Dance'],
      artist: 'Martin Garrix',
      capacity: 5000,
      booked: 3200,
      rating: 4.8,
      reviews: 245
    },
    {
      id: '2',
      title: 'Stand-up Comedy Night',
      category: 'Comedy',
      date: '2025-02-12',
      time: '19:30',
      venue: 'Canvas Laugh Club',
      location: 'Mumbai',
      price: 800,
      originalPrice: 1000,
      discount: 20,
      image: Garba1,
      description: 'Laugh out loud with the best comedians in town. A night full of humor and entertainment.',
      tags: ['Comedy', 'Entertainment', 'Stand-up'],
      capacity: 200,
      booked: 156,
      rating: 4.6,
      reviews: 89
    },
    {
      id: '3',
      title: 'Food & Wine Festival',
      category: 'Food',
      date: '2025-02-20',
      time: '18:00',
      venue: 'Mahalaxmi Racecourse',
      location: 'Mumbai',
      price: 1200,
      image: Garba2,
      description: 'Indulge in culinary delights from renowned chefs and premium wines from around the world.',
      tags: ['Food', 'Wine', 'Culinary'],
      capacity: 1000,
      booked: 687,
      rating: 4.7,
      reviews: 156
    },
    {
      id: '4',
      title: 'Art Workshop: Abstract Painting',
      category: 'Workshop',
      date: '2025-02-18',
      time: '14:00',
      venue: 'Kala Ghoda Art District',
      location: 'Mumbai',
      price: 1500,
      originalPrice: 2000,
      discount: 25,
      image: Garba3,
      description: 'Learn abstract painting techniques from professional artists in this hands-on workshop.',
      tags: ['Art', 'Creative', 'Learning'],
      capacity: 30,
      booked: 18,
      rating: 4.9,
      reviews: 24
    },
    {
      id: '5',
      title: 'Mumbai Marathon 2025',
      category: 'Sports',
      date: '2025-03-10',
      time: '05:30',
      venue: 'Marine Drive',
      location: 'Mumbai',
      price: 2500,
      image: sports1,
      description: 'Join the most prestigious marathon in India. Run through the iconic Marine Drive and support various charitable causes.',
      tags: ['Marathon', 'Running', 'Fitness'],
      capacity: 50000,
      booked: 32000,
      rating: 4.9,
      reviews: 1245
    },
    {
      id: '6',
      title: 'Cricket Premier League',
      category: 'Sports',
      date: '2025-04-15',
      time: '19:30',
      venue: 'Wankhede Stadium',
      location: 'Mumbai',
      price: 3500,
      originalPrice: 4000,
      discount: 12.5,
      image: sports2,
      description: 'Witness the most exciting T20 cricket league live at Wankhede Stadium. Experience the electrifying atmosphere!',
      tags: ['Cricket', 'IPL', 'Sports'],
      capacity: 33000,
      booked: 28000,
      rating: 4.8,
      reviews: 956
    },
    // Salon & Spa Events
    {
      id: '7',
      title: 'Luxury Spa Day Retreat',
      category: 'Salon',
      date: '2025-02-25',
      time: '10:00',
      venue: 'Taj Spa & Salon',
      location: 'Mumbai',
      price: 5000,
      originalPrice: 7500,
      discount: 33,
      image: salon1,
      description: 'Indulge in a day of ultimate relaxation with our luxury spa package including massage, facial, and more.',
      tags: ['Spa', 'Wellness', 'Pampering'],
      capacity: 20,
      booked: 15,
      rating: 4.9,
      reviews: 87
    },
    {
      id: '8',
      title: 'Bridal Makeup Masterclass',
      category: 'Salon',
      date: '2025-03-05',
      time: '14:00',
      venue: 'Lakme Salon',
      location: 'Mumbai',
      price: 3500,
      image: salon2,
      description: 'Learn professional bridal makeup techniques from top makeup artists. Perfect for brides-to-be and makeup enthusiasts.',
      tags: ['Makeup', 'Bridal', 'Beauty'],
      capacity: 15,
      booked: 8,
      rating: 4.7,
      reviews: 42
    },
  ];

  return (
    <EventContext.Provider
      value={{
        events,
        selectedLocation,
        setSelectedLocation,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        bookingDetails,
        setBookingDetails
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
