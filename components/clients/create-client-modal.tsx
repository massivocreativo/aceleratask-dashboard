'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useParrillasStore } from '@/store/parrillas-store';
import { createClient } from '@/lib/supabase/client';

interface CreateClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
    '#FF6B35', // Orange
    '#004D98', // Blue
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange Red
    '#3b82f6', // Blue
    '#10b981', // Emerald
];

export function CreateClientModal({ open, onOpenChange }: CreateClientModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { fetchClients, fetchParrillas } = useParrillasStore();

    const handleClose = () => {
        setName('');
        setColor(PRESET_COLORS[0]);
        setContactEmail('');
        setContactPhone('');
        setError('');
        onOpenChange(false);
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('El nombre del cliente es requerido');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const supabase = createClient();

            const { error: insertError } = await supabase
                .from('clients')
                .insert({
                    name: name.trim(),
                    color,
                    contact_email: contactEmail.trim() || null,
                    contact_phone: contactPhone.trim() || null,
                } as any);

            if (insertError) throw insertError;

            // Refresh clients list
            await fetchClients();
            await fetchParrillas();

            handleClose();
        } catch (err: any) {
            setError(err.message || 'Error al crear cliente');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                        Agrega un nuevo cliente para asignar parrillas
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Cliente *</Label>
                        <Input
                            id="name"
                            placeholder="Ej: Nike, Adidas, Coca-Cola"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Color Identificador *</Label>
                        <div className="grid grid-cols-10 gap-2">
                            {PRESET_COLORS.map((presetColor) => (
                                <button
                                    key={presetColor}
                                    type="button"
                                    className={`size-8 rounded-full border-2 transition-all ${color === presetColor
                                            ? 'border-primary scale-110'
                                            : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: presetColor }}
                                    onClick={() => setColor(presetColor)}
                                    disabled={loading}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-20 h-10"
                                disabled={loading}
                            />
                            <span className="text-sm text-muted-foreground">
                                O elige un color personalizado
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email de Contacto (Opcional)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="contacto@cliente.com"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono de Contacto (Opcional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 234 567 8900"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={loading || !name.trim()}
                    >
                        {loading ? 'Creando...' : 'Crear Cliente'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
