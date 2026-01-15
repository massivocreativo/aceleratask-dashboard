"use client";

import { useState } from "react";
import { Check, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface ParrillaAssignmentProps {
    assignedUsers: UserProfile[];
    allUsers: UserProfile[];
    onAssignmentChange: (userIds: string[]) => void;
    trigger?: React.ReactNode;
}

export function ParrillaAssignment({
    assignedUsers,
    allUsers,
    onAssignmentChange,
    trigger,
}: ParrillaAssignmentProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(assignedUsers.map(u => u.id));

    const filteredUsers = allUsers.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            user.full_name.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
        );
    });

    const isUserSelected = (userId: string) => {
        return selectedUserIds.includes(userId);
    };

    const toggleUser = (userId: string) => {
        if (isUserSelected(userId)) {
            setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
        } else {
            setSelectedUserIds([...selectedUserIds, userId]);
        }
    };

    const handleSave = () => {
        onAssignmentChange(selectedUserIds);
        setOpen(false);
    };

    const handleCancel = () => {
        setSelectedUserIds(assignedUsers.map(u => u.id));
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Asignar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Asignar Miembros del Equipo</DialogTitle>
                    <DialogDescription>
                        Selecciona los miembros que trabajarán en esta parrilla
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <Input
                        placeholder="Buscar por nombre o rol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Selected users count */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{selectedUserIds.length} seleccionados</span>
                        {selectedUserIds.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedUserIds([])}
                            >
                                Limpiar todo
                            </Button>
                        )}
                    </div>

                    {/* User list */}
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                        {filteredUsers.map((user) => {
                            const selected = isUserSelected(user.id);
                            return (
                                <div
                                    key={user.id}
                                    onClick={() => toggleUser(user.id)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                        selected
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:bg-accent"
                                    )}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                                        <AvatarFallback>
                                            {user.full_name.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{user.full_name}</div>
                                        <div className="text-sm text-muted-foreground truncate">
                                            {user.role}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">
                                            {user.role}
                                        </Badge>
                                        {selected && (
                                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                No se encontraron usuarios
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={handleCancel} className="flex-1">
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="flex-1">
                            <Check className="h-4 w-4 mr-2" />
                            Guardar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
