import React from 'react';
import { motion } from 'framer-motion';
import { Music, Laugh, UtensilsCrossed, PaintBucket, PartyPopper, Users, Filter, Trophy, Scissors } from 'lucide-react';
import { useEvents } from '../context/EventContext';

const CategoryFilter = () => {
  const { selectedCategory, setSelectedCategory } = useEvents();

  const categories = [
    { id: 'All', name: 'All Events', icon: Filter, color: 'bg-gray-100 text-gray-700' },
    { id: 'Music', name: 'Music', icon: Music, color: 'bg-purple-100 text-purple-700' },
    { id: 'Comedy', name: 'Comedy', icon: Laugh, color: 'bg-yellow-100 text-yellow-700' },
    { id: 'Sports', name: 'Sports', icon: Trophy, color: 'bg-orange-100 text-orange-700' },
    { id: 'Salon', name: 'Salon & Spa', icon: Scissors, color: 'bg-teal-100 text-teal-700' }
  ];

  return (
    <section className="bg-white py-4 sm:py-6 md:py-8 border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Browse by Category</h2>
        </div>

        <div className="flex overflow-x-auto pb-3 sm:pb-4 -mx-2 px-2 scrollbar-hide">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 min-w-[90px] sm:min-w-[100px] md:min-w-[120px] mx-1 ${
                  isSelected
                    ? 'border-brand-secondary bg-brand-secondary/10 shadow-md transform scale-[1.02] sm:scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm sm:hover:shadow-md'
                }`}
              >
                <div className={`p-2 sm:p-3 rounded-lg mb-1 sm:mb-2 ${isSelected ? 'bg-brand-secondary text-white' : category.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </div>
                <span className={`text-[11px] sm:text-xs md:text-sm font-medium text-center leading-tight ${
                  isSelected ? 'text-brand-secondary' : 'text-gray-700'
                }`}>
                  {category.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
