'use client';

import { useParrillasStore } from "@/store/parrillas-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Activity,
    AlertCircle,
    CalendarClock,
    CheckCircle2,
    Clock,
    TrendingUp
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DashboardView() {
    const { parrillas, currentUser, openParrillaModal } = useParrillasStore();

    if (!currentUser) return null;

    const isManagement = currentUser.role === 'CEO' || currentUser.role === 'Creative Director';

    // Filter parrillas based on role
    const relevantParrillas = isManagement
        ? parrillas
        : parrillas.filter(p => p.assignees.some(u => u.id === currentUser.id));

    // Calculate Metrics
    const activeParrillas = relevantParrillas.filter(p => p.status.name.toLowerCase() !== 'completado' && p.status.name.toLowerCase() !== 'publicado');
    const urgentParrillas = activeParrillas.filter(p => p.priority === 'urgent');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueOrToday = activeParrillas.filter(p => {
        if (!p.due_date) return false;
        const dueDate = new Date(p.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate <= today;
    });

    const reviewsPending = activeParrillas.filter(p =>
        p.status.name.toLowerCase().includes('revisión') ||
        p.status.name.toLowerCase().includes('review')
    );

    // Sort for "Upcoming Deliveries" (Overdue first, then soonest)
    const upcomingDeliveries = [...activeParrillas]
        .filter(p => p.due_date)
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5);

    return (
        <div className="p-6 space-y-8 bg-background/50 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Hola, {currentUser.full_name.split(' ')[0]} 👋
                </h1>
                <p className="text-muted-foreground">
                    Aquí tienes el resumen {isManagement ? 'global de la agencia' : 'de tus asignaciones'} para hoy {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Parrillas Activas
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeParrillas.length}</div>
                        <p className="text-xs text-muted-foreground">
                            En curso actualmente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Urgentes
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{urgentParrillas.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Requieren atención inmediata
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Vencen Hoy / Atrasadas
                        </CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{overdueOrToday.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Límite de entrega cercano
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            En Revisión
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reviewsPending.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Esperando feedback
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Areas */}
            <div className="grid gap-4 md:grid-cols-7">
                {/* Upcoming Deliveries List - Takes up 4 columns */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Próximas Entregas</CardTitle>
                        <CardDescription>
                            Parrillas ordenadas por fecha de vencimiento.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingDeliveries.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay entregas pendientes próximas.
                                </div>
                            ) : (
                                upcomingDeliveries.map((parrilla) => (
                                    <div
                                        key={parrilla.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                        onClick={() => openParrillaModal(parrilla)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="size-2 rounded-full ring-2 ring-offset-2"
                                                style={{ backgroundColor: parrilla.client.color, '--tw-ring-color': parrilla.client.color } as any}
                                            />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {parrilla.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {parrilla.client.name} • {parrilla.status.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {parrilla.priority === 'urgent' && (
                                                <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">URGENTE</Badge>
                                            )}
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <CalendarClock className="mr-1 h-3 w-3" />
                                                    {parrilla.due_date ? format(new Date(parrilla.due_date), "d MMM", { locale: es }) : 'Sin fecha'}
                                                </div>
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {parrilla.assignees.map((user) => (
                                                        <Avatar key={user.id} className="inline-block h-5 w-5 rounded-full ring-1 ring-background">
                                                            <AvatarImage src={user.avatar_url || ''} />
                                                            <AvatarFallback className="text-[8px]">{user.full_name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Distribution / Quick Access - Takes up 3 columns */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Estado del {isManagement ? 'Equipo' : 'Trabajo'}</CardTitle>
                        <CardDescription>
                            Distribución de tus tareas actuales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Simple Bar Chart Visualization */}
                            <div className="space-y-3">
                                {['To Do', 'In Progress', 'En Revisión', 'Completado'].map((statusKey) => {
                                    // Fuzzy match for status names
                                    const count = relevantParrillas.filter(p =>
                                        statusKey === 'To Do' ? ['to do', 'pendiente', 'backlog'].some(s => p.status.name.toLowerCase().includes(s)) :
                                            statusKey === 'In Progress' ? ['in progress', 'en proceso', 'working'].some(s => p.status.name.toLowerCase().includes(s)) :
                                                statusKey === 'En Revisión' ? ['review', 'revisión', 'aprobación'].some(s => p.status.name.toLowerCase().includes(s)) :
                                                    ['done', 'completado', 'publicado'].some(s => p.status.name.toLowerCase().includes(s))
                                    ).length;

                                    const percentage = relevantParrillas.length > 0 ? (count / relevantParrillas.length) * 100 : 0;

                                    return (
                                        <div key={statusKey} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-medium">{statusKey}</span>
                                                <span className="text-muted-foreground">{count}</span>
                                            </div>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        statusKey === 'To Do' ? "bg-slate-400" :
                                                            statusKey === 'In Progress' ? "bg-blue-500" :
                                                                statusKey === 'En Revisión' ? "bg-purple-500" :
                                                                    "bg-green-500"
                                                    )}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
