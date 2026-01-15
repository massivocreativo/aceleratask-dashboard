import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

// Types from database
type Parrilla = Database['public']['Tables']['parrillas']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type Status = Database['public']['Tables']['statuses']['Row'];
type Label = Database['public']['Tables']['labels']['Row'];
type ParrillaComment = Database['public']['Tables']['parrilla_comments']['Row'];
type ParrillaImage = Database['public']['Tables']['parrilla_images']['Row'];
interface UserProfile {
    id: string;
    full_name: string;
    role: 'Designer' | 'Content Manager' | 'Creative Director' | 'CEO';
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    preferences: {
        notifications?: {
            all?: boolean;
            email?: boolean;
        };
    } | null;
}

// Extended types with relations
export interface ParrillaWithRelations extends Parrilla {
    client: Client;
    status: Status;
    assignees: UserProfile[];
    labels: Label[];
    images: ParrillaImage[];
    comments: (ParrillaComment & { user: UserProfile })[];
}

interface ParrillasState {
    // Data
    parrillas: ParrillaWithRelations[];
    clients: Client[];
    statuses: Status[];
    labels: Label[];
    users: UserProfile[];
    currentUser: UserProfile | null;

    // UI State
    selectedParrilla: ParrillaWithRelations | null;
    isModalOpen: boolean;
    currentView: 'board' | 'calendar' | 'dashboard' | 'settings' | 'notifications' | 'designs';

    // Filters
    filterClientId: string | null;
    filterDate: string | null;
    filterRole: string | null; // Kept for backward compatibility if needed, or can be deprecated
    filterUserId: string | null;
    searchQuery: string;

    // Loading & Error
    loading: boolean;
    error: string | null;

    // Actions
    fetchParrillas: () => Promise<void>;
    fetchClients: () => Promise<void>;
    fetchStatuses: () => Promise<void>;
    fetchLabels: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    fetchCurrentUser: () => Promise<void>;

    deleteClient: (clientId: string) => Promise<void>;

    addParrilla: (
        parrilla: Database['public']['Tables']['parrillas']['Insert'],
        assigneeIds?: string[],
        labelIds?: string[]
    ) => Promise<void>;
    updateParrilla: (parrillaId: string, updates: Partial<Parrilla>) => Promise<void>;
    deleteParrilla: (parrillaId: string) => Promise<void>;
    updateParrillaStatus: (parrillaId: string, statusId: string) => Promise<void>;

    // Comments
    addComment: (parrillaId: string, content: string, attachmentFile?: File) => Promise<void>;

    // Assignees
    updateAssignees: (parrillaId: string, userIds: string[]) => Promise<void>;

    // Labels
    updateLabels: (parrillaId: string, labelIds: string[]) => Promise<void>;

    // Images
    addParrillaImage: (parrillaId: string, file: File) => Promise<void>;
    deleteParrillaImage: (parrillaId: string, imageId: string, imageUrl: string) => Promise<void>;

    // Modal
    openParrillaModal: (parrilla: ParrillaWithRelations) => void;
    closeParrillaModal: () => void;

    // Create Modal
    isCreateModalOpen: boolean;
    defaultStatusId: string | null;
    openCreateModal: (statusId?: string) => void;
    closeCreateModal: () => void;

    // Filters
    setFilterClientId: (clientId: string | null) => void;
    setFilterDate: (date: string | null) => void;
    setFilterRole: (role: string | null) => void;
    setFilterUserId: (userId: string | null) => void;
    setSearchQuery: (query: string) => void;
    setCurrentView: (view: 'board' | 'calendar' | 'dashboard' | 'settings' | 'notifications' | 'designs') => void;

    // Computed
    getFilteredParrillas: () => ParrillaWithRelations[];
    getParrillasByStatus: () => Record<string, ParrillaWithRelations[]>;

    // Realtime
    subscribeToParrillas: () => void;
}

