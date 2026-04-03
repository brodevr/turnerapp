
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  ArrowLeft, 
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import apiClient from '@/lib/apiClient';
import { formatDate } from '@/utils/appointmentUtils';

const PatientHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  // New record state
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    professional_id: '',
    observations: '',
    images: []
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientRes, historyRes, profRes] = await Promise.all([
        apiClient.get(`/patients/${id}`),
        apiClient.get(`/patient-histories?patient_id=${id}`),
        apiClient.get('/professionals')
      ]);
      setPatient(patientRes.data);
      setHistory(historyRes.data);
      const profs = profRes.data;
      setProfessionals(profs);
      
      if (profs.length > 0 && !newRecord.professional_id) {
        setNewRecord(prev => ({ ...prev, professional_id: profs[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del paciente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewRecord(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setNewRecord(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('patient_id', id);
    formData.append('professional_id', newRecord.professional_id);
    formData.append('date', newRecord.date);
    formData.append('observations', newRecord.observations);
    
    newRecord.images.forEach((file) => {
      formData.append('images[]', file);
    });

    try {
      await apiClient.post('/patient-histories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: "Éxito",
        description: "Ficha agregada correctamente.",
      });
      
      setIsAdding(false);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        professional_id: professionals.length > 0 ? professionals[0].id.toString() : '',
        observations: '',
        images: []
      });
      fetchData();
    } catch (error) {
      console.error('Error saving record:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la ficha.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta ficha? Esta acción borrará las fotos permanentemente.')) return;

    try {
      await apiClient.delete(`/patient-histories/${recordId}`);
      toast({
        title: "Eliminado",
        description: "La ficha ha sido eliminada.",
      });
      fetchData();
    } catch (error) {
       toast({
        title: "Error",
        description: "No se pudo eliminar la ficha.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/patients')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            {loading ? (
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Historial: {patient?.name} {patient?.lastname}</h1>
                <p className="text-muted-foreground mt-1">DNI: {patient?.dni} | Tel: {patient?.phone}</p>
              </div>
            )}
            <Button 
              className="ml-auto flex items-center gap-2"
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? "outline" : "default"}
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAdding ? "Cancelar" : "Nueva Ficha"}
            </Button>
          </div>

          {/* New Record Form */}
          {isAdding && (
            <Card className="mb-8 border-primary/20 shadow-md animate-in slide-in-from-top duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Nueva Entrada de Historia Clínica
                </CardTitle>
                <CardDescription>Completa los detalles del tratamiento u observación de hoy.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fecha</label>
                      <Input 
                        type="date"
                        value={newRecord.date}
                        onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Profesional</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newRecord.professional_id}
                        onChange={(e) => setNewRecord({...newRecord, professional_id: e.target.value})}
                        required
                      >
                        <option value="">Seleccionar profesional...</option>
                        {professionals.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observaciones y Diagnóstico</label>
                    <Textarea 
                      placeholder="Describe qué se realizó hoy, productos utilizados, recomendaciones, etc..."
                      className="min-h-[150px]"
                      value={newRecord.observations}
                      onChange={(e) => setNewRecord({...newRecord, observations: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Fotos / Imágenes
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {newRecord.images.map((file, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs">Subir</span>
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Descargar</Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Guardar Ficha
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Timeline of Records */}
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {loading ? (
              [1, 2].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)
            ) : history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Clock className="w-5 h-5" />
                  </div>
                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow">
                    <div className="flex items-center justify-between space-x-2 mb-2">
                       <Badge variant="outline" className="flex items-center gap-1 font-bold text-primary border-primary/20">
                        <CalendarIcon className="w-3 h-3" />
                        {item.date}
                      </Badge>
                      <div className="flex items-center gap-2">
                         <span className="text-xs text-muted-foreground hidden sm:inline">Por: {item.professional_name}</span>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                    <div className="text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
                      {item.observations}
                    </div>
                    
                    {/* Images Grid */}
                    {item.images && item.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        {item.images.map((url, imgIdx) => (
                          <a 
                            key={imgIdx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="relative group/img aspect-square rounded-md overflow-hidden bg-muted border"
                          >
                            <img src={url} alt="record" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="w-5 h-5 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-400">Sin historial registrado</h3>
                <p className="text-sm text-slate-400">Empezá agregando la primera ficha de paciente.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientHistoryPage;
