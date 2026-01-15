'use client';

import React, { useEffect } from 'react';
import { useNotificationsStore } from '@/store/notifications-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCheck, Bell, MessageSquare, Briefcase, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useParrillasStore } from '@/store/parrillas-store';

export function NotificationsView() {
    const { notifications, fetchNotifications, markAllAsRead, markAsRead, unreadCount } = useNotificationsStore();
    const { setCurrentView } = useParrillasStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Briefcase className="h-5 w-5 text-green-500" />;
            case 'warning': return <Info className="h-5 w-5 text-yellow-500" />;
            case 'error': return <Info className="h-5 w-5 text-red-500" />;
            case 'info':
            default: return <MessageSquare className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background p-6 space-y-6 max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
                    <p className="text-muted-foreground">
                        Historial de actividad de tus parrillas.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={() => markAllAsRead()} className="gap-2">
                        <CheckCheck className="h-4 w-4" />
                        Marcar todas como leídas
                    </Button>
                )}
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col">
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Recientes
                    </CardTitle>
                    <CardDescription>
                        Tienes {unreadCount} notificaciones sin leer.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground opacity-50">
                                <Bell className="h-16 w-16 mb-4 stroke-1" />
                                <p>No tienes notificaciones recientes</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={cn(
                                            "flex gap-4 p-4 transition-colors hover:bg-muted/50 cursor-pointer items-start",
                                            !notif.is_read ? "bg-blue-50/50 dark:bg-blue-950/10" : "bg-transparent"
                                        )}
                                        onClick={() => {
                                            if (!notif.is_read) markAsRead(notif.id);
                                            // Optional: Navigate to detail
                                        }}
                                    >
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 grid gap-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn("text-sm font-medium leading-none", !notif.is_read && "font-bold text-foreground")}>
                                                    {notif.title}
                                                </p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notif.message}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="self-center">
                                                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
