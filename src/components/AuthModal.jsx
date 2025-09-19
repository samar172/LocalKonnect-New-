import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LogOut, MessageSquare, FileText, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OTP_LENGTH = 6;

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login, user, logout } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(30);
  
  const otpInputRefs = useRef([]);

  useEffect(() => {
    if (step === 'otp' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (phoneNumber.length === 10) {
      setStep('otp');
      setCountdown(30); // Reset countdown
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Focus previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length === OTP_LENGTH) {
      // Simulate OTP verification
      console.log('Verifying OTP:', enteredOtp);
      login(phoneNumber);
      // Reset state on close
      setTimeout(() => {
        setStep('phone');
        setPhoneNumber('');
        setOtp(new Array(OTP_LENGTH).fill(''));
      }, 300);
    }
  };

  const changePhoneNumber = () => {
    setStep('phone');
    setOtp(new Array(OTP_LENGTH).fill(''));
  };

  const resendOtp = () => {
    if (countdown === 0) {
      setCountdown(30);
      // Logic to resend OTP
      console.log('Resending OTP...');
    }
  };

  const isOtpComplete = otp.join('').length === OTP_LENGTH;

  // Logged-in: show a right-side profile drawer
  if (user && isAuthModalOpen) {
    const displayName = user?.name || 'Profile';
    const displayPhone = user?.phone ? `+91 ${user.phone}` : '';

    const handleViewBookings = () => {
      closeAuthModal();
      // Navigate to bookings page if/when implemented
      // navigate('/bookings');
    };

    const handleChat = () => {
      closeAuthModal();
      // Placeholder for chat action
      // navigate('/support');
    };

    const handleTerms = () => {
      closeAuthModal();
      navigate('/terms');
    };

    const handlePrivacy = () => {
      closeAuthModal();
      navigate('/privacy');
    };

    const handleLogout = () => {
      logout();
      closeAuthModal();
    };

    return (
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-stretch bg-black/40"
            onClick={closeAuthModal}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="ml-auto h-full w-[92vw] sm:w-[420px] bg-white shadow-2xl rounded-l-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <button onClick={closeAuthModal} className="p-1 rounded-full hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
              </div>

              {/* Profile info */}
              <div className="px-6 py-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-purple-500 text-white flex items-center justify-center text-2xl font-bold">
                  {displayName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-gray-900 font-semibold">{displayName}</div>
                  {displayPhone && <div className="text-gray-500 text-sm">{displayPhone}</div>}
                </div>
              </div>

              <div className="px-4 pb-2 text-xs uppercase tracking-wide text-gray-500">Account</div>
              <button onClick={handleViewBookings} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800">View all bookings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide text-gray-500">Support</div>
              <button onClick={handleChat} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800">Chat with us</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wide text-gray-500">More</div>
              <button onClick={handleTerms} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800">Terms & Conditions</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              <button onClick={handlePrivacy} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-800">Privacy Policy</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <div className="mt-auto p-4">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Logged-out: show existing authentication modal
  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeAuthModal}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeAuthModal} className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 z-20">
              <X className="w-6 h-6" />
            </button>

            {/* Branded Header */}
            <div className="relative p-8 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 text-white text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">L</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">LocalKonnect</h1>
              </div>
              <p className="mt-3 text-white/80">Experience the best in Dining, Movies, and Events.</p>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {step === 'phone' && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-center text-gray-800">Enter your mobile number</h2>
                    <p className="text-center text-gray-500 mt-2">If you don't have an account yet, we'll create one for you</p>
                    <form onSubmit={handlePhoneSubmit} className="mt-6">
                      <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-brand-secondary focus-within:border-transparent">
                        <div className="flex items-center pl-3 pr-2 border-r">
                          <span role="img" aria-label="India flag">🇮🇳</span>
                          <span className="ml-2 font-medium text-gray-700">+91</span>
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="Enter mobile number"
                          className="w-full p-3 border-none focus:ring-0 rounded-r-lg"
                          required
                          pattern="\d{10}"
                        />
                      </div>
                      <button type="submit" className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                        Continue
                      </button>
                    </form>
                    <p className="text-xs text-gray-400 text-center mt-4">
                      By continuing, you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
                    </p>
                  </motion.div>
                )}

                {step === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold text-center text-gray-800">Enter OTP</h2>
                    <p className="text-center text-gray-500 mt-2">
                      We have sent a verification code to +91 {phoneNumber}
                      <button onClick={changePhoneNumber} className="text-brand-secondary font-medium ml-2 hover:underline">
                        (Change)
                      </button>
                    </p>
                    <form onSubmit={handleOtpSubmit} className="mt-6">
                      <div className="flex justify-center space-x-2">
                        {otp.map((data, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={data}
                            onChange={(e) => handleOtpChange(e.target, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                            required
                          />
                        ))}
                      </div>
                      <button
                        type="submit"
                        disabled={!isOtpComplete}
                        className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </form>
                    <p className="text-sm text-gray-500 text-center mt-4">
                      Didn't get the OTP?{' '}
                      <button onClick={resendOtp} disabled={countdown > 0} className="text-brand-secondary font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed">
                        Request again {countdown > 0 && `in 00:${countdown.toString().padStart(2, '0')}`}
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
