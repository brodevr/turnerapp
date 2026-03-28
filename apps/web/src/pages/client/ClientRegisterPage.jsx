import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Chrome } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const ClientRegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, googleLogin } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.pwdMatchError', { defaultValue: "Passwords do not match" }));
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      const redirectPath = location.state?.redirect || '/client/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Simple mock prompt since OAuth is not yet connected
    const fakeEmail = prompt("Enter your Google Email (Mock):", "demo@google.com");
    if (!fakeEmail) return;

    setIsLoading(true);
    setError('');

    try {
      await googleLogin({
        email: fakeEmail,
        google_id: "google-mock-" + btoa(fakeEmail), // Dummy ID
        name: fakeEmail.split('@')[0],
        lastname: ""
      });
      const redirectPath = location.state?.redirect || '/client/dashboard';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Google Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-lg border-0 mb-8 mt-8">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight">{t('auth.register.title')}</CardTitle>
            <CardDescription className="text-base">
              {t('auth.register.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-11 text-base font-medium" 
              onClick={handleGoogleLogin}
            >
              <Chrome className="mr-2 h-5 w-5" />
              {t('auth.register.google')}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">{t('auth.register.orEmail')}</span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.register.firstName')}</Label>
                  <Input id="name" required value={formData.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname">{t('auth.register.lastName')}</Label>
                  <Input id="lastname" required value={formData.lastname} onChange={handleChange} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.register.email')}</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('auth.register.phone')}</Label>
                <Input id="phone" type="tel" placeholder="+123456789" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.register.password')}</Label>
                  <Input id="password" type="password" required minLength={8} value={formData.password} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" required minLength={8} value={formData.confirmPassword} onChange={handleChange} />
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full h-11 text-base font-semibold mt-4 transition-all hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? t('auth.register.submitting') : t('auth.register.submit')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-6">
            <div className="text-sm text-center text-slate-500">
              {t('auth.register.haveAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t('auth.register.loginLink')}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ClientRegisterPage;
