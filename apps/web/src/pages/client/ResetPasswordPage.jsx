
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, AtSign, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import apiClient from '@/lib/apiClient';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !email) {
      setError('Enlace de recuperación inválido o incompleto.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/client/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">¡Contraseña Cambiada!</CardTitle>
              <CardDescription>
                Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.
              </CardDescription>
            </div>
            <div className="pt-4">
              <Button asChild className="w-full h-12 text-lg">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-md border-none shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Restablecer Contraseña</CardTitle>
          <CardDescription className="text-center">
            Elige una nueva contraseña segura para tu cuenta.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2 opacity-60">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input value={email || ''} disabled className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="pass" className="text-sm font-medium">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  id="pass"
                  type="password" 
                  placeholder="********" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">Confirmar Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  id="confirm"
                  type="password" 
                  placeholder="********" 
                  className="pl-10"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12" disabled={loading || !!error}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Restablecer Contraseña'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
