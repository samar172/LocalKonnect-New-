import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import Header from '../components/Header';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setIsSubmitted(false), 5000); // Reset submitted state after 5 seconds
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Get in Touch
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              We'd love to hear from you. Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
            {/* Contact Information */}
            <div className="bg-gray-800 p-8 sm:p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-gray-300 mb-10">
                Fill up the form and our Team will get back to you within 24 hours.
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-brand-secondary" />
                  <a href="tel:+919571364889" className="text-lg hover:text-brand-secondary transition-colors">+91 9571364889</a>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-brand-secondary" />
                  <a href="mailto:info@localkonnect.com" className="text-lg hover:text-brand-secondary transition-colors">info@localkonnect.com</a>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-brand-secondary mt-1" />
                  <span className="text-lg">Bikaner, Rajasthan</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleChange} placeholder="+91-9876543210" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                  <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea name="message" id="message" rows="4" required value={formData.message} onChange={handleChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"></textarea>
                </div>
                <div>
                  <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-brand-secondary hover:bg-brand-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
                {isSubmitted && (
                  <div className="text-center p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg">
                    Thank you! Your message has been sent successfully.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;
