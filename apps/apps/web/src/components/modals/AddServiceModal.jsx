import React, { useState, useRef } from 'react';
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
import { Upload, Loader2, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const EMPTY_FORM = { name: '', duration_minutes: 30, price: 0, description: '', color: '#3B82F6', image_url: '', is_promo: false, promo_label: '' };

const AddServiceModal = ({ open, onOpenChange, onSuccess }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await apiClient.upload.image(file);
      setFormData(f => ({ ...f, image_url: url }));
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir la imagen.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.services.create({ ...formData, price: parseFloat(formData.price), is_promo: formData.is_promo });
      toast({ title: 'Servicio agregado' });
      setFormData(EMPTY_FORM);
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({ title: 'Error', description: 'No se pudo agregar el servicio.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('admin.services.addTitle', { defaultValue: 'Agregar Servicio' })}</DialogTitle>
          <DialogDescription>{t('admin.services.addSubtitle', { defaultValue: 'Añadí un nuevo servicio al sistema' })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('admin.services.form.name', { defaultValue: 'Nombre' })}</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('admin.services.form.durationDesc', { defaultValue: 'Duración (min)' })}</Label>
              <Input type="number" min="15" max="480" step="15" value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label>{t('admin.services.form.price', { defaultValue: 'Precio ($)' })}</Label>
              <Input type="number" min="0" step="0.01" value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.services.form.description', { defaultValue: 'Descripción' })}</Label>
            <Textarea value={formData.description} rows={3}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Imagen</Label>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
              onChange={handleFileChange} />
            {formData.image_url ? (
              <div className="relative group">
                <img src={formData.image_url} alt="preview"
                  className="h-32 w-full object-cover rounded-lg border" />
                <button type="button"
                  onClick={() => { setFormData(f => ({ ...f, image_url: '' })); fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                {isUploading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs">Subiendo...</span></>
                  : <><Upload className="w-5 h-5" /><span className="text-xs">Subir imagen (JPG, PNG, WebP · máx 5MB)</span></>}
              </button>
            )}
          </div>

          {/* Promo toggle */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
            <Checkbox
              id="add-is-promo"
              checked={formData.is_promo}
              onCheckedChange={(checked) => setFormData(f => ({ ...f, is_promo: !!checked, promo_label: checked ? f.promo_label : '' }))}
            />
            <label htmlFor="add-is-promo" className="text-sm font-medium cursor-pointer select-none">
              Mostrar como promoción en el inicio
            </label>
          </div>

          {formData.is_promo && (
            <div className="space-y-2">
              <Label>Etiqueta de precio de promo</Label>
              <Input
                placeholder="Ej: $45.000 ARS"
                value={formData.promo_label}
                onChange={(e) => setFormData(f => ({ ...f, promo_label: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Se muestra como badge sobre la imagen en la sección de promos.</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('admin.services.form.color', { defaultValue: 'Color' })}</Label>
            <Input type="color" value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('admin.services.form.cancel', { defaultValue: 'Cancelar' })}
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Agregar Servicio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
