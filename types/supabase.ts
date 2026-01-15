export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            user_profiles: {
                Row: {
                    id: string
                    full_name: string
                    role: 'Designer' | 'Content Manager' | 'Creative Director' | 'CEO'
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name: string
                    role: 'Designer' | 'Content Manager' | 'Creative Director' | 'CEO'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    role?: 'Designer' | 'Content Manager' | 'Creative Director' | 'CEO'
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            clients: {
                Row: {
                    id: string
                    name: string
                    color: string
                    contact_email: string | null
                    contact_phone: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    color: string
                    contact_email?: string | null
                    contact_phone?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    color?: string
                    contact_email?: string | null
                    contact_phone?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            statuses: {
                Row: {
                    id: string
                    name: string
                    color: string
                    icon: string | null
                    order_index: number
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    color: string
                    icon?: string | null
                    order_index: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    color?: string
                    icon?: string | null
                    order_index?: number
                    created_at?: string
                }
            }
            labels: {
                Row: {
                    id: string
                    name: string
                    color: string
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    color: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    color?: string
                    created_at?: string
                }
            }
            parrillas: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    status_id: string
                    client_id: string
                    due_date: string | null
                    priority: 'low' | 'medium' | 'high' | 'urgent'
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    status_id: string
                    client_id: string
                    due_date?: string | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    status_id?: string
                    client_id?: string
                    due_date?: string | null
                    priority?: 'low' | 'medium' | 'high' | 'urgent'
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            parrilla_assignees: {
                Row: {
                    parrilla_id: string
                    user_id: string
                    assigned_at: string
                }
                Insert: {
                    parrilla_id: string
                    user_id: string
                    assigned_at?: string
                }
                Update: {
                    parrilla_id?: string
                    user_id?: string
                    assigned_at?: string
                }
            }
            parrilla_labels: {
                Row: {
                    parrilla_id: string
                    label_id: string
                }
                Insert: {
                    parrilla_id: string
                    label_id: string
                }
                Update: {
                    parrilla_id?: string
                    label_id?: string
                }
            }
            parrilla_images: {
                Row: {
                    id: string
                    parrilla_id: string
                    url: string
                    caption: string | null
                    order_index: number
                    uploaded_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    parrilla_id: string
                    url: string
                    caption?: string | null
                    order_index: number
                    uploaded_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    parrilla_id?: string
                    url?: string
                    caption?: string | null
                    order_index?: number
                    uploaded_by?: string | null
                    created_at?: string
                }
            }
            parrilla_annotations: {
                Row: {
                    id: string
                    image_id: string
                    data_url: string
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    image_id: string
                    data_url: string
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    image_id?: string
                    data_url?: string
                    created_by?: string | null
                    created_at?: string
                }
            }
            parrilla_comments: {
                Row: {
                    id: string
                    parrilla_id: string
                    image_id: string | null
                    content: string
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    parrilla_id: string
                    image_id?: string | null
                    content: string
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    parrilla_id?: string
                    image_id?: string | null
                    content?: string
                    created_by?: string | null
                    created_at?: string
                }
            },
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    message: string
                    type: 'info' | 'success' | 'warning' | 'error'
                    link: string | null
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    message: string
                    type?: 'info' | 'success' | 'warning' | 'error'
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    message?: string
                    type?: 'info' | 'success' | 'warning' | 'error'
                    link?: string | null
                    is_read?: boolean
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
