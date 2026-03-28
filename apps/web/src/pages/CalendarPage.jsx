
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { useTranslation } from 'react-i18next';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookingData, updateBookingData } = useBooking();
  const [selectedDate, setSelectedDate] = useState(null);

  if (!bookingData.professional || !bookingData.service) {
    navigate('/professionals');
    return null;
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleContinue = () => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      updateBookingData('date', dateStr);
      navigate('/time-slots');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.calendar.title')}</h1>
            <p className="text-muted-foreground">
              {bookingData.service?.name} - {bookingData.professional?.name}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('booking.calendar.subtitle')}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < today}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/services')}>
              {t('booking.services.backBtn', { defaultValue: 'Back to Services' })}
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleContinue} disabled={!selectedDate}>
              {t('booking.customer.continue', { defaultValue: 'Continue' })}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CalendarPage;
