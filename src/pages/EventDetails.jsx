import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Clock, Hourglass, Navigation, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { getServiceById } from "../api/apiutils";
import Header from "../components/Header";
import { SkeletonDetailHeader, SkeletonDetailInfo, SkeletonOrderSummary } from "../components/Skeleton";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState(1);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await getServiceById(id);
        const data = res.data;

        // Normalize attributes
        const attrMap = {};
        data.attributes.forEach((a) => {
          attrMap[a.categoryAttribute.attributeKey] = a.value;
        });

        setEvent({
          id: data.id,
          title: data.name,
          image: data.thumbnail,
          description: attrMap["event_description"] || "",
          time: attrMap["event_time"]?.split(",") || [],
          dates: attrMap["event_date"]?.split(",") || [],
          location: attrMap["event_location"] ? JSON.parse(attrMap["event_location"]) : null,
          files: attrMap["event_files"] ? [attrMap["event_files"]] : [],
          variants: data.variants || [],
          duration: data.duration,
        });
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-8 md:pt-16 pb-24 md:pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SkeletonDetailHeader />
              <SkeletonDetailInfo />
            </div>
            <div className="lg:col-span-1 hidden md:block">
              <SkeletonOrderSummary />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <Link to="/" className="text-brand-secondary hover:text-brand-secondary/90">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 pt-12 md:pt-20 pb-24 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          {/* Event Details */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden mb-6 rounded-none lg:rounded-xl"
            >
              <img src={event.image} alt={event.title} className="w-full h-64 md:h-96 object-cover" />
            </motion.div>

            {/* Event Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {/* Dates and Time */}

              {/* About */}
              <div className="border-t pt-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">About the Event</h3>
                <p className={`${showMore ? "" : "line-clamp-3"} text-gray-700 whitespace-pre-line`}>
                  {event.description}
                </p>
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-sm text-gray-600 hover:text-gray-900 mt-2 flex items-center"
                >
                  {showMore ? "Show less" : "Show more"}
                  <ChevronDown
                    className={`w-4 h-4 ml-1 transition-transform ${showMore ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* Gallery Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Gallery</h3>
                {event.files && event.files.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.files[0].split(',').map((imageUrl, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img 
                          src={imageUrl.trim()} 
                          alt={`Event ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm sticky top-24 border border-gray-100"
            >
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Event Details</h3>
                <div className="space-y-4 mt-4">
                  {/* Date */}
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <Calendar className="w-5 h-5 text-brand-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.dates[0]}</p>
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <Clock className="w-5 h-5 text-brand-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.time[0]}</p>
                    </div>
                  </div>
                  
                  {/* Duration */}
                  {event.duration && (
                    <div className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <Hourglass className="w-5 h-5 text-brand-secondary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.duration >= 60 
                            ? `${Math.floor(event.duration / 60)} hr ${event.duration % 60 !== 0 ? `${event.duration % 60} min` : ''}`
                            : `${event.duration} min`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                      <MapPin className="w-5 h-5 text-brand-secondary" />
                    </div>
                    <div>
                      {/* <p className="text-sm text-gray-600">Venue</p> */}
                      <p className="font-medium text-gray-900">{event.location?.address || 'Venue details not available'}</p>
                      {event.location && (
                        <a
                          href={`https://www.google.com/maps?q=${event.location.latitude},${event.location.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-brand-secondary hover:underline inline-flex items-center mt-1"
                        >
                          View on Map
                          <Navigation className="w-3.5 h-3.5 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {event.variants.length > 0 && (() => {
                // Find the variant with the minimum price
                const minVariant = event.variants.reduce((min, current) => {
                  const currentPrice = current.salePrice || current.price;
                  const minPrice = min.salePrice || min.price;
                  return currentPrice < minPrice ? current : min;
                }, event.variants[0]);

                return (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-700">Price starts from</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{minVariant.salePrice || minVariant.price}
                        </span>
                        {/* {minVariant.price !== minVariant.salePrice && (
                          <span className="text-gray-500 line-through text-sm block">
                            ₹{minVariant.price}
                          </span>
                        )} */}
                      </div>
                    </div>
                    <Link
                      to={`/tickets/${event.id}?variant=${minVariant.id}`}
                      className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <span>Book Now</span>
                    </Link>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
