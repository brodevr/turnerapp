
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { formatDate, formatTime } from '@/utils/appointmentUtils';
import apiClient from '@/lib/apiClient';
import { Calendar, Clock, User, Briefcase, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookingData, resetBooking } = useBooking();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!bookingData.professional || !bookingData.service || !bookingData.date || !bookingData.timeSlot || !bookingData.customerInfo) {
    navigate('/professionals');
    return null;
  }

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate end time based on service duration
      const [hours, minutes] = bookingData.timeSlot.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + bookingData.service.duration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

      const appointmentData = {
        date: bookingData.date,
        start_time: bookingData.timeSlot,
        end_time: endTime,
        status: 'pending', // Laravel uses pending as default
        professional_id: bookingData.professional.id,
        service_id: bookingData.service.id,
        patient_id: bookingData.customerInfo.patient_id || null,
        customer_name: bookingData.customerInfo.name,
        customer_email: bookingData.customerInfo.email,
        customer_phone: bookingData.customerInfo.phone
      };

      const appointment = await apiClient.appointments.create(appointmentData);
      
      navigate('/success', { state: { appointmentId: appointment.id } });
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(t('booking.error', { defaultValue: 'Error al crear la cita. Por favor intenta de nuevo.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.confirmation.title')}</h1>
            <p className="text-muted-foreground">{t('booking.confirmation.subtitle')}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('booking.confirmation.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('booking.confirmation.professional')}</p>
                  <p className="text-muted-foreground">{bookingData.professional.name}</p>
                  {bookingData.professional.specialization && (
                    <p className="text-sm text-muted-foreground">{bookingData.professional.specialization}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('booking.confirmation.service')}</p>
                  <p className="text-muted-foreground">{bookingData.service.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{bookingData.service.duration} minutes</p>
                    {Number(bookingData.service.price) > 0 && (
                      <>
                        <span className="text-muted-foreground text-sm">•</span>
                        <p className="text-sm font-semibold text-primary">${Number(bookingData.service.price).toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('booking.confirmation.date')}</p>
                  <p className="text-muted-foreground">{formatDate(bookingData.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{t('booking.confirmation.time')}</p>
                  <p className="text-muted-foreground">{formatTime(bookingData.timeSlot)}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">{t('booking.confirmation.customerInfo')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <p className="text-muted-foreground">{bookingData.customerInfo.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <p className="text-muted-foreground">{bookingData.customerInfo.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <p className="text-muted-foreground">{bookingData.customerInfo.phone}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/customer-form')}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {t('booking.confirmation.back')}
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  disabled={isLoading}
                  className="w-full sm:flex-1"
                >
                  {isLoading ? t('booking.confirmation.confirmIng') : t('booking.confirmation.confirmBtn')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConfirmationPage;
