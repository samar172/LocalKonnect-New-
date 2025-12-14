// Razorpay configuration
// Uses test key in development, live key in production
export const RAZORPAY_KEY_ID =
    import.meta.env.VITE_RAZORPAY_LIVE_KEY_ID ||
    import.meta.env.VITE_RAZORPAY_TEST_KEY_ID;
