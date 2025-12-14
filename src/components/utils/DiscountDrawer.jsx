import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Tag,
    Check,
    Loader2,
    ChevronRight,
    Percent,
    Gift,
    AlertCircle,
    Trash2,
    CheckCircle2,
    Circle
} from 'lucide-react';
import { getApplicableDiscounts, validateDiscountCode } from '@/api/apiUtils';
import { toast } from 'react-hot-toast';

// Applied Discount Badge Component
const AppliedDiscountBadge = ({ discount, onRemove }) => (
    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
                <span className="text-sm text-green-800">
                    You saved ₹{Number(discount?.savings || 0).toFixed(1)} with{" "}
                    <span className="font-semibold">{discount?.code || ""}</span>
                </span>
            </div>
        </div>
        <button
            onClick={() => onRemove(discount.id)}
            className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
        >
            <Trash2 className="w-3 h-3" />
            Remove
        </button>
    </div>
);

/**
 * DiscountDrawer Component
 * 
 * Props:
 * @param {Array} appliedDiscounts - Array of currently applied discounts
 * @param {Function} setAppliedDiscounts - Setter function for applied discounts
 * @param {Object} dataToFetchDiscount - Object containing providerId, categoryId, bookingAmount, serviceIds, paymentMode
 * @param {boolean} loading - Loading state
 * @param {Function} setLoading - Setter for loading state
 */
