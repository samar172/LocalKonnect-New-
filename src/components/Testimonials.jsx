import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "LocalKonnect has completely changed how I find things to do in my city. The variety of events is amazing, and the booking process is seamless. Highly recommended!",
    name: 'Priya Sharma',
    location: 'Event Goer, Mumbai',
    avatar: 'https://i.pravatar.cc/150?u=priya-sharma'
  },
  {
    quote: "As an artist, getting my workshop listed was so easy. I saw a huge increase in attendance. It's a fantastic platform for creators and attendees alike.",
    name: 'Rohan Verma',
    location: 'Workshop Host, Delhi',
    avatar: 'https://i.pravatar.cc/150?u=rohan-verma'
  },
  {
    quote: "I love the curated 'This Weekend' section. It takes the guesswork out of planning my weekends. Found a hidden gem of a food festival last week!",
    name: 'Anjali Singh',
    location: 'Foodie, Bengaluru',
    avatar: 'https://i.pravatar.cc/150?u=anjali-singh'
  },
  {
    quote: "The app is beautifully designed and super intuitive. I managed to book concert tickets in under two minutes. The best event discovery app out there.",
    name: 'Vikram Patel',
    location: 'Music Lover, Pune',
    avatar: 'https://i.pravatar.cc/150?u=vikram-patel'
  },
  {
    quote: "Finally, a platform that understands the local culture. It's not just about big concerts, but also about smaller, intimate cultural gatherings. A must-have for everyone.",
    name: 'Meera Krishnan',
    location: 'Culture Enthusiast, Chennai',
    avatar: 'https://i.pravatar.cc/150?u=meera-krishnan'
  },
  {
    quote: "The customer support is top-notch. I had an issue with a booking, and it was resolved within minutes. Impressive service!",
    name: 'Amit Desai',
    location: 'Theater Fan, Ahmedabad',
    avatar: 'https://i.pravatar.cc/150?u=amit-desai'
  }
];

const TestimonialCard = ({ testimonial }) => (
  <div className="flex-shrink-0 w-[300px] sm:w-[350px] md:w-[400px] bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg mx-3 md:mx-4">
    <Quote className="w-8 h-8 md:w-10 md:h-10 text-red-500 mb-4" />
    <p className="text-gray-300 mb-4 md:mb-6 text-base md:text-lg leading-relaxed">"{testimonial.quote}"</p>
    <div className="flex items-center">
      <img 
        src={testimonial.avatar} 
        alt={testimonial.name} 
        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-red-500" 
      />
      <div className="ml-3 md:ml-4">
        <p className="font-bold text-white text-sm md:text-base">{testimonial.name}</p>
        <p className="text-xs md:text-sm text-gray-400">{testimonial.location}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const marqueeVariants = {
    animate: {
      x: [0, -2892], // (450px card + 32px margin) * 6 cards
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: 50,
          ease: "linear",
        },
      },
    },
  };

  return (
    <section className="bg-gray-900 py-12 md:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
          What our customers say about us
        </h2>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
          Real stories from our vibrant community of event-goers and organizers.
        </p>
      </div>
      <div className="relative">
        <motion.div
          className="flex py-4"
          variants={marqueeVariants}
          animate="animate"
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </motion.div>
        <div className="absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
      </div>
    </section>
  );
};

export default Testimonials;
