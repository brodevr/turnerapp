
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import { TableSkeleton } from '@/components/SkeletonLoader.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import DateRangeFilter from '@/components/DateRangeFilter.jsx';
import AppointmentEditModal from '@/components/modals/AppointmentEditModal.jsx';
import AppointmentCancelModal from '@/components/modals/AppointmentCancelModal.jsx';
import apiClient from '@/lib/apiClient';
import { formatDate, formatTime } from '@/utils/appointmentUtils';
import { Edit, X, Filter, ChevronDown, ChevronUp, User, Briefcase, Calendar as CalendarIcon, Clock, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const AppointmentsListPage = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    professional: '',
    service: '',
    status: ''
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const allAppointments = await apiClient.appointments.getAll();

      // Apply Local Filters
      const filtered = allAppointments.filter(apt => {
        if (filters.startDate && apt.date < filters.startDate) return false;
        if (filters.endDate && apt.date > filters.endDate) return false;
        // In Laravel IDs are integers, from React state they are strings
        if (filters.professional && apt.professional_id != filters.professional) return false;
        if (filters.service && apt.service_id != filters.service) return false;
        if (filters.status && apt.status !== filters.status) return false;
        return true;
      });

      // Laravel Eloquent automatically includes professional and service relations
      setAppointments(filtered);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [profsData, servicesData] = await Promise.all([
          apiClient.professionals.getAll(),
          apiClient.services.getAll()
        ]);
        setProfessionals(profsData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();
    fetchAppointments();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const handleSendEmailReminder = async (appointment) => {
    try {
      await apiClient.appointments.sendReminder(appointment.id);
      toast({
        title: 'Recordatorio enviado',
        description: `Se ha enviado el mail a ${appointment.customer_name} con éxito.`
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el recordatorio.',
        variant: 'destructive'
      });
    }
  };

  const handleWhatsAppReminder = (appointment) => {
    const date = formatDate(appointment.date);
    const time = formatTime(appointment.start_time);
    const message = `Hola ${appointment.customer_name}, te recordamos tu turno para el día ${date} a las ${time} hs en Virginia Rojas Beauty. ¡Te esperamos! ✨`;
    const phone = appointment.customer_phone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      professional: '',
      service: '',
      status: ''
    });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('admin.appointments.title', { defaultValue: 'Appointments' })}</h1>

          <Card className="mb-6">
            <CardHeader 
              className="flex flex-row items-center justify-between cursor-pointer hover:bg-accent/5 transition-colors md:cursor-default"
              onClick={() => window.innerWidth < 768 && setShowFilters(!showFilters)}
            >
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                {t('admin.appointments.filters', { defaultValue: 'Filters' })}
              </CardTitle>
              <div className="md:hidden">
                {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </CardHeader>
            <CardContent className={`${!showFilters && 'hidden md:block'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                <div className="sm:col-span-2">
                  <DateRangeFilter
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    onStartDateChange={(value) => setFilters({ ...filters, startDate: value })}
                    onEndDateChange={(value) => setFilters({ ...filters, endDate: value })}
                  />
                </div>
                <div className="w-full">
                  <Label className="mb-2 block">{t('admin.appointments.columns.professional', { defaultValue: 'Professional' })}</Label>
                  <Select value={filters.professional || undefined} onValueChange={(value) => setFilters({ ...filters, professional: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.appointments.allProfessionals', { defaultValue: 'All Professionals' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full">
                  <Label className="mb-2 block">{t('admin.appointments.columns.service', { defaultValue: 'Service' })}</Label>
                  <Select value={filters.service || undefined} onValueChange={(value) => setFilters({ ...filters, service: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.appointments.allServices', { defaultValue: 'All Services' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full">
                  <Label className="mb-2 block">{t('admin.appointments.columns.status', { defaultValue: 'Status' })}</Label>
                  <Select value={filters.status || undefined} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.appointments.allStatuses', { defaultValue: 'All Statuses' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_payment">Pago Pendiente</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="no_show">No se presentó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.appointments.title', { defaultValue: 'All Appointments' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : appointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('admin.appointments.noAppointments', { defaultValue: 'No appointments found' })}</p>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.date', { defaultValue: 'Date' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.time', { defaultValue: 'Time' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.client', { defaultValue: 'Customer' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.professional', { defaultValue: 'Professional' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.service', { defaultValue: 'Service' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.status', { defaultValue: 'Status' })}</TableHead>
                          <TableHead className="whitespace-nowrap">Seña</TableHead>
                          <TableHead className="whitespace-nowrap">Recordatorio</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.actions', { defaultValue: 'Actions' })}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((apt) => (
                          <TableRow key={apt.id}>
                            <TableCell className="whitespace-nowrap">{formatDate(apt.date)}</TableCell>
                            <TableCell className="whitespace-nowrap">{formatTime(apt.start_time)}</TableCell>
                            <TableCell className="min-w-[200px]">
                              <div>
                                <p className="font-medium">{apt.customer_name}</p>
                                <p className="text-sm text-muted-foreground">{apt.customer_email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{apt.professional?.name}</TableCell>
                            <TableCell className="min-w-[120px]">{apt.service?.name}</TableCell>
                            <TableCell>
                              <StatusBadge status={apt.status} />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {apt.deposit_amount ? (
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">${Number(apt.deposit_amount).toLocaleString('es-AR')} ARS</p>
                                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                    apt.payment_status === 'approved'      ? 'bg-green-100 text-green-700' :
                                    apt.payment_status === 'rejected'      ? 'bg-red-100 text-red-700' :
                                    apt.payment_status === 'not_required'  ? 'bg-gray-100 text-gray-500' :
                                    apt.payment_status === 'cancelled'     ? 'bg-gray-100 text-gray-600' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {apt.payment_status === 'approved'     ? '✓ Acreditada' :
                                     apt.payment_status === 'rejected'     ? '✗ Rechazada'  :
                                     apt.payment_status === 'not_required' ? 'Sin seña'     :
                                     apt.payment_status === 'cancelled'    ? 'Cancelada'    : '⏳ Pendiente'}
                                  </span>
                                  {apt.mp_payment_id && (
                                    <p className="text-xs text-muted-foreground font-mono">
                                      MP #{apt.mp_payment_id}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin seña</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {apt.reminder_sent_at ? (
                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{new Date(apt.reminder_sent_at).toLocaleDateString(i18n.language === 'es' ? 'es-AR' : 'en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No enviado</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" title="Enviar Mail" onClick={() => handleSendEmailReminder(apt)}>
                                  <Mail className="w-4 h-4 text-rose-400" />
                                </Button>
                                <Button size="sm" variant="outline" title="Enviar WhatsApp" onClick={() => handleWhatsAppReminder(apt)}>
                                  <MessageSquare className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleEdit(apt)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {apt.status !== 'cancelled' && (
                                  <Button size="sm" variant="outline" onClick={() => handleCancel(apt)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="md:hidden space-y-4">
                    {appointments.map((apt) => (
                      <div key={apt.id} className="p-4 border rounded-lg space-y-4 bg-card active:bg-accent/10 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <p className="font-bold">{apt.customer_name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{apt.customer_email}</span>
                            </div>
                          </div>
                          <StatusBadge status={apt.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(apt.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(apt.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                            <Briefcase className="w-4 h-4" />
                            <span className="truncate"><b>{t('admin.appointments.columns.service')}:</b> {apt.service?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground col-span-2 border-t pt-2 mt-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: apt.professional?.color || '#3B82F6' }}
                            />
                            <span><b>{t('admin.appointments.columns.professional', { defaultValue: 'Pro' })}:</b> {apt.professional?.name}</span>
                          </div>
                          {apt.deposit_amount && (
                            <div className="col-span-2 border-t pt-2 mt-1 flex justify-between items-center">
                              <span className="text-xs text-muted-foreground italic">Seña:</span>
                              <div className="text-right">
                                <span className="text-sm font-medium">${Number(apt.deposit_amount).toLocaleString('es-AR')} ARS</span>
                                <span className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                                  apt.payment_status === 'approved'  ? 'bg-green-100 text-green-700' :
                                  apt.payment_status === 'rejected'  ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {apt.payment_status === 'approved' ? '✓ Acreditada' :
                                   apt.payment_status === 'rejected' ? '✗ Rechazada'  : '⏳ Pendiente'}
                                </span>
                                {apt.mp_payment_id && (
                                  <p className="text-xs text-muted-foreground font-mono mt-0.5">MP #{apt.mp_payment_id}</p>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="col-span-2 border-t pt-2 mt-1 flex justify-between items-center">
                            <span className="text-xs text-muted-foreground italic">Recordatorio:</span>
                            {apt.reminder_sent_at ? (
                              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{new Date(apt.reminder_sent_at).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Nunca</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 gap-2" 
                            onClick={() => handleSendEmailReminder(apt)}
                          >
                            <Mail className="w-4 h-4 text-rose-400" />
                            Mail
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm" 
                            className="flex-1 gap-2 text-green-600" 
                            onClick={() => handleWhatsAppReminder(apt)}
                          >
                            <MessageSquare className="w-4 h-4" />
                            WSP
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1 gap-2" 
                            onClick={() => handleEdit(apt)}
                          >
                            <Edit className="w-4 h-4" />
                            {t('admin.professionals.edit', { defaultValue: 'Edit' })}
                          </Button>
                          {apt.status !== 'cancelled' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10" 
                              onClick={() => handleCancel(apt)}
                            >
                              <X className="w-4 h-4" />
                              {t('clientDashboard.cancel', { defaultValue: 'Cancel' })}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AppointmentEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />

      <AppointmentCancelModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        appointment={selectedAppointment}
        onSuccess={fetchAppointments}
      />
    </div>
  );
};

export default AppointmentsListPage;
