/**
 * Currency conversion utilities using Frankfurter API
 * https://frankfurter.dev/
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

// Map of country codes to currencies
const COUNTRY_TO_CURRENCY: Record<string, CurrencyInfo> = {
  AU: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  US: { code: "USD", symbol: "$", name: "US Dollar" },
  GB: { code: "GBP", symbol: "£", name: "British Pound" },
  EU: { code: "EUR", symbol: "€", name: "Euro" },
  CN: { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  JP: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  IN: { code: "INR", symbol: "₹", name: "Indian Rupee" },
  CA: { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  NZ: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  SG: { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  HK: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  KR: { code: "KRW", symbol: "₩", name: "South Korean Won" },
  TH: { code: "THB", symbol: "฿", name: "Thai Baht" },
  MY: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  ID: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  PH: { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  VN: { code: "VND", symbol: "₫", name: "Vietnamese Dong" },
  ZA: { code: "ZAR", symbol: "R", name: "South African Rand" },
  BR: { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  MX: { code: "MXN", symbol: "Mex$", name: "Mexican Peso" },
  AE: { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  SA: { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  CH: { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  SE: { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  NO: { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  DK: { code: "DKK", symbol: "kr", name: "Danish Krone" },
  PL: { code: "PLN", symbol: "zł", name: "Polish Zloty" },
  CZ: { code: "CZK", symbol: "Kč", name: "Czech Koruna" },
  HU: { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  RO: { code: "RON", symbol: "lei", name: "Romanian Leu" },
  TR: { code: "TRY", symbol: "₺", name: "Turkish Lira" },
  IL: { code: "ILS", symbol: "₪", name: "Israeli Shekel" },
  NG: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  KE: { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
  GH: { code: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
  EG: { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  MA: { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
  TZ: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
  UG: { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
  ET: { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
  AO: { code: "AOA", symbol: "Kz", name: "Angolan Kwanza" },
  ZM: { code: "ZMW", symbol: "ZK", name: "Zambian Kwacha" },
  ZW: { code: "ZWL", symbol: "Z$", name: "Zimbabwean Dollar" },
  BW: { code: "BWP", symbol: "P", name: "Botswana Pula" },
  MU: { code: "MUR", symbol: "₨", name: "Mauritian Rupee" },
  RW: { code: "RWF", symbol: "FRw", name: "Rwandan Franc" },
  SN: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
  CI: { code: "XOF", symbol: "CFA", name: "West African CFA Franc" },
  CM: { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc" },
};

// Default currency (Australian Dollar)
const DEFAULT_CURRENCY: CurrencyInfo = { code: "AUD", symbol: "A$", name: "Australian Dollar" };

// Base price in AUD cents
const BASE_PRICE_AUD = 39900; // $399 AUD

/**
 * Get user's country code from IP using a free geolocation service
 */
export async function getUserCountryCode(): Promise<string | null> {
  try {
    // Try ipapi.co first (free tier allows 1000 requests/day)
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn("ipapi.co failed, trying fallback...");
      // Fallback to ipify + ipapi (free, HTTPS)
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();

        const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          console.log("=== IP Geolocation Data (Fallback) ===");
          console.log("Country Code:", geoData.country_code);
          console.log("Country Name:", geoData.country_name);
          console.log("======================================");
          return geoData.country_code || null;
        }
      } catch (fallbackError) {
        console.warn("Fallback also failed:", fallbackError);
      }

      return null;
    }

    const data = await response.json();
    console.log("=== IP Geolocation Data ===");
    console.log("Full response:", data);
    console.log("Country Code:", data.country_code);
    console.log("Country Name:", data.country_name);
    console.log("IP Address:", data.ip);
    console.log("City:", data.city);
    console.log("Region:", data.region);
    console.log("========================");

    return data.country_code || null;
  } catch (error) {
    console.error("Failed to get user country:", error);
    return null;
  }
}

/**
 * Get currency info for a country code
 */
export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  // Check for EU countries
  const euCountries = ["DE", "FR", "IT", "ES", "PT", "NL", "BE", "AT", "IE", "FI", "GR", "LU", "MT", "CY", "SK", "SI", "EE", "LV", "LT"];
  if (euCountries.includes(countryCode)) {
    return COUNTRY_TO_CURRENCY.EU;
  }

  return COUNTRY_TO_CURRENCY[countryCode] || DEFAULT_CURRENCY;
}

