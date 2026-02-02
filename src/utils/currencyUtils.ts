import { useSelector } from 'react-redux';
import {
  selectSelectedCurrency,
  selectAllCurrencies,
} from '../store/slices/currenciesSlice';
import { Currency } from '../database/schema';

/**
 * Hook to handle currency formatting and conversion
 */
export const useCurrency = () => {
  const selectedCurrency = useSelector(selectSelectedCurrency);
  const allCurrencies = useSelector(selectAllCurrencies);

  /**
   * Formats a price based on the selected currency.
   * Assumes the input price is in the base currency (e.g. USD).
   */
  const formatPrice = (price: number, sourceCurrencyCode: string = 'USD') => {
    if (!selectedCurrency) return `${price.toFixed(2)}`;

    // 1. Convert to base currency first (if input is not base)
    let basePrice = price;
    if (sourceCurrencyCode !== 'USD') {
      const sourceCurrency = allCurrencies.find(
        c => c.code === sourceCurrencyCode,
      );
      if (sourceCurrency && sourceCurrency.rate !== 0) {
        basePrice = price / sourceCurrency.rate;
      }
    }

    // 2. Convert from base to target
    const convertedPrice = basePrice * selectedCurrency.rate;

    // 3. Format with symbol
    return `${selectedCurrency.symbol}${convertedPrice.toFixed(2)}`;
  };

  /**
   * Converts a price from one currency to another.
   */
  const convertPrice = (price: number, fromCode: string, toCode: string) => {
    const fromCurrency = allCurrencies.find(c => c.code === fromCode);
    const toCurrency = allCurrencies.find(c => c.code === toCode);

    if (!fromCurrency || !toCurrency || fromCurrency.rate === 0) return price;

    const basePrice = price / fromCurrency.rate;
    return basePrice * toCurrency.rate;
  };

  return {
    formatPrice,
    convertPrice,
    selectedCurrency,
    allCurrencies,
  };
};

/**
 * Static utility for formatting (without hooks)
 */
export const formatCurrency = (
  price: number,
  currency: Currency | undefined,
) => {
  if (!currency) return price.toFixed(2);
  return `${currency.symbol}${(price * currency.rate).toFixed(2)}`;
};
