"use client";

import { ParrillaColumn } from "./parrilla-column";
import { ParrillaDetailModal } from "./parrilla-detail-modal";
import { useParrillasStore, ParrillaWithRelations } from "@/store/parrillas-store";
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragOverEvent, closestCorners } from "@dnd-kit/core";
import { useState } from "react";
import { ParrillaCard } from "./parrilla-card";

export function ParrillaBoard() {
    const { statuses, getParrillasByStatus, updateParrillaStatus } = useParrillasStore();
    const [activeParrilla, setActiveParrilla] = useState<ParrillaWithRelations | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveParrilla(active.data.current?.parrilla || null);
    }

    const handleDragOver = (event: DragOverEvent) => {
        // Visual sorting logic is handled by SortableContext automatically for reordering.
        // For moving between columns, we might need more logic if we want "live" transfer in the store, 
        // but for now, we rely on drop to commit.
        // However, Sortable requires onDragOver to visualize insertion into empty columns or different lists effectively
        // if we are using local state. Since we use Store state, we might not see live updates unless we optimistically update.
        // For simple "fluidity", the `onDragEnd` commit is okay, but `DragOverlay` is key.
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveParrilla(null);

        if (!over) return;

        const parrillaId = active.id as string;
        const newStatusId = over.id as string;
        const currentParrilla = active.data.current?.parrilla;

        // If dropped in a different status column
        // Note: over.id is usually the container ID if we drop on the column, 
        // OR the item ID if we drop on an item.

        let targetStatusId = newStatusId;

        // Check if we dropped over an item, find its status
        // WE need to map item IDs to statuses if that happens, but for now let's assume valid column drops or handle collision
        // Actually, if using Sortable, "over" might be another item.
        // We know items are in columns. We can find the column of the over item.

        // Simpler approach for now:
        // logic to detect change status on drop.

        // Since we are not reordering inside the same column persistence-wise yet (no order field update), 
        // we only care about Status changes.

        if (currentParrilla) {
            // Find which column the `over` id belongs to
            // If over.id is a status id
            const isStatus = statuses.some(s => s.id === over.id);

            if (isStatus && currentParrilla.status_id !== over.id) {
                updateParrillaStatus(parrillaId, over.id as string);
                return;
            }

            // If over.id is another item
            // Find the status of that item
            // current implementation of updateParrillaStatus only takes statusId.
            // We'd need to lookup the status of the item we dropped over.

            // Let's iterate types to find where the over item lives
            for (const status of statuses) {
                const items = parrillasByStatus[status.id] || [];
                if (items.some(p => p.id === over.id)) {
                    if (currentParrilla.status_id !== status.id) {
                        updateParrillaStatus(parrillaId, status.id);
                    }
                    break;
                }
            }
        }
    };

    // Get parrillas grouped by status
    const parrillasByStatus = getParrillasByStatus();

    return (
        <>
            <div className="flex gap-4 p-4 h-full overflow-x-auto">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    {statuses.map((status) => (
                        <ParrillaColumn
                            key={status.id}
                            status={status}
                            parrillas={parrillasByStatus[status.id] || []}
                        />
                    ))}
                    <DragOverlay>
                        {activeParrilla ? (
                            <div className="w-[320px] lg:w-[380px] opacity-80 rotate-2 cursor-grabbing">
                                <ParrillaCard parrilla={activeParrilla} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
            <ParrillaDetailModal />
        </>
    );
}
