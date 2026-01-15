'use client';

import { useEffect } from 'react';
import { ParrillaSidebar } from '@/components/task/sidebar/parrilla-sidebar';
import { ParrillaHeader } from '@/components/task/header/parrilla-header';
import { ParrillaBoard } from '@/components/task/board/parrilla-board';
import { ParrillaCalendar } from '@/components/task/calendar/parrilla-calendar';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { CreateParrillaModal } from '@/components/task/board/create-parrilla-modal';
import { SettingsView } from '@/components/dashboard/settings-view';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useParrillasStore } from '@/store/parrillas-store';
import ProtectedRoute from '@/components/auth/protected-route';
import { NotificationsView } from '@/components/dashboard/notifications-view';
import { DesignsView } from '@/components/dashboard/designs-view';
import { Loader } from '@/components/ui/loader';

export default function Home() {
  const { currentView, loading, fetchParrillas, fetchClients, fetchStatuses, fetchLabels, fetchUsers, subscribeToParrillas } = useParrillasStore();


  useEffect(() => {
    // Override console.log to capture status for UI (Temporary Hack)
    /*
    const originalLog = console.log;
    console.log = (...args) => {
        if (args[0]?.includes('Realtime')) setRealtimeStatus(args.join(' '));
        originalLog(...args);
    };
    */

    // Fetch all data on mount
    const loadData = async () => {
      await Promise.all([
        fetchParrillas(),
        fetchClients(),
        fetchStatuses(),
        fetchLabels(),
        fetchUsers(),
      ]);
      // Enable Realtime
      subscribeToParrillas();
    };

    loadData();
  }, []);

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <ParrillaSidebar />
        <div className="flex-1 flex flex-col overflow-hidden h-screen">

          <ParrillaHeader />
          <main className="w-full h-full overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Loader size={120} />
                  <p className="text-muted-foreground font-medium">Cargando parrillas...</p>
                </div>
              </div>
            ) : (
              currentView === 'board' ? <ParrillaBoard /> :
                currentView === 'calendar' ? <ParrillaCalendar /> :
                  currentView === 'settings' ? <SettingsView /> :
                    currentView === 'notifications' ? <NotificationsView /> :
                      currentView === 'designs' ? <DesignsView /> :
                        <DashboardView />
            )}
          </main>
          <CreateParrillaModal />
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
