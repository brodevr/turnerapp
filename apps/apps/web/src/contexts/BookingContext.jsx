
import React, { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    professional: null,
    service: null,
    date: null,
    timeSlot: null,
    customerInfo: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const updateBookingData = useCallback((field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetBooking = useCallback(() => {
    setBookingData({
      professional: null,
      service: null,
      date: null,
      timeSlot: null,
      customerInfo: {
        name: '',
        email: '',
        phone: ''
      }
    });
  }, []);

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
};
