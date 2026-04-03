import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Chrome, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login: adminLogin } = useAuth();
  const { login: clientLogin, googleLogin } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Try Client Auth first
      await clientLogin(email, password);
      // Success as Client
      navigate(from || '/client/dashboard', { replace: true });
    } catch (clientErr) {
      // 2. If client auth fails, try Admin Auth
      try {
        await adminLogin(email, password);
        // Success as Admin
        navigate(from || '/admin/dashboard', { replace: true });
      } catch (adminErr) {
        // Both failed
        setError(t('auth.login.invalid', { defaultValue: 'Invalid email or password' }));
        setIsLoading(false); // Only set false on full failure, as success redirects anyway
      }
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
      navigate(from || '/client/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Google Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 mt-8 mb-8">
        <Card className="w-full max-w-md shadow-lg border-primary/20">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary">{t('nav.login')}</CardTitle>
            <CardDescription>{t('auth.login.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-11 text-base font-medium" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-5 w-5" />
              {t('auth.login.google', { defaultValue: 'Sign in with Google' })}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">
                  {t('auth.login.orEmail', { defaultValue: 'Or continue with email' })}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.login.email', { defaultValue: 'Email' })}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder', { defaultValue: 'name@example.com' })}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.login.password', { defaultValue: 'Password' })}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              <Button type="submit" className="w-full text-md h-12" disabled={isLoading}>
                {isLoading ? t('auth.login.submitting', { defaultValue: '...' }) : t('auth.login.submit')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center space-y-4 text-sm text-slate-600 border-t pt-6 pb-8">
            <p>
              {t('auth.login.noAccount', { defaultValue: "Don't have an account?" })}{' '}
              <Link to="/client/register" className="text-primary font-semibold hover:underline">
                {t('auth.login.registerLink', { defaultValue: 'Register' })}
              </Link>
            </p>
            <Link to="/forgot-password" size="sm" className="text-primary/70 hover:text-primary transition-colors underline-offset-4 hover:underline">
               {t('auth.login.forgot', { defaultValue: 'Forgot your password?' })}
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
