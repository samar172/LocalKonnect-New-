import { useState, useEffect, useCallback } from "react";
import { RAZORPAY_KEY_ID } from "@/services/paymentConfig";
import { axiosUser } from "@/api/axiosInstance";
import { ENDPOINTS } from "@/api/endpoints";
import toast from "react-hot-toast";

/**
 * Verify the payment with the backend.
 * @param {Object} razorpayResponse - The response object from Razorpay.
 * @returns {Promise<Object>} - The verification result from the backend.
 */
export async function verifyPayment(razorpayResponse) {
  const payload = {
    razorpay_order_id: razorpayResponse.razorpay_order_id,
    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
    razorpay_signature: razorpayResponse.razorpay_signature,
  };
  const response = await axiosUser.post(ENDPOINTS.verifyOrder, payload);
  return response.data;
}

/**
 * Custom React hook to handle Razorpay payment flow.
 * @returns {Object} - { initiatePayment, isPaymentLoading }
 */
export function useRazorpay() {
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  // Dynamically load Razorpay script
  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initiatePayment = useCallback(async (order, options = {}) => {
    setIsPaymentLoading(true);
    try {
      const razorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Local Konnect",
        image: "https://localkonnect.com/lklogo.png",
        ...options,
        handler: async function (response) {
          if (options.handler) {
            await options.handler(response);
          } else {
            try {
              await verifyPayment(response);
              toast.success("Payment successful and verified!");
            } catch (err) {
              toast.error("Payment verification failed.");
            }
          }
          // Only reset loading if no custom handler (which handles its own loading state)
          if (!options.handler) {
            setIsPaymentLoading(false);
          }
        },
        modal: {
          ...options.modal,
          ondismiss: () => {
            setIsPaymentLoading(false);

            if (options.modal && options.modal.ondismiss) {
              options.modal.ondismiss();
            }
          },
        },
      };

      const rzp = new window.Razorpay(razorpayOptions);

      rzp.on("payment.failed", function (response) {
        if (options.onFailure) {
          options.onFailure(response.error);
        } else {
          setIsPaymentLoading(false);
          toast.error(response.error.description || "Payment failed");
        }
      });

      rzp.open();
    } catch (error) {
      setIsPaymentLoading(false);
      if (options.onFailure) {
        options.onFailure(error);
      } else {
        console.error("Payment init failed", error);
      }
    }
  }, []);

  return { initiatePayment, isPaymentLoading, setIsPaymentLoading };
}
