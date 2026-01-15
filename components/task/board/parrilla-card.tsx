"use client";

import { ParrillaWithRelations } from "@/store/parrillas-store";
import {
    Calendar,
    MessageSquare,
    Image as ImageIcon,
    User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useParrillasStore } from "@/store/parrillas-store";
import { getStatusIcon } from "@/lib/status-icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ParrillaCardProps {
    parrilla: ParrillaWithRelations;
}

export function ParrillaCard({ parrilla }: ParrillaCardProps) {
    const { openParrillaModal } = useParrillasStore();
    const StatusIcon = getStatusIcon(parrilla.status.icon);
    const hasImages = parrilla.images.length > 0;
    const hasComments = parrilla.comments.length > 0;
    // Note: In Supabase schema, comments don't have imageIndex, they have image_id
    const pendingComments = parrilla.comments.filter(c => c.image_id !== null).length;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: parrilla.id,
        data: { parrilla }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : undefined,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-background shrink-0 rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200"
            onClick={() => openParrillaModal(parrilla)}
        >
            {/* Client Header */}
            <div
                className="px-3 py-2 border-b border-border"
                style={{ backgroundColor: `${parrilla.client.color}15` }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="size-6 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: parrilla.client.color }}
                    >
                        {parrilla.client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate">{parrilla.client.name}</span>
                    {parrilla.priority === "urgent" && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-auto">
                            Urgente
                        </Badge>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 mb-2">
                    <div className="size-5 mt-0.5 shrink-0 flex items-center justify-center bg-muted rounded-sm p-1">
                        <StatusIcon />
                    </div>
                    <h3 className="text-sm font-medium leading-tight flex-1 line-clamp-1">
                        {parrilla.title}
                    </h3>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {parrilla.description}
                </p>

                {/* Image Preview Grid */}
                {hasImages && (
                    <div className="grid grid-cols-6 gap-1 mb-3">
                        {parrilla.images.slice(0, 6).map((image, idx) => (
                            <div
                                key={image.id}
                                className="aspect-square rounded-sm overflow-hidden bg-muted relative"
                            >
                                <img
                                    src={image.url}
                                    alt={`Post ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {/* Annotations are stored separately in parrilla_annotations table */}
                            </div>
                        ))}
                    </div>
                )}

                {/* Labels */}
                {parrilla.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {parrilla.labels.map((label) => (
                            <Badge
                                key={label.id}
                                variant="secondary"
                                className={cn(
                                    "text-[10px] px-1.5 py-0.5 font-medium",
                                    label.color
                                )}
                            >
                                {label.name}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 border-t border-border border-dashed">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {parrilla.due_date && (
                            <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
                                <Calendar className="size-3" />
                                <span>{new Date(parrilla.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                            </div>
                        )}
                        {hasComments && (
                            <div className={cn(
                                "flex items-center gap-1.5 border rounded-sm py-1 px-2",
                                pendingComments > 0 ? "border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/50" : "border-border"
                            )}>
                                <MessageSquare className="size-3" />
                                <span>{parrilla.comments.length}</span>
                            </div>
                        )}
                        {hasImages && (
                            <div className="flex items-center gap-1.5 border border-border rounded-sm py-1 px-2">
                                <ImageIcon className="size-3" />
                                <span>{parrilla.images.length}/6</span>
                            </div>
                        )}
                    </div>

                    {/* Assignees */}
                    {parrilla.assignees.length > 0 && (
                        <div className="flex -space-x-2">
                            {parrilla.assignees.slice(0, 3).map((user) => (
                                <Avatar
                                    key={user.id}
                                    className="size-6 border-2 border-background"
                                >
                                    <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                                    <AvatarFallback className="text-[10px]">
                                        {user.full_name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {parrilla.assignees.length > 3 && (
                                <div className="size-6 border-2 border-background rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                                    +{parrilla.assignees.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
