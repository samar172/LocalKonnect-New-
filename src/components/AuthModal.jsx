import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, LogOut, MessageSquare, FileText, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const OTP_LENGTH = 6;

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, login, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const otpInputRefs = useRef([]);
  const [navigationState, setNavigationState] = useState(() => {
    const savedState = sessionStorage.getItem('otpVerificationState');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    return {};
  });

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value.substring(0, 1); // Only take the first character
    setOtp(newOtp);

    // Auto-focus to next input
    if (element.value && index < OTP_LENGTH - 1 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    // Basic phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = '/auth/m/login';
      const requestData = { mobile: phoneNumber };
      
      console.log('Sending OTP to:', { endpoint, ...requestData });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        requestData,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      if (response.data.success) {
        setStep('otp');
        setCountdown(120); // Start 2-minute countdown
        // Focus the first OTP input
        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 100);
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP request error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status on mount and when the modal opens
  useEffect(() => {
    // Handle session expired message
    if (location.state?.error === 'session_expired') {
      setError(location.state.message || 'Your session has expired. Please sign in again.');
      window.history.replaceState({}, document.title);
    }

    const checkAuth = () => {
      const token = localStorage.getItem('lk_auth_token');
      const userData = localStorage.getItem('lk-user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser) {
            // Update the auth context if we have a user in localStorage but not in context
            if (!user) {
              login(parsedUser);
            }
            closeAuthModal();
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          // Clear invalid user data
          localStorage.removeItem('lk_auth_token');
          localStorage.removeItem('lk-user');
        }
      }
    };

    checkAuth();
  }, [isAuthModalOpen, location.state, closeAuthModal, login, user]);

  const handleOtpSubmit = async (e) => {
    e?.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== OTP_LENGTH) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = '/auth/m/verify-otp';
      const requestData = {
        mobile: phoneNumber,
        otp: otpString
      };

      console.log('Verifying OTP:', { endpoint, ...requestData });
      
      const response = await axios.create({
        baseURL: import.meta.env.VITE_API_BASE_URL,
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }).post(endpoint, requestData);

      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Clear OTP verification state
        sessionStorage.removeItem('otpVerificationState');
        
        // Store auth data
        localStorage.setItem('lk_auth_token', token);
        localStorage.setItem('lk-user', JSON.stringify(user));
        
        // Call the login function from auth context with token included
        login({
          ...user,
          token: token
        });
        
        // Show success message
        toast.success('Login successful!');
        
        // Close modal after a short delay
        setTimeout(() => {
          closeAuthModal();
          setStep('phone');
          setPhoneNumber('');
          setOtp(Array(6).fill(''));
        }, 1000);
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Clear OTP on error
      setOtp(Array(6).fill(''));
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const changePhoneNumber = () => {
    setStep('phone');
    setOtp(Array(6).fill(''));
    setError('');
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/m/resend-otp`,
        { mobile: phoneNumber },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      if (response.data.success) {
        setCountdown(120); // Reset countdown to 2 minutes
        setOtp(Array(6).fill(''));
        otpInputRefs.current[0]?.focus();
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.join('').length === OTP_LENGTH;
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Don't render anything if modal is closed and we don't have a user
  if (!isAuthModalOpen && !user) {
    return null;
  }

  // Logged-in: show a right-side profile drawer
  if (user) {
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

  // If we reach here, we should show the auth modal
  if (!isAuthModalOpen) {
    return null;
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
                      <button 
                        type="submit" 
                        className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          'Continue'
                        )}
                      </button>
                      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
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
                            inputMode="numeric"
                            maxLength="1"
                            value={data}
                            onChange={(e) => handleOtpChange(e.target, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            ref={(el) => (otpInputRefs.current[index] = el)}
                            className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            required
                            disabled={isLoading}
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
                      <button
                        type="submit"
                        disabled={!isOtpComplete || isLoading}
                        className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify OTP'
                        )}
                      </button>
                    </form>
                    <p className="text-sm text-gray-500 text-center mt-4">
                      Didn't get the OTP?{' '}
                      <button 
                        onClick={resendOtp} 
                        disabled={countdown > 0 || isResending} 
                        className="text-brand-secondary font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isResending ? (
                          <span className="inline-flex items-center">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          `Request again ${countdown > 0 ? `in ${formatTime(countdown)}` : ''}`
                        )}
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
