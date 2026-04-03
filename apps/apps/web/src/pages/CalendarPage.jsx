
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { formatDate } from '@/utils/appointmentUtils';
import apiClient from '@/lib/apiClient';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookingData, updateBookingData } = useBooking();

  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]); // ['YYYY-MM-DD', ...]
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(new Date());

  if (!bookingData.professional || !bookingData.service) {
    navigate('/professionals');
    return null;
  }

  const fetchMonthAvailability = useCallback(async (month) => {
    setLoadingMonth(true);
    try {
      const dates = await apiClient.availability.getMonth(
        bookingData.professional.id,
        bookingData.service.id,
        month.getFullYear(),
        month.getMonth() + 1
      );
      setAvailableDates(dates);
    } catch {
      setAvailableDates([]);
    } finally {
      setLoadingMonth(false);
    }
  }, [bookingData.professional.id, bookingData.service.id]);

  useEffect(() => {
    fetchMonthAvailability(displayMonth);
  }, [fetchMonthAvailability, displayMonth]);

  const handleDateSelect = (date) => {
    if (!date) return;
    const dateStr = date.toLocaleDateString('sv-SE'); // gives 'YYYY-MM-DD' without timezone issues
    if (!availableDates.includes(dateStr)) return; // block selecting unavailable days
    setSelectedDate(date);
    updateBookingData('timeSlot', null);
  };

  const handleMonthChange = (month) => {
    setDisplayMonth(month);
    setSelectedDate(null);
  };

  const handleContinue = () => {
    if (selectedDate) {
      const dateStr = selectedDate.toLocaleDateString('sv-SE');
      updateBookingData('date', dateStr);
      navigate('/time-slots');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a Set for O(1) lookups
  const availableSet = new Set(availableDates);

  // Disable days: past days OR future days with no availability
  const isDisabled = (date) => {
    if (date < today) return true;
    const dateStr = date.toLocaleDateString('sv-SE');
    return !availableSet.has(dateStr);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.calendar.title')}</h1>
            <p className="text-muted-foreground">
              {bookingData.service?.name} — {bookingData.professional?.name}
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>{t('booking.calendar.subtitle')}</CardTitle>
              {loadingMonth && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Cargando disponibilidad...
                </span>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={displayMonth}
                onMonthChange={handleMonthChange}
                disabled={isDisabled}
                modifiers={{
                  available: (date) => {
                    if (date < today) return false;
                    return availableSet.has(date.toLocaleDateString('sv-SE'));
                  },
                }}
                modifiersClassNames={{
                  available: 'calendar-day-available',
                }}
                className="rounded-md border w-full"
              />

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center pt-1 pb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                  Días disponibles
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-muted border inline-block" />
                  Sin turnos
                </span>
                {selectedDate && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-primary/80 ring-2 ring-primary inline-block" />
                    {formatDate(selectedDate.toLocaleDateString('sv-SE'))}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/services')}>
              {t('booking.services.backBtn')}
            </Button>
            <Button
              className="w-full sm:w-auto"
              onClick={handleContinue}
              disabled={!selectedDate || loadingMonth}
            >
              {t('booking.customer.continue')}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalendarPage;
