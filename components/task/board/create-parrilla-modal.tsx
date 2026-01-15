"use client";

import { useState, useEffect } from "react";
import { useParrillasStore } from "@/store/parrillas-store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Loader2, Plus, X, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function CreateParrillaModal() {
    const {
        isCreateModalOpen,
        closeCreateModal,
        defaultStatusId,
        addParrilla,
        clients,
        statuses,
        labels,
        users,
        loading
    } = useParrillasStore();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [clientId, setClientId] = useState("");
    const [statusId, setStatusId] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
    const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

    useEffect(() => {
        if (isCreateModalOpen) {
            setTitle("");
            setDescription("");
            setClientId("");
            // Use defaultStatusId if available, otherwise first status, otherwise empty (though it should have one)
            setStatusId(defaultStatusId || (statuses.length > 0 ? statuses[0].id : ""));
            setDueDate(undefined);
            setPriority("medium");
            setAssignedUserIds([]);
            setSelectedLabelIds([]);
        }
    }, [isCreateModalOpen, defaultStatusId, statuses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !clientId) return;

        // Ensure we have a status ID
        const finalStatusId = statusId || (statuses.length > 0 ? statuses[0].id : "");
        if (!finalStatusId) {
            console.error("No status available");
            return;
        }

        await addParrilla({
            title,
            description,
            client_id: clientId,
            status_id: finalStatusId,
            due_date: dueDate ? dueDate.toISOString() : null,
            priority,
            updated_at: new Date().toISOString(),
        }, assignedUserIds, selectedLabelIds);

        closeCreateModal();
    };

    const toggleLabel = (labelId: string) => {
        setSelectedLabelIds(prev =>
            prev.includes(labelId)
                ? prev.filter(id => id !== labelId)
                : [...prev, labelId]
        );
    };

    const toggleUser = (userId: string) => {
        setAssignedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const assignedUsers = users.filter(u => assignedUserIds.includes(u.id));

    return (
        <Dialog open={isCreateModalOpen} onOpenChange={(open) => !open && closeCreateModal()}>
            <DialogContent className="sm:max-w-[600px] p-6 gap-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-xl font-semibold">Nueva Parrilla</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Crea una nueva parrilla de contenido para un cliente
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Título <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Parrilla Enero - Semana 1"
                            required
                            className="h-10"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el contenido de esta parrilla..."
                            className="min-h-[80px] resize-none"
                        />
                    </div>

                    {/* Client */}
                    <div className="space-y-2">
                        <Label htmlFor="client" className="text-sm font-medium">
                            Cliente <span className="text-red-500">*</span>
                        </Label>
                        <Select value={clientId} onValueChange={setClientId} required>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecciona un cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="size-2 rounded-full"
                                                style={{ backgroundColor: client.color }}
                                            />
                                            {client.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-medium">Prioridad</Label>
                        <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Seleccionar prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Baja</SelectItem>
                                <SelectItem value="medium">Media</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                                <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Fecha de Entrega</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
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

                    {/* Assignees */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Asignados</Label>
                        <div className="flex items-center justify-between p-1">
                            {assignedUsers.length === 0 ? (
                                <span className="text-sm text-muted-foreground">No hay usuarios asignados</span>
                            ) : (
                                <div className="flex -space-x-2">
                                    {assignedUsers.map(user => (
                                        <div key={user.id} className="relative group">
                                            <Avatar className="size-8 border-2 border-background">
                                                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                                                <AvatarFallback>
                                                    {user.full_name.split(" ").map((n: string) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <div
                                                    className="bg-destructive text-destructive-foreground rounded-full p-0.5 size-4 flex items-center justify-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleUser(user.id);
                                                    }}
                                                >
                                                    <X className="size-3" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button type="button" variant="outline" size="sm" className="h-8 gap-1">
                                        <Plus className="size-3.5" />
                                        Asignar
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-2" align="end">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-xs mb-2 px-2 text-muted-foreground">Usuarios</h4>
                                        {users.map(user => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer text-sm"
                                                onClick={() => toggleUser(user.id)}
                                            >
                                                <div className={cn(
                                                    "size-4 border rounded-sm flex items-center justify-center",
                                                    assignedUserIds.includes(user.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                                )}>
                                                    {assignedUserIds.includes(user.id) && <Check className="size-3" />}
                                                </div>
                                                <Avatar className="size-6">
                                                    <AvatarImage src={user.avatar_url || undefined} />
                                                    <AvatarFallback className="text-[10px]">
                                                        {user.full_name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="truncate">{user.full_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Etiquetas</Label>
                        <div className="flex flex-wrap gap-2">
                            {labels.map((label) => {
                                const isSelected = selectedLabelIds.includes(label.id);
                                return (
                                    <Badge
                                        key={label.id}
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            "cursor-pointer hover:bg-opacity-80 px-3 py-1 text-xs font-normal transition-all",
                                            isSelected
                                                ? "ring-2 ring-offset-1 ring-primary border-transparent"
                                                : "text-muted-foreground hover:text-foreground hover:border-foreground/50"
                                        )}
                                        style={isSelected ? { backgroundColor: label.color || undefined } : {}}
                                        onClick={() => toggleLabel(label.id)}
                                    >
                                        {label.name}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-8">
                        <Button type="button" variant="outline" onClick={closeCreateModal}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !title || !clientId}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Parrilla
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
