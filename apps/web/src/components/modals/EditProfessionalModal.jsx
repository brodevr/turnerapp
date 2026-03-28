
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const EditProfessionalModal = ({ open, onOpenChange, professional, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    color: '#3B82F6'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name || '',
        email: professional.email || '',
        specialization: professional.specialization || '',
        color: professional.color || '#3B82F6'
      });
    }
  }, [professional]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.professionals.update(professional.id, formData);
      toast({
        title: 'Professional updated',
        description: 'The professional has been updated successfully.'
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al actualizar el profesional. Por favor intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('admin.professionals.editTitle', { defaultValue: 'Edit Professional' })}</DialogTitle>
          <DialogDescription>{t('admin.professionals.editSubtitle', { defaultValue: 'Update professional details' })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('admin.professionals.form.name', { defaultValue: 'Name' })}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('admin.professionals.form.email', { defaultValue: 'Email' })}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">{t('admin.professionals.specialization', { defaultValue: 'Specialization' })}</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">{t('admin.professionals.form.color', { defaultValue: 'Color' })}</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('admin.professionals.form.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('admin.professionals.form.saving', { defaultValue: 'Saving...' }) : t('admin.professionals.form.save', { defaultValue: 'Save Changes' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfessionalModal;
