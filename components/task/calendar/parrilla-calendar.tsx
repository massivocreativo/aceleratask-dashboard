"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useParrillasStore } from "@/store/parrillas-store";
import { ParrillaWithRelations } from "@/store/parrillas-store";
import { cn } from "@/lib/utils";

export function ParrillaCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { getFilteredParrillas, openParrillaModal } = useParrillasStore();

    const parrillas = getFilteredParrillas();

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Get parrillas for a specific date
    const getParrillasForDate = (day: number): ParrillaWithRelations[] => {
        const targetDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        return parrillas.filter((p) => {
            if (!p.due_date) return false;
            // Assuming due_date comes as ISO string (or YYYY-MM-DD from database date column)
            return p.due_date.startsWith(targetDateStr);
        });
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const today = new Date();
    const isToday = (day: number) => {
        return (
            day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
        );
    };

    const isPast = (day: number) => {
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return cellDate < todayDate;
    };

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Hoy
                    </Button>
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col">
                {/* Day names */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map((day) => (
                        <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2 flex-1">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[100px]" />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayParrillas = getParrillasForDate(day);
                        const hasParrillas = dayParrillas.length > 0;

                        return (
                            <Card
                                key={day}
                                className={cn(
                                    "min-h-[100px] p-2 flex flex-col transition-colors",
                                    isToday(day) && "border-primary border-2",
                                    isPast(day) && "bg-muted/30",
                                    hasParrillas && "cursor-pointer hover:bg-accent"
                                )}
                            >
                                <div className={cn(
                                    "text-sm font-medium mb-1",
                                    isToday(day) && "text-primary font-bold"
                                )}>
                                    {day}
                                </div>

                                {/* Parrillas for this day */}
                                <div className="flex-1 space-y-1 overflow-y-auto">
                                    {dayParrillas.slice(0, 3).map((parrilla) => (
                                        <div
                                            key={parrilla.id}
                                            onClick={() => openParrillaModal(parrilla)}
                                            className={cn(
                                                "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80",
                                                parrilla.priority === "urgent" && "bg-red-500/20 text-red-700 dark:text-red-300",
                                                parrilla.priority === "high" && "bg-orange-500/20 text-orange-700 dark:text-orange-300",
                                                parrilla.priority === "medium" && "bg-blue-500/20 text-blue-700 dark:text-blue-300",
                                                parrilla.priority === "low" && "bg-gray-500/20 text-gray-700 dark:text-gray-300"
                                            )}
                                            title={parrilla.title}
                                        >
                                            {parrilla.title}
                                        </div>
                                    ))}
                                    {dayParrillas.length > 3 && (
                                        <div className="text-xs text-muted-foreground">
                                            +{dayParrillas.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
