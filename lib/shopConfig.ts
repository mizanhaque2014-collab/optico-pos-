// OPTICO POS - Dynamic Shop Profile Configuration
// This file resolves shop information dynamically from localStorage to support multi-tenant deployments without code changes.

export interface ShopProfile {
  shopName: string;
  addressLine1: string;
  addressLine2: string;
  mobile: string;
  whatsapp: string;
  email: string;
  gstin: string;
  logo: string;
}

const DEFAULT_PROFILE: ShopProfile = {
  shopName: "OPTICO POS",
  addressLine1: "Primary Optical Hub",
  addressLine2: "Central Business District",
  mobile: "9999999999",
  whatsapp: "9999999999",
  email: "info@opticopos.com",
  gstin: "",
  logo: "",
};

function getStoredProfile(): Partial<ShopProfile> {
  if (typeof window === "undefined") return {};
  try {
    const custom = localStorage.getItem("opt_shop_profile");
    if (custom) {
      return JSON.parse(custom);
    }
  } catch (e) {
    console.warn("Failed to parse opt_shop_profile from localStorage:", e);
  }
  return {};
}

export const shopConfig = {
  get shopName(): string {
    return getStoredProfile().shopName || DEFAULT_PROFILE.shopName;
  },
  get addressLine1(): string {
    return getStoredProfile().addressLine1 || DEFAULT_PROFILE.addressLine1;
  },
  get addressLine2(): string {
    return getStoredProfile().addressLine2 || DEFAULT_PROFILE.addressLine2;
  },
  get mobile(): string {
    return getStoredProfile().mobile || DEFAULT_PROFILE.mobile;
  },
  get whatsapp(): string {
    return getStoredProfile().whatsapp || DEFAULT_PROFILE.whatsapp;
  },
  get email(): string {
    return getStoredProfile().email || DEFAULT_PROFILE.email;
  },
  get gstin(): string {
    return getStoredProfile().gstin || DEFAULT_PROFILE.gstin;
  },
  get logo(): string {
    return getStoredProfile().logo || DEFAULT_PROFILE.logo;
  },
};

// Helper to save a custom shop profile
export function saveShopProfile(profile: Partial<ShopProfile>) {
  if (typeof window !== "undefined") {
    localStorage.setItem("opt_shop_profile", JSON.stringify(profile));
    // Trigger storage event for same-window updates
    window.dispatchEvent(new Event("storage"));
  }
}
