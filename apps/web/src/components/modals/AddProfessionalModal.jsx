
import React, { useState } from 'react';
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

const AddProfessionalModal = ({ open, onOpenChange, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    color: '#3B82F6'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.professionals.create(formData);
      toast({
        title: 'Professional added',
        description: 'The professional has been added successfully.'
      });
      setFormData({ name: '', email: '', specialization: '', color: '#3B82F6' });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al agregar el profesional. Por favor intenta de nuevo.',
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
          <DialogTitle>{t('admin.professionals.addTitle', { defaultValue: 'Add Professional' })}</DialogTitle>
          <DialogDescription>{t('admin.professionals.addSubtitle', { defaultValue: 'Add a new professional to the system' })}</DialogDescription>
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
              {isLoading ? t('admin.professionals.form.saving', { defaultValue: 'Adding...' }) : t('admin.professionals.form.save', { defaultValue: 'Add Professional' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProfessionalModal;
