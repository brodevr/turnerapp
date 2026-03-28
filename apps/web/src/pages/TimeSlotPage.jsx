
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { getAvailableTimeSlots, formatDate, formatTime } from '@/utils/appointmentUtils';
import { useTranslation } from 'react-i18next';

const TimeSlotPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookingData, updateBookingData } = useBooking();
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingData.professional || !bookingData.service || !bookingData.date) {
      navigate('/professionals');
      return;
    }

    const fetchTimeSlots = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const slots = await getAvailableTimeSlots(
          bookingData.professional.id,
          bookingData.service.id,
          bookingData.date
        );
        setTimeSlots(slots);
      } catch (err) {
        setError('Error al cargar los horarios disponibles. Por favor intenta de nuevo.');
        console.error('Error fetching time slots:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [bookingData, navigate]);

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      updateBookingData('timeSlot', selectedSlot);
      navigate('/customer-form');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.timeSlots.title')}</h1>
            <p className="text-muted-foreground">
              {bookingData.service?.name} - {bookingData.professional?.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(bookingData.date)}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('booking.timeSlots.subtitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => navigate('/calendar')}>{t('booking.customer.back', { defaultValue: 'Back' })}</Button>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {t('booking.timeSlots.noSlots')}
                  </p>
                  <Button onClick={() => navigate('/calendar')}>{t('booking.customer.back', { defaultValue: 'Back' })}</Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? 'default' : 'outline'}
                      onClick={() => handleSlotSelect(slot)}
                      className="h-12"
                    >
                      {formatTime(slot)}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/calendar')}>
              {t('booking.customer.back', { defaultValue: 'Back' })}
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleContinue} disabled={!selectedSlot}>
              {t('booking.customer.continue', { defaultValue: 'Continue' })}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TimeSlotPage;