/**
 * Fetch exchange rate from Frankfurter API (primary) or exchangerate-api.com (fallback)
 */
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
  if (fromCurrency === toCurrency) return 1;

  try {
    // Try Frankfurter API first (supports major currencies)
    const frankfurterResponse = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`);

    if (frankfurterResponse.ok) {
      const data = await frankfurterResponse.json();
      console.log("✅ Frankfurter API response:", data);
      return data.rates[toCurrency] || null;
    }

    console.log("⚠️ Frankfurter API failed, trying alternative API...");

    // Fallback to exchangerate-api.com (free tier, supports more currencies including African currencies)
    const fallbackResponse = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);

    if (!fallbackResponse.ok) {
      console.error(`Fallback API error: ${fallbackResponse.status} ${fallbackResponse.statusText}`);
      return null;
    }

    const fallbackData = await fallbackResponse.json();
    console.log("✅ Fallback API response:", fallbackData);

    return fallbackData.rates[toCurrency] || null;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    return null;
  }
}

/**
 * Convert price from AUD to target currency
 */
export async function convertPrice(targetCurrency: string): Promise<{ amount: number; currency: CurrencyInfo } | null> {
  try {
    const rate = await getExchangeRate("AUD", targetCurrency);
    if (!rate) return null;

    const convertedAmount = Math.round((BASE_PRICE_AUD / 100) * rate);
    const currencyInfo = Object.values(COUNTRY_TO_CURRENCY).find((c) => c.code === targetCurrency) || DEFAULT_CURRENCY;

    return {
      amount: convertedAmount,
      currency: currencyInfo,
    };
  } catch (error) {
    console.error("Failed to convert price:", error);
    return null;
  }
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: CurrencyInfo): string {
  // For currencies that typically don't show decimals (JPY, KRW, etc.)
  const noDecimalCurrencies = ["JPY", "KRW", "VND", "IDR"];
  const decimals = noDecimalCurrencies.includes(currency.code) ? 0 : 0;

  // Format with proper thousand separators
  const formattedNumber = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${currency.symbol}${formattedNumber}`;
}

/**
 * Get user's currency and converted price
 */
export async function getUserPricing(): Promise<{ amount: number; currency: CurrencyInfo; formatted: string }> {
  try {
    console.log("📍 Getting user country code...");
    // Get user's country
    const countryCode = await getUserCountryCode();

    if (!countryCode) {
      console.log("⚠️ No country code detected, falling back to AUD");
      // Fallback to default (AUD)
      return {
        amount: BASE_PRICE_AUD / 100,
        currency: DEFAULT_CURRENCY,
        formatted: formatPrice(BASE_PRICE_AUD / 100, DEFAULT_CURRENCY),
      };
    }

    console.log("✅ Country code detected:", countryCode);

    // Get currency for country
    const currency = getCurrencyForCountry(countryCode);
    console.log("💱 Currency for country:", currency);

    // If already AUD, no conversion needed
    if (currency.code === "AUD") {
      console.log("ℹ️ Currency is AUD, no conversion needed");
      return {
        amount: BASE_PRICE_AUD / 100,
        currency,
        formatted: formatPrice(BASE_PRICE_AUD / 100, currency),
      };
    }

    console.log("🔄 Converting AUD to", currency.code);
    // Convert price
    const converted = await convertPrice(currency.code);

    if (!converted) {
      console.log("⚠️ Conversion failed, falling back to AUD");
      // Fallback to AUD if conversion fails
      return {
        amount: BASE_PRICE_AUD / 100,
        currency: DEFAULT_CURRENCY,
        formatted: formatPrice(BASE_PRICE_AUD / 100, DEFAULT_CURRENCY),
      };
    }

    console.log("✅ Conversion successful:", converted);
    return {
      amount: converted.amount,
      currency: converted.currency,
      formatted: formatPrice(converted.amount, converted.currency),
    };
  } catch (error) {
    console.error("❌ Failed to get user pricing:", error);
    // Fallback to default
    return {
      amount: BASE_PRICE_AUD / 100,
      currency: DEFAULT_CURRENCY,
      formatted: formatPrice(BASE_PRICE_AUD / 100, DEFAULT_CURRENCY),
    };
  }
}
