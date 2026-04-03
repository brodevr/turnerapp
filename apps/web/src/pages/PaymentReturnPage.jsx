
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';

const PaymentReturnPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetBooking } = useBooking();

  const params     = new URLSearchParams(location.search);
  const status     = params.get('collection_status') || params.get('status');
  const pathType   = location.pathname.split('/').pop(); // 'success', 'failure', 'pending'

  const isApproved = pathType === 'success' && status === 'approved';
  const isPending  = pathType === 'pending' || status === 'pending' || status === 'in_process';

  // Read before the useEffect clears them
  const appointmentId  = sessionStorage.getItem('pending_appointment_id');
  const retryPaymentUrl = sessionStorage.getItem('pending_payment_url');

  useEffect(() => {
    if (isApproved) {
      sessionStorage.removeItem('pending_appointment_id');
      sessionStorage.removeItem('pending_payment_url');
      resetBooking();
    }
  }, []);

  const content = (() => {
    if (isApproved) {
      return {
        icon:    <CheckCircle2 className="w-16 h-16 text-green-500" />,
        title:   '¡Pago recibido!',
        message: 'Tu seña fue acreditada y tu turno está confirmado. Recibirás un email con los detalles.',
        bg:      'bg-green-50 border-green-100',
        extra: appointmentId ? (
          <div className="bg-white/60 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground">Referencia de turno</p>
            <p className="font-mono font-semibold">#{appointmentId}</p>
          </div>
        ) : null,
        action:  <Button onClick={() => navigate('/')}>Volver al inicio</Button>,
      };
    }
    if (isPending) {
      return {
        icon:    <Clock className="w-16 h-16 text-yellow-500" />,
        title:   'Pago en proceso',
        message: 'Tu pago está siendo procesado. Te notificaremos por email cuando se acredite y tu turno quede confirmado.',
        bg:      'bg-yellow-50 border-yellow-100',
        extra:   null,
        action:  <Button onClick={() => navigate('/')}>Volver al inicio</Button>,
      };
    }
    // failure / rejected
    return {
      icon:    <XCircle className="w-16 h-16 text-red-500" />,
      title:   'Pago no completado',
      message: 'No pudimos procesar tu pago. Tu turno quedó pendiente.',
      bg:      'bg-red-50 border-red-100',
      extra:   null,
      action: (
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={() => {
            sessionStorage.removeItem('pending_appointment_id');
            sessionStorage.removeItem('pending_payment_url');
            navigate('/');
          }}>Cancelar turno</Button>
          {retryPaymentUrl && (
            <Button onClick={() => { window.location.href = retryPaymentUrl; }}>
              Reintentar pago
            </Button>
          )}
        </div>
      ),
    };
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className={`border ${content.bg}`}>
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex justify-center">{content.icon}</div>
              <h1 className="text-2xl font-bold">{content.title}</h1>
              <p className="text-muted-foreground">{content.message}</p>
              {content.extra}
              {content.action}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentReturnPage;
