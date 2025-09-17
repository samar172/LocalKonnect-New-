import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const DeleteAccountPage = () => {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const requiredText = 'DELETE';
  const isButtonDisabled = confirmationText !== requiredText || isDeleting;

  const handleDelete = async (e) => {
    e.preventDefault();
    if (isButtonDisabled) return;

    setIsDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsDeleting(false);
    alert('Your account has been permanently deleted.');
    // In a real app, you would redirect the user, e.g., to the homepage
    // navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl"
        >
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h2 className="text-2xl leading-6 font-extrabold text-gray-900">
                Delete Your Account
              </h2>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  This action is permanent and cannot be undone. All your data, including event history and personal information, will be permanently erased.
                </p>
              </div>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleDelete}>
            <div>
              <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700">
                To confirm, please type "<strong>{requiredText}</strong>" in the box below.
              </label>
              <div className="mt-1">
                <input
                  id="confirmation"
                  name="confirmation"
                  type="text"
                  autoComplete="off"
                  required
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isButtonDisabled}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete My Account
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default DeleteAccountPage;
