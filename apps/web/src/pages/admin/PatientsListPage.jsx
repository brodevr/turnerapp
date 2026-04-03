
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  FileText,
  ChevronRight,
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Loader2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import apiClient from '@/lib/apiClient';

const emptyPatient = {
  name: '',
  lastname: '',
  email: '',
  phone: '',
  dni: '',
  birthdate: ''
};

const PatientsListPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({ ...emptyPatient });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (search = '') => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/patients${search ? `?search=${search}` : ''}`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  // --- CREATE ---
  const openAddModal = () => {
    setFormData({ ...emptyPatient });
    setAddModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/patients', formData);
      toast({ title: 'Paciente creado', description: 'El paciente fue registrado exitosamente.' });
      setAddModalOpen(false);
      fetchPatients(searchTerm);
    } catch (error) {
      const msg = error.message || 'No se pudo crear el paciente.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // --- EDIT ---
  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || '',
      lastname: patient.lastname || '',
      email: patient.email || '',
      phone: patient.phone || '',
      dni: patient.dni || '',
      birthdate: patient.birthdate || ''
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/patients/${selectedPatient.id}`, formData);
      toast({ title: 'Paciente actualizado', description: 'Los datos fueron actualizados con éxito.' });
      setEditModalOpen(false);
      fetchPatients(searchTerm);
    } catch (error) {
      const msg = error.message || 'No se pudo actualizar el paciente.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // --- DELETE ---
  const openDeleteDialog = (patient) => {
    setSelectedPatient(patient);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/patients/${selectedPatient.id}`);
      toast({ title: 'Paciente eliminado', description: 'El registro fue eliminado correctamente.' });
      setDeleteDialogOpen(false);
      fetchPatients(searchTerm);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el paciente.', variant: 'destructive' });
    }
  };

  // --- Form fields shared between Add/Edit ---
  const renderFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastname">Apellido</Label>
          <Input
            id="lastname"
            placeholder="Apellido"
            value={formData.lastname}
            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@ejemplo.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            placeholder="+54 11 1234-5678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dni">DNI</Label>
          <Input
            id="dni"
            placeholder="12345678"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthdate">Fecha de Nacimiento</Label>
        <Input
          id="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
              <p className="text-muted-foreground mt-1">Gestiona la base de datos de tus clientes y sus historias clínicas.</p>
            </div>
            <Button onClick={openAddModal} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Paciente
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-8 border-none shadow-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input 
                    placeholder="Buscar por nombre, email o DNI..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </form>
            </CardContent>
          </Card>

          {/* Patients Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow border-none shadow-sm overflow-hidden group">
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-full shadow-sm text-primary">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{patient.name} {patient.lastname}</CardTitle>
                            <p className="text-xs text-muted-foreground">ID: #{patient.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditModal(patient)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => openDeleteDialog(patient)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex flex-col flex-1">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                        {patient.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                        {patient.dni && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ClipboardList className="w-4 h-4 text-muted-foreground" />
                            <span>DNI: {patient.dni}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-auto pt-4 border-t">
                        <Button 
                          variant="default" 
                          className="w-full shadow-sm hover:shadow-md transition-all flex justify-between px-4"
                          onClick={() => navigate(`/admin/patients/${patient.id}/history`)}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>Historias e Imágenes</span>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-70" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No se encontraron pacientes</h3>
                  <p className="text-muted-foreground mb-4">Intenta con otros términos de búsqueda o crea un nuevo paciente.</p>
                  <Button onClick={openAddModal} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Paciente
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ADD PATIENT MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nuevo Paciente
            </DialogTitle>
            <DialogDescription>Registra un nuevo paciente en el sistema. Se le asignará una contraseña temporal.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            {renderFormFields()}
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Crear Paciente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT PATIENT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Editar Paciente
            </DialogTitle>
            <DialogDescription>Modifica los datos del paciente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            {renderFormFields()}
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Eliminar Paciente
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar a <strong>{selectedPatient?.name} {selectedPatient?.lastname}</strong>? 
              Esta acción eliminará también todo su historial clínico y no podrá deshacerse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Sí, Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsListPage;
