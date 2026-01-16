"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ProfilePhotoUploadProps {
    currentUser: {
        id: string;
        full_name: string;
        avatar_url: string | null;
    } | null;
}

export function ProfilePhotoUpload({ currentUser }: ProfilePhotoUploadProps) {
    const [uploading, setUploading] = React.useState(false);
    const [avatarUrl, setAvatarUrl] = React.useState(currentUser?.avatar_url || '');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setAvatarUrl(currentUser?.avatar_url || '');
    }, [currentUser?.avatar_url]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor selecciona una imagen válida");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen debe ser menor a 2MB");
            return;
        }

        setUploading(true);

        try {
            const supabase = createClient();

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user profile
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateError } = await (supabase as any)
                .from('user_profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', currentUser.id);

            if (updateError) {
                throw updateError;
            }

            setAvatarUrl(publicUrl);
            toast.success("Foto de perfil actualizada");

            // Reload to update across the app
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast.error(error.message || "Error al subir la foto");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-6">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt={currentUser?.full_name || ''} className="object-cover" />
                    <AvatarFallback className="text-2xl">
                        {currentUser?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                >
                    <Camera className="h-4 w-4" />
                    {uploading ? 'Subiendo...' : 'Cambiar foto'}
                </Button>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG o GIF. Máximo 2MB.
                </p>
            </div>
        </div>
    );
}
