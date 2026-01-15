import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';
import { toast } from 'sonner'; // Using sonner for toasts as it's cleaner

// Manually defining interface until types are regenerated
export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationsState {
    notifications: Notification[];
    unreadCount: number;
    permission: NotificationPermission;
    loading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    requestPermission: () => Promise<void>;
    playSound: () => void;
    subscribeToNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    loading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true });
        const supabase = createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50); // Fetch recent 50

        if (error) {
            console.error('Error fetching notifications:', error);
            set({ error: error.message, loading: false });
        } else {
            const unread = data?.filter((n: Notification) => !n.is_read).length || 0;
            set({ notifications: data || [], unreadCount: unread, loading: false });
        }
    },

    markAsRead: async (id: string) => {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (!error) {
            set((state) => {
                const updated = state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
                // Fix lint by filtering properly typed objects or ensuring state.notifications is typed
                const unread = updated.filter(n => !n.is_read).length;
                return { notifications: updated, unreadCount: unread };
            });
        }
    },

    markAllAsRead: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                unreadCount: 0
            }));
        }
    },

    requestPermission: async () => {
        if (typeof Notification === 'undefined') return;

        try {
            const permission = await Notification.requestPermission();
            set({ permission });
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    },

    playSound: () => {
        try {
            // Using a generic pleasant notification sound hosted or local
            // For now, we'll try to use a standard accessible one or expected path
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Audio play failed", e));
        } catch (e) {
            console.error("Audio failed", e);
        }
    },

    subscribeToNotifications: () => {
        const supabase = createClient();
        const { playSound, fetchNotifications } = get();

        // Need auth user id to subscribe specifically to own channel if using filters
        // Or filter in the callback

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;

            supabase
                .channel('notifications-realtime')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newNotif = payload.new as Notification;
                        console.log('🔔 RECEIVED NOTIFICATION:', newNotif);

                        // 1. Play Sound
                        console.log('🔔 Attempting to play sound...');
                        playSound();

                        // 2. Browser Notification
                        console.log('🔔 Browser Permission:', Notification.permission);
                        if (Notification.permission === 'granted') {
                            new Notification(newNotif.title, {
                                body: newNotif.message,
                                icon: '/aceleratask-logo.png'
                            });
                        } else {
                            console.warn('⚠️ Browser Notification NOT granted');
                        }

                        // 3. UI Toast
                        toast.info(newNotif.title, {
                            description: newNotif.message,
                        });

                        // 4. Update Store
                        fetchNotifications();
                    }
                )
                .subscribe((status) => {
                    console.log('🔔 Notification Subscription Status:', status);
                    if (status === 'SUBSCRIBED') console.log('✅ Listening for specific user notifications');
                });
        });
    }
}));
