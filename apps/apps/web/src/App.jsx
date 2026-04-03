
import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { BookingProvider } from '@/contexts/BookingContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import { Toaster } from '@/components/ui/sonner';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';

import { ClientAuthProvider } from '@/contexts/ClientAuthContext.jsx';
import ClientRegisterPage from '@/pages/client/ClientRegisterPage.jsx';
import ClientDashboard from '@/pages/client/ClientDashboard.jsx';
import ForgotPasswordPage from '@/pages/client/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/client/ResetPasswordPage.jsx';

import HomePage from '@/pages/HomePage.jsx';
import IdentitySelectionPage from '@/pages/IdentitySelectionPage.jsx';
import ProfessionalSelectionPage from '@/pages/ProfessionalSelectionPage.jsx';
import ServiceSelectionPage from '@/pages/ServiceSelectionPage.jsx';
import CalendarPage from '@/pages/CalendarPage.jsx';
import TimeSlotPage from '@/pages/TimeSlotPage.jsx';
import CustomerFormPage from '@/pages/CustomerFormPage.jsx';
import ConfirmationPage from '@/pages/ConfirmationPage.jsx';
import SuccessPage from '@/pages/SuccessPage.jsx';

import LoginPage from '@/pages/LoginPage.jsx';
import AdminDashboard from '@/pages/admin/AdminDashboard.jsx';
import AppointmentsListPage from '@/pages/admin/AppointmentsListPage.jsx';
import ProfessionalsPage from '@/pages/admin/ProfessionalsPage.jsx';
import ServicesPage from '@/pages/admin/ServicesPage.jsx';
import ScheduleConfigPage from '@/pages/admin/ScheduleConfigPage.jsx';
import TimeSlotBlockingPage from '@/pages/admin/TimeSlotBlockingPage.jsx';
import CalendarViewPage from '@/pages/admin/CalendarViewPage.jsx';
import PatientsListPage from '@/pages/admin/PatientsListPage.jsx';
import PatientHistoryPage from '@/pages/admin/PatientHistoryPage.jsx';
import PaymentReturnPage from '@/pages/PaymentReturnPage.jsx';
import PaymentSettingsPage from '@/pages/admin/PaymentSettingsPage.jsx';

function App() {
  return (
    <ClientAuthProvider>
      <AuthProvider>
        <BookingProvider>
          <Router>
          <ScrollToTop />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/identity" element={<IdentitySelectionPage />} />
            <Route path="/professionals" element={<ProfessionalSelectionPage />} />
            <Route path="/services" element={<ServiceSelectionPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/time-slots" element={<TimeSlotPage />} />
            <Route path="/customer-form" element={<CustomerFormPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/payment/success" element={<PaymentReturnPage />} />
            <Route path="/payment/failure" element={<PaymentReturnPage />} />
            <Route path="/payment/pending" element={<PaymentReturnPage />} />

            {/* Client Portal routes */}
            <Route path="/client/login" element={<Navigate to="/login" replace />} />
            <Route path="/client/register" element={<ClientRegisterPage />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />

            {/* Unified login */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/client/reset-password" element={<ResetPasswordPage />} />

            {/* Protected admin routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/appointments" 
              element={
                <ProtectedRoute>
                  <AppointmentsListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/professionals" 
              element={
                <ProtectedRoute>
                  <ProfessionalsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/services" 
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/schedule" 
              element={
                <ProtectedRoute>
                  <ScheduleConfigPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/blocking" 
              element={
                <ProtectedRoute>
                  <TimeSlotBlockingPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/calendar" 
              element={
                <ProtectedRoute>
                  <CalendarViewPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/patients" 
              element={
                <ProtectedRoute>
                  <PatientsListPage />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin/patients/:id/history"
              element={
                <ProtectedRoute>
                  <PatientHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payment-settings"
              element={
                <ProtectedRoute>
                  <PaymentSettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                  <p className="text-muted-foreground mb-6">The page you are looking for does not exist.</p>
                  <a href="/" className="text-primary hover:underline">Return to Home</a>
                </div>
              </div>
            } />
          </Routes>
            <Toaster />
            <ShadcnToaster />
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ClientAuthProvider>
  );
}

export default App;
