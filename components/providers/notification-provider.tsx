"use client";

import { useEffect } from "react";
import { useNotificationsStore } from "@/store/notifications-store";
import { Toaster as SonnerToaster } from "sonner";
import { usePathname } from "next/navigation";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { subscribeToNotifications, requestPermission } = useNotificationsStore();
    const pathname = usePathname();

    useEffect(() => {
        // Request permission on mount (or maybe on a specific user action to be less intrusive, 
        // but user asked for "like whatsapp", so early request is often expected or at least after login)
        requestPermission();

        // Start listening
        subscribeToNotifications();
    }, [subscribeToNotifications, requestPermission]);

    return (
        <>
            {children}
            <SonnerToaster position="top-right" richColors closeButton />
        </>
    );
}
