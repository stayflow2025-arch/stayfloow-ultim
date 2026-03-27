
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Currency = 'EUR' | 'DZD' | 'USD' | 'GBP' | 'CHF' | 'EGP';

/**
 * Taux de conversion avec l'EURO comme monnaie de référence (1 EUR = X)
 * Valeurs indicatives pour la version locale StayFloow
 */
const conversionRates: Record<Currency, number> = {
  EUR: 1,
  DZD: 145.2, // 1 EUR = 145.2 DZD (approx)
  USD: 1.08,  // 1 EUR = 1.08 USD
  GBP: 0.83,  // 1 EUR = 0.83 GBP
  CHF: 0.95,  // 1 EUR = 0.95 CHF
  EGP: 52.5,  // 1 EUR = 52.5 EGP
};

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  DZD: 'DA',
  USD: '$',
  GBP: '£',
  CHF: 'CHF',
  EGP: 'E£'
};

const currencyFlags: Record<Currency, string> = {
  EUR: '🇪🇺',
  DZD: '🇩🇿',
  USD: '🇺🇸',
  GBP: '🇬🇧',
  CHF: '🇨🇭',
  EGP: '🇪🇬'
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInBase: number, isRawValue?: boolean) => string;
  convertFromBase: (priceInBase: number) => number;
  getCurrencySymbol: (curr?: Currency) => string;
  getCurrencyFlag: (curr?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<Currency>('EUR');
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

  const convertFromBase = (priceInBase: number) => {
    return priceInBase * (conversionRates[currency] || 1);
  };

  const getCurrencySymbol = (curr?: Currency) => {
    return currencySymbols[curr || currency];
  };

  const getCurrencyFlag = (curr?: Currency) => {
    return currencyFlags[curr || currency];
  };

  const formatPrice = (priceInBase: number, isRawValue = false) => {
    if (!mounted) return priceInBase.toLocaleString();

    const rate = conversionRates[currency] || 1;
    const convertedPrice = priceInBase * rate;

    if (isRawValue) {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(convertedPrice);
    }

    // Formatage spécifique pour le Dinar Algérien
    if (currency === 'DZD') {
      return new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 0,
      }).format(convertedPrice);
    }

    // Formatage standard pour les autres devises
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'EUR' || currency === 'USD' ? 2 : 0,
    }).format(convertedPrice);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertFromBase,
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
      currency: "EUR" as Currency,
      setCurrency: () => {},
      formatPrice: (p: number) => p.toLocaleString() + " €",
      convertFromBase: (p: number) => p,
      getCurrencySymbol: () => "€",
      getCurrencyFlag: () => "🇪🇺",
    };
  }
  return context;
};
