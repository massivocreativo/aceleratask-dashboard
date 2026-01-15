-- =====================================================
-- NOTIFICATION TRIGGERS
-- =====================================================

-- 1. Trigger for New Assignment
-- Notify the user who was assigned.
CREATE OR REPLACE FUNCTION public.handle_new_assignment()
RETURNS TRIGGER AS $$
DECLARE
    v_parrilla_title TEXT;
    v_assigner_name TEXT;
BEGIN
    -- Get Parrilla Title
    SELECT title INTO v_parrilla_title FROM public.parrillas WHERE id = NEW.parrilla_id;
    
    -- Get Assigner Name (optional, hard to get auth.uid in trigger safely sometimes, but we can try generic)
    -- For now, just "System" or generic message if we can't easily get the actor.
    -- However, we can just say "Has sido asignado a..."
    
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        NEW.user_id,
        'Nueva Tarea Asignada',
        'Has sido asignado a la parrilla: ' || v_parrilla_title,
        'info',
        '/dashboard?view=board&parrilla=' || NEW.parrilla_id -- Hypothetical link
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_parrilla_assignment
    AFTER INSERT ON public.parrilla_assignees
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_assignment();


-- 2. Trigger for New Comment
-- Notify all assignees of the parrilla (except the commenter).
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    v_parrilla_title TEXT;
    v_commenter_name TEXT;
    v_assignee RECORD;
BEGIN
    SELECT title INTO v_parrilla_title FROM public.parrillas WHERE id = NEW.parrilla_id;
    SELECT full_name INTO v_commenter_name FROM public.user_profiles WHERE id = NEW.created_by;

    -- Loop through all assignees
    FOR v_assignee IN 
        SELECT user_id FROM public.parrilla_assignees WHERE parrilla_id = NEW.parrilla_id
    LOOP
        -- Don't notify the person who wrote the comment
        IF v_assignee.user_id != NEW.created_by THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                v_assignee.user_id,
                'Nuevo Comentario',
                COALESCE(v_commenter_name, 'Alguien') || ' comentó en: ' || v_parrilla_title,
                'info'
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_parrilla_comment
    AFTER INSERT ON public.parrilla_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_comment();


-- 3. Trigger for Status Change
-- Notify assignees when status changes.
CREATE OR REPLACE FUNCTION public.handle_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_parrilla_title TEXT;
    v_old_status TEXT;
    v_new_status TEXT;
    v_assignee RECORD;
BEGIN
    -- Only proceed if status_id changed
    IF OLD.status_id = NEW.status_id THEN
        RETURN NEW;
    END IF;

    SELECT title INTO v_parrilla_title FROM public.parrillas WHERE id = NEW.id;
    SELECT name INTO v_old_status FROM public.statuses WHERE id = OLD.status_id;
    SELECT name INTO v_new_status FROM public.statuses WHERE id = NEW.status_id;

    -- Loop assignees
    FOR v_assignee IN 
        SELECT user_id FROM public.parrilla_assignees WHERE parrilla_id = NEW.id
    LOOP
        -- We might also want to exclude the person who changed it? 
        -- Usually auth.uid() is available in RLS context but triggers run as postgres/superuser often depending on config.
        -- We'll just notify everyone assigned for broad visibility.
        
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            v_assignee.user_id,
            'Cambio de Estado',
            'La parrilla "' || v_parrilla_title || '" pasó de ' || COALESCE(v_old_status, 'Unknown') || ' a ' || COALESCE(v_new_status, 'Unknown'),
            'warning' -- or info
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_parrilla_status_update
    AFTER UPDATE ON public.parrillas
    FOR EACH ROW EXECUTE FUNCTION public.handle_status_change();


-- 4. Trigger for New Parrilla (Created)
-- Note: Parrillas created don't necessarily have assignees yet.
-- If we want to notify "Admins" (CEO/Director) when a Designer creates a task?
-- Or "Designers" when Admin creates one?
-- User said: "Si se crea una nueva tarea".
-- Let's assume notify CEO/Creative Director when ANY task is created (for visibility).

CREATE OR REPLACE FUNCTION public.handle_new_parrilla_creation()
RETURNS TRIGGER AS $$
DECLARE
    v_creator_name TEXT;
    v_admin RECORD;
BEGIN
    SELECT full_name INTO v_creator_name FROM public.user_profiles WHERE id = NEW.created_by;

    -- Notify Managers (CEO, Creative Director)
    FOR v_admin IN 
        SELECT id FROM public.user_profiles 
        WHERE role IN ('CEO', 'Creative Director', 'Content Manager') 
        AND id != NEW.created_by -- Don't notify self
    LOOP
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            v_admin.id,
            'Nueva Parrilla Creada',
            COALESCE(v_creator_name, 'Alguien') || ' creó la parrilla: ' || NEW.title,
            'success'
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_parrilla_created
    AFTER INSERT ON public.parrillas
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_parrilla_creation();
