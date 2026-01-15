"use client";

import * as React from "react";
import {
    Calendar as CalendarIcon,
    Plus,
    Grid3X3,
    Filter,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useParrillasStore } from "@/store/parrillas-store";
import { Badge } from "@/components/ui/badge";

export function ParrillaHeader() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const { filterClientId, setFilterClientId, setFilterDate, parrillas, clients, users, currentUser, setCurrentView, openCreateModal } = useParrillasStore();

    const selectedClient = clients.find(c => c.id === filterClientId);
    const parrillaCount = parrillas.length;

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            setFilterDate(dateStr);
        } else {
            setFilterDate(null);
        }
        setOpen(false);
    };

    return (
        <>
            <div className="border-b border-border bg-background">
                <div className="flex items-center justify-between px-3 lg:px-6 py-3">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger />
                        <div className="flex items-center gap-2">
                            <Grid3X3 className="size-5 text-primary" />
                            <h1 className="text-base lg:text-lg font-semibold">Parrillas</h1>
                            <Badge variant="secondary" className="text-xs">
                                {parrillaCount} activas
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <ThemeToggle />
                        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground mr-2">
                            {/* Online Users Avatars */}
                            <div className="flex -space-x-2">
                                {users.slice(0, 5).map((user) => (
                                    <Avatar key={user.id} className="h-7 w-7 border-2 border-green-500 ring-2 ring-background" title={user.full_name}>
                                        <AvatarImage src={user.avatar_url || ''} alt={user.full_name} />
                                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                            {user.full_name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                ))}
                                {users.length > 5 && (
                                    <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                        +{users.length - 5}
                                    </div>
                                )}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2 p-0">
                                        <Avatar className="h-8 w-8 border-2 border-green-500">
                                            <AvatarImage src={currentUser?.avatar_url || ''} alt={currentUser?.full_name || ''} />
                                            <AvatarFallback>{currentUser?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuItem onClick={() => setCurrentView('settings' as any)}>
                                        Configuración
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Button size="sm" className="gap-2" onClick={() => openCreateModal()}>
                            <Plus className="size-4" />
                            <span className="hidden sm:inline">Nueva Parrilla</span>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-3 lg:px-6 py-3 border-t border-border overflow-x-auto">
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Client Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="size-4" />
                                    {selectedClient ? (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-4 rounded-sm"
                                                style={{ backgroundColor: selectedClient.color }}
                                            />
                                            <span>{selectedClient.name}</span>
                                        </div>
                                    ) : (
                                        <span>Todos los clientes</span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                                <DropdownMenuItem onClick={() => setFilterClientId(null)}>
                                    <div className="flex items-center gap-2">
                                        <div className="size-4 rounded-sm bg-gradient-to-br from-violet-500 to-pink-500" />
                                        <span>Todos los clientes</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {clients.map((client) => (
                                    <DropdownMenuItem
                                        key={client.id}
                                        onClick={() => setFilterClientId(client.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-4 rounded-sm"
                                                style={{ backgroundColor: client.color }}
                                            />
                                            <span>{client.name}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Status badges */}
                        <div className="hidden md:flex items-center gap-1">
                            <Badge variant="outline" className="text-xs gap-1">
                                <div className="size-2 rounded-full bg-blue-500" />
                                Contenido
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                                <div className="size-2 rounded-full bg-amber-500" />
                                Diseño
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                                <div className="size-2 rounded-full bg-orange-500" />
                                Cambios
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                                <div className="size-2 rounded-full bg-green-500" />
                                Entrega
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 hidden lg:flex font-normal"
                                >
                                    <CalendarIcon className="size-4" />
                                    {date
                                        ? date.toLocaleDateString("es-ES", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })
                                        : "Seleccionar fecha"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    captionLayout="dropdown"
                                    onSelect={(selectedDate: Date | undefined) => {
                                        setDate(selectedDate);
                                        setOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>

        </>
    );
}
