
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Currency = 'DZD' | 'USD' | 'EUR' | 'GBP' | 'CHF' | 'EGP';

const conversionRates: Record<Currency, number> = {
  DZD: 1,
  USD: 1 / 134.5,
  EUR: 1 / 145.2,
  GBP: 1 / 171.1,
  CHF: 1 / 150.5,
  EGP: 1 / 2.85,
};

const currencySymbols: Record<Currency, string> = {
  DZD: 'DA',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CHF: 'CHF',
  EGP: 'E£'
};

const currencyFlags: Record<Currency, string> = {
  DZD: '🇩🇿',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  EGP: '🇪🇬'
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInDZD: number, isRawValue?: boolean) => string;
  convertFromDZD: (priceInDZD: number) => number;
  getCurrencySymbol: (curr?: Currency) => string;
  getCurrencyFlag: (curr?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('DZD');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stayfloow_currency') as Currency;
    if (saved && conversionRates[saved]) {
      setCurrency(saved);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('stayfloow_currency', currency);
    }
  }, [currency, mounted]);

  const convertFromDZD = (priceInDZD: number) => {
    return priceInDZD * conversionRates[currency];
  };

  const getCurrencySymbol = (curr?: Currency) => {
    return currencySymbols[curr || currency];
  };

  const getCurrencyFlag = (curr?: Currency) => {
    return currencyFlags[curr || currency];
  };

  const formatPrice = (priceInDZD: number, isRawValue = false) => {
    if (!mounted) return priceInDZD.toString(); // Safety for hydration

    const rate = conversionRates[currency];
    const convertedPrice = priceInDZD * rate;

    if (isRawValue) {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedPrice);
    }

    if (currency === 'DZD') {
      return new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 0,
      }).format(convertedPrice);
    }

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(convertedPrice);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertFromDZD,
        getCurrencySymbol,
        getCurrencyFlag,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "DZD" as Currency,
      setCurrency: () => {},
      formatPrice: (p: number) => p.toString(),
      convertFromDZD: (p: number) => p,
      getCurrencySymbol: () => "DA",
      getCurrencyFlag: () => "🇩🇿",
    };
  }
  return context;
};
