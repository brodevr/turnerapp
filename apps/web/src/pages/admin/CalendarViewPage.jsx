
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/AdminSidebar.jsx';

const CalendarViewPage = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Vista de Calendario</h1>
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                La vista de calendario estará disponible próximamente. Mostrará todas las citas en formato visual.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CalendarViewPage;
