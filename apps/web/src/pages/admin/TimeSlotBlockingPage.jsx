
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/AdminSidebar.jsx';

const TimeSlotBlockingPage = () => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-8 pt-20 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Time Slot Blocking</h1>
          <Card>
            <CardHeader>
              <CardTitle>Block Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Time slot blocking functionality coming soon. This will allow you to block specific time slots for professionals.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TimeSlotBlockingPage;
