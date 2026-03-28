import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import apiClient from '@/lib/apiClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, LogOut, MessageCircle, Plus, User } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ClientDashboard = () => {
  const { clientUser, logout, isLoading: authLoading } = useClientAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleReschedule = (appointment) => {
    const phoneNumber = "5491134686566"; // Replace with real company phone
    const message = encodeURIComponent(`${t('clientDashboard.rescheduleMsg')}: ${appointment.service?.name} (${appointment.date} ${appointment.start_time.substring(0, 5)})`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  useEffect(() => {
    if (!authLoading && !clientUser) {
      navigate('/client/login');
    }
  }, [clientUser, authLoading, navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await apiClient.clientAuth.getAppointments();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to load appointments', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (clientUser) {
      fetchAppointments();
    }
  }, [clientUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/client/login');
  };

  if (authLoading || (!clientUser && isLoading)) return <LoadingSpinner fullScreen />;

  const upcomingAppointments = appointments.filter(apt =>
    new Date(`${apt.date}T${apt.start_time}`) > new Date() && apt.status !== 'cancelled'
  );

  const pastAppointments = appointments.filter(apt =>
    new Date(`${apt.date}T${apt.start_time}`) <= new Date() || apt.status === 'cancelled'
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('clientDashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('clientDashboard.greeting', { name: clientUser?.name || '' })}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button onClick={() => navigate('/professionals')} className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              {t('clientDashboard.bookNew')}
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2 text-slate-600 hover:text-slate-900 w-full sm:w-auto">
              <LogOut className="w-4 h-4" />
              {t('clientDashboard.logout')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading your history..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {t('clientDashboard.upcoming')}
                </h2>
                {upcomingAppointments.length === 0 ? (
                  <Card className="border-dashed shadow-none bg-white/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-900">{t('clientDashboard.noUpcoming')}</p>
                      <p className="text-slate-500 mb-6">{t('clientDashboard.noUpcomingDesc')}</p>
                      <Button onClick={() => navigate('/professionals')}>{t('clientDashboard.bookNow')}</Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map(apt => (
                      <Card key={apt.id} className="overflow-hidden transition-all hover:shadow-md">
                        <div className="flex flex-col sm:flex-row">
                          <div className="bg-primary/5 p-6 flex flex-col justify-center items-center min-w-[140px] border-b sm:border-b-0 sm:border-r border-slate-100">
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                              {new Date(apt.date).toLocaleDateString(t('nav.home') === 'Home' ? 'en-US' : 'es-ES', { month: 'short' })}
                            </span>
                            <span className="text-4xl font-bold text-slate-900 my-1">
                              {new Date(apt.date).getDate()}
                            </span>
                            <span className="text-sm text-slate-500">
                              {new Date(apt.date).toLocaleDateString(t('nav.home') === 'Home' ? 'en-US' : 'es-ES', { weekday: 'short' })}
                            </span>
                          </div>
                          <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{apt.service?.name || 'Service'}</h3>
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                  apt.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-slate-500 text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  with {apt.professional?.name || 'Professional'}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReschedule(apt)}
                                  className="text-primary hover:text-primary/80 hover:bg-primary/5"
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" /> {t('clientDashboard.reschedule')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {pastAppointments.length > 0 && (
                <section className="pt-8 border-t">
                  <h2 className="text-xl font-semibold mb-4 text-slate-700">{t('clientDashboard.past')}</h2>
                  <div className="space-y-3">
                    {pastAppointments.map(apt => (
                      <Card key={apt.id} className="bg-slate-50/50 border-slate-200">
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-slate-700">{apt.service?.name}</h4>
                            <p className="text-sm text-slate-500">
                              {new Date(apt.date).toLocaleDateString()} at {apt.start_time.substring(0, 5)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500">with {apt.professional?.name}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${apt.status === 'cancelled' || apt.status === 'no_show'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-slate-200 text-slate-700'
                              }`}>
                              {apt.status}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>{t('clientDashboard.profileInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs text-slate-500">{t('clientDashboard.fullName')}</Label>
                    <p className="font-medium">{clientUser?.name} {clientUser?.lastname}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">{t('clientDashboard.emailConfigured')}</Label>
                    <p className="font-medium">{clientUser?.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">{t('clientDashboard.phone')}</Label>
                    <p className="font-medium">{clientUser?.phone || t('clientDashboard.notProvided')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ClientDashboard;
