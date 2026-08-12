/**
 * Helper utility for calculating default warranty days based on purchase / sale price.
 * Tiers:
 * - ₹0 to ₹5,000  => 30 Days Warranty
 * - ₹5,000 to ₹10,000 => 60 Days Warranty
 * - Above ₹10,000 => 90 Days Warranty
 */
export const calculateDefaultWarranty = (price: number): number => {
  const numPrice = Number(price) || 0;
  if (numPrice <= 5000) {
    return 30;
  } else if (numPrice <= 10000) {
    return 60;
  } else {
    return 90;
  }
};

export const getWarrantyTierLabel = (price: number): string => {
  const numPrice = Number(price) || 0;
  if (numPrice <= 5000) {
    return "30 Days (Standard Tier ₹0-₹5,000)";
  } else if (numPrice <= 10000) {
    return "60 Days (Mid-Tier ₹5,000-₹10,000)";
  } else {
    return "90 Days (Premium Tier >₹10,000)";
  }
};
