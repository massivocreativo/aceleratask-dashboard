'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from '@/lib/supabase/client';
import { ExternalLink, FolderOpen, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface AgencySettings {
    key: string;
    value: { url: string };
    updated_at: string;
}

export function DesignsView() {
    const [driveUrl, setDriveUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('agency_settings')
            .select('value')
            .eq('key', 'drive_url')
            .single();

        if (data) {
            const settings = data as unknown as { value: { url: string } };
            setDriveUrl(settings.value?.url || '');
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        const supabase = createClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('agency_settings')
            .upsert({
                key: 'drive_url',
                value: { url: driveUrl },
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        if (error) {
            setMessage({ type: 'error', text: 'Error al guardar el enlace.' });
        } else {
            setMessage({ type: 'success', text: 'Enlace guardado correctamente.' });
        }
        setIsSaving(false);
    };

    const openDrive = () => {
        if (driveUrl) {
            window.open(driveUrl.startsWith('http') ? driveUrl : `https://${driveUrl}`, '_blank');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-8 h-full overflow-y-auto space-y-8 bg-background">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Diseños y Recursos</h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona los recursos gráficos y el acceso al Drive de la agencia.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Google Drive Card */}
                <Card className="border-blue-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-medium">
                            Google Drive Master
                        </CardTitle>
                        <FolderOpen className="h-6 w-6 text-blue-500" />
                    </CardHeader>
                    <CardHeader>
                        <CardDescription>
                            Enlace directo a la carpeta principal de diseños en Google Drive.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="https://drive.google.com/drive/folders/..."
                                value={driveUrl}
                                onChange={(e) => setDriveUrl(e.target.value)}
                            />
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </div>
                        {message && (
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}
                        {driveUrl && (
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-4"
                                onClick={openDrive}
                            >
                                <ExternalLink className="h-4 w-4" />
                                Abrir Carpeta de Drive
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Coming Soon / Quick Actions */}
                <Card className="opacity-75 border-dashed">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xl font-medium">
                            Recursos Rápidos
                        </CardTitle>
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardHeader>
                        <CardDescription>
                            Próximamente: Sube logos y guías de estilo aquí para acceso rápido.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-6 text-muted-foreground">
                        <div className="text-center">
                            <p>Funcionalidad en desarrollo</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Embed Preview (Optional) */}
            {driveUrl && driveUrl.includes('drive.google.com') && (
                <Card>
                    <CardHeader>
                        <CardTitle>Vista Previa</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[500px]">
                        <iframe
                            src={driveUrl.replace('/view', '/preview').replace('/edit', '/preview')}
                            width="100%"
                            height="100%"
                            className="border-0 rounded-md bg-muted/20"
                            allow="autoplay"
                        ></iframe>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Nota: Es posible que Google bloquee la vista previa. Usa el botón "Abrir" para ver todos los archivos.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
