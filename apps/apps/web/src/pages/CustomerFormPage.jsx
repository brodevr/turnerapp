import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import { useTranslation } from 'react-i18next';

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useBooking();
  const { clientUser } = useClientAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: clientUser ? `${clientUser.name} ${clientUser.lastname}` : (bookingData.customerInfo?.name || ''),
    email: clientUser ? clientUser.email : (bookingData.customerInfo?.email || ''),
    phone: clientUser ? (clientUser.phone || '') : (bookingData.customerInfo?.phone || ''),
    patient_id: clientUser ? clientUser.id : null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (clientUser) {
      setFormData({
        name: `${clientUser.name} ${clientUser.lastname}`,
        email: clientUser.email,
        phone: clientUser.phone || '',
        patient_id: clientUser.id
      });
    }
  }, [clientUser]);

  if (!bookingData.professional || !bookingData.service || !bookingData.date || !bookingData.timeSlot) {
    navigate('/professionals');
    return null;
  }

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('booking.customer.errors.name');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('booking.customer.errors.emailReq');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('booking.customer.errors.emailInvalid');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('booking.customer.errors.phoneReq');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateBookingData('customerInfo', formData);
      navigate('/confirmation');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          
          {clientUser ? (
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{t('booking.customer.titleAuth')}</h1>
              <p className="text-muted-foreground">
                {t('booking.customer.subtitleAuth')}
              </p>
            </div>
          ) : (
            <div className="mb-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{t('booking.customer.titleGuest')}</h1>
                <p className="text-muted-foreground">
                  {t('booking.customer.subtitleGuest')}
                </p>
              </div>

              <Card className="border-primary/20 bg-primary/5 shadow-sm">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-primary mb-1">{t('booking.customer.haveAccount')}</h3>
                    <p className="text-sm text-slate-600">{t('booking.customer.haveAccountDesc')}</p>
                  </div>
                  <div className="flex flex-col w-full sm:w-auto gap-3 min-w-[200px]">
                    <Button variant="outline" className="w-full bg-white hover:bg-slate-50" onClick={() => navigate('/login', { state: { from: { pathname: '/customer-form' } } })}>
                      {t('booking.customer.loginBtn')}
                    </Button>
                    <Button variant="default" className="w-full" onClick={() => navigate('/client/register', { state: { redirect: '/customer-form' } })}>
                      {t('booking.customer.registerBtn')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{clientUser ? t('booking.customer.formTitleAuth') : t('booking.customer.formTitleGuest')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('booking.customer.fullName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('booking.customer.fullNamePlaceholder')}
                    readOnly={!!clientUser}
                    className={clientUser ? "bg-slate-50 text-slate-500 font-medium" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('booking.customer.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('booking.customer.emailPlaceholder')}
                    readOnly={!!clientUser}
                    className={clientUser ? "bg-slate-50 text-slate-500 font-medium" : ""}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('booking.customer.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('booking.customer.phonePlaceholder')}
                    readOnly={!!clientUser}
                    className={clientUser ? "bg-slate-50 text-slate-500 font-medium" : ""}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <Button type="button" variant="outline" className="w-full sm:w-auto h-11" onClick={() => navigate('/time-slots')}>
                    {t('booking.customer.back')}
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto h-11 text-md">
                    {t('booking.customer.continue')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerFormPage;
