import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Send } from 'lucide-react';
import Header from '../components/Header';

const DeleteAccountPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    reason: '',
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
    setFormData({ email: '', phone: '', reason: '' });
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Request Account Deletion
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Please provide your contact details and the reason for deletion. Our team will process your request promptly.
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-brand-secondary/10 border-b border-brand-secondary/20 p-6 sm:p-8 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-brand-secondary/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-brand-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-brand-secondary">Important</h2>
                <p className="text-sm text-brand-secondary mt-1">
                  Deleting your account is permanent and cannot be undone. Please ensure you've backed up any important information.
                </p>
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} placeholder="samar@example.com" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleChange} placeholder="+91-9876543210" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary" />
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for deletion</label>
                  <textarea name="reason" id="reason" rows="4" required value={formData.reason} onChange={handleChange} placeholder="I no longer use this service" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary"></textarea>
                </div>
                <div>
                  <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-brand-secondary hover:bg-brand-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400">
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Request Deletion
                      </>
                    )}
                  </button>
                </div>
                {isSubmitted && (
                  <div className="text-center p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg">
                    Your request has been received. We will reach out to confirm and process the deletion.
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

export default DeleteAccountPage;