export const useParrillasStore = create<ParrillasState>((set, get) => ({
    // Initial state
    parrillas: [] as ParrillaWithRelations[],
    clients: [] as Client[],
    statuses: [] as Status[],
    labels: [] as Label[],
    users: [] as UserProfile[],
    currentUser: null,
    filterUserId: null,
    selectedParrilla: null,
    isModalOpen: false,
    isCreateModalOpen: false,
    defaultStatusId: null,
    currentView: 'board',
    filterClientId: null,
    filterDate: null,
    filterRole: null,
    searchQuery: '',
    loading: false,
    error: null,

    // Fetch parrillas with all relations
    fetchParrillas: async () => {
        set({ loading: true, error: null });
        const supabase = createClient();

        try {
            // Fetch parrillas
            const { data: parrillasData, error: parrillasError } = await supabase
                .from('parrillas')
                .select('*')
                .order('created_at', { ascending: false });

            if (parrillasError) throw parrillasError;

            // Fetch all related data in parallel
            const [clientsRes, statusesRes, usersRes, labelsRes] = await Promise.all([
                supabase.from('clients').select('*'),
                supabase.from('statuses').select('*').order('order_index'),
                supabase.from('user_profiles').select('*'),
                supabase.from('labels').select('*'),
            ]);

            if (clientsRes.error) throw clientsRes.error;
            if (statusesRes.error) throw statusesRes.error;
            if (usersRes.error) throw usersRes.error;
            if (labelsRes.error) throw labelsRes.error;

            // Fetch assignees for each parrilla
            const { data: assigneesData } = await supabase
                .from('parrilla_assignees')
                .select('*');

            // Fetch labels for each parrilla
            const { data: parrillaLabelsData } = await supabase
                .from('parrilla_labels')
                .select('*');

            // Fetch images
            const { data: imagesData } = await supabase
                .from('parrilla_images')
                .select('*')
                .order('order_index');

            // Fetch comments with user info
            const { data: commentsData } = await supabase
                .from('parrilla_comments')
                .select('*')
                .order('created_at', { ascending: false });

            // Build parrillas with relations
            const parrillasWithRelations: ParrillaWithRelations[] = (parrillasData as any[] || []).map(parrilla => {
                const client = (clientsRes.data || []).find((c: any) => c.id === parrilla.client_id);
                const status = (statusesRes.data || []).find((s: any) => s.id === parrilla.status_id);

                const assigneeIds = (assigneesData || []).filter((a: any) => a.parrilla_id === parrilla.id).map((a: any) => a.user_id);
                const assignees = (usersRes.data || []).filter((u: any) => assigneeIds.includes(u.id));

                const labelIds = (parrillaLabelsData || []).filter((pl: any) => pl.parrilla_id === parrilla.id).map((pl: any) => pl.label_id);
                const labels = (labelsRes.data || []).filter((l: any) => labelIds.includes(l.id));

                const images = (imagesData || []).filter((img: any) => img.parrilla_id === parrilla.id);

                const comments = ((commentsData || []).filter((c: any) => c.parrilla_id === parrilla.id) as any[]).map(comment => {
                    const user = (usersRes.data || []).find((u: any) => u.id === comment.created_by);
                    return { ...comment, user: user! };
                });

                return {
                    ...parrilla,
                    client: client!,
                    status: status!,
                    assignees: assignees as UserProfile[],
                    labels: labels as Label[],
                    images: images as ParrillaImage[],
                    comments,
                };
            });

            set({
                parrillas: parrillasWithRelations,
                clients: clientsRes.data || [],
                statuses: statusesRes.data || [],
                users: usersRes.data || [],
                labels: labelsRes.data || [],
                loading: false
            });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            console.error('Error fetching parrillas:', error);
        }
    },

    fetchClients: async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('clients').select('*');
        if (!error && data) {
            set({ clients: data });
        }
    },

    fetchStatuses: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('statuses')
            .select('*')
            .order('order_index');
        if (!error && data) {
            set({ statuses: data });
        }
    },

    fetchLabels: async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('labels').select('*');
        if (!error && data) {
            set({ labels: data });
        }
    },

    fetchUsers: async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('user_profiles').select('*');
        if (!error && data) {
            set({ users: data });
        }
    },

    fetchCurrentUser: async () => {
        const supabase = createClient();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                set({ currentUser: data });
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    },

    deleteClient: async (clientId) => {
        const supabase = createClient();
        set({ loading: true });
        try {
            const { error } = await supabase.from('clients').delete().eq('id', clientId);
            if (error) throw error;
            await get().fetchClients();
            if (get().filterClientId === clientId) {
                set({ filterClientId: null });
            }
        } catch (error: any) {
            set({ error: error.message });
            console.error('Error deleting client:', error);
        } finally {
            set({ loading: false });
        }
    },

    addParrilla: async (parrilla, assigneeIds = [], labelIds = []) => {
        const supabase = createClient();
        set({ loading: true });

        try {
            const { data, error } = await supabase
                .from('parrillas')
                // @ts-ignore
                .insert(parrilla)
                .select()
                .single();

            if (error) throw error;
            if (!data) throw new Error('No data returned from insert');

            // Insert assignees if any
            if (assigneeIds && assigneeIds.length > 0) {
                const assigneeInserts = assigneeIds.map(userId => ({
                    // @ts-ignore
                    parrilla_id: data.id,
                    user_id: userId
                }));
                const { error: assigneeError } = await supabase
                    .from('parrilla_assignees')
                    // @ts-ignore
                    .insert(assigneeInserts);
                if (assigneeError) console.error('Error adding assignees:', assigneeError);
            }

            // Insert labels if any
            if (labelIds && labelIds.length > 0) {
                const labelInserts = labelIds.map(labelId => ({
                    // @ts-ignore
                    parrilla_id: data.id,
                    label_id: labelId
                }));
                const { error: labelError } = await supabase
                    .from('parrilla_labels')
                    // @ts-ignore
                    .insert(labelInserts);
                if (labelError) console.error('Error adding labels:', labelError);
            }

            // Refresh parrillas
            await get().fetchParrillas();
            set({ isCreateModalOpen: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            console.error('Error adding parrilla:', error);
        }
    },

    updateParrilla: async (parrillaId, updates) => {
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('parrillas')
                // @ts-ignore
                .update(updates)
                .eq('id', parrillaId);

            if (error) throw error;

            // Refresh parrillas
            await get().fetchParrillas();
        } catch (error: any) {
            console.error('Error updating parrilla:', error);
        }
    },

    deleteParrilla: async (parrillaId) => {
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('parrillas')
                .delete()
                .eq('id', parrillaId);

            if (error) throw error;

            // Refresh parrillas
            await get().fetchParrillas();
        } catch (error: any) {
            console.error('Error deleting parrilla:', error);
        }
    },

    updateParrillaStatus: async (parrillaId, statusId) => {
        const state = get();
        const previousParrillas = state.parrillas;

        // 1. Optimistic Update
        const updatedParrillas = state.parrillas.map(p =>
            p.id === parrillaId ? { ...p, status_id: statusId } : p
        );

        // Update local status immediately without triggering loading
        set({ parrillas: updatedParrillas });

        const supabase = createClient();

        try {
            // 2. Perform DB Update silently
            const { error } = await supabase
                .from('parrillas')
                // @ts-ignore
                .update({ status_id: statusId } as any)
                .eq('id', parrillaId);

            if (error) throw error;

            // Success: No need to refetch if local state is already correct for this field.
            // If we needed calculated fields from DB, we might fetch silently, but for status it's fine.

        } catch (error: any) {
            console.error('Error updating parrilla status:', error);
            // 3. Revert on Error
            set({ parrillas: previousParrillas });
            // Optional: Show toast error here
        }
    },

    addComment: async (parrillaId: string, content: string, attachmentFile?: File) => {
        const supabase = createClient();

        try {
            let attachmentUrl = null;

            // 1. Upload Attachment if provided
            if (attachmentFile) {
                const fileExt = attachmentFile.name.split('.').pop();
                const fileName = `${Date.now()}-comment.${fileExt}`;
                const filePath = `${parrillaId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('parrilla-images')
                    .upload(filePath, attachmentFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('parrilla-images')
                    .getPublicUrl(filePath);

                attachmentUrl = publicUrl;
            }

            // 2. Insert Comment
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('parrilla_comments')
                .insert({
                    parrilla_id: parrillaId,
                    content,
                    attachment_url: attachmentUrl,
                    created_by: user.id
                } as any);

            if (error) throw error;

            // Refresh parrillas to get new comment
            await get().fetchParrillas();

            // Update selectedParrilla if active
            const state = get();
            if (state.selectedParrilla?.id === parrillaId) {
                const updatedParrilla = state.parrillas.find(p => p.id === parrillaId);
                if (updatedParrilla) {
                    set({ selectedParrilla: updatedParrilla });
                }
            }
        } catch (error: any) {
            console.error('Error adding comment:', error);
        }
    },

    updateAssignees: async (parrillaId, userIds) => {
        const supabase = createClient();

        try {
            // Delete existing assignees
            await supabase
                .from('parrilla_assignees')
                .delete()
                .eq('parrilla_id', parrillaId);

            // Insert new assignees
            if (userIds.length > 0) {
                const assignees = userIds.map(userId => ({
                    parrilla_id: parrillaId,
                    user_id: userId,
                }));

                const { error } = await supabase
                    .from('parrilla_assignees')
                    .insert(assignees as any);

                if (error) throw error;
            }

            // Refresh parrillas
            await get().fetchParrillas();
        } catch (error: any) {
            console.error('Error updating assignees:', error);
        }
    },

    updateLabels: async (parrillaId, labelIds) => {
        const supabase = createClient();

        try {
            // Delete existing labels for this parrilla
            const { error: deleteError } = await supabase
                .from('parrilla_labels')
                .delete()
                .eq('parrilla_id', parrillaId);

            if (deleteError) throw deleteError;

            // Insert new labels
            if (labelIds.length > 0) {
                const { error: insertError } = await supabase
                    .from('parrilla_labels')
                    .insert(
                        labelIds.map(labelId => ({
                            parrilla_id: parrillaId,
                            label_id: labelId
                        })) as any
                    );

                if (insertError) throw insertError;
            }

            // Fetch passed parrillas to update UI
            await get().fetchParrillas();

        } catch (error) {
            console.error('Error updating labels:', error);
            set({ error: (error as Error).message });
        }
    },

    addParrillaImage: async (parrillaId, file) => {
        const supabase = createClient();
        const state = get();
        const currentUser = state.currentUser;

        if (!currentUser) {
            console.error("No user logged in to upload image");
            return;
        }

        try {
            set({ loading: true });

            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${parrillaId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('parrilla-images')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('parrilla-images')
                .getPublicUrl(fileName);

            // 3. Insert into Database
            const { data: newImage, error: dbError } = await supabase
                .from('parrilla_images')
                .insert({
                    parrilla_id: parrillaId,
                    url: publicUrl,
                    caption: file.name,
                    order_index: 0, // Default to 0 or calculate max + 1
                    uploaded_by: currentUser.id
                } as any)
                .select()
                .single();

            if (dbError) throw dbError;

            // 4. Update Local State (Functional update to avoid race conditions)
            set((currentState) => {
                const updatedParrillas = currentState.parrillas.map(p => {
                    if (p.id === parrillaId) {
                        return {
                            ...p,
                            images: [...p.images, newImage]
                        };
                    }
                    return p;
                });

                return {
                    parrillas: updatedParrillas,
                    selectedParrilla: currentState.selectedParrilla?.id === parrillaId
                        ? { ...currentState.selectedParrilla, images: [...currentState.selectedParrilla.images, newImage] }
                        : currentState.selectedParrilla,
                    loading: false
                };
            });

        } catch (error) {
            console.error('Error uploading image:', error);
            set({ error: (error as Error).message, loading: false });
        }
    },

    deleteParrillaImage: async (parrillaId, imageId, imageUrl) => {
        const supabase = createClient();
        try {
            // 1. Remove from Storage
            const bucketName = 'parrilla-images';
            if (imageUrl.includes(bucketName)) {
                // Extract path after bucket name
                const path = imageUrl.split(`${bucketName}/`)[1];
                if (path) {
                    const { error: storageError } = await supabase.storage
                        .from(bucketName)
                        .remove([path]);
                    if (storageError) console.error('Error removing from storage:', storageError);
                }
            }

            // 2. Remove from DB
            const { error: dbError } = await supabase
                .from('parrilla_images')
                .delete()
                .eq('id', imageId);

            if (dbError) throw dbError;

            // 3. Update Local State
            set((state) => {
                const updatedParrillas = state.parrillas.map(p => {
                    if (p.id === parrillaId) {
                        return {
                            ...p,
                            images: p.images.filter(img => img.id !== imageId)
                        };
                    }
                    return p;
                });

                return {
                    parrillas: updatedParrillas,
                    selectedParrilla: state.selectedParrilla?.id === parrillaId
                        ? { ...state.selectedParrilla, images: state.selectedParrilla.images.filter(img => img.id !== imageId) }
                        : state.selectedParrilla
                };
            });

        } catch (error: any) {
            console.error('Error deleting image:', error);
            set({ error: error.message });
        }
    },



    openParrillaModal: (parrilla) => {
        set({ selectedParrilla: parrilla, isModalOpen: true });
    },

    closeParrillaModal: () => {
        set({ selectedParrilla: null, isModalOpen: false });
    },

    openCreateModal: (statusId) => {
        set({ isCreateModalOpen: true, defaultStatusId: statusId || null });
    },

    closeCreateModal: () => {
        set({ isCreateModalOpen: false, defaultStatusId: null });
    },

    setFilterClientId: (clientId) => set({ filterClientId: clientId }),
    setFilterDate: (date) => set({ filterDate: date }),
    setFilterRole: (role) => set({ filterRole: role }),
    setFilterUserId: (userId) => set({ filterUserId: userId }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setCurrentView: (view) => set({ currentView: view }),

    getFilteredParrillas: () => {
        const state = get();
        let filtered = state.parrillas;

        if (state.filterClientId) {
            filtered = filtered.filter(p => p.client_id === state.filterClientId);
        }

        if (state.filterDate) {
            filtered = filtered.filter(p => p.due_date === state.filterDate);
        }

        if (state.filterRole) {
            filtered = filtered.filter(p =>
                p.assignees.some(user => user.role === state.filterRole)
            );
        }

        if (state.filterUserId) {
            filtered = filtered.filter(p =>
                p.assignees.some(user => user.id === state.filterUserId)
            );
        }

        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.client.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query))
            );
        }

        return filtered;
    },

    getParrillasByStatus: () => {
        const filtered = get().getFilteredParrillas();
        const statuses = get().statuses;

        const grouped: Record<string, ParrillaWithRelations[]> = {};

        statuses.forEach(status => {
            grouped[status.id] = filtered.filter(p => p.status_id === status.id);
        });

        return grouped;
    },

    subscribeToParrillas: () => {
        const supabase = createClient();

        // Single channel for all content updates
        supabase
            .channel('content-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'parrillas' },
                async (payload) => {
                    const { fetchParrillas } = get();

                    if (payload.eventType === 'INSERT') {
                        // New parrilla created
                        fetchParrillas();
                    } else if (payload.eventType === 'UPDATE') {
                        const newParrilla = payload.new as Parrilla;
                        set((state) => ({
                            parrillas: state.parrillas.map(p =>
                                p.id === newParrilla.id
                                    ? { ...p, ...newParrilla }
                                    : p
                            ),
                            selectedParrilla: state.selectedParrilla?.id === newParrilla.id
                                ? { ...state.selectedParrilla, ...newParrilla }
                                : state.selectedParrilla
                        }));
                    } else if (payload.eventType === 'DELETE') {
                        const deletedId = payload.old.id;
                        set((state) => ({
                            parrillas: state.parrillas.filter(p => p.id !== deletedId),
                            selectedParrilla: state.selectedParrilla?.id === deletedId ? null : state.selectedParrilla
                        }));
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'parrilla_comments' },
                async (payload) => {
                    const newComment = payload.new as ParrillaComment;
                    const state = get();
                    const supabase = createClient();

                    // 1. Fetch commenter profile
                    if (!newComment.created_by) return;

                    // 1. Fetch commenter profile
                    let commenter: UserProfile | undefined = state.users.find(u => u.id === newComment.created_by);

                    if (!commenter) {
                        const { data } = await supabase.from('user_profiles').select('*').eq('id', newComment.created_by).single();
                        if (data) {
                            commenter = data as UserProfile;
                        } else {
                            // Fallback if user not found
                            commenter = {
                                id: newComment.created_by,
                                full_name: 'Usuario',
                                role: 'Designer',
                                avatar_url: null,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                preferences: null
                            } as UserProfile;
                        }
                    }

                    const fullComment = { ...newComment, user: commenter };

                    // 2. Update Store
                    set((state) => {
                        console.log(`Processing Update for Parrilla ID: ${newComment.parrilla_id}`);

                        let found = false;
                        const updatedParrillas = state.parrillas.map(p => {
                            if (p.id === newComment.parrilla_id) {
                                found = true;
                                console.log(`Found matching parrilla in list: ${p.id}`);
                                // Avoid duplicates
                                if (p.comments.some(c => c.id === newComment.id)) {
                                    console.log('Skipping duplicate comment');
                                    return p;
                                }
                                console.log('Adding new comment to parrilla list');
                                return {
                                    ...p,
                                    comments: [fullComment, ...p.comments] // Add to TOP if sorting desc
                                };
                            }
                            return p;
                        });

                        if (!found) console.warn('⚠️ Parent Parrilla NOT found in state list');

                        // Update selected parrilla if match
                        let updatedSelected = state.selectedParrilla;
                        if (state.selectedParrilla?.id === newComment.parrilla_id) {
                            console.log('Updating Selected Parrilla');
                            if (!state.selectedParrilla.comments.some(c => c.id === newComment.id)) {
                                updatedSelected = {
                                    ...state.selectedParrilla,
                                    comments: [fullComment, ...state.selectedParrilla.comments]
                                };
                            } else {
                                console.log('Duplicate comment in Selected Parrilla');
                            }
                        } else {
                            console.log('Selected Parrilla does not match or is null', state.selectedParrilla?.id);
                        }

                        return {
                            parrillas: updatedParrillas,
                            selectedParrilla: updatedSelected
                        };
                    });
                }
            )
            .subscribe((status) => {
                console.log('Realtime Connection Status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Successfully subscribed to content-realtime');
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Realtime Channel Error via subscribe callback');
                }
                if (status === 'TIMED_OUT') {
                    console.error('⚠️ Realtime Connection Timed Out');
                }
            });
    }
}));
