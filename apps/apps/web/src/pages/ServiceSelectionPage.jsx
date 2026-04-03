import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import apiClient from '@/lib/apiClient';
import { Clock, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ServiceSelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookingData, updateBookingData } = useBooking();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!bookingData.professional) {
      navigate('/professionals');
      return;
    }

    const fetchServices = async () => {
      try {
        const data = await apiClient.services.getAll();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, [bookingData.professional, navigate]);

  const handleSelect = (service) => {
    updateBookingData('service', service);
    navigate('/calendar');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.services.title')}</h1>
            <p className="text-muted-foreground">
              {t('booking.services.subtitle')} - {bookingData.professional?.name}
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t('booking.services.empty', { defaultValue: 'No services available.' })}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
                  onClick={() => handleSelect(service)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: service.color || '#3B82F6' }}
                        >
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{service.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>{service.duration_minutes} {t('booking.services.minutes', { defaultValue: 'min' })}</span>
                            {Number(service.price) > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-primary flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  ${Number(service.price).toFixed(2)}
                                </span>
                              </>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{service.description}</p>
                    )}
                    <Button className="w-full">{t('booking.services.selectBtn', { defaultValue: 'Select Service' })}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/professionals')}>
              {t('booking.services.backBtn', { defaultValue: 'Back to Professionals' })}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceSelectionPage;
