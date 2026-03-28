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
import { Textarea } from '@/components/ui/textarea';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const AddServiceModal = ({ open, onOpenChange, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    price: 0,
    description: '',
    color: '#3B82F6'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.services.create({
        ...formData,
        price: parseFloat(formData.price)
      });
      toast({
        title: 'Service added',
        description: 'The service has been added successfully.'
      });
      setFormData({ name: '', duration: 30, price: 0, description: '', color: '#3B82F6' });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al agregar el servicio. Por favor intenta de nuevo.',
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
          <DialogTitle>{t('admin.services.addTitle', { defaultValue: 'Add Service' })}</DialogTitle>
          <DialogDescription>{t('admin.services.addSubtitle', { defaultValue: 'Add a new service to the system' })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('admin.services.form.name', { defaultValue: 'Service Name' })}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">{t('admin.services.form.durationDesc', { defaultValue: 'Duration (minutes)' })}</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">{t('admin.services.form.price', { defaultValue: 'Price ($)' })}</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('admin.services.form.description', { defaultValue: 'Description' })}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">{t('admin.services.form.color', { defaultValue: 'Color' })}</Label>
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('admin.services.form.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('admin.services.form.saving', { defaultValue: 'Adding...' }) : t('admin.services.form.save', { defaultValue: 'Add Service' })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
