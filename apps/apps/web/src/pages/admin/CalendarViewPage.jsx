
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Briefcase,
  Info,
  ExternalLink,
  Filter
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import apiClient from '@/lib/apiClient';

const CalendarViewPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [blockings, setBlockings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Selected Appointment for Modal
  const [selectedApt, setSelectedApt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentMonth, selectedProfessional]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const start = format(startOfWeek(startOfMonth(currentMonth)), 'yyyy-MM-dd');
      const end = format(endOfWeek(endOfMonth(currentMonth)), 'yyyy-MM-dd');
      
      const params = { start_date: start, end_date: end };
      if (selectedProfessional !== 'all') {
        params.professional_id = selectedProfessional;
      }

      const [aptRes, blockRes, profRes] = await Promise.all([
        apiClient.get('/appointments', { params }),
        apiClient.get('/time-slot-blockings', { params: { date_start: start, date_end: end } }),
        apiClient.get('/professionals')
      ]);

      setAppointments(aptRes.data);
      setBlockings(blockRes);
      setProfessionals(profRes.data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h1>
          <p className="text-muted-foreground mt-1">Vista general de todos los turnos y bloqueos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="px-2 h-8">
              Hoy
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <SelectTrigger className="w-[200px] bg-white">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Todos los profesionales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {professionals.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return (
      <div className="grid grid-cols-7 mb-2 border-b pb-2">
        {days.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 border-l border-t bg-gray-200 gap-px overflow-hidden rounded-xl border">
        {calendarDays.map((day, idx) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const dayAppointments = appointments.filter(apt => apt.date === formattedDate);
          const dayBlockings = blockings.filter(block => block.date === formattedDate);
          
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={idx} 
              className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-gray-50/50 ${
                !isCurrentMonth ? 'bg-gray-50/50 text-gray-300' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-primary text-primary-foreground' : ''
                }`}>
                  {format(day, 'd')}
                </span>
                {dayAppointments.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                    {dayAppointments.length}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {/* Blockings indicator */}
                {dayBlockings.map(block => (
                  <div 
                    key={`block-${block.id}`} 
                    className="text-[10px] bg-red-50 text-red-600 border border-red-100 rounded px-1 py-0.5 truncate flex items-center gap-1"
                    title={`Bloqueo: ${block.start_time} - ${block.end_time}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {block.start_time.substring(0, 5)} Bloqueo
                  </div>
                ))}

                {/* Appointments list */}
                {dayAppointments.map(apt => (
                  <button 
                    key={apt.id} 
                    onClick={() => {
                      setSelectedApt(apt);
                      setIsModalOpen(true);
                    }}
                    className={`w-full text-left text-[11px] px-1.5 py-1 rounded border truncate transition-all ${
                      apt.status === 'confirmed' ? 'bg-green-50 border-green-100 text-green-700' :
                      apt.status === 'pending' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                      'bg-gray-50 border-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="font-bold mr-1">{apt.start_time.substring(0, 5)}</span>
                    {apt.customer_name || apt.patient?.name || 'Cita'}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          {renderHeader()}
          
          <Card className="border-none shadow-sm overflow-hidden p-4 bg-white">
            {renderDays()}
            {renderCells()}
          </Card>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground bg-white p-3 rounded-lg border shadow-sm">
            <span className="font-semibold mr-2 uppercase tracking-wider">Leyenda:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded" /> Confirmado
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded" /> Pendiente
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded" /> Otro/Cancelado
            </div>
             <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded" /> Bloqueo Manual
            </div>
          </div>
        </div>

        {/* Appointment Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Detalle del Turno
              </DialogTitle>
            </DialogHeader>
            {selectedApt && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Cliente</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      {selectedApt.customer_name || selectedApt.patient?.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Estado</p>
                    <Badge className={
                      selectedApt.status === 'confirmed' ? 'bg-green-500 hover:bg-green-600' :
                      selectedApt.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500'
                    }>
                      {selectedApt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Servicio</p>
                  <p className="font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    {selectedApt.service_name || selectedApt.service?.name}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-b py-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedApt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">{selectedApt.start_time.substring(0, 5)} hs</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Profesional</p>
                  <p className="text-sm">{selectedApt.professional_name || selectedApt.professional?.name}</p>
                </div>
              </div>
            )}
            <DialogFooter>
               <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
               {selectedApt?.id && (
                 <Button onClick={() => window.open(`/admin/appointments?id=${selectedApt.id}`, '_blank')}>
                   <ExternalLink className="w-4 h-4 mr-2" /> Ir a Lista
                 </Button>
               )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CalendarViewPage;
