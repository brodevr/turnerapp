
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { useBooking } from '@/contexts/BookingContext.jsx';
import apiClient from '@/lib/apiClient';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProfessionalSelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateBookingData } = useBooking();
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const data = await apiClient.professionals.getAll();
        setProfessionals(data);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessionals();
  }, []);

  const handleSelect = (professional) => {
    updateBookingData('professional', professional);
    navigate('/services');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('booking.professionals.title')}</h1>
            <p className="text-muted-foreground">{t('booking.professionals.subtitle')}</p>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : professionals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">{t('booking.professionals.empty', { defaultValue: 'No professionals available.' })}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {professionals.map((professional) => (
                <Card 
                  key={professional.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleSelect(professional)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: professional.color || '#3B82F6' }}
                      >
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle>{professional.name}</CardTitle>
                        {professional.specialization && (
                          <CardDescription>{professional.specialization}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">{t('booking.professionals.selectBtn', { defaultValue: 'Select Professional' })}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfessionalSelectionPage;
