
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SuccessPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const appointmentId = location.state?.appointmentId;
  const { resetBooking } = useBooking();

  React.useEffect(() => {
    resetBooking();
  }, [resetBooking]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{t('booking.success.title', { defaultValue: 'Appointment Confirmed' })}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                {t('booking.success.message', { defaultValue: 'Your appointment has been successfully booked. You will receive a confirmation email shortly.' })}
              </p>
              {appointmentId && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t('booking.success.reference', { defaultValue: 'Appointment Reference' })}</p>
                  <p className="font-mono font-medium">{appointmentId}</p>
                </div>
              )}
              <div className="pt-6">
                <Button onClick={() => navigate('/')}>
                  {t('booking.success.returnHome', { defaultValue: 'Return to Home' })}
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

export default SuccessPage;
