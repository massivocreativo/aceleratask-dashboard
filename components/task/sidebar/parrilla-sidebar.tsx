'use client';

import * as React from 'react';
import {
    Building,
    Calendar,
    ChevronRight,
    LayoutDashboard,
    Palette,
    Search,
    Settings,
    Users,
    Bell,
    FolderKanban,
    Plus,
    Trash2,
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { useParrillasStore } from '@/store/parrillas-store';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Image from 'next/image';
import { CreateClientModal } from '@/components/clients/create-client-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                isActive={active}
                onClick={onClick}
                className="cursor-pointer"
            >
                {icon}
                <span>{label}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

interface SidebarSectionProps {
    title: string;
    children: React.ReactNode;
}

function SidebarSection({ title, children }: SidebarSectionProps) {
    return (
        <SidebarGroup>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {title}
            </div>
            <SidebarMenu>{children}</SidebarMenu>
        </SidebarGroup>
    );
}

export function ParrillaSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const { setFilterClientId, filterClientId, setSearchQuery, currentView, setCurrentView, setFilterRole, filterRole, clients, deleteClient, currentUser, fetchCurrentUser, filterUserId, setFilterUserId, users } = useParrillasStore();
    const [createClientOpen, setCreateClientOpen] = React.useState(false);

    React.useEffect(() => {
        fetchCurrentUser();
    }, []);

    const handleDeleteClient = async (e: React.MouseEvent, clientId: string) => {
        e.stopPropagation();
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            await deleteClient(clientId);
        }
    };

    const isManagement = currentUser?.role === 'CEO' || currentUser?.role === 'Creative Director';
    const canDelete = isManagement;

    return (
        <>
            <Sidebar collapsible="offcanvas" {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent">
                                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-white shadow-sm">
                                    <Image
                                        src="/aceleratask-logo.png"
                                        alt="Aceleratask"
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">Aceleratask</span>
                                    <span className="text-xs text-muted-foreground">
                                        Gestión de Parrillas
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarSection title="Buscar">
                        <div className="px-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar parrillas..."
                                    className="pl-8"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </SidebarSection>

                    <SidebarSeparator />

                    <SidebarSection title="Menú">
                        <SidebarItem
                            icon={<LayoutDashboard className="size-4" />}
                            label="Dashboard"
                            active={currentView === 'dashboard'}
                            onClick={() => setCurrentView('dashboard')}
                        />
                        <SidebarItem
                            icon={<FolderKanban className="size-4" />}
                            label="Parrillas"
                            active={currentView === 'board'}
                            onClick={() => setCurrentView('board')}
                        />
                        <SidebarItem
                            icon={<Calendar className="size-4" />}
                            label="Calendario"
                            active={currentView === 'calendar'}
                            onClick={() => setCurrentView('calendar')}
                        />
                        <SidebarItem
                            icon={<Palette className="size-4" />}
                            label="Diseños"
                            active={currentView === 'designs'}
                            onClick={() => setCurrentView('designs')}
                        />
                        <SidebarItem
                            icon={<Bell className="size-4" />}
                            label="Notificaciones"
                            active={currentView === 'notifications'}
                            onClick={() => setCurrentView('notifications')}
                        />
                    </SidebarSection>

                    <SidebarSeparator />

                    <SidebarSection title="Clientes">
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton>
                                        <Building className="size-4" />
                                        <span>Ver todos los clientes</span>
                                        <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                onClick={() => setFilterClientId(null)}
                                                isActive={filterClientId === null}
                                            >
                                                <div className="size-2 rounded-full bg-muted-foreground" />
                                                <span>Todos</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        {clients.map((client) => (
                                            <SidebarMenuSubItem key={client.id} className="group/item relative pr-6">
                                                <SidebarMenuSubButton
                                                    onClick={() => setFilterClientId(client.id)}
                                                    isActive={filterClientId === client.id}
                                                >
                                                    <div
                                                        className="size-2 rounded-full"
                                                        style={{ backgroundColor: client.color }}
                                                    />
                                                    <span className="truncate">{client.name}</span>
                                                </SidebarMenuSubButton>
                                                {canDelete && (
                                                    <button
                                                        onClick={(e) => handleDeleteClient(e, client.id)}
                                                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-all"
                                                        title="Eliminar cliente"
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </button>
                                                )}
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setCreateClientOpen(true)}>
                                <Plus className="size-4" />
                                <span>Nuevo Cliente</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarSection>

                    {isManagement && (
                        <>
                            <SidebarSeparator />
                            <SidebarSection title="Empleados">
                                <Collapsible defaultOpen className="group/collapsible">
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton>
                                                <Users className="size-4" />
                                                <span>{users.length} miembros activos</span>
                                                <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {users.map((user) => (
                                                    <SidebarMenuSubItem key={user.id}>
                                                        <SidebarMenuSubButton
                                                            onClick={() => {
                                                                setFilterUserId(filterUserId === user.id ? null : user.id);
                                                                setCurrentView('board');
                                                            }}
                                                            isActive={filterUserId === user.id}
                                                        >
                                                            <Avatar className="size-5 mr-1.5 h-5 w-5">
                                                                <AvatarImage src={user.avatar_url || ''} />
                                                                <AvatarFallback className="text-[9px]">{user.full_name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="truncate text-xs">{user.full_name}</span>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            </SidebarSection>
                        </>
                    )}
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={currentUser?.avatar_url || ''} alt={currentUser?.full_name || ''} />
                                            <AvatarFallback className="rounded-lg">{currentUser?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{currentUser?.full_name || 'Usuario'}</span>
                                            <span className="truncate text-xs">{currentUser?.role || ''}</span>
                                        </div>
                                        <Settings className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--sidebar-width) min-w-56 rounded-lg"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem onClick={() => setCurrentView('settings' as any)}>
                                        <Settings className="mr-2 size-4" />
                                        Configuración
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                        Cerrar Sesión
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <CreateClientModal
                open={createClientOpen}
                onOpenChange={setCreateClientOpen}
            />
        </>
    );
}
