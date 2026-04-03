
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import { TableSkeleton } from '@/components/SkeletonLoader.jsx';
import AddProfessionalModal from '@/components/modals/AddProfessionalModal.jsx';
import EditProfessionalModal from '@/components/modals/EditProfessionalModal.jsx';
import ConfirmDialog from '@/components/ConfirmDialog.jsx';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Mail, Award, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProfessionalsPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  const fetchProfessionals = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.professionals.getAll();
      setProfessionals(data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const handleEdit = (professional) => {
    setSelectedProfessional(professional);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (professional) => {
    setSelectedProfessional(professional);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await apiClient.professionals.delete(selectedProfessional.id);
      toast({
        title: 'Professional deleted',
        description: 'The professional has been deleted successfully.'
      });
      fetchProfessionals();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el profesional. Por favor intenta de nuevo.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{t('admin.professionals.title', { defaultValue: 'Professionals' })}</h1>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.professionals.addBtn', { defaultValue: 'Add Professional' })}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.professionals.title', { defaultValue: 'All Professionals' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : professionals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('admin.professionals.noProfessionals', { defaultValue: 'No professionals found' })}</p>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">{t('admin.professionals.form.name', { defaultValue: 'Name' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.professionals.form.email', { defaultValue: 'Email' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.professionals.specialization', { defaultValue: 'Specialization' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.professionals.form.color', { defaultValue: 'Color' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.actions', { defaultValue: 'Actions' })}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {professionals.map((prof) => (
                          <TableRow key={prof.id}>
                            <TableCell className="font-medium whitespace-nowrap">{prof.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{prof.email}</TableCell>
                            <TableCell className="min-w-[150px]">{prof.specialization || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <div 
                                  className="w-6 h-6 rounded border"
                                  style={{ backgroundColor: prof.color || '#3B82F6' }}
                                />
                                <span className="text-sm text-muted-foreground">{prof.color || '#3B82F6'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(prof)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteClick(prof)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-4">
                    {professionals.map((prof) => (
                      <div key={prof.id} className="p-4 border rounded-lg space-y-4 bg-card">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-white font-bold text-xl shadow-sm"
                            style={{ backgroundColor: prof.color || '#3B82F6' }}
                          >
                            {prof.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-lg">{prof.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {prof.specialization || 'General'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{prof.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Palette className="w-4 h-4" />
                            <span>{t('admin.professionals.form.color', { defaultValue: 'Color' })}: {prof.color || '#3B82F6'}</span>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 gap-2" 
                            onClick={() => handleEdit(prof)}
                          >
                            <Edit className="w-4 h-4" />
                            {t('admin.professionals.edit', { defaultValue: 'Edit' })}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDeleteClick(prof)}
                          >
                            <Trash2 className="w-4 h-4" />
                            {t('admin.professionals.delete', { defaultValue: 'Delete' })}
                          </Button>
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

      <AddProfessionalModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchProfessionals}
      />

      <EditProfessionalModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        professional={selectedProfessional}
        onSuccess={fetchProfessionals}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Professional"
        description="Are you sure you want to delete this professional? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ProfessionalsPage;