const DiscountDrawer = ({
    appliedDiscounts = [],
    setAppliedDiscounts,
    dataToFetchDiscount,
    loading,
    setLoading
}) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedDiscounts, setSelectedDiscounts] = useState([]);
    const [allDiscounts, setAllDiscounts] = useState({
        applicable: [],
        near: [],
        summary: {
            totalApplicable: 0,
            totalNearApplicable: 0,
            maxSavings: 0,
        },
    });
    const [showError, setShowError] = useState(false);
    const [enteredCode, setEnteredCode] = useState("");
    const [userCity, setUserCity] = useState(["Bikaner"]);

    // Helper function to check if a discount is within the time range
    const isDiscountActive = (discount, now) => {
        const timeToSeconds = (timeString) => {
            if (!timeString) return null;
            const [hours = 0, minutes = 0, seconds = 0] = timeString
                .split(":")
                .map(Number);
            return hours * 3600 + minutes * 60 + seconds;
        };

        const startSeconds = timeToSeconds(discount?.applicableTimeStart);
        const endSeconds = timeToSeconds(discount?.applicableTimeEnd);
        const nowSeconds =
            now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        if (startSeconds === null && endSeconds === null) return true;
        if (startSeconds !== null && endSeconds === null) return nowSeconds >= startSeconds;
        if (startSeconds === null && endSeconds !== null) return nowSeconds <= endSeconds;
        if (startSeconds !== null && endSeconds !== null) {
            if (endSeconds < startSeconds) {
                return nowSeconds >= startSeconds || nowSeconds <= endSeconds;
            } else {
                return nowSeconds >= startSeconds && nowSeconds <= endSeconds;
            }
        }
        return false;
    };

    // Handle discount selection in drawer
    const handleSelectDiscount = (discount) => {
        setSelectedDiscounts((currentSelection) => {
            const isAlreadySelected = currentSelection.some((d) => d.id === discount.id);

            if (isAlreadySelected) {
                return [];
            }

            return [{
                id: discount.id,
                code: discount.code,
                name: discount.name,
                cities: userCity,
                value: discount.discountValue,
                type: discount.discountType,
                discountAmount: discount.discountAmount,
                finalAmount: discount.finalAmount,
                originalAmount: discount.originalAmount,
                savings: discount.savings,
                minOrderAmount: discount?.minOrderAmount,
            }];
        });
    };

    // Apply selected discounts
    const handleApply = () => {
        setAppliedDiscounts(selectedDiscounts);
        setIsDrawerOpen(false);
    };

    // Validate promo code
    const handleValidate = async () => {
        if (enteredCode.trim() === "") return;
        try {
            setLoading(true);
            const body = {
                ...dataToFetchDiscount,
                discountCode: enteredCode.trim(),
                cities: userCity
            };
            const response = await validateDiscountCode(body);
            if (response?.success) {
                const discountData = {
                    ...response?.data?.discount,
                    cities: userCity,
                    discountAmount: response?.data?.discountAmount,
                    finalAmount: response?.data?.finalAmount,
                    originalAmount: dataToFetchDiscount?.bookingAmount,
                    savings: dataToFetchDiscount?.bookingAmount - response?.data?.finalAmount,
                    minOrderAmount: response?.data?.minOrderAmount,
                };

                setAppliedDiscounts([discountData]);
                setEnteredCode("");
                toast.success('Promo code applied successfully!');
            } else {
                setShowError(true);
                toast.error('Invalid or non-applicable coupon code!');
                setTimeout(() => setShowError(false), 5000);
            }
        } catch (error) {
            console.error(error);
            setShowError(true);
            toast.error(error.response?.data?.message || 'Failed to validate promo code');
            setTimeout(() => setShowError(false), 5000);
        } finally {
            setLoading(false);
        }
    };

    // Remove applied discount
    const handleRemoveApplied = (discountId) => {
        const newApplied = appliedDiscounts.filter((d) => d.id !== discountId);
        setAppliedDiscounts(newApplied);
        setSelectedDiscounts(newApplied);
    };

    // Fetch discounts on component mount only (not on every render)
    useEffect(() => {
        let isCancelled = false;

        const fetchDiscounts = async () => {
            try {
                setLoading(true);
                const { providerId, bookingAmount } = dataToFetchDiscount || {};
                if (!providerId || !bookingAmount) {
                    return;
                }
                const response = await getApplicableDiscounts({
                    ...dataToFetchDiscount,
                    cities: userCity,
                });
                if (!isCancelled && response?.success) {
                    const now = new Date();
                    const applicableDiscounts =
                        response?.data?.applicableDiscounts?.filter((discount) =>
                            isDiscountActive(discount, now)
                        ) || [];

                    const nearApplicableDiscounts =
                        response?.data?.nearApplicableDiscounts?.filter((discount) =>
                            isDiscountActive(discount, now)
                        ) || [];

                    setAllDiscounts({
                        applicable: applicableDiscounts,
                        near: nearApplicableDiscounts,
                        summary: response?.data?.summary || {},
                    });
                }
            } catch (error) {
                console.error("Failed to fetch discounts", error);
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        // Only fetch if we have the required data and haven't fetched yet
        const providerId = dataToFetchDiscount?.providerId;
        const bookingAmount = dataToFetchDiscount?.bookingAmount;

        if (providerId && bookingAmount) {
            fetchDiscounts();
        }

        return () => {
            isCancelled = true;
        };
    }, [dataToFetchDiscount?.providerId, dataToFetchDiscount?.bookingAmount]);

    // Initialize selected discounts from applied discounts
    useEffect(() => {
        setSelectedDiscounts(appliedDiscounts);
    }, []);

    return (
        <>
            {/* Promo Code Input Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-brand-secondary" />
                    Promo Code
                </h2>

                {/* Input Field */}
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-sm"
                        placeholder="Enter discount code"
                    />
                    <button
                        onClick={handleValidate}
                        disabled={loading}
                        className="px-6 py-3 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 transition-colors disabled:opacity-50 font-medium text-sm flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Applying...
                            </>
                        ) : 'Apply'}
                    </button>
                </div>

                {/* Error Message */}
                {showError && (
                    <span className="text-xs text-red-500 mt-2 block">
                        Invalid or non-applicable coupon code!
                    </span>
                )}

                {/* Applied Discounts Badges */}
                {appliedDiscounts.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {appliedDiscounts.map((discount) => (
                            <AppliedDiscountBadge
                                key={discount.id}
                                discount={discount}
                                onRemove={handleRemoveApplied}
                            />
                        ))}
                    </div>
                )}

                {/* View All Coupons Link */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="mt-4 text-brand-secondary hover:text-brand-secondary/80 text-sm font-medium flex items-center gap-1"
                >
                    View all coupons
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Bottom Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-hidden"
                        >
                            {/* Drawer Handle */}
                            <div className="flex justify-center pt-3 pb-2">
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>

                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900">Apply Discounts</h3>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="overflow-y-auto max-h-[calc(80vh-180px)] px-6 py-4">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-brand-secondary animate-spin" />
                                        <span className="ml-3 text-gray-600">Loading...</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Applicable Discounts */}
                                        {allDiscounts.applicable.map((discount) => {
                                            const isSelected = selectedDiscounts.some((d) => d.id === discount.id);

                                            return (
                                                <div
                                                    key={discount.id}
                                                    onClick={() => handleSelectDiscount(discount)}
                                                    className={`p-4 mb-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                        ? 'border-brand-secondary bg-brand-secondary/5'
                                                        : 'border-gray-200 hover:border-brand-secondary/50'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex flex-col items-start">
                                                            <h3 className="font-semibold text-gray-900">{discount.name}</h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-sm text-brand-secondary font-medium">
                                                                    {discount.discountType === "percentage"
                                                                        ? `${Number(discount.discountValue)?.toFixed(0)}% OFF`
                                                                        : `₹${Number(discount.discountValue)?.toFixed(0)} OFF`}
                                                                </p>
                                                                {Number(discount?.maxDiscountAmount) > 0 && (
                                                                    <p className="text-sm text-gray-500">
                                                                        Upto ₹{Number(discount?.maxDiscountAmount || 0).toFixed(0)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500 mt-2 font-mono bg-gray-100 py-1 px-2 rounded">
                                                                {discount.code}
                                                            </span>
                                                        </div>
                                                        {isSelected ? (
                                                            <CheckCircle2 className="h-6 w-6 text-brand-secondary flex-shrink-0" />
                                                        ) : (
                                                            <Circle className="h-6 w-6 text-gray-300 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Near-Applicable Discounts */}
                                        {allDiscounts.near.map((discount) => (
                                            <div
                                                key={discount.id}
                                                className="p-4 mb-3 rounded-xl border-2 border-gray-200 bg-gray-100 opacity-70"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex flex-col items-start">
                                                        <h3 className="font-semibold text-gray-500">{discount.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-sm text-gray-500 font-medium">
                                                                {discount.discountType === "percentage"
                                                                    ? `${Number(discount.discountValue)?.toFixed(0)}% OFF`
                                                                    : `₹${Number(discount.discountValue)?.toFixed(0)} OFF`}
                                                            </p>
                                                            {Number(discount?.maxDiscountAmount) > 0 && (
                                                                <p className="text-sm text-gray-400">
                                                                    Upto ₹{Number(discount?.maxDiscountAmount || 0).toFixed(0)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <span className="text-xs font-mono bg-gray-200 py-1 px-2 rounded text-gray-500">
                                                        {discount.code}
                                                    </span>
                                                    <p className="mt-2 text-xs text-red-500">
                                                        Add more services worth ₹{discount?.amountNeeded} to apply this coupon
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Empty State */}
                                        {allDiscounts.applicable.length === 0 && allDiscounts.near.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <Gift className="w-16 h-16 text-gray-300 mb-4" />
                                                <p className="text-gray-600 font-medium">No Coupons Available!</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            {allDiscounts.applicable.length > 0 && (
                                <div className="px-6 py-4 border-t bg-white">
                                    <button
                                        onClick={handleApply}
                                        disabled={loading || selectedDiscounts.length === 0}
                                        className="w-full py-3 bg-brand-secondary text-white rounded-xl font-semibold hover:bg-brand-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Apply Discounts
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default DiscountDrawer;
