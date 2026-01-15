"use client";

import * as React from "react";
import { useParrillasStore } from "@/store/parrillas-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ProfilePhotoUpload } from "./profile-photo-upload";

export function SettingsView() {
    const { currentUser } = useParrillasStore();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
            </div>
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="account">Cuenta</TabsTrigger>
                    <TabsTrigger value="appearance">Apariencia</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Perfil</CardTitle>
                            <CardDescription>
                                Actualiza tu información personal y foto de perfil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <ProfilePhotoUpload currentUser={currentUser} />
                            <Separator />
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nombre Completo</Label>
                                    <Input id="fullName" defaultValue={currentUser?.full_name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <Input id="role" defaultValue={currentUser?.role} disabled />
                                </div>
                            </div>
                            <Button>Guardar Cambios</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cuenta</CardTitle>
                            <CardDescription>
                                Administra la configuración de tu cuenta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Opciones de cuenta próximamente...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Apariencia</CardTitle>
                            <CardDescription>
                                Personaliza el tema de la aplicación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Configuración de tema se maneja vía ThemeToggle en el header.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notificaciones</CardTitle>
                            <CardDescription>
                                Administra tus preferencias de notificación.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="notifications-all" className="flex flex-col space-y-1">
                                    <span>Activar todas las notificaciones</span>
                                    <span className="font-normal text-muted-foreground">Recibe alertas sonoras y visuales en la aplicación.</span>
                                </Label>
                                <Switch
                                    id="notifications-all"
                                    checked={currentUser?.preferences?.notifications?.all ?? true}
                                    onCheckedChange={async (checked) => {
                                        // Specific component logic for updating preferences
                                        // In a real app, strict decoupling is key, but here we can direct update for speed given the architecture
                                        const { createClient } = await import('@/lib/supabase/client');
                                        const supabase = createClient();
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const { error } = await (supabase as any).from('user_profiles').update({
                                            preferences: {
                                                ...currentUser?.preferences,
                                                notifications: { ...currentUser?.preferences?.notifications, all: checked }
                                            }
                                        }).eq('id', currentUser?.id);

                                        if (error) {
                                            console.error(error);
                                        } else {
                                            // Optimistically update store or refetch (store reload usually happens on mount so hard refresh might be needed, or manual store update)
                                            window.location.reload(); // Simplest way to reflect "deep" profile changes across app for now without deep store mutation logic
                                        }
                                    }}
                                />
                            </div>

                            {/* Debug / Test Section */}
                            <Separator />
                            <div className="flex flex-col space-y-4">
                                <Label className="text-base font-semibold">Pruebas y Diagnóstico</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            const { useNotificationsStore } = await import('@/store/notifications-store');
                                            useNotificationsStore.getState().requestPermission();
                                            // Force check
                                            if (Notification.permission === 'granted') {
                                                const { toast } = await import('sonner');
                                                toast.success("Permisos de notificación activos");
                                            }
                                        }}
                                    >
                                        Solicitar Permisos Navegador
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={async () => {
                                            const audio = new Audio('/sounds/notification.mp3');
                                            audio.volume = 0.5;
                                            audio.play()
                                                .then(() => {
                                                    import('sonner').then(({ toast }) => toast.success("Sonido reproducido correctamente"));
                                                })
                                                .catch((e) => {
                                                    console.error(e);
                                                    import('sonner').then(({ toast }) => toast.error("Error al reproducir sonido. Verifica 'public/sounds/notification.mp3'"));
                                                });
                                        }}
                                    >
                                        Probar Sonido
                                    </Button>
                                </div>
                            </div>

                            <Separator />
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="notifications-email" className="flex flex-col space-y-1">
                                    <span>Notificaciones por Email</span>
                                    <span className="font-normal text-muted-foreground">Recibe un resumen diario por correo (Próximamente).</span>
                                </Label>
                                <Switch
                                    id="notifications-email"
                                    disabled
                                    checked={false}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
