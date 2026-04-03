
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import apiClient from '@/lib/apiClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  LogOut, 
  MessageCircle, 
  Plus, 
  User, 
  Settings, 
  Lock, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const ClientDashboard = () => {
  const { clientUser, logout, isLoading: authLoading, updateClientUser } = useClientAuth();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    lastname: '',
    phone: '',
    dni: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [passForm, setPassForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  useEffect(() => {
    if (!authLoading && !clientUser) {
      navigate('/login');
    } else if (clientUser) {
      setProfileForm({
        name: clientUser.name || '',
        lastname: clientUser.lastname || '',
        phone: clientUser.phone || '',
        dni: clientUser.dni || '',
      });
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
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const response = await apiClient.patch('/client/profile', profileForm);
      updateClientUser(response.record);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error(err.message || 'Error al actualizar perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passForm.password !== passForm.password_confirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsUpdatingPass(true);
    try {
      await apiClient.patch('/client/update-password', passForm);
      toast.success('Contraseña actualizada correctamente');
      setPassForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      toast.error(err.message || 'Error al actualizar contraseña');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleReschedule = (appointment) => {
    const phoneNumber = "5491134686566"; // Replace with real company phone
    const message = encodeURIComponent(`${t('clientDashboard.rescheduleMsg')}: ${appointment.service?.name} (${appointment.date} ${appointment.start_time.substring(0, 5)})`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
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
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-white shadow-sm">
                <User className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('clientDashboard.title')}</h1>
                <p className="text-muted-foreground mt-1">{t('clientDashboard.greeting', { name: clientUser?.name || '' })}</p>
             </div>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white border p-1 h-auto shadow-sm">
            <TabsTrigger value="appointments" className="py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Calendar className="w-4 h-4" />
              Turnos
            </TabsTrigger>
            <TabsTrigger value="profile" className="py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
              <Settings className="w-4 h-4" />
              Mi Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-8 mt-0 focus-visible:outline-none">
            {isLoading ? (
              <LoadingSpinner text="Cargando tus turnos..." />
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
                          <Card key={apt.id} className="overflow-hidden transition-all hover:shadow-md border-none shadow-sm">
                            <div className="flex flex-col sm:flex-row">
                              <div className="bg-primary/5 p-6 flex flex-col justify-center items-center min-w-[140px] border-b sm:border-b-0 sm:border-r border-slate-100">
                                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                                  {new Date(apt.date).toLocaleDateString('es-ES', { month: 'short' })}
                                </span>
                                <span className="text-4xl font-bold text-slate-900 my-1">
                                  {new Date(apt.date).getDate() + 1} 
                                </span>
                                <span className="text-sm text-slate-500">
                                  {new Date(apt.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                                </span>
                              </div>
                              <div className="p-6 flex-1 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg">{apt.service?.name || 'Servicio'}</h3>
                                  <Badge className={{
                                    confirmed:       'bg-green-500',
                                    pending:         'bg-amber-500',
                                    pending_payment: 'bg-orange-500',
                                    cancelled:       'bg-red-500',
                                    completed:       'bg-blue-500',
                                    no_show:         'bg-gray-400',
                                  }[apt.status] || 'bg-amber-500'}>
                                    {{
                                      confirmed:       'Confirmado',
                                      pending:         'Pendiente',
                                      pending_payment: 'Pago pendiente',
                                      cancelled:       'Cancelado',
                                      completed:       'Completado',
                                      no_show:         'No se presentó',
                                    }[apt.status] || apt.status}
                                  </Badge>
                                </div>
                                <div className="text-slate-500 text-sm space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary/70" />
                                    {apt.start_time.substring(0, 5)} - {apt.end_time.substring(0, 5)}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-primary/70" />
                                      {apt.professional?.name || 'Profesional'}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReschedule(apt)}
                                      className="text-primary hover:text-primary/80 hover:bg-primary/5"
                                    >
                                      <MessageCircle className="w-4 h-4 mr-1" /> Reagendar
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
                          <Card key={apt.id} className="bg-white border-none shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                                  <History className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-slate-700">{apt.service?.name}</h4>
                                  <p className="text-sm text-slate-500">
                                    {new Date(apt.date).toLocaleDateString()} a las {apt.start_time.substring(0, 5)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-500">con {apt.professional?.name}</span>
                                <Badge variant="outline" className={{
                                  cancelled: 'text-red-500 border-red-200',
                                  completed: 'text-blue-500 border-blue-200',
                                  no_show:   'text-gray-400 border-gray-200',
                                }[apt.status] || ''}>
                                  {{
                                    confirmed:       'Confirmado',
                                    pending:         'Pendiente',
                                    pending_payment: 'Pago pendiente',
                                    cancelled:       'Cancelado',
                                    completed:       'Completado',
                                    no_show:         'No se presentó',
                                  }[apt.status] || apt.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="lg:col-span-1">
                  <Card className="sticky top-24 border-none shadow-md overflow-hidden">
                    <CardHeader className="bg-primary text-primary-foreground">
                      <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 bg-white">
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-slate-100 rounded text-slate-500">
                            <User className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Nombre Completo</p>
                            <p className="font-medium text-slate-900">{clientUser?.name} {clientUser?.lastname}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-slate-100 rounded text-slate-500">
                            <Plus className="w-4 h-4 rotate-45" />
                         </div>
                         <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Email</p>
                            <p className="font-medium text-slate-900 break-all">{clientUser?.email}</p>
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-slate-100 rounded text-slate-500">
                            <Plus className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-tighter">Teléfono</p>
                            <p className="font-medium text-slate-900">{clientUser?.phone || 'No proporcionado'}</p>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-0 focus-visible:outline-none">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Data */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                       <Settings className="w-5 h-5 text-primary" />
                       Mis Datos Personales
                    </CardTitle>
                    <CardDescription>Manten tu información actualizada para recibir mejores servicios.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input 
                            value={profileForm.name} 
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Apellido</Label>
                          <Input 
                            value={profileForm.lastname} 
                            onChange={(e) => setProfileForm({...profileForm, lastname: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input 
                          value={profileForm.phone} 
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          placeholder="+54 9..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>DNI (Opcional)</Label>
                        <Input 
                          value={profileForm.dni} 
                          onChange={(e) => setProfileForm({...profileForm, dni: e.target.value})}
                          placeholder="Tu documento"
                        />
                      </div>
                      <Button type="submit" className="w-full h-11" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Cambios
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Password Security */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                       <Lock className="w-5 h-5 text-primary" />
                       Seguridad
                    </CardTitle>
                    <CardDescription>Cambia tu contraseña periódicamente para proteger tu cuenta.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Contraseña Actual</Label>
                        <Input 
                          type="password"
                          value={passForm.current_password} 
                          onChange={(e) => setPassForm({...passForm, current_password: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nueva Contraseña</Label>
                        <Input 
                          type="password"
                          value={passForm.password} 
                          onChange={(e) => setPassForm({...passForm, password: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nueva Contraseña</Label>
                        <Input 
                          type="password"
                          value={passForm.password_confirmation} 
                          onChange={(e) => setPassForm({...passForm, password_confirmation: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" variant="secondary" className="w-full h-11" disabled={isUpdatingPass}>
                        {isUpdatingPass ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                        Actualizar Contraseña
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Help Alert */}
                <div className="md:col-span-2">
                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle>¿Necesitas ayuda?</AlertTitle>
                    <AlertDescription>
                      Si tienes problemas para gestionar tu cuenta o turnos, recuerda que puedes contactarnos vía WhatsApp para una asistencia más rápida.
                    </AlertDescription>
                  </Alert>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

// Reusable History Icon since lucide one might differ
const History = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export default ClientDashboard;
