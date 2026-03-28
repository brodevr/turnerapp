import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { clientUser, logout: clientLogout } = useClientAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('i18nextLng', nextLang);
  };

  const currentLangLabel = i18n.language === 'en' ? 'ES' : 'EN';

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleClientLogout = async () => {
    await clientLogout();
    setMobileMenuOpen(false);
    navigate('/client/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl text-primary flex-shrink-0" onClick={closeMenu}>
          Virginia Rojas Beauty
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <Link to="/professionals" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
            {t('nav.book')}
          </Link>

          <div className="flex items-center gap-4 border-l pl-4 ml-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-primary font-medium">
                  <Link to="/admin">{t('nav.admin')}</Link>
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  {t('nav.logout')}
                </Button>
              </div>
            ) : clientUser ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="text-primary font-medium">
                  <Link to="/client/dashboard">{t('nav.dashboard')}</Link>
                </Button>
                <Button onClick={handleClientLogout} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <Button asChild variant="default" size="sm" className="hidden lg:inline-flex">
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-slate-600 hover:text-primary font-bold"
            >
              <Globe className="w-4 h-4" />
              {currentLangLabel}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-slate-600 hover:text-primary font-bold mr-2"
          >
            <Globe className="w-4 h-4" />
            {currentLangLabel}
          </Button>
          <button
            className="p-2 -mr-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white absolute top-16 left-0 w-full shadow-lg z-50 flex flex-col pt-2 pb-6 px-4 space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <Link to="/" className="w-full p-3 text-base font-medium rounded-md hover:bg-slate-50 text-slate-700" onClick={closeMenu}>
            {t('nav.home')}
          </Link>
          <Link to="/professionals" className="w-full p-3 text-base font-medium rounded-md hover:bg-slate-50 text-slate-700" onClick={closeMenu}>
            {t('nav.book')}
          </Link>
          <div className="h-px bg-slate-100 my-2" />

          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link to="/admin" className="w-full p-3 text-base font-medium rounded-md bg-primary/5 text-primary" onClick={closeMenu}>
                {t('nav.admin')}
              </Link>
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-normal">
                {t('nav.logout')}
              </Button>
            </div>
          ) : clientUser ? (
            <div className="flex flex-col gap-2">
              <Link to="/client/dashboard" className="w-full p-3 text-base font-medium rounded-md bg-primary/5 text-primary" onClick={closeMenu}>
                {t('nav.dashboard')}
              </Link>
              <Button onClick={handleClientLogout} variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-normal">
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <Button asChild variant="default" className="w-full justify-center mt-2">
              <Link to="/login" onClick={closeMenu}>{t('nav.login')}</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
