"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ParrillaAssignment } from "../assignment/parrilla-assignment";
import { useParrillasStore } from "@/store/parrillas-store";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

interface CreateParrillaModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateParrillaModal({ open, onOpenChange }: CreateParrillaModalProps) {
    const { addParrilla, clients, labels, statuses, users } = useParrillasStore();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedClient, setSelectedClient] = useState<string>("");
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !selectedClient || !user) return;

        setLoading(true);
        try {
            // Get the first status (should be "Contenido" or similar)
            const defaultStatus = statuses[0];
            if (!defaultStatus) {
                console.error('No statuses available');
                return;
            }

            await addParrilla({
                title: title.trim(),
                description: description.trim() || null,
                status_id: defaultStatus.id,
                client_id: selectedClient,
                due_date: dueDate?.toISOString().split('T')[0] || null,
                priority,
                created_by: user.id,
            });

            // TODO: Add assignees and labels after parrilla is created
            // This would require getting the parrilla ID and then inserting into junction tables

            handleClose();
        } catch (error) {
            console.error('Error creating parrilla:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setSelectedClient("");
        setSelectedLabels([]);
        setAssignedUserIds([]);
        setDueDate(undefined);
        setPriority("medium");
        onOpenChange(false);
    };

    const toggleLabel = (labelId: string) => {
        setSelectedLabels(prev =>
            prev.includes(labelId)
                ? prev.filter(id => id !== labelId)
                : [...prev, labelId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva Parrilla</DialogTitle>
                    <DialogDescription>
                        Crea una nueva parrilla de contenido para un cliente
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                            id="title"
                            placeholder="Ej: Parrilla Enero - Semana 1"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe el contenido de esta parrilla..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Cliente */}
                    <div className="space-y-2">
                        <Label htmlFor="client">Cliente *</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-3 rounded-sm"
                                                style={{ backgroundColor: client.color }}
                                            />
                                            {client.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Prioridad */}
                    <div className="space-y-2">
                        <Label htmlFor="priority">Prioridad</Label>
                        <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Baja</SelectItem>
                                <SelectItem value="medium">Media</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Fecha de entrega */}
                    <div className="space-y-2">
                        <Label>Fecha de Entrega</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? dueDate.toLocaleDateString("es-ES") : "Seleccionar fecha"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dueDate}
                                    onSelect={setDueDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Asignados */}
                    <div className="space-y-2">
                        <Label>Asignados</Label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 flex flex-wrap gap-1">
                                {assignedUserIds.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">
                                        No hay usuarios asignados
                                    </span>
                                ) : (
                                    assignedUserIds.map((userId) => {
                                        const user = users.find(u => u.id === userId);
                                        return user ? (
                                            <Badge key={user.id} variant="secondary">
                                                {user.full_name}
                                            </Badge>
                                        ) : null;
                                    })
                                )}
                            </div>
                            <Button variant="outline" size="sm" disabled>
                                <Plus className="h-4 w-4 mr-1" />
                                Asignar
                            </Button>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-2">
                        <Label>Etiquetas</Label>
                        <div className="flex flex-wrap gap-2">
                            {labels.map((label) => (
                                <Badge
                                    key={label.id}
                                    variant={selectedLabels.includes(label.id) ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer",
                                        selectedLabels.includes(label.id) && label.color
                                    )}
                                    onClick={() => toggleLabel(label.id)}
                                >
                                    {label.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!title.trim() || !selectedClient || loading}
                    >
                        {loading ? 'Creando...' : 'Crear Parrilla'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
