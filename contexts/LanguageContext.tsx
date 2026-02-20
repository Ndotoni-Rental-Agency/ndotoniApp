/**
 * Language Context for Mobile App
 * Provides language management for i18n
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@ndotoni:language';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

// Simple translations (can be expanded)
const translations: Record<Language, Record<string, string>> = {
  en: {
    'home': 'Home',
    'explore': 'Properties',
    'list': 'List Property',
    'messages': 'Messages',
    'profile': 'Profile',
    'welcome': 'Welcome',
    'signIn': 'Sign In',
    'signOut': 'Sign Out',
    'myProperties': 'My Properties',
    'myBookings': 'My Bookings',
    'settings': 'Settings',
    'help': 'Help & Support',
    'darkMode': 'Dark Mode',
    'language': 'Language',
    'preferences': 'Preferences',
  },
  sw: {
    'home': 'Nyumbani',
    'explore': 'Mali',
    'list': 'Orodhesha Mali',
    'messages': 'Ujumbe',
    'profile': 'Wasifu',
    'welcome': 'Karibu',
    'signIn': 'Ingia',
    'signOut': 'Toka',
    'myProperties': 'Mali Zangu',
    'myBookings': 'Uhifadhi Wangu',
    'settings': 'Mipangilio',
    'help': 'Msaada',
    'darkMode': 'Hali ya Giza',
    'language': 'Lugha',
    'preferences': 'Mapendeleo',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference
  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'sw')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('[LanguageContext] Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('[LanguageContext] Error saving language:', error);
    }
  };

  // Simple translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
