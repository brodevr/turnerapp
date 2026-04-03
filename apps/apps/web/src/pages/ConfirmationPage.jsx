
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { formatDate, formatTime } from '@/utils/appointmentUtils';
import apiClient from '@/lib/apiClient';
import { Calendar, Clock, User, Briefcase, Mail, Phone, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookingData } = useBooking();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    apiClient.payments.getSettings()
      .then(s => setPaymentSettings(s))
      .catch(() => {}); // non-blocking — falls back to free flow if unavailable
  }, []);

  useEffect(() => {
    if (!bookingData.professional || !bookingData.service || !bookingData.date || !bookingData.timeSlot || !bookingData.customerInfo) {
      navigate('/professionals');
    }
  }, [bookingData, navigate]);

  if (!bookingData.professional || !bookingData.service || !bookingData.date || !bookingData.timeSlot || !bookingData.customerInfo) {
    return null;
  }

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate end time based on service duration
      const [hours, minutes] = bookingData.timeSlot.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + bookingData.service.duration_minutes;
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

      const result = await apiClient.appointments.create(appointmentData);

      if (result.payment?.init_point) {
        const paymentUrl = result.payment.init_point || result.payment.sandbox_init_point;
        sessionStorage.setItem('pending_appointment_id', result.data.id);
        sessionStorage.setItem('pending_payment_url', paymentUrl);
        window.location.href = paymentUrl;
      } else {
        navigate('/success', { state: { appointmentId: result.data.id } });
      }
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
                    <p className="text-sm text-muted-foreground">{bookingData.service.duration_minutes} min</p>
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

              {/* Deposit info when payment is required */}
              {paymentSettings?.payment_enabled && Number(bookingData.service?.price) > 0 && (() => {
                const total   = Number(bookingData.service.price);
                const pct     = paymentSettings.deposit_percentage;
                const deposit = Math.round(total * pct / 100 * 100) / 100;
                return (
                  <div className="border rounded-lg p-4 bg-primary/5 border-primary/20 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <CreditCard className="w-4 h-4" />
                      Seña requerida para confirmar el turno
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Precio total del servicio</span>
                      <span className="font-medium">${total.toLocaleString('es-AR')} ARS</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Seña ({pct}%)</span>
                      <Badge variant="secondary" className="text-primary font-bold">
                        ${deposit.toLocaleString('es-AR')} ARS
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Serás redirigido a MercadoPago para abonar la seña. El turno se confirmará automáticamente al acreditarse el pago.
                    </p>
                  </div>
                );
              })()}

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
