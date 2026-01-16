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

    // Optimize image: resize and compress
    const optimizeImage = (file: File, maxSize: number = 400, quality: number = 0.8): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                let { width, height } = img;

                // Calculate new dimensions maintaining aspect ratio
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    };

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

            // Optimize image before upload (resize to 400x400, compress to 80% quality)
            const optimizedBlob = await optimizeImage(file, 400, 0.8);
            const originalSize = file.size;
            const optimizedSize = optimizedBlob.size;
            console.log(`Image optimized: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB`);

            // Generate unique filename (always .jpg after optimization)
            const fileName = `${currentUser.id}-${Date.now()}.jpg`;
            const filePath = `avatars/${fileName}`;

            // Upload optimized image to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, optimizedBlob, {
                    upsert: true,
                    contentType: 'image/jpeg'
                });

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
