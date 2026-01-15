"use client";

import { Database } from "@/types/supabase";
import { ParrillaWithRelations, useParrillasStore } from "@/store/parrillas-store";
import { ParrillaCard } from "./parrilla-card";
import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatusIcon } from "@/lib/status-icons";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

type Status = Database['public']['Tables']['statuses']['Row'];

interface ParrillaColumnProps {
    status: Status;
    parrillas: ParrillaWithRelations[];
}

export function ParrillaColumn({ status, parrillas }: ParrillaColumnProps) {
    const { openCreateModal } = useParrillasStore();
    const StatusIcon = getStatusIcon(status.icon);
    const count = parrillas.length;

    const { setNodeRef } = useDroppable({
        id: status.id,
    });

    return (
        <div className="shrink-0 w-[320px] lg:w-[380px] flex flex-col h-full flex-1">
            <div ref={setNodeRef} className="rounded-lg border border-border p-3 bg-muted/70 dark:bg-muted/50 flex flex-col max-h-full">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div
                            className="size-5 flex items-center justify-center rounded-md"
                            style={{ backgroundColor: `${status.color}20` }}
                        >
                            <StatusIcon />
                        </div>
                        <span className="text-sm font-semibold">{status.name}</span>
                        <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${status.color}20`, color: status.color }}
                        >
                            {count}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-background"
                            onClick={() => openCreateModal(status.id)}
                        >
                            <Plus className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </div>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 overflow-y-auto h-full pr-1 scrollbar-thin">
                    <SortableContext items={parrillas.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        {parrillas.map((parrilla) => (
                            <ParrillaCard key={parrilla.id} parrilla={parrilla} />
                        ))}
                    </SortableContext>

                    {/* Add New Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs h-auto py-2 px-3 self-start hover:bg-background border border-dashed border-border w-full justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => openCreateModal(status.id)}
                    >
                        <Plus className="size-4" />
                        <span>Nueva parrilla</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
