
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  AlertCircle,
  Loader2,
  X,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import apiClient from '@/lib/apiClient';

const TimeSlotBlockingPage = () => {
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState([]);
  const [blockings, setBlockings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [newBlock, setNewBlock] = useState({
    professional_id: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    end_time: '11:00',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, blockRes] = await Promise.all([
        apiClient.get('/professionals'),
        apiClient.get('/time-slot-blockings')
      ]);
      setProfessionals(profRes.data);
      setBlockings(blockRes);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/time-slot-blockings', newBlock);
      toast({
        title: "Bloqueo creado",
        description: "El horario ha sido bloqueado correctamente.",
      });
      setIsAdding(false);
      setNewBlock({
        ...newBlock,
        reason: ''
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo crear el bloqueo.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (id) => {
    if (!window.confirm('¿Desbloquear este horario?')) return;
    try {
      await apiClient.delete(`/time-slot-blockings/${id}`);
      toast({
        title: "Horario desbloqueado",
        description: "El bloqueo ha sido eliminado.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el bloqueo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bloqueo de Horarios</h1>
              <p className="text-muted-foreground mt-1">Bloquea franjas horarias específicas por profesional.</p>
            </div>
            <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
              {isAdding ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {isAdding ? "Cancelar" : "Nuevo Bloqueo"}
            </Button>
          </div>

          {isAdding && (
            <Card className="mb-8 border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>Configurar Nuevo Bloqueo</CardTitle>
                <CardDescription>Selecciona el profesional y el rango horario que deseas dejar no disponible.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBlock} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Profesional</label>
                      <Select 
                        onValueChange={(val) => setNewBlock({...newBlock, professional_id: val})}
                        value={newBlock.professional_id}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar profesional" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id.toString()}>{prof.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fecha</label>
                      <Input 
                        type="date" 
                        value={newBlock.date}
                        onChange={(e) => setNewBlock({...newBlock, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Desde</label>
                      <Input 
                        type="time" 
                        value={newBlock.start_time}
                        onChange={(e) => setNewBlock({...newBlock, start_time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hasta</label>
                      <Input 
                        type="time" 
                        value={newBlock.end_time}
                        onChange={(e) => setNewBlock({...newBlock, end_time: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Motivo (Opcional)</label>
                    <Input 
                      placeholder="Ej: Almuerzo, Trámite personal, etc." 
                      value={newBlock.reason}
                      onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})}
                    />
                  </div>
                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertCircle className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary font-semibold">Nota</AlertTitle>
                    <AlertDescription className="text-primary/80">
                      Los clientes no podrán reservar turnos que se superpongan con este bloque.
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirmar Bloqueo
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <CardTitle>Bloqueos Activos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : blockings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Profesional</th>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Rango</th>
                        <th className="px-6 py-4">Motivo</th>
                        <th className="px-6 py-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {blockings.map((block) => (
                        <tr key={block.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 font-medium">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {block.professional?.name || 'Profesional'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                              {block.date}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="outline" className="font-mono">
                                {block.start_time.substring(0, 5)} - {block.end_time.substring(0, 5)}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 italic text-sm text-muted-foreground">
                            {block.reason || '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteBlock(block.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground italic">No hay horarios bloqueados actualmente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TimeSlotBlockingPage;
