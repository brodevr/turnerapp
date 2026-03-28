
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Briefcase, 
  Clock, 
  CalendarDays,
  CalendarX,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', label: t('admin.sidebar.dashboard', { defaultValue: 'Dashboard' }), icon: LayoutDashboard },
    { path: '/admin/appointments', label: t('admin.sidebar.appointments', { defaultValue: 'Appointments' }), icon: Calendar },
    { path: '/admin/professionals', label: t('admin.sidebar.professionals', { defaultValue: 'Professionals' }), icon: Users },
    { path: '/admin/services', label: t('admin.sidebar.services', { defaultValue: 'Services' }), icon: Briefcase },
    { path: '/admin/schedule', label: 'Schedule', icon: Clock },
    { path: '/admin/blocking', label: 'Time Slots', icon: CalendarX },
    { path: '/admin/calendar', label: 'Calendar View', icon: CalendarDays },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground mt-4"
        onClick={handleLogout}
      >
        <LogOut className="w-5 h-5" />
        <span>{t('admin.sidebar.logout', { defaultValue: 'Logout' })}</span>
      </Button>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-muted-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          <span className="font-bold text-lg text-primary">Admin Panel</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside 
            className="fixed left-0 top-0 h-full w-72 bg-background border-r p-6 shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 mt-2">
              <h2 className="text-xl font-bold">Navigation</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              <NavLinks />
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-background border-r p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="space-y-2">
          <NavLinks />
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
