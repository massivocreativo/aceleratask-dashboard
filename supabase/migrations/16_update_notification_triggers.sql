-- =====================================================
-- UPDATE NOTIFICATION TRIGGERS
-- =====================================================

-- 1. Update New Parrilla Creation Trigger
-- Add 'Designer' to list of notified roles.
CREATE OR REPLACE FUNCTION public.handle_new_parrilla_creation()
RETURNS TRIGGER AS $$
DECLARE
    v_creator_name TEXT;
    v_recipient RECORD;
BEGIN
    SELECT full_name INTO v_creator_name FROM public.user_profiles WHERE id = NEW.created_by;

    -- Notify Managers and Designers
    FOR v_recipient IN 
        SELECT id FROM public.user_profiles 
        WHERE role IN ('CEO', 'Creative Director', 'Content Manager', 'Designer') 
        AND id != NEW.created_by -- Don't notify self
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            v_recipient.id,
            'Nueva Parrilla Creada',
            COALESCE(v_creator_name, 'Alguien') || ' creó la parrilla: ' || NEW.title,
            'success'
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Update Status Change Trigger
-- Notify Assignees AND the Creator of the parrilla.
CREATE OR REPLACE FUNCTION public.handle_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_parrilla_title TEXT;
    v_parrilla_creator UUID;
    v_old_status TEXT;
    v_new_status TEXT;
    v_recipient_id UUID;
    v_notified_users UUID[] := ARRAY[]::UUID[];
BEGIN
    -- Only proceed if status_id changed
    IF OLD.status_id = NEW.status_id THEN
        RETURN NEW;
    END IF;

    SELECT title, created_by INTO v_parrilla_title, v_parrilla_creator FROM public.parrillas WHERE id = NEW.id;
    SELECT name INTO v_old_status FROM public.statuses WHERE id = OLD.status_id;
    SELECT name INTO v_new_status FROM public.statuses WHERE id = NEW.status_id;

    -- Helper to insert notification if not already notified
    -- (To avoid double notification if Creator is also Assigned)
    
    -- 1. Notify Assignees
    FOR v_recipient_id IN 
        SELECT user_id FROM public.parrilla_assignees WHERE parrilla_id = NEW.id
    LOOP
        IF NOT (v_recipient_id = ANY(v_notified_users)) THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                v_recipient_id,
                'Cambio de Estado',
                'La parrilla "' || v_parrilla_title || '" pasó de ' || COALESCE(v_old_status, 'Unknown') || ' a ' || COALESCE(v_new_status, 'Unknown'),
                'info'
            );
            v_notified_users := array_append(v_notified_users, v_recipient_id);
        END IF;
    END LOOP;

    -- 2. Notify Creator (if not already notified and not the one making the change - strictly speaking trigger doesn't know who made change easily, but usually Creator wants to know updates)
    -- We'll assume we notify creator even if they are watching.
    IF v_parrilla_creator IS NOT NULL AND NOT (v_parrilla_creator = ANY(v_notified_users)) THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            v_parrilla_creator,
            'Cambio de Estado',
            'Tu parrilla "' || v_parrilla_title || '" pasó de ' || COALESCE(v_old_status, 'Unknown') || ' a ' || COALESCE(v_new_status, 'Unknown'),
            'info'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Update New Comment Trigger
-- Notify Assignees AND the Creator.
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    v_parrilla_title TEXT;
    v_parrilla_creator UUID;
    v_commenter_name TEXT;
    v_recipient_id UUID;
    v_notified_users UUID[] := ARRAY[]::UUID[];
BEGIN
    SELECT title, created_by INTO v_parrilla_title, v_parrilla_creator FROM public.parrillas WHERE id = NEW.parrilla_id;
    SELECT full_name INTO v_commenter_name FROM public.user_profiles WHERE id = NEW.created_by;

    -- 1. Notify Assignees
    FOR v_recipient_id IN 
        SELECT user_id FROM public.parrilla_assignees WHERE parrilla_id = NEW.parrilla_id
    LOOP
        -- Don't notify the commenter
        IF v_recipient_id != NEW.created_by AND NOT (v_recipient_id = ANY(v_notified_users)) THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                v_recipient_id,
                'Nuevo Comentario',
                COALESCE(v_commenter_name, 'Alguien') || ' comentó en: ' || v_parrilla_title,
                'info'
            );
            v_notified_users := array_append(v_notified_users, v_recipient_id);
        END IF;
    END LOOP;

    -- 2. Notify Creator (if not commenter and not already notified)
    IF v_parrilla_creator IS NOT NULL 
       AND v_parrilla_creator != NEW.created_by 
       AND NOT (v_parrilla_creator = ANY(v_notified_users)) 
    THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            v_parrilla_creator,
            'Nuevo Comentario',
            COALESCE(v_commenter_name, 'Alguien') || ' comentó en tu parrilla: ' || v_parrilla_title,
            'info'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
