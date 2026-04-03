
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import { CardSkeleton } from '@/components/SkeletonLoader.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import apiClient from '@/lib/apiClient';
import { Calendar, Users, Briefcase, Clock } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/appointmentUtils';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalProfessionals: 0,
    totalServices: 0,
    totalPatients: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        const [appointments, professionals, services, patients] = await Promise.all([
          apiClient.appointments.getAll(),
          apiClient.professionals.getAll(),
          apiClient.services.getAll(),
          apiClient.get('/patients')
        ]);

        const upcoming = appointments
          .filter(apt => apt.date >= today && (apt.status === 'pending' || apt.status === 'confirmed'))
          .slice(0, 10);

        setStats({
          totalAppointments: appointments.length,
          upcomingAppointments: upcoming.length,
          totalProfessionals: professionals.length,
          totalServices: services.length,
          totalPatients: patients.data.length
        });

        setRecentAppointments(upcoming);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: t('admin.dashboard.stats.totalAppointments'), value: stats.totalAppointments, icon: Calendar, color: 'text-blue-600' },
    { title: t('admin.dashboard.stats.upcoming'), value: stats.upcomingAppointments, icon: Clock, color: 'text-green-600' },
    { title: 'Pacientes', value: stats.totalPatients, icon: Users, color: 'text-purple-600' },
    { title: t('admin.dashboard.stats.services'), value: stats.totalServices, icon: Briefcase, color: 'text-orange-600' }
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('admin.sidebar.dashboard', { defaultValue: 'Dashboard' })}</h1>

          {isLoading ? (
            <CardSkeleton count={4} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.dashboard.upcomingTitle', { defaultValue: 'Upcoming Appointments' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAppointments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('admin.appointments.noAppointments', { defaultValue: 'No upcoming appointments' })}</p>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.date')}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.time')}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.client')}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.professional')}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.service')}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentAppointments.map((apt) => (
                          <TableRow key={apt.id}>
                            <TableCell className="whitespace-nowrap">{formatDate(apt.date)}</TableCell>
                            <TableCell className="whitespace-nowrap">{formatTime(apt.start_time)}</TableCell>
                            <TableCell className="min-w-[150px]">{apt.customer_name}</TableCell>
                            <TableCell className="whitespace-nowrap">{apt.professional?.name}</TableCell>
                            <TableCell className="min-w-[120px]">{apt.service?.name}</TableCell>
                            <TableCell>
                              <StatusBadge status={apt.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="md:hidden space-y-4">
                    {recentAppointments.map((apt) => (
                      <div key={apt.id} className="p-4 border rounded-lg space-y-3 bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg">{apt.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{apt.service?.name}</p>
                          </div>
                          <StatusBadge status={apt.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(apt.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(apt.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                            <Users className="w-4 h-4" />
                            <span>{apt.professional?.name}</span>
                          </div>
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
    </div>
  );
};

export default AdminDashboard;
