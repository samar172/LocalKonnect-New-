/**
 * Determines if the application should run in mock mode for testing.
 * NOTE: 'import.meta.env.VITE_NODE_ENV' is automatically set to 'development'
 * when you run 'npm start'. You do not need to set it yourself.
 */
export const IS_MOCK_MODE = import.meta.env.VITE_NODE_ENV === 'development';

/**
 * Your Razorpay Key ID should be stored in a .env file at the root
 * of your project for security and accessed like this.
 *
 * File: .env
 * VITE_RAZORPAY_KEY_ID=your_key_here
 */
export const RAZORPAY_KEY_ID = IS_MOCK_MODE ? import.meta.env.VITE_RAZORPAY_TEST_KEY_ID : import.meta.env.VITE_RAZORPAY_LIVE_KEY_ID;