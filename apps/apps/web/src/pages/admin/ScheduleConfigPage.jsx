
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

const ScheduleConfigPage = () => {
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const data = await apiClient.professionals.getAll();
        setProfessionals(data);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      }
    };
    fetchProfessionals();
  }, []);

  useEffect(() => {
    if (selectedProfessional) {
      fetchSchedule();
    }
  }, [selectedProfessional]);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.schedules.getByProfessional(selectedProfessional);

      const scheduleMap = {};
      data.forEach(item => {
        scheduleMap[item.day_of_week] = item;
      });

      const fullSchedule = daysOfWeek.map(day => {
        if (scheduleMap[day]) {
          return scheduleMap[day];
        }
        return {
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
          is_enabled: false,
          professional_id: selectedProfessional
        };
      });

      setSchedule(fullSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const daySchedule of schedule) {
        const start_time = daySchedule.start_time.substring(0, 5);
        const end_time = daySchedule.end_time.substring(0, 5);
        if (daySchedule.id) {
          await apiClient.schedules.update(daySchedule.id, {
            start_time,
            end_time,
            is_enabled: daySchedule.is_enabled
          });
        } else {
          await apiClient.schedules.create({
            professional_id: selectedProfessional,
            day_of_week: daySchedule.day_of_week,
            start_time,
            end_time,
            is_enabled: daySchedule.is_enabled
          });
        }
      }

      toast({
        title: 'Horario guardado',
        description: 'El horario ha sido actualizado correctamente.'
      });
      fetchSchedule();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al guardar el horario. Por favor intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Configuración de Horarios</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Seleccionar Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProfessional || undefined} onValueChange={setSelectedProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProfessional && (
            <Card>
              <CardHeader>
                <CardTitle>Horario Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSpinner text="Cargando horario..." />
                ) : (
                  <div className="space-y-6">
                    {schedule.map((daySchedule, index) => (
                      <div key={daySchedule.day_of_week} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg">
                        <div className="flex justify-between items-center md:w-32">
                          <p className="font-medium">{daySchedule.day_of_week}</p>
                          <div className="flex items-center gap-2 md:hidden">
                            <Switch
                              checked={daySchedule.is_enabled}
                              onCheckedChange={(checked) => handleScheduleChange(index, 'is_enabled', checked)}
                            />
                            <Label>Activo</Label>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 w-32">
                          <Switch
                            checked={daySchedule.is_enabled}
                            onCheckedChange={(checked) => handleScheduleChange(index, 'is_enabled', checked)}
                          />
                          <Label>Enabled</Label>
                        </div>
                        <div className="flex-1 flex gap-4 w-full">
                          <div className="flex-1">
                            <Label htmlFor={`opening-${index}`}>Hora de Apertura</Label>
                            <Input
                              id={`opening-${index}`}
                              type="time"
                              value={daySchedule.start_time}
                              onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                              disabled={!daySchedule.is_enabled}
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`closing-${index}`}>Hora de Cierre</Label>
                            <Input
                              id={`closing-${index}`}
                              type="time"
                              value={daySchedule.end_time}
                              onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                              disabled={!daySchedule.is_enabled}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button onClick={handleSave} disabled={isSaving} className="w-full">
                      {isSaving ? 'Guardando...' : 'Guardar Horario'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScheduleConfigPage;
