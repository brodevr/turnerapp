
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle2, XCircle, ExternalLink, LogOut } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar.jsx';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

const PaymentSettingsPage = () => {
  const { toast }    = useToast();
  const location     = useLocation();
  const navigate     = useNavigate();
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [connecting, setConnecting]   = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [settings, setSettings]       = useState({
    payment_enabled:        true,
    deposit_percentage:     30,
    payment_expiry_minutes: 30,
    mp_connected:           false,
    mp_email:               '',
    mp_user_id:             '',
  });

  // Handle OAuth return params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mp_connected') === '1') {
      toast({ title: '¡MercadoPago conectado!', description: 'Tu cuenta fue vinculada correctamente.' });
      navigate('/admin/payment-settings', { replace: true });
    }
    if (params.get('mp_error')) {
      const reasons = {
        invalid_state:         'Error de seguridad (state inválido). Intentá de nuevo.',
        no_code:               'MercadoPago no devolvió el código de autorización.',
        token_exchange_failed: 'No se pudo obtener el token. Verificá tus credenciales de app.',
      };
      toast({
        title: 'Error al conectar MercadoPago',
        description: reasons[params.get('mp_error')] ?? 'Error desconocido.',
        variant: 'destructive',
      });
      navigate('/admin/payment-settings', { replace: true });
    }
  }, []);

  useEffect(() => {
    apiClient.payments.getSettings()
      .then(data => setSettings(s => ({ ...s, ...data })))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await apiClient.payments.getMercadoPagoConnectUrl();
      window.location.href = url;
    } catch {
      toast({ title: 'Error', description: 'No se pudo iniciar la conexión.', variant: 'destructive' });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('¿Desconectar la cuenta de MercadoPago? Los cobros dejarán de funcionar.')) return;
    setDisconnecting(true);
    try {
      await apiClient.payments.disconnectMercadoPago();
      setSettings(s => ({ ...s, mp_connected: false, mp_email: '', mp_user_id: '' }));
      toast({ title: 'Cuenta desconectada', description: 'MercadoPago fue desvinculado.' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo desconectar.', variant: 'destructive' });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await apiClient.payments.updateSettings({
        payment_enabled:        settings.payment_enabled,
        deposit_percentage:     settings.deposit_percentage,
        payment_expiry_minutes: settings.payment_expiry_minutes,
      });
      setSettings(s => ({ ...s, ...updated }));
      toast({ title: 'Configuración guardada' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const depositExample = settings.deposit_percentage
    ? `Ej: servicio $10.000 → seña $${(10000 * settings.deposit_percentage / 100).toLocaleString('es-AR')} ARS`
    : '';

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-2xl mx-auto space-y-6">

          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuración de Pagos</h1>
              <p className="text-muted-foreground mt-1">Conectá tu cuenta de MercadoPago y configurá la seña.</p>
            </div>
          </div>

          {/* ── MercadoPago connection card ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* MP logo placeholder */}
                <span className="text-[#009EE3] font-extrabold tracking-tight text-lg">MP</span>
                Cuenta de MercadoPago
              </CardTitle>
              <CardDescription>
                Autorizá la app para que pueda cobrar señas en tu nombre.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : settings.mp_connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-800">Cuenta conectada</p>
                      {settings.mp_email && (
                        <p className="text-sm text-green-700 truncate">{settings.mp_email}</p>
                      )}
                      {settings.mp_user_id && (
                        <p className="text-xs text-green-600 mt-0.5">User ID: {settings.mp_user_id}</p>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 shrink-0">Activa</Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                  >
                    {disconnecting
                      ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      : <LogOut className="w-4 h-4 mr-2" />}
                    Desconectar cuenta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <XCircle className="w-5 h-5 text-gray-400 shrink-0" />
                    <p className="text-sm text-muted-foreground">No hay ninguna cuenta conectada.</p>
                  </div>
                  <Button
                    className="w-full bg-[#009EE3] hover:bg-[#0081c0] text-white"
                    onClick={handleConnect}
                    disabled={connecting}
                  >
                    {connecting
                      ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      : <ExternalLink className="w-4 h-4 mr-2" />}
                    Conectar con MercadoPago
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Necesitás configurar <code className="font-mono">MP_CLIENT_ID</code> y <code className="font-mono">MP_CLIENT_SECRET</code> en el servidor antes de conectar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Deposit parameters ── */}
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de Seña</CardTitle>
              <CardDescription>
                Configurá qué porcentaje del precio se cobra al reservar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div>
                      <p className="font-medium">Cobro de seña habilitado</p>
                      <p className="text-sm text-muted-foreground">Al desactivar, los turnos se confirman sin pago previo.</p>
                    </div>
                    <Switch
                      checked={settings.payment_enabled}
                      onCheckedChange={(val) => setSettings(s => ({ ...s, payment_enabled: val }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Porcentaje de seña (%)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.deposit_percentage}
                      onChange={(e) => setSettings(s => ({ ...s, deposit_percentage: Number(e.target.value) }))}
                      disabled={!settings.payment_enabled}
                      className="max-w-xs"
                    />
                    {depositExample && (
                      <p className="text-xs text-muted-foreground">{depositExample}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Tiempo de expiración (minutos)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.payment_expiry_minutes}
                      onChange={(e) => setSettings(s => ({ ...s, payment_expiry_minutes: Number(e.target.value) }))}
                      disabled={!settings.payment_enabled}
                      className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minutos para completar el pago antes de que el turno se cancele automáticamente.
                    </p>
                  </div>

                  <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Guardar Configuración
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default PaymentSettingsPage;
