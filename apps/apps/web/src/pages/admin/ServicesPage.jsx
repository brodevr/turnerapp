
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import { TableSkeleton } from '@/components/SkeletonLoader.jsx';
import AddServiceModal from '@/components/modals/AddServiceModal.jsx';
import EditServiceModal from '@/components/modals/EditServiceModal.jsx';
import ConfirmDialog from '@/components/ConfirmDialog.jsx';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Clock, AlignLeft, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ServicesPage = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.services.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (service) => {
    setSelectedService(service);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await apiClient.services.delete(selectedService.id);
      toast({
        title: 'Service deleted',
        description: 'The service has been deleted successfully.'
      });
      fetchServices();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar el servicio. Por favor intenta de nuevo.',
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
            <h1 className="text-3xl font-bold">{t('admin.services.title', { defaultValue: 'Services' })}</h1>
            <Button onClick={() => setAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.services.addBtn', { defaultValue: 'Add Service' })}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.services.title', { defaultValue: 'All Services' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={5} columns={5} />
              ) : services.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">{t('admin.services.noServices', { defaultValue: 'No services found' })}</p>
              ) : (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">{t('admin.services.form.name', { defaultValue: 'Name' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.services.form.durationDesc', { defaultValue: 'Duration' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.services.form.price', { defaultValue: 'Price' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.services.form.description', { defaultValue: 'Description' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.services.form.color', { defaultValue: 'Color' })}</TableHead>
                          <TableHead className="whitespace-nowrap">{t('admin.appointments.columns.actions', { defaultValue: 'Actions' })}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium whitespace-nowrap">{service.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{service.duration_minutes} minutes</TableCell>
                            <TableCell className="whitespace-nowrap font-medium">${Number(service.price).toFixed(2)}</TableCell>
                            <TableCell className="max-w-xs truncate min-w-[200px]">{service.description || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <div 
                                  className="w-6 h-6 rounded border"
                                  style={{ backgroundColor: service.color || '#3B82F6' }}
                                />
                                <span className="text-sm text-muted-foreground">{service.color || '#3B82F6'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteClick(service)}>
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
                    {services.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg space-y-4 bg-card">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg">{service.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span className="font-semibold text-foreground bg-primary/10 px-2 py-0.5 rounded">${Number(service.price).toFixed(2)}</span>
                              <span>•</span>
                              <Clock className="w-4 h-4" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                          </div>
                          <div 
                            className="w-10 h-10 rounded border shadow-sm"
                            style={{ backgroundColor: service.color || '#3B82F6' }}
                          />
                        </div>

                        {service.description && (
                          <div className="text-sm text-muted-foreground flex gap-2 items-start bg-muted/30 p-3 rounded">
                            <AlignLeft className="w-4 h-4 mt-1 shrink-0" />
                            <p className="line-clamp-3">{service.description}</p>
                          </div>
                        )}

                        <div className="flex gap-3 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 gap-2" 
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="w-4 h-4" />
                            {t('admin.professionals.edit', { defaultValue: 'Edit' })}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDeleteClick(service)}
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

      <AddServiceModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={fetchServices}
      />

      <EditServiceModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        service={selectedService}
        onSuccess={fetchServices}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ServicesPage;
