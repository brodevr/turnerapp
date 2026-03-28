import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { useClientAuth } from '@/contexts/ClientAuthContext.jsx';
import LoadingSpinner from '@/components/LoadingSpinner.jsx';

const IdentitySelectionPage = () => {
  const navigate = useNavigate();
  const { clientUser, isLoading } = useClientAuth();

  // If already logged in, skip this page automatically
  useEffect(() => {
    if (!isLoading && clientUser) {
      navigate('/professionals', { replace: true });
    }
  }, [clientUser, isLoading, navigate]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Welcome
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              How would you like to continue with your booking?
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="flex flex-col border-primary/20 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer" onClick={() => navigate('/client/login', { state: { redirect: '/professionals' } })}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <LogIn className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Log In</CardTitle>
                <CardDescription className="text-base pt-2">
                  I already have an account
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-end justify-center pb-8">
                <Button className="w-full">Sign In</Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col border-primary/20 hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer" onClick={() => navigate('/client/register', { state: { redirect: '/professionals' } })}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Create Account</CardTitle>
                <CardDescription className="text-base pt-2">
                  I'm a new client
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-end justify-center pb-8">
                <Button variant="outline" className="w-full">Sign Up</Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              className="group text-muted-foreground hover:text-slate-900 font-medium px-8 py-6 h-auto"
              onClick={() => navigate('/professionals')}
            >
              Continue as Guest
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdentitySelectionPage;
