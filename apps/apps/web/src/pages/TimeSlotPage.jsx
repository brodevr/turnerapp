
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { getAllSlotsWithStatus, formatDate } from '@/utils/appointmentUtils';
import { Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TimeSlotPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookingData, updateBookingData } = useBooking();

  const [slots, setSlots] = useState([]); // [{ time, available }]
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookingData.professional || !bookingData.service || !bookingData.date) {
      navigate('/professionals');
      return;
    }

    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllSlotsWithStatus(
          bookingData.professional.id,
          bookingData.service.id,
          bookingData.date
        );
        setSlots(data);
      } catch {
        setError('Error al cargar los horarios. Por favor intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [bookingData, navigate]);

  const handleContinue = () => {
    if (selectedSlot) {
      updateBookingData('timeSlot', selectedSlot);
      navigate('/customer-form');
    }
  };

  const availableCount = slots.filter(s => s.available).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.timeSlots.title')}</h1>
            <p className="text-muted-foreground">
              {bookingData.service?.name} — {bookingData.professional?.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(bookingData.date)}
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('booking.timeSlots.subtitle')}</CardTitle>
              {!isLoading && slots.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  <span className="text-primary font-semibold">{availableCount}</span> de {slots.length} disponibles
                </span>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => navigate('/calendar')}>{t('booking.customer.back')}</Button>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">{t('booking.timeSlots.noSlots')}</p>
                  <Button onClick={() => navigate('/calendar')}>{t('booking.customer.back')}</Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {slots.map(({ time, available }) => {
                      const isSelected = selectedSlot === time;

                      if (!available) {
                        return (
                          <div
                            key={time}
                            title="Horario no disponible"
                            className="relative h-12 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                          >
                            <Lock className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                            <span className="text-xs text-muted-foreground/50 line-through">{time}</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedSlot(time)}
                          className={[
                            'relative h-12 rounded-lg border text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-md scale-[1.04]'
                              : 'bg-white border-primary/30 text-primary hover:bg-primary/5 hover:border-primary hover:scale-[1.02]',
                          ].join(' ')}
                        >
                          {isSelected && (
                            <CheckCircle2 className="absolute top-1 right-1 w-3 h-3 opacity-80" />
                          )}
                          {time}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-5 pt-4 border-t">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded border border-primary/40 bg-white inline-block" />
                      Disponible
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-muted-foreground/40" />
                      Ocupado / bloqueado
                    </span>
                    {selectedSlot && (
                      <span className="flex items-center gap-1.5 text-primary font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Seleccionado: {selectedSlot}
                      </span>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/calendar')}>
              {t('booking.customer.back')}
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleContinue} disabled={!selectedSlot}>
              {t('booking.customer.continue')}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TimeSlotPage;
