// All API endpoints are managed here

export const ENDPOINTS = {
  // Authentication
  login: '/auth/m/login',
  customerRegister: '/auth/c/register',
  verifyOtp: '/auth/verify-otp',
  resendOtp: '/auth/resend-otp',
  // services
  getAllServiceCategories: '/service-categories',
  // category
  getCategoryById: (id) => `/service-categories/${id}`,
  // service provider
  getServiceProviders: (categoryId) => `/service-categories/${categoryId}/providers`,
  getProviderById: (id) => `/providers/${id}`,
  getProviderSlots: (providerId) => `/providers/${providerId}/slots`,
  toggleProviderLikeStatus: (providerId) => `/providers/${providerId}/like`,
  getLikedStatusForProvider: (providerId) => `/providers/${providerId}/like`,
  // services
  getAllServices: '/services',
  getProviderServices: (providerId) => `/providers/${providerId}/services`,
  getServiceById: (serviceId) => `/providers/services/${serviceId}`,
  // bookings
  createBooking: '/bookings',
  getAllProviderBookings: '/bookings',
  getBookingById: (bookingId) => `/bookings/${bookingId}`,
  cancelBookingById: (bookingId) => `/bookings/${bookingId}/cancel`,
  getMyBookings: '/bookings/me',
  // customer
  getCurrUser: '/user/profile',
  // payment
  verifyOrder: '/payment/verify',
  // banner
  getBannerAds: '/banner-ads',
  // wallet
  getWallet: '/wallet',
  // discount
  getApplicableDiscount: '/discounts/applicable',
  validateDiscountCode: '/bookings/validate-discount',
  applyDiscountCode: (id) => `/bookings/${id}/apply-discount`,
  removeDiscountCode: (id) => `/bookings/${id}/remove-discount`,
};

  