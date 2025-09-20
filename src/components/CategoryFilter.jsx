import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Laugh, UtensilsCrossed, PaintBucket, PartyPopper, Users, Filter, Trophy, Scissors } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { getAllServiceCategories } from '../api/apiutils';
import { Skeleton } from './Skeleton';

const CategoryFilter = () => {
  const { selectedCategory, setSelectedCategory, setSelectedCategoryId } = useEvents();

  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map category names to icons with fallbacks
  const getIconForCategory = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('music')) return Music;
    if (n.includes('comedy')) return Laugh;
    if (n.includes('sport')) return Trophy;
    if (n.includes('salon') || n.includes('spa') || n.includes('beauty')) return Scissors;
    if (n.includes('art') || n.includes('paint')) return PaintBucket;
    if (n.includes('food') || n.includes('dine')) return UtensilsCrossed;
    if (n.includes('party') || n.includes('fest')) return PartyPopper;
    return Filter;
  };

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const res = await getAllServiceCategories('active', true);
        const list = Array.isArray(res?.data) ? res.data : [];
        const normalized = list.map((c, idx) => ({
          id: c.id ?? c._id ?? idx,
          name: c.name ?? c.title ?? `Category ${idx + 1}`,
          iconUrl: c.icon || c.image || c.logo || null,
          iconName: c.iconName || c.icon_key || null,
        }));
        if (!cancelled) setApiCategories(normalized);
      } catch (e) {
        if (!cancelled) setApiCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="bg-white py-4 sm:py-6 md:py-8 border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Browse by Category</h2>
          <button 
            onClick={() => { setSelectedCategory('All'); setSelectedCategoryId(null); }}
            className="text-sm text-brand-primary hover:text-brand-secondary"
          >
            Clear Filter
          </button>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">

          {/* API-driven categories */}
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={`cat-skel-${index}`} className="flex-shrink-0 flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 min-w-[90px] sm:min-w-[100px] md:min-w-[120px] mx-1 border-gray-200">
                <div className="p-2 sm:p-3 rounded-lg mb-1 sm:mb-2 bg-gray-100 text-gray-700">
                  <Skeleton className="w-6 h-6" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : (
            apiCategories.map((category, index) => {
              const Icon = getIconForCategory(category.name);
              const isSelected = selectedCategory === category.name;
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index + 1) * 0.05 }}
                  onClick={() => { setSelectedCategory(category.name); setSelectedCategoryId(category.id); }}
                  className={`flex-shrink-0 flex flex-col items-center p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 min-w-[90px] sm:min-w-[100px] md:min-w-[120px] mx-1 ${
                    isSelected
                      ? 'border-brand-secondary bg-brand-secondary/10 shadow-md transform scale-[1.02] sm:scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm sm:hover:shadow-md'
                  }`}
                >
                  <div className={`${isSelected ? 'bg-brand-secondary text-white' : 'bg-gray-100 text-gray-700'} p-2 sm:p-3 rounded-lg mb-1 sm:mb-2 flex items-center justify-center`}>
                    {category.iconUrl ? (
                      <img
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-5 h-5 md:w-6 md:h-6 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    )}
                  </div>
                  <span className={`text-[11px] sm:text-xs md:text-sm font-medium text-center leading-tight ${
                    isSelected ? 'text-brand-secondary' : 'text-gray-700'
                  }`}>
                    {category.name}
                  </span>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryFilter;
