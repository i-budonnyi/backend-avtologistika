--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: add_default_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_default_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- тАЮ┬о┬д┬а╤Г┬м┬о ╨О┬а┬з┬о╤Ю? ╨З╨░┬а╤Ю┬а ╨Д┬о╨░╨Б╨▒╨▓╨│╤Ю┬а╨╖╨│
    INSERT INTO user_permissions (user_id, permission_id)
    VALUES
        (NEW.id, 1), -- ╨Л┬н┬о╤Ю┬л╥Р┬н┬н╨┐ ╨З╨░┬о╨┤?┬л╨╛
        (NEW.id, 2), -- ╨П┬о┬д┬а┬н┬н╨┐ ?┬д╥Р┬й
        (NEW.id, 3), -- ╨П┬о┬д┬а┬н┬н╨┐ ╨З╨░┬о╨О┬л╥Р┬м
        (NEW.id, 4), -- тАЪ╨Б╨▒╤Ю?╨▓┬л╥Р┬н┬н╨┐ ╨│ ╨З╨░┬о╨┤?┬л?
        (NEW.id, 6), -- тАЪ?┬д╨З╨░┬а╤Ю╨Д┬а ╨З┬о╤Ю?┬д┬о┬м┬л╥Р┬н╨╝
        (NEW.id, 7), -- ╨П╨░╨Б┬й┬о┬м ╨З┬о╤Ю?┬д┬о┬м┬л╥Р┬н╨╝
        (NEW.id, 8), -- ╨П╨░╨Б┬й┬о┬м ╨▒╨З┬о╤Ю?╨╣╥Р┬н╨╝
        (NEW.id, 9), -- ╨Й┬о┬м╥Р┬н╨▓╨│╤Ю┬а┬н┬н╨┐
        (NEW.id, 10); -- тА╣┬а┬й╨Д╨Б

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.add_default_permissions() OWNER TO postgres;

--
-- Name: add_to_blog(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_to_blog() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO blog (type, reference_id, user_id, title, description)
    VALUES (
        TG_ARGV[0],  -- тАЩ╨Б╨З ┬з┬а╨З╨Б╨▒╨│: 'idea' ┬а╨О┬о 'problem' (╨З╥Р╨░╥Р┬д┬а╤Г╨▓╨╝╨▒╨┐ ┬а╨░╨И╨│┬м╥Р┬н╨▓┬о┬м ╨▓╨░╨Б╨И╥Р╨░┬а)
        NEW.id,      -- ID ┬н┬о╤Ю┬о╤Е ?┬д╥Р╤Е ┬а╨О┬о ╨З╨░┬о╨О┬л╥Р┬м╨Б
        NEW.user_id, -- ID ╨Д┬о╨░╨Б╨▒╨▓╨│╤Ю┬а╨╖┬а, ╨┐╨Д╨Б┬й ╨З┬о┬д┬а╤Ю ┬з┬а╨З╨Б╨▒
        NEW.title,   -- ╨М┬а┬з╤Ю┬а
        NEW.description -- ╨Л╨З╨Б╨▒
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.add_to_blog() OWNER TO postgres;

--
-- Name: assign_default_ambassador_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_default_ambassador_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO ambassador_permissions (ambassador_id, permission_id, assigned_at)
  VALUES (NEW.id, 1, CURRENT_TIMESTAMP); -- тАб┬а┬м?┬н?╨▓╨╝ 1 ┬н┬а ╤Ю?┬д╨З┬о╤Ю?┬д┬н╨Б┬й ID
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.assign_default_ambassador_permissions() OWNER TO postgres;

--
-- Name: assign_default_secretary_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_default_secretary_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO secretary_permissions (secretary_id, permission_id)
    SELECT NEW.id, id FROM permissions
    WHERE name IN (
        'receive_application_notification',
        'evaluate_application',
        'notify_ambassador_revision',
        'provide_revision_feedback',
        'form_agenda',
        'schedule_meeting',
        'participate_meeting',
        'record_meeting_minutes',
        'record_jury_results'
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.assign_default_secretary_permissions() OWNER TO postgres;

--
-- Name: assign_full_admin_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_full_admin_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO admin_permissions (admin_id, permission_id)
    SELECT NEW.id, id FROM permissions;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.assign_full_admin_permissions() OWNER TO postgres;

--
-- Name: assign_pm_default_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_pm_default_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO pm_permissions_assignment (pm_id, permission_id)
    SELECT NEW.id, id FROM pm_permissions;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.assign_pm_default_permissions() OWNER TO postgres;

--
-- Name: assign_user_role(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_user_role(target_user_id integer, target_role_id integer, admin_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if the user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'User with ID % does not exist.', target_user_id;
    END IF;

    -- Check if the role exists
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = target_role_id) THEN
        RAISE EXCEPTION 'Role with ID % does not exist.', target_role_id;
    END IF;

    -- Insert or update the role assignment
    INSERT INTO user_roles (user_id, role_id, assigned_by, assigned_at)
    VALUES (target_user_id, target_role_id, admin_id, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, role_id) 
    DO UPDATE SET 
        assigned_by = EXCLUDED.assigned_by,
        assigned_at = EXCLUDED.assigned_at;
END;
$$;


ALTER FUNCTION public.assign_user_role(target_user_id integer, target_role_id integer, admin_id integer) OWNER TO postgres;

--
-- Name: check_task_access(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_task_access() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM project_users pu
        JOIN jira_tasks jt ON pu.project_id = jt.project_id
        WHERE pu.user_id = NEW.user_id AND jt.id = NEW.task_id
    ) AND NOT EXISTS (
        SELECT 1
        FROM supervisor_projects sp
        JOIN jira_tasks jt ON sp.project_id = jt.project_id
        WHERE sp.supervisor_id = NEW.user_id AND jt.id = NEW.task_id
    ) THEN
        RAISE EXCEPTION 'User does not have access to this task.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_task_access() OWNER TO postgres;

--
-- Name: check_user_login(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_user_login(p_email character varying, p_password character varying, p_ip character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INT;
BEGIN
    -- ╨П╥Р╨░╥Р╤Ю?╨░╨Д┬а ╨Д┬о╨░╨Б╨▒╨▓╨│╤Ю┬а╨╖┬а ┬з┬а email ? ╨З┬а╨░┬о┬л╥Р┬м
    SELECT id INTO v_user_id
    FROM users
    WHERE email = p_email AND password = p_password;

    IF v_user_id IS NOT NULL THEN
        -- ╤Я╨Д╨╣┬о ┬а╤Ю╨▓┬о╨░╨Б┬з┬а╨╢?╨┐ ╨│╨▒╨З?╨╕┬н┬а, ┬з┬а╨З╨Б╨▒╨│╤Г┬м┬о ╨│ ┬л┬о╨И ╨│╨▒╨З?╨╕┬н╨Б┬й ╤Ю╨╡?┬д
        INSERT INTO login_attempts (user_id, status, ip_address)
        VALUES (v_user_id, 'success', p_ip);
        RETURN TRUE;
    ELSE
        -- ╤Я╨Д╨╣┬о ┬а╤Ю╨▓┬о╨░╨Б┬з┬а╨╢?╨┐ ┬н╥Р╤Ю┬д┬а┬л┬а, ┬з┬а╨З╨Б╨▒╨│╤Г┬м┬о ╨▒╨З╨░┬о╨О╨│
        INSERT INTO login_attempts (user_id, status, ip_address)
        VALUES (NULL, 'failure', p_ip);
        RETURN FALSE;
    END IF;
END;
$$;


ALTER FUNCTION public.check_user_login(p_email character varying, p_password character varying, p_ip character varying) OWNER TO postgres;

--
-- Name: clear_user_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clear_user_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- тАЪ╨Б┬д┬а┬л╥Р┬н┬н╨┐ ╤Ю╨▒?╨╡ ╨З╨░┬а╤Ю ╨Д┬о╨░╨Б╨▒╨▓╨│╤Ю┬а╨╖┬а
    DELETE FROM user_permissions
    WHERE user_id = OLD.user_id;

    RETURN NEW; -- ╨П╨░┬о┬д┬о╤Ю┬ж╨│╤Г┬м┬о ╤Ю╨Б╨Д┬о┬н┬а┬н┬н╨┐ ┬з┬а╨З╨Б╨▓╨│
END;
$$;


ALTER FUNCTION public.clear_user_permissions() OWNER TO postgres;

--
-- Name: copy_new_idea_to_blog(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.copy_new_idea_to_blog() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO blog (reference_id, title, description, user_id, type, created_at)
    VALUES (NEW.id, NEW.title, NEW.description, NEW.user_id, 'idea', NEW.created_at);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.copy_new_idea_to_blog() OWNER TO postgres;

--
-- Name: delete_user_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_user_permissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- тАЪ╨Б┬д┬а┬л╨┐╤Г┬м┬о ╤Ю╨▒? ╨З╨░┬а╤Ю┬а ╨Д┬о╨░╨Б╨▒╨▓╨│╤Ю┬а╨╖┬а
    DELETE FROM user_permissions
    WHERE user_id = OLD.id;

    RETURN OLD;
END;
$$;


ALTER FUNCTION public.delete_user_permissions() OWNER TO postgres;

--
-- Name: finalize_decision_at_midnight(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finalize_decision_at_midnight() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    approved_count INT;
    rejected_count INT;
    needs_revision_count INT;
    majority_decision VARCHAR(50);
BEGIN
    -- ╨П?┬д╨░┬а╨╡┬о╤Ю╨│╤Г┬м┬о ╨Д?┬л╨╝╨Д?╨▒╨▓╨╝ ╨И┬о┬л┬о╨▒?╤Ю ┬з┬а ╨Д┬о┬ж╥Р┬н ╤Ю┬а╨░?┬а┬н╨▓ ╨░?╨╕╥Р┬н┬н╨┐
    SELECT 
        SUM(CASE WHEN decision_type = 'approved' THEN 1 ELSE 0 END),
        SUM(CASE WHEN decision_type = 'rejected' THEN 1 ELSE 0 END),
        SUM(CASE WHEN decision_type = 'needs_revision' THEN 1 ELSE 0 END)
    INTO approved_count, rejected_count, needs_revision_count
    FROM jury_decisions
    WHERE project_id = NEW.project_id;

    -- тАЪ╨Б┬з┬н┬а╨╖┬а╤Г┬м┬о ╨О?┬л╨╝╨╕?╨▒╨▓╨╝ ╨И┬о┬л┬о╨▒?╤Ю
    IF approved_count >= rejected_count AND approved_count >= needs_revision_count THEN
        majority_decision := 'approved';
    ELSIF rejected_count > approved_count AND rejected_count >= needs_revision_count THEN
        majority_decision := 'rejected';
    ELSE
        majority_decision := 'needs_revision';
    END IF;

    -- тАЪ╨▒╨▓┬а┬н┬о╤Ю┬л╨╛╤Г┬м┬о ┬о╨▒╨▓┬а╨▓┬о╨╖┬н╥Р ╨░?╨╕╥Р┬н┬н╨┐, ╨┐╨Д╨╣┬о ╨╣╥Р ┬н╥Р ╨О╨│┬л┬о ╨З╨░╨Б┬й┬н╨┐╨▓┬о
    UPDATE jury_decisions
    SET final_decision = majority_decision
    WHERE project_id = NEW.project_id AND final_decision IS NULL;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.finalize_decision_at_midnight() OWNER TO postgres;

--
-- Name: finalize_decision_immediately(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.finalize_decision_immediately() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_jury INT;
    voted_jury INT;
    approved_count INT;
    rejected_count INT;
    needs_revision_count INT;
    majority_decision VARCHAR(50);
BEGIN
    -- ╨Л╨▓╨░╨Б┬м╨│╤Г┬м┬о ┬з┬а╨И┬а┬л╨╝┬н╨│ ╨Д?┬л╨╝╨Д?╨▒╨▓╨╝ ┬ж╨│╨░?
    SELECT COUNT(*) INTO total_jury FROM jury_members;

    -- ╨Л╨▓╨░╨Б┬м╨│╤Г┬м┬о ╨Д?┬л╨╝╨Д?╨▒╨▓╨╝ ╨З╨░┬о╨И┬о┬л┬о╨▒╨│╤Ю┬а╤Ю╨╕╨Б╨╡ ┬ж╨│╨░? ┬д┬л╨┐ ╨╢╨╝┬о╨И┬о ╨З╨░┬о╥Р╨Д╨▓╨│
    SELECT COUNT(*) INTO voted_jury 
    FROM jury_decisions 
    WHERE project_id = NEW.project_id 
    AND decision_date::DATE = CURRENT_DATE;

    -- ╨П?┬д╨░┬а╨╡┬о╤Ю╨│╤Г┬м┬о ╨Д?┬л╨╝╨Д?╨▒╨▓╨╝ ╨И┬о┬л┬о╨▒?╤Ю ┬з┬а ╨Д┬о┬ж╥Р┬н ╤Ю┬а╨░?┬а┬н╨▓ ╨░?╨╕╥Р┬н┬н╨┐
    SELECT 
        SUM(CASE WHEN decision_type = 'approved' THEN 1 ELSE 0 END),
        SUM(CASE WHEN decision_type = 'rejected' THEN 1 ELSE 0 END),
        SUM(CASE WHEN decision_type = 'needs_revision' THEN 1 ELSE 0 END)
    INTO approved_count, rejected_count, needs_revision_count
    FROM jury_decisions
    WHERE project_id = NEW.project_id;

    -- тАЪ╨Б┬з┬н┬а╨╖┬а╤Г┬м┬о ╨О?┬л╨╝╨╕?╨▒╨▓╨╝ ╨И┬о┬л┬о╨▒?╤Ю
    IF approved_count >= rejected_count AND approved_count >= needs_revision_count THEN
        majority_decision := 'approved';
    ELSIF rejected_count > approved_count AND rejected_count >= needs_revision_count THEN
        majority_decision := 'rejected';
    ELSE
        majority_decision := 'needs_revision';
    END IF;

    -- ╤Я╨Д╨╣┬о ╤Ю╨▒? ┬ж╨│╨░? ╨З╨░┬о╨И┬о┬л┬о╨▒╨│╤Ю┬а┬л╨Б - ╤Ю╨▒╨▓┬а┬н┬о╤Ю┬л╨╛╤Г┬м┬о ┬о╨▒╨▓┬а╨▓┬о╨╖┬н╥Р ╨░?╨╕╥Р┬н┬н╨┐
    IF voted_jury = total_jury THEN
        UPDATE jury_decisions
        SET final_decision = majority_decision
        WHERE project_id = NEW.project_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.finalize_decision_immediately() OWNER TO postgres;

--
-- Name: log_audit_action(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_audit_action() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO audit_log (table_name, record_id, action_type, changed_at)
    VALUES ('jira_tasks', NEW.id, TG_OP, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_audit_action() OWNER TO postgres;

--
-- Name: log_financial_actions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_financial_actions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, description)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        NEW.treasurer_id,
        TG_OP || ' operation on financial_transactions: ' || NEW.description
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_financial_actions() OWNER TO postgres;

--
-- Name: log_jury_actions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_jury_actions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO jury_logs (jury_member_id, action)
        VALUES (NEW.id, 'INSERT');
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO jury_logs (jury_member_id, action)
        VALUES (OLD.id, 'DELETE');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_jury_actions() OWNER TO postgres;

--
-- Name: log_media_upload(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_media_upload() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO audit_logs (action_type, table_name, record_id, user_id, description)
    VALUES (
        'INSERT',
        'media_files',
        NEW.id,
        NEW.uploader_id,
        'Media file uploaded: ' || NEW.file_name
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_media_upload() OWNER TO postgres;

--
-- Name: log_pm_actions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_pm_actions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO pm_logs (pm_id, action)
    VALUES (NEW.id, TG_OP || ' action on Project Manager');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_pm_actions() OWNER TO postgres;

--
-- Name: log_task_status_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_task_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO task_status_log (task_id, old_status, new_status, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, NOW());
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_task_status_change() OWNER TO postgres;

--
-- Name: log_task_updates(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_task_updates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO task_logs (task_id, action, log_time)
    VALUES (NEW.id, TG_OP || ' task status updated', CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_task_updates() OWNER TO postgres;

--
-- Name: mark_notification_as_read(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mark_notification_as_read(notification_id integer, ambassador_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE notifications
    SET status = 'read'
    WHERE id = notification_id AND user_id = ambassador_id;
END;
$$;


ALTER FUNCTION public.mark_notification_as_read(notification_id integer, ambassador_id integer) OWNER TO postgres;

--
-- Name: migrate_existing_ideas_to_blogs(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.migrate_existing_ideas_to_blogs() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO blog (reference_id, title, description, user_id, type, created_at)
  SELECT id, title, description, user_id, 'idea', created_at
  FROM ideas
  WHERE id NOT IN (SELECT reference_id FROM blog); -- тАЬ┬н╨Б╨Д┬а╤Г┬м┬о ┬д╨│╨О┬л╨╛╤Ю┬а┬н┬н╨┐
END;
$$;


ALTER FUNCTION public.migrate_existing_ideas_to_blogs() OWNER TO postgres;

--
-- Name: notify_about_draft_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_about_draft_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- тАШ╨З┬о╤Ю?╨╣┬а╤Г┬м┬о ╨Д┬о╨░╨Б╨▒╨▓╨│╤Ю┬а╨╖┬а
    INSERT INTO notifications (user_id, message)
    VALUES (
        NEW.user_id,
        'тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #' || NEW.id || ' ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.'
    );

    -- тАШ╨З┬о╤Ю?╨╣┬а╤Г┬м┬о ┬а┬м╨О┬а╨▒┬а┬д┬о╨░┬а
    INSERT INTO notifications (user_id, message)
    VALUES (
        NEW.ambassador_id,
        'тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #' || NEW.id || ' ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.'
    );

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_about_draft_update() OWNER TO postgres;

--
-- Name: notify_all_users(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_all_users() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO notifications (user_id, message)
    SELECT id, '╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "' || NEW.title || '" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.'
    FROM users;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_all_users() OWNER TO postgres;

--
-- Name: notify_ambassador_on_status_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_ambassador_on_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    ambassador_exists INT;
BEGIN
    -- ╨П╥Р╨░╥Р╤Ю?╨░╨┐╤Г┬м┬о, ╨╖╨Б ?╨▒┬н╨│╤Г ┬а┬м╨О┬а╨▒┬а┬д┬о╨░ ?┬з ╨▓┬а╨Д╨Б┬м id
    SELECT COUNT(*) INTO ambassador_exists
    FROM ambassadors
    WHERE id = NEW.application_id;

    -- ╤Я╨Д╨╣┬о ┬а┬м╨О┬а╨▒┬а┬д┬о╨░ ?╨▒┬н╨│╤Г, ╨▒╨▓╤Ю┬о╨░╨╛╤Г┬м┬о ╨▒╨З┬о╤Ю?╨╣╥Р┬н┬н╨┐
    IF ambassador_exists > 0 THEN
        INSERT INTO notifications (user_id, message)
        VALUES (
            NEW.application_id, -- ID ┬а┬м╨О┬а╨▒┬а┬д┬о╨░┬а
            'тАШ╨▓┬а╨▓╨│╨▒ ╤Ю┬а╨╕┬о╤Е ┬а╨З┬л?╨Д┬а╨╢?╤Е #' || NEW.application_id || ' ┬з┬м?┬н╥Р┬н┬о ┬н┬а: ' || NEW.status
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_ambassador_on_status_change() OWNER TO postgres;

--
-- Name: notify_revision_with_comment(integer, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_revision_with_comment(application_id integer, ambassador_id integer, comment_text text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO notifications (user_id, message, comment)
    VALUES (
        ambassador_id,
        '╨М╥Р┬о╨О╨╡?┬д┬н┬о ┬д┬о┬о╨З╨░┬а╨╢╨╛╤Ю┬а╨▓╨Б ╤Ю┬а╨╕╨│ ┬а╨З┬л?╨Д┬а╨╢?╨╛ #' || application_id,
        comment_text
    );
END;
$$;


ALTER FUNCTION public.notify_revision_with_comment(application_id integer, ambassador_id integer, comment_text text) OWNER TO postgres;

--
-- Name: notify_subscribers(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_subscribers() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO notifications (user_id, message)
    SELECT user_id, '╨М┬о╤Ю┬а ' || TG_ARGV[0] || ' "' || NEW.title || '" ┬д┬о╨▒╨▓╨│╨З┬н┬а ╨│ ╨О┬л┬о┬з?.'
    FROM subscriptions
    WHERE blog_id = NEW.id;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_subscribers() OWNER TO postgres;

--
-- Name: notify_treasurer_on_decision(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_treasurer_on_decision() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.decision = 'Approved' AND NEW.bonus_amount > 0 THEN
        INSERT INTO notifications (user_id, message, status)
        VALUES (
            (SELECT id FROM treasurers LIMIT 1), -- Assume one Treasurer for now
            'A new decision requires payment: User ' || NEW.user_id || 
            ' has been awarded ' || NEW.bonus_amount || ' for project ' || NEW.project_id,
            'unread'
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_treasurer_on_decision() OWNER TO postgres;

--
-- Name: notify_user_on_payment(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_user_on_payment() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.payment_status = 'completed' THEN
        INSERT INTO notifications (user_id, message, status)
        VALUES (
            NEW.user_id,
            'Your bonus payment of ' || NEW.bonus_amount || ' has been processed.',
            'unread'
        );
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_user_on_payment() OWNER TO postgres;

--
-- Name: update_agenda_item_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_agenda_item_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.added_at = CURRENT_TIMESTAMP; -- ╨Л┬н┬о╤Ю┬л╨╛╤Г┬м┬о ╨╖┬а╨▒
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_agenda_item_timestamp() OWNER TO postgres;

--
-- Name: update_application_status_and_notify(integer, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_application_status_and_notify(application_id integer, ambassador_id integer, comment_text text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- ╨Л┬н┬о╤Ю┬л╨╛╤Г┬м┬о ╨▒╨▓┬а╨▓╨│╨▒ ┬а╨З┬л?╨Д┬а╨╢?╤Е
    UPDATE agenda_items
    SET status = 'revision_requested'
    WHERE agenda_items.application_id = update_application_status_and_notify.application_id; -- тАЬ┬н╨Б╨Д┬н╥Р┬н┬н╨┐ ┬н╥Р┬о┬д┬н┬о┬з┬н┬а╨╖┬н┬о╨▒╨▓?

    -- тАШ╨▓╤Ю┬о╨░╨╛╤Г┬м┬о ╨▒╨З┬о╤Ю?╨╣╥Р┬н┬н╨┐ ┬д┬л╨┐ ┬а┬м╨О┬а╨▒┬а┬д┬о╨░┬а
    INSERT INTO notifications (user_id, message, comment)
    VALUES (
        ambassador_id,
        '╨М╥Р┬о╨О╨╡?┬д┬н┬о ┬д┬о┬о╨З╨░┬а╨╢╨╛╤Ю┬а╨▓╨Б ╤Ю┬а╨╕╨│ ┬а╨З┬л?╨Д┬а╨╢?╨╛ #' || update_application_status_and_notify.application_id,
        comment_text
    );
END;
$$;


ALTER FUNCTION public.update_application_status_and_notify(application_id integer, ambassador_id integer, comment_text text) OWNER TO postgres;

--
-- Name: update_application_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_application_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP; -- ╨Л┬н┬о╤Ю┬л╨╛╤Г┬м┬о ╨╖┬а╨▒ ┬о╨▒╨▓┬а┬н┬н╨╝┬о╨И┬о ╨░╥Р┬д┬а╨И╨│╤Ю┬а┬н┬н╨┐
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_application_timestamp() OWNER TO postgres;

--
-- Name: update_blog_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_blog_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_blog_updated_at() OWNER TO postgres;

--
-- Name: update_budget_on_transaction(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_budget_on_transaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.transaction_type = 'expense' THEN
        UPDATE project_budgets
        SET spent_amount = spent_amount + NEW.amount
        WHERE project_id = NEW.description::INTEGER; -- Assuming description contains project_id for simplicity
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_budget_on_transaction() OWNER TO postgres;

--
-- Name: update_invitation_status(integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_invitation_status(p_invitation_id integer, p_status character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE project_invitations
    SET status = p_status
    WHERE id = p_invitation_id;

    -- тАЮ┬о┬д┬а╨▓╨Б ╨Д┬о╨░╨Б╨▒╨▓╨│╤Ю┬а╨╖┬а ┬д┬о ╨З╨░┬о╤Г╨Д╨▓╨│, ╨┐╨Д╨╣┬о ╤Ю?┬н ╨З?┬д╨▓╤Ю╥Р╨░┬д╨Б╤Ю
    IF p_status = 'accepted' THEN
        INSERT INTO project_users (project_id, user_id)
        SELECT project_id, invited_user_id
        FROM project_invitations
        WHERE id = p_invitation_id;
    END IF;
END;
$$;


ALTER FUNCTION public.update_invitation_status(p_invitation_id integer, p_status character varying) OWNER TO postgres;

--
-- Name: update_jury_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_jury_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_jury_updated_at() OWNER TO postgres;

--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: update_user_trigger_function(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_user_trigger_function() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_user_trigger_function() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_permissions (
    admin_id integer NOT NULL,
    permission_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_permissions OWNER TO postgres;

--
-- Name: administrators; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administrators (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.administrators OWNER TO postgres;

--
-- Name: administrators_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administrators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administrators_id_seq OWNER TO postgres;

--
-- Name: administrators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administrators_id_seq OWNED BY public.administrators.id;


--
-- Name: agenda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agenda (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    meeting_date timestamp without time zone NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    decision_type character varying(50),
    application_id integer
);


ALTER TABLE public.agenda OWNER TO postgres;

--
-- Name: agenda_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agenda_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agenda_id_seq OWNER TO postgres;

--
-- Name: agenda_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agenda_id_seq OWNED BY public.agenda.id;


--
-- Name: agenda_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agenda_items (
    id integer NOT NULL,
    agenda_id integer,
    application_id integer NOT NULL,
    application_type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.agenda_items OWNER TO postgres;

--
-- Name: agenda_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.agenda_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.agenda_items_id_seq OWNER TO postgres;

--
-- Name: agenda_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.agenda_items_id_seq OWNED BY public.agenda_items.id;


--
-- Name: ambassador_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ambassador_permissions (
    ambassador_id integer NOT NULL,
    permission_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    permission character varying(255) DEFAULT 'default_permission'::character varying NOT NULL
);


ALTER TABLE public.ambassador_permissions OWNER TO postgres;

--
-- Name: ambassadors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ambassadors (
    id integer NOT NULL,
    phone character varying(15) NOT NULL,
    "position" character varying(100),
    email character varying(150) NOT NULL,
    first_name character varying(100),
    last_name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer NOT NULL
);


ALTER TABLE public.ambassadors OWNER TO postgres;

--
-- Name: ambassadors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ambassadors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ambassadors_id_seq OWNER TO postgres;

--
-- Name: ambassadors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ambassadors_id_seq OWNED BY public.ambassadors.id;


--
-- Name: application_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_logs (
    id integer NOT NULL,
    application_id integer,
    editor_id integer,
    old_comment character varying(50),
    new_comment character varying(50),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.application_logs OWNER TO postgres;

--
-- Name: application_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_logs_id_seq OWNER TO postgres;

--
-- Name: application_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_logs_id_seq OWNED BY public.application_logs.id;


--
-- Name: application_returns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_returns (
    id integer NOT NULL,
    application_id integer NOT NULL,
    secretary_id integer NOT NULL,
    ambassador_id integer,
    comment text NOT NULL,
    returned_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.application_returns OWNER TO postgres;

--
-- Name: application_returns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_returns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_returns_id_seq OWNER TO postgres;

--
-- Name: application_returns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_returns_id_seq OWNED BY public.application_returns.id;


--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    user_id integer,
    ambassador_id integer,
    type character varying(10) DEFAULT 'general'::character varying,
    reference_id integer,
    title character varying(255) NOT NULL,
    content text DEFAULT ''::text,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    jury_secretary_id integer,
    jury_comment character varying(50),
    review_comment text,
    idea_id integer,
    locked_by integer,
    description text,
    decision_type character varying(50),
    CONSTRAINT applications_type_check CHECK (((type)::text = ANY ((ARRAY['idea'::character varying, 'problem'::character varying])::text[])))
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO postgres;

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    id integer NOT NULL,
    message_id integer,
    file_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attachments_file_size_check CHECK ((file_size <= 15728640))
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attachments_id_seq OWNER TO postgres;

--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    table_name character varying(255),
    record_id integer,
    action_type character varying(50),
    changed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_id_seq OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    action_type character varying(50) NOT NULL,
    table_name character varying(50) NOT NULL,
    record_id integer,
    user_id integer,
    description text,
    performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: audit_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_reports (
    id integer NOT NULL,
    auditor_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_reports OWNER TO postgres;

--
-- Name: audit_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_reports_id_seq OWNER TO postgres;

--
-- Name: audit_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_reports_id_seq OWNED BY public.audit_reports.id;


--
-- Name: auditors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditors (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditors OWNER TO postgres;

--
-- Name: auditors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditors_id_seq OWNER TO postgres;

--
-- Name: auditors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditors_id_seq OWNED BY public.auditors.id;


--
-- Name: blog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog (
    id integer NOT NULL,
    type character varying(10) NOT NULL,
    reference_id integer NOT NULL,
    user_id integer,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    createdat timestamp without time zone DEFAULT now(),
    updatedat timestamp without time zone DEFAULT now(),
    CONSTRAINT blog_type_check CHECK (((type)::text = ANY (ARRAY['idea'::text, 'problem'::text, 'article'::text, 'news'::text, 'post'::text])))
);


ALTER TABLE public.blog OWNER TO postgres;

--
-- Name: blog_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_id_seq OWNER TO postgres;

--
-- Name: blog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_id_seq OWNED BY public.blog.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    author_id integer,
    status character varying(20) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO postgres;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    blog_id integer,
    user_id integer,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    idea_id integer,
    updated_at timestamp without time zone DEFAULT now(),
    content text,
    problem_id integer
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: feedback_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback_messages (
    id integer NOT NULL,
    problem_id integer,
    idea_id integer,
    user_id integer,
    ambassador_id integer,
    sender text,
    text text,
    created_at timestamp without time zone DEFAULT now(),
    sender_id integer,
    sender_role character varying(20),
    recipient_id integer,
    CONSTRAINT feedback_messages_check CHECK ((((problem_id IS NOT NULL) AND (idea_id IS NULL)) OR ((problem_id IS NULL) AND (idea_id IS NOT NULL)))),
    CONSTRAINT feedback_messages_sender_check CHECK ((sender = ANY (ARRAY['user'::text, 'ambassador'::text])))
);


ALTER TABLE public.feedback_messages OWNER TO postgres;

--
-- Name: feedback_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feedback_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_messages_id_seq OWNER TO postgres;

--
-- Name: feedback_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feedback_messages_id_seq OWNED BY public.feedback_messages.id;


--
-- Name: final_jury_decisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.final_jury_decisions (
    id integer NOT NULL,
    project_id integer,
    user_id integer NOT NULL,
    jury_member_id integer NOT NULL,
    decision text NOT NULL,
    decision_text text,
    decision_date timestamp without time zone NOT NULL,
    agenda_id integer,
    final_decision character varying(50) NOT NULL,
    submission_date timestamp without time zone
);


ALTER TABLE public.final_jury_decisions OWNER TO postgres;

--
-- Name: final_jury_decisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.final_jury_decisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.final_jury_decisions_id_seq OWNER TO postgres;

--
-- Name: final_jury_decisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.final_jury_decisions_id_seq OWNED BY public.final_jury_decisions.id;


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_transactions (
    id integer NOT NULL,
    treasurer_id integer,
    transaction_type character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.financial_transactions OWNER TO postgres;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financial_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_transactions_id_seq OWNER TO postgres;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financial_transactions_id_seq OWNED BY public.financial_transactions.id;


--
-- Name: ideas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ideas (
    id integer NOT NULL,
    user_id integer NOT NULL,
    ambassador_id integer,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    priority integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    author_first_name character varying(255),
    author_last_name character varying(255),
    type character varying(10),
    secretary_id integer,
    decision_type character varying(50),
    CONSTRAINT valid_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.ideas OWNER TO postgres;

--
-- Name: ideas_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ideas_backup (
    id integer,
    user_id integer,
    ambassador_id integer,
    title character varying(255),
    description text,
    status character varying(50),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    priority integer,
    "createdAt" timestamp without time zone,
    "updatedAt" timestamp without time zone
);


ALTER TABLE public.ideas_backup OWNER TO postgres;

--
-- Name: ideas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ideas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ideas_id_seq OWNER TO postgres;

--
-- Name: ideas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ideas_id_seq OWNED BY public.ideas.id;


--
-- Name: jira_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jira_tasks (
    id integer NOT NULL,
    project_id integer,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'To Do'::character varying,
    assigned_to integer,
    created_by_pm_id integer,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jira_tasks OWNER TO postgres;

--
-- Name: jira_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jira_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jira_tasks_id_seq OWNER TO postgres;

--
-- Name: jira_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jira_tasks_id_seq OWNED BY public.jira_tasks.id;


--
-- Name: jury_decisions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jury_decisions (
    id integer NOT NULL,
    project_id integer,
    user_id integer,
    jury_member_id integer,
    decision character varying(255) NOT NULL,
    bonus_amount numeric(15,2) DEFAULT 0.00,
    decision_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    agenda_id integer,
    decision_text text,
    decision_type character varying(50),
    submission_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    review_date timestamp without time zone,
    pm_id integer,
    approved boolean DEFAULT false,
    final_decision character varying(50)
);


ALTER TABLE public.jury_decisions OWNER TO postgres;

--
-- Name: jury_decisions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jury_decisions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jury_decisions_id_seq OWNER TO postgres;

--
-- Name: jury_decisions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jury_decisions_id_seq OWNED BY public.jury_decisions.id;


--
-- Name: jury_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jury_logs (
    id integer NOT NULL,
    jury_member_id integer,
    action character varying(50) NOT NULL,
    log_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jury_logs OWNER TO postgres;

--
-- Name: jury_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jury_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jury_logs_id_seq OWNER TO postgres;

--
-- Name: jury_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jury_logs_id_seq OWNED BY public.jury_logs.id;


--
-- Name: jury_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jury_members (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    photo character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


ALTER TABLE public.jury_members OWNER TO postgres;

--
-- Name: jury_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jury_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jury_members_id_seq OWNER TO postgres;

--
-- Name: jury_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jury_members_id_seq OWNED BY public.jury_members.id;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    id integer NOT NULL,
    blog_id integer,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    idea_id integer
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- Name: likes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.likes_id_seq OWNER TO postgres;

--
-- Name: likes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.likes_id_seq OWNED BY public.likes.id;


--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_attempts (
    id integer NOT NULL,
    user_id integer,
    login_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) NOT NULL,
    ip_address character varying(45)
);


ALTER TABLE public.login_attempts OWNER TO postgres;

--
-- Name: login_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_attempts_id_seq OWNER TO postgres;

--
-- Name: login_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_attempts_id_seq OWNED BY public.login_attempts.id;


--
-- Name: media_files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_files (
    id integer NOT NULL,
    uploader_id integer,
    file_name character varying(255) NOT NULL,
    file_path text NOT NULL,
    file_size bigint NOT NULL,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT media_files_file_size_check CHECK ((file_size <= 15728640))
);


ALTER TABLE public.media_files OWNER TO postgres;

--
-- Name: media_files_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_files_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_files_id_seq OWNER TO postgres;

--
-- Name: media_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_files_id_seq OWNED BY public.media_files.id;


--
-- Name: media_managers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media_managers (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.media_managers OWNER TO postgres;

--
-- Name: media_managers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_managers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_managers_id_seq OWNER TO postgres;

--
-- Name: media_managers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_managers_id_seq OWNED BY public.media_managers.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    recipient_id integer,
    subject character varying(255) DEFAULT NULL::character varying,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    status character varying(20) DEFAULT 'unread'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    comment text
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: pm_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_logs (
    id integer NOT NULL,
    pm_id integer,
    action character varying(255) NOT NULL,
    log_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pm_logs OWNER TO postgres;

--
-- Name: pm_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_logs_id_seq OWNER TO postgres;

--
-- Name: pm_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_logs_id_seq OWNED BY public.pm_logs.id;


--
-- Name: pm_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_permissions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text
);


ALTER TABLE public.pm_permissions OWNER TO postgres;

--
-- Name: pm_permissions_assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_permissions_assignment (
    pm_id integer NOT NULL,
    permission_id integer NOT NULL,
    granted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pm_permissions_assignment OWNER TO postgres;

--
-- Name: pm_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_permissions_id_seq OWNER TO postgres;

--
-- Name: pm_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_permissions_id_seq OWNED BY public.pm_permissions.id;


--
-- Name: problems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.problems (
    id integer NOT NULL,
    user_id integer,
    ambassador_id integer,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    status character varying(50) DEFAULT 'new'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.problems OWNER TO postgres;

--
-- Name: problems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.problems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.problems_id_seq OWNER TO postgres;

--
-- Name: problems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.problems_id_seq OWNED BY public.problems.id;


--
-- Name: project_budgets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_budgets (
    id integer NOT NULL,
    project_id integer,
    treasurer_id integer,
    allocated_amount numeric(15,2) NOT NULL,
    spent_amount numeric(15,2) DEFAULT 0.00,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_budgets OWNER TO postgres;

--
-- Name: project_budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_budgets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_budgets_id_seq OWNER TO postgres;

--
-- Name: project_budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_budgets_id_seq OWNED BY public.project_budgets.id;


--
-- Name: project_invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_invitations (
    id integer NOT NULL,
    project_id integer,
    invited_user_id integer,
    invited_by_pm_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_invitations OWNER TO postgres;

--
-- Name: project_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_invitations_id_seq OWNER TO postgres;

--
-- Name: project_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_invitations_id_seq OWNED BY public.project_invitations.id;


--
-- Name: project_managers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_managers (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    photo character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_managers OWNER TO postgres;

--
-- Name: project_managers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_managers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_managers_id_seq OWNER TO postgres;

--
-- Name: project_managers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_managers_id_seq OWNED BY public.project_managers.id;


--
-- Name: project_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_messages (
    id integer NOT NULL,
    project_id integer,
    sender_pm_id integer,
    recipient_user_id integer,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_messages OWNER TO postgres;

--
-- Name: project_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.project_messages_id_seq OWNER TO postgres;

--
-- Name: project_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_messages_id_seq OWNED BY public.project_messages.id;


--
-- Name: project_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_users (
    project_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.project_users OWNER TO postgres;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    jury_decision_id integer,
    pm_id integer,
    status character varying(50) DEFAULT 'pending'::character varying
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: secretaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secretaries (
    id integer NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    photo text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    role character varying(255) DEFAULT 'jury_secretary'::character varying
);


ALTER TABLE public.secretaries OWNER TO postgres;

--
-- Name: secretaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.secretaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secretaries_id_seq OWNER TO postgres;

--
-- Name: secretaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secretaries_id_seq OWNED BY public.secretaries.id;


--
-- Name: secretary_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secretary_permissions (
    secretary_id integer NOT NULL,
    permission_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.secretary_permissions OWNER TO postgres;

--
-- Name: selected_ideas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.selected_ideas (
    id integer NOT NULL,
    user_id integer NOT NULL,
    idea_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    selected_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.selected_ideas OWNER TO postgres;

--
-- Name: selected_ideas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.selected_ideas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.selected_ideas_id_seq OWNER TO postgres;

--
-- Name: selected_ideas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.selected_ideas_id_seq OWNED BY public.selected_ideas.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id integer NOT NULL,
    blog_id integer,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    idea_id integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    problem_id integer
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: supervisor_projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supervisor_projects (
    supervisor_id integer NOT NULL,
    project_id integer NOT NULL,
    assigned_by_pm_id integer,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.supervisor_projects OWNER TO postgres;

--
-- Name: supervisors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supervisors (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    photo character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.supervisors OWNER TO postgres;

--
-- Name: supervisors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.supervisors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.supervisors_id_seq OWNER TO postgres;

--
-- Name: supervisors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.supervisors_id_seq OWNED BY public.supervisors.id;


--
-- Name: task_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_comments (
    id integer NOT NULL,
    task_id integer,
    user_id integer,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.task_comments OWNER TO postgres;

--
-- Name: task_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_comments_id_seq OWNER TO postgres;

--
-- Name: task_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_comments_id_seq OWNED BY public.task_comments.id;


--
-- Name: task_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_logs (
    id integer NOT NULL,
    task_id integer,
    action character varying(255) NOT NULL,
    log_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.task_logs OWNER TO postgres;

--
-- Name: task_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_logs_id_seq OWNER TO postgres;

--
-- Name: task_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_logs_id_seq OWNED BY public.task_logs.id;


--
-- Name: task_status_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_status_log (
    id integer NOT NULL,
    task_id integer NOT NULL,
    old_status character varying(50),
    new_status character varying(50),
    changed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.task_status_log OWNER TO postgres;

--
-- Name: task_status_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_status_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_status_log_id_seq OWNER TO postgres;

--
-- Name: task_status_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_status_log_id_seq OWNED BY public.task_status_log.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    project_id integer,
    assigned_to integer,
    created_by_pm_id integer,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'To Do'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    phone character varying(15),
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    profile_picture text,
    role character varying(50) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: treasurer_payment_dashboard; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.treasurer_payment_dashboard AS
 SELECT first_name,
    last_name,
    phone,
    email
   FROM public.users;


ALTER VIEW public.treasurer_payment_dashboard OWNER TO postgres;

--
-- Name: treasurers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treasurers (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    phone character varying(15) NOT NULL,
    email character varying(150) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.treasurers OWNER TO postgres;

--
-- Name: treasurers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.treasurers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.treasurers_id_seq OWNER TO postgres;

--
-- Name: treasurers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.treasurers_id_seq OWNED BY public.treasurers.id;


--
-- Name: user_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_logs (
    id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    logged_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    details text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_logs OWNER TO postgres;

--
-- Name: user_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_logs_id_seq OWNER TO postgres;

--
-- Name: user_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_logs_id_seq OWNED BY public.user_logs.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_by integer
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: administrators id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrators ALTER COLUMN id SET DEFAULT nextval('public.administrators_id_seq'::regclass);


--
-- Name: agenda id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda ALTER COLUMN id SET DEFAULT nextval('public.agenda_id_seq'::regclass);


--
-- Name: agenda_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda_items ALTER COLUMN id SET DEFAULT nextval('public.agenda_items_id_seq'::regclass);


--
-- Name: ambassadors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassadors ALTER COLUMN id SET DEFAULT nextval('public.ambassadors_id_seq'::regclass);


--
-- Name: application_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_logs ALTER COLUMN id SET DEFAULT nextval('public.application_logs_id_seq'::regclass);


--
-- Name: application_returns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_returns ALTER COLUMN id SET DEFAULT nextval('public.application_returns_id_seq'::regclass);


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: audit_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_reports ALTER COLUMN id SET DEFAULT nextval('public.audit_reports_id_seq'::regclass);


--
-- Name: auditors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditors ALTER COLUMN id SET DEFAULT nextval('public.auditors_id_seq'::regclass);


--
-- Name: blog id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog ALTER COLUMN id SET DEFAULT nextval('public.blog_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: feedback_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages ALTER COLUMN id SET DEFAULT nextval('public.feedback_messages_id_seq'::regclass);


--
-- Name: final_jury_decisions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_jury_decisions ALTER COLUMN id SET DEFAULT nextval('public.final_jury_decisions_id_seq'::regclass);


--
-- Name: financial_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions ALTER COLUMN id SET DEFAULT nextval('public.financial_transactions_id_seq'::regclass);


--
-- Name: ideas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ideas ALTER COLUMN id SET DEFAULT nextval('public.ideas_id_seq'::regclass);


--
-- Name: jira_tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jira_tasks ALTER COLUMN id SET DEFAULT nextval('public.jira_tasks_id_seq'::regclass);


--
-- Name: jury_decisions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_decisions ALTER COLUMN id SET DEFAULT nextval('public.jury_decisions_id_seq'::regclass);


--
-- Name: jury_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_logs ALTER COLUMN id SET DEFAULT nextval('public.jury_logs_id_seq'::regclass);


--
-- Name: jury_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_members ALTER COLUMN id SET DEFAULT nextval('public.jury_members_id_seq'::regclass);


--
-- Name: likes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes ALTER COLUMN id SET DEFAULT nextval('public.likes_id_seq'::regclass);


--
-- Name: login_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts ALTER COLUMN id SET DEFAULT nextval('public.login_attempts_id_seq'::regclass);


--
-- Name: media_files id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_files ALTER COLUMN id SET DEFAULT nextval('public.media_files_id_seq'::regclass);


--
-- Name: media_managers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_managers ALTER COLUMN id SET DEFAULT nextval('public.media_managers_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: pm_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_logs ALTER COLUMN id SET DEFAULT nextval('public.pm_logs_id_seq'::regclass);


--
-- Name: pm_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_permissions ALTER COLUMN id SET DEFAULT nextval('public.pm_permissions_id_seq'::regclass);


--
-- Name: problems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems ALTER COLUMN id SET DEFAULT nextval('public.problems_id_seq'::regclass);


--
-- Name: project_budgets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets ALTER COLUMN id SET DEFAULT nextval('public.project_budgets_id_seq'::regclass);


--
-- Name: project_invitations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_invitations ALTER COLUMN id SET DEFAULT nextval('public.project_invitations_id_seq'::regclass);


--
-- Name: project_managers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_managers ALTER COLUMN id SET DEFAULT nextval('public.project_managers_id_seq'::regclass);


--
-- Name: project_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_messages ALTER COLUMN id SET DEFAULT nextval('public.project_messages_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: secretaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries ALTER COLUMN id SET DEFAULT nextval('public.secretaries_id_seq'::regclass);


--
-- Name: selected_ideas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.selected_ideas ALTER COLUMN id SET DEFAULT nextval('public.selected_ideas_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: supervisors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisors ALTER COLUMN id SET DEFAULT nextval('public.supervisors_id_seq'::regclass);


--
-- Name: task_comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments ALTER COLUMN id SET DEFAULT nextval('public.task_comments_id_seq'::regclass);


--
-- Name: task_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_logs ALTER COLUMN id SET DEFAULT nextval('public.task_logs_id_seq'::regclass);


--
-- Name: task_status_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_status_log ALTER COLUMN id SET DEFAULT nextval('public.task_status_log_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: treasurers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasurers ALTER COLUMN id SET DEFAULT nextval('public.treasurers_id_seq'::regclass);


--
-- Name: user_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_logs ALTER COLUMN id SET DEFAULT nextval('public.user_logs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permissions (admin_id, permission_id, assigned_at) FROM stdin;
1	1	2024-12-16 14:55:26.895753
1	2	2024-12-16 14:55:26.895753
1	3	2024-12-16 14:55:26.895753
1	4	2024-12-16 14:55:26.895753
1	5	2024-12-16 14:55:26.895753
1	6	2024-12-16 14:55:26.895753
1	7	2024-12-16 14:55:26.895753
1	8	2024-12-16 14:55:26.895753
1	9	2024-12-16 14:55:26.895753
1	10	2024-12-16 14:55:26.895753
1	11	2024-12-16 14:55:26.895753
1	12	2024-12-16 14:55:26.895753
1	13	2024-12-16 14:55:26.895753
1	14	2024-12-16 14:55:26.895753
1	15	2024-12-16 14:55:26.895753
1	16	2024-12-16 14:55:26.895753
1	17	2024-12-16 14:55:26.895753
1	19	2024-12-16 14:55:26.895753
1	20	2024-12-16 14:55:26.895753
1	21	2024-12-16 14:55:26.895753
1	22	2024-12-16 14:55:26.895753
1	23	2024-12-16 14:55:26.895753
1	24	2024-12-16 14:55:26.895753
1	25	2024-12-16 14:55:26.895753
1	26	2024-12-16 14:55:26.895753
1	27	2024-12-16 14:55:26.895753
1	28	2024-12-16 14:55:26.895753
1	29	2024-12-16 14:55:26.895753
1	30	2024-12-16 14:55:26.895753
1	31	2024-12-16 14:55:26.895753
1	32	2024-12-16 14:55:26.895753
1	33	2024-12-16 14:55:26.895753
1	34	2024-12-16 14:55:26.895753
1	35	2024-12-16 14:55:26.895753
1	36	2024-12-16 14:55:26.895753
1	37	2024-12-16 14:55:26.895753
1	38	2024-12-16 14:55:26.895753
1	39	2024-12-16 14:55:26.895753
\.


--
-- Data for Name: administrators; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administrators (id, first_name, last_name, phone, email, password, created_at, updated_at) FROM stdin;
1	Super	Admin	0501234567	admin@example.com	secure_password	2024-12-16 14:55:26.895753	2024-12-16 14:55:26.895753
\.


--
-- Data for Name: agenda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agenda (id, title, description, meeting_date, created_by, created_at, decision_type, application_id) FROM stdin;
1	╨П┬о╨░╨┐┬д┬о╨Д ┬д╥Р┬н┬н╨Б┬й ┬н┬а 20 ╨И╨░╨│┬д┬н╨┐	╨Л╨О╨И┬о╤Ю┬о╨░╥Р┬н┬н╨┐ ╨З┬о┬д┬а┬н╨Б╨╡ ┬а╨З┬л?╨Д┬а╨╢?┬й	2024-12-20 10:00:00	\N	2024-12-16 12:10:40.077381	\N	\N
2	╨Я╨╛╤А╤П╨┤╨╛╨║ ╨┤╨╡╨╜╨╜╨╕╨╣: add	╨Ю╨▒╨│╨╛╨▓╨╛╤А╨╡╨╜╨╜╤П ╨╖╨░╤П╨▓╨║╨╕ ╨▓╤Ц╨┤ ╨Ж╨▓╨░╨╜: ╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	2025-02-28 05:06:00	39	2025-02-15 12:35:00.417186	\N	\N
3	╨Я╨╛╤А╤П╨┤╨╛╨║ ╨┤╨╡╨╜╨╜╨╕╨╣: add	╨Ю╨▒╨│╨╛╨▓╨╛╤А╨╡╨╜╨╜╤П ╨╖╨░╤П╨▓╨║╨╕ ╨▓╤Ц╨┤ ╨Ж╨▓╨░╨╜: ╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	2025-02-27 04:07:00	39	2025-02-15 14:25:04.624436	\N	\N
4	╨Я╨╛╤А╤П╨┤╨╛╨║ ╨┤╨╡╨╜╨╜╨╕╨╣: ╨Я╨╡╤А╨╡╨┤╨░╨╣╤В╨╡ ╤Б╨╡╨║╤А╨╡╤В╨░╤А╤О ╨╢╤Г╤А╤Ц	╨Ю╨▒╨│╨╛╨▓╨╛╤А╨╡╨╜╨╜╤П ╨╖╨░╤П╨▓╨║╨╕ ╨▓╤Ц╨┤ ╨Ж╨▓╨░╨╜: ╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	2025-02-13 08:07:00	39	2025-02-15 14:26:23.470425	\N	\N
5	╨Я╨╛╤А╤П╨┤╨╛╨║ ╨┤╨╡╨╜╨╜╨╕╨╣: add	╨Ю╨▒╨│╨╛╨▓╨╛╤А╨╡╨╜╨╜╤П ╨╖╨░╤П╨▓╨║╨╕ ╨▓╤Ц╨┤ ╨Ж╨▓╨░╨╜: ╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	2025-02-21 02:00:00	39	2025-02-15 14:46:20.879619	\N	\N
9	╨Э╨╛╨▓╨╕╨╣ ╨Я╤А╨╛╤Ф╨║╤В	qwqw	2025-02-20 07:00:00	39	2025-02-17 06:56:11.635813	\N	\N
10	╨Я╤А╨╛╨┐╨╛╨╜╤Г╤О ╨┐╨╛╨║╤А╨░╤Й╨╡╨╜╨╜╤П 	dqwd	2025-02-20 06:00:00	39	2025-02-17 07:16:31.548597	\N	\N
6	╨Я╨╛╤А╤П╨┤╨╛╨║ ╨┤╨╡╨╜╨╜╨╕╨╣: ╨Я╤А╨╛╨┐╨╛╨╜╤Г╤О ╨┐╨╛╨║╤А╨░╤Й╨╡╨╜╨╜╤П 	╨Ю╨▒╨│╨╛╨▓╨╛╤А╨╡╨╜╨╜╤П ╨╖╨░╤П╨▓╨║╨╕ ╨▓╤Ц╨┤ ╨Ж╨▓╨░╨╜: ╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	2025-02-28 03:00:00	39	2025-02-15 14:56:21.305288	review_allowed	\N
7	╨Я╨╛╤А╤П╨┤╨╛╨║ ╨┤╨╡╨╜╨╜╨╕╨╣: ╨Я╤А╨╛╨┐╨╛╨╜╤Г╤О ╨┐╨╛╨║╤А╨░╤Й╨╡╨╜╨╜╤П 	╨Ю╨▒╨│╨╛╨▓╨╛╤А╨╡╨╜╨╜╤П ╨╖╨░╤П╨▓╨║╨╕ ╨▓╤Ц╨┤ ╨Ж╨▓╨░╨╜: ╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	2025-02-25 05:00:00	39	2025-02-16 07:07:49.17721	approved	\N
11	╨Э╨╛╨▓╨╕╨╣ ╨Я╤А╨╛╤Ф╨║╤В	tfgnhjfgndfn	2025-04-18 03:03:06	39	2025-04-17 11:28:21.797425	approved	\N
\.


--
-- Data for Name: agenda_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agenda_items (id, agenda_id, application_id, application_type, status, added_at) FROM stdin;
2	1	7	problem	pending	2024-12-16 12:10:47.910149
1	1	3	idea	revision_requested	2024-12-16 12:20:47.399396
\.


--
-- Data for Name: ambassador_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ambassador_permissions (ambassador_id, permission_id, assigned_at, permission) FROM stdin;
7	1	2025-02-04 07:01:20.347741	default_permission
456	1	2025-02-04 14:37:35.109794	default_permission
\.


--
-- Data for Name: ambassadors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ambassadors (id, phone, "position", email, first_name, last_name, created_at, updated_at, user_id) FROM stdin;
7	0975643423	\N	123@ya.ua	Amassador	Kop	2025-02-04 07:01:20.347741	2025-02-04 07:01:20.347741	38
456	123456789	\N	test@example.com	Test	User	2025-02-04 14:37:35.109794	2025-02-04 14:37:35.109794	123
\.


--
-- Data for Name: application_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_logs (id, application_id, editor_id, old_comment, new_comment, "timestamp") FROM stdin;
\.


--
-- Data for Name: application_returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_returns (id, application_id, secretary_id, ambassador_id, comment, returned_at) FROM stdin;
6	8	39	40	utyutyut	2025-02-15 14:55:57.043565
7	6	39	40	daa	2025-02-16 07:07:26.92865
8	4	39	37	uyuy	2025-02-16 11:38:57.024031
9	11	39	40	╨Я╤А╨╕╤З╨╕╨╜╨░ ╨┐╨╛╨▓╨╡╤А╨╜╨╡╨╜╨╜╤П ╨╖╨░╤П╨▓╨║╨╕	2025-02-17 06:24:58.288284
10	8	39	40	sfcsf	2025-02-17 06:42:45.924884
11	4	39	37	sfsf	2025-02-17 07:16:09.255006
12	12	39	40	thwrhrh	2025-04-17 11:27:50.762162
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, user_id, ambassador_id, type, reference_id, title, content, status, created_at, updated_at, jury_secretary_id, jury_comment, review_comment, idea_id, locked_by, description, decision_type) FROM stdin;
4	37	\N	idea	25	123	wszxcfrre	draft	2025-02-08 13:15:14.399242	2025-02-15 11:25:53.673687	\N	\N	\N	\N	\N	╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	\N
6	40	\N	\N	26	╨Я╤А╨╛╨┐╨╛╨╜╤Г╤О ╨┐╨╛╨║╤А╨░╤Й╨╡╨╜╨╜╤П 	╨Ч╨░╨╝╤Ц╨╜╨╕╤В╨╕ ╤Е╨╡╤И╨╛╨▓╨░╨╜╨╕╨╣ ╨┐╨░╤А╨╛╨╗╤М ╨╜╨░ ╤Б╤Г╤З╨░╤Б╨╜╨│╤Ц ╤В╨╡╤Е╨╜╨╛╨╗╨╛╨│╤Ц╤Ч	submitted	2025-02-10 07:23:45.805079	2025-02-15 11:25:53.673687	3	\N	\N	\N	\N	╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	\N
7	40	\N	\N	27	╨Я╨╡╤А╨╡╨┤╨░╨╣╤В╨╡ ╤Б╨╡╨║╤А╨╡╤В╨░╤А╤О ╨╢╤Г╤А╤Ц	╨Щ╤П ╤Ц╨┤╨╡╤П ╨┐╨╛╨║╨╗╨╕╨║╨░╨╜╨░ ╨╜╨░ ╤В╨╡ ╤Й╨╛ 	submitted	2025-02-10 14:28:10.884484	2025-02-15 11:25:53.673687	39	\N	\N	\N	\N	╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	\N
8	40	\N	\N	28	add	reqawq	draft	2025-02-11 06:51:51.110082	2025-02-15 11:25:53.673687	\N	\N	\N	\N	\N	╨Г╥Р┬з ┬о╨З╨Б╨▒╨│	\N
10	40	\N	idea	\N	╨Т╤Ц╤В╨░╨╗╤М╨╜╨╕╨╣ ╨С╨╛╨║╤Б 	╤Г╤Б╤Ц╨╝ ╨▓╤Ц╤В╨░╨╗╤М╨╜╨╕╨╣ ╨▒╨╛╨║╤Б 	draft	2025-02-16 12:32:02.87646	2025-02-16 12:32:02.87646	\N	\N	\N	32	\N	\N	\N
11	40	\N	idea	\N	╨Э╨╛╨▓╨╕╨╣ ╨Я╤А╨╛╤Ф╨║╤В	╨Я╤А╨╕╨▓╤Ц╤В ╨▓╤Б╤Ц╨╝ ╨░╨▓╤В╨╛╨╝╨░╨│╤Ц╤Б╤В╤А╨░╨╗╤М	draft	2025-02-16 15:31:48.419751	2025-02-16 15:31:48.419751	\N	\N	\N	33	\N	\N	\N
12	40	\N	idea	\N	test	test	draft	2025-02-17 11:32:56.819014	2025-02-17 11:32:56.819014	\N	\N	\N	34	\N	\N	\N
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attachments (id, message_id, file_name, file_path, file_size, uploaded_at) FROM stdin;
\.


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, table_name, record_id, action_type, changed_at) FROM stdin;
1	jira_tasks	1	UPDATE	2025-02-03 17:19:40.323136
2	jira_tasks	1	UPDATE	2025-02-03 17:19:40.323136
3	jira_tasks	5	UPDATE	2025-02-03 17:19:40.323136
4	jira_tasks	1	UPDATE	2025-02-03 17:19:40.323136
5	jira_tasks	\N	DELETE	2025-02-03 17:19:40.323136
6	jira_tasks	\N	DELETE	2025-02-03 17:19:40.323136
7	jira_tasks	\N	DELETE	2025-02-03 17:19:40.323136
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, action_type, table_name, record_id, user_id, description, performed_at) FROM stdin;
1	INSERT	projects	2	\N	INSERT operation performed on table projects	2024-12-16 14:39:16.110247
2	INSERT	media_files	1	\N	Media file uploaded: new_feature_image.png	2024-12-16 14:44:49.998132
3	INSERT	financial_transactions	1	\N	INSERT operation on financial_transactions: 1	2024-12-16 14:48:55.015663
\.


--
-- Data for Name: audit_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_reports (id, auditor_id, title, content, created_at) FROM stdin;
2	1	Project Audit Summary	Summary of actions performed in the Projects module.	2024-12-16 14:41:11.487034
\.


--
-- Data for Name: auditors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditors (id, first_name, last_name, phone, email, created_at, updated_at) FROM stdin;
1	John	Doe	0987654321	auditor@example.com	2024-12-16 14:40:08.562654	2024-12-16 14:40:08.562654
\.


--
-- Data for Name: blog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog (id, type, reference_id, user_id, title, description, created_at, updated_at, createdat, updatedat) FROM stdin;
14	idea	23	37	╨Ч╨╜╨╡╨▒╨░ ╤Ц╨┤╨╡╤П	╨ж╨╡ ╨┐╨╡╤А╤И╨░ ╤Ц╨┤╨╡╤П ╨▓ ╤Ж╤М╨╛╨╝╤Г ╤А╨╛╤Ж╤Ц  	2025-02-04 08:10:49.267089	\N	2025-02-04 08:10:49.267089	2025-02-04 08:10:49.267089
15	idea	24	38	╨Я╤А╨╕╨▓╤Ц╤В ╨║╨╛╨┤╤Г╨▓╨░╨╜╨╜╤П	╤Б╨┐╨╛╨┤╤Ц╨▓╨░╤О╤Б╤М ╨┐╨╛╨▒╨░╤З╨╕╤В╨╕ ╤Ж╨╡ ╨╝╨╛╤Ф ╤Ц╨╝╤П	2025-02-04 08:31:58.077556	\N	2025-02-04 08:31:58.077556	2025-02-04 08:31:58.077556
16	idea	25	37	123	wszxcfrre	2025-02-04 14:50:16.972703	\N	2025-02-04 14:50:16.972703	2025-02-04 14:50:16.972703
17	idea	26	40	╨Я╤А╨╛╨┐╨╛╨╜╤Г╤О ╨┐╨╛╨║╤А╨░╤Й╨╡╨╜╨╜╤П 	╨Ч╨░╨╝╤Ц╨╜╨╕╤В╨╕ ╤Е╨╡╤И╨╛╨▓╨░╨╜╨╕╨╣ ╨┐╨░╤А╨╛╨╗╤М ╨╜╨░ ╤Б╤Г╤З╨░╤Б╨╜╨│╤Ц ╤В╨╡╤Е╨╜╨╛╨╗╨╛╨│╤Ц╤Ч	2025-02-10 06:57:26.583082	\N	2025-02-10 06:57:26.583082	2025-02-10 06:57:26.583082
18	idea	27	40	╨Я╨╡╤А╨╡╨┤╨░╨╣╤В╨╡ ╤Б╨╡╨║╤А╨╡╤В╨░╤А╤О ╨╢╤Г╤А╤Ц	╨Щ╤П ╤Ц╨┤╨╡╤П ╨┐╨╛╨║╨╗╨╕╨║╨░╨╜╨░ ╨╜╨░ ╤В╨╡ ╤Й╨╛ 	2025-02-10 14:27:37.281734	\N	2025-02-10 14:27:37.281734	2025-02-10 14:27:37.281734
19	idea	28	40	add	reqawq	2025-02-11 06:50:49.30068	\N	2025-02-11 06:50:49.30068	2025-02-11 06:50:49.30068
20	idea	29	40	╨Я╨╛╨▓╨╡╤А╨╜╨╕ ╤Б╨╡╨║╤А╨░╤В╨░╤А	╨░╨╛╨▓╨╡╤А╨╜╨╡╨╜╤П ╤Ж╤Ц╤Ф╤Ч ╤Ц╨┤╨╡╤Ч	2025-02-11 09:44:38.257113	\N	2025-02-11 09:44:38.257113	2025-02-11 09:44:38.257113
21	idea	30	40	HELLOWORLD2025	╨Я╤А╨╕╨▓╤Ц╤В ╨▓ ╨╝╨╡╨╜╨╡ ╤Ф ╤Ц╨┤╨╡╤П 	2025-02-12 09:07:15.422097	\N	2025-02-12 09:07:15.422097	2025-02-12 09:07:15.422097
22	idea	31	40	1233	Hello World 	2025-02-14 09:31:06.779444	\N	2025-02-14 09:31:06.779444	2025-02-14 09:31:06.779444
23	idea	32	40	╨Т╤Ц╤В╨░╨╗╤М╨╜╨╕╨╣ ╨С╨╛╨║╤Б 	╤Г╤Б╤Ц╨╝ ╨▓╤Ц╤В╨░╨╗╤М╨╜╨╕╨╣ ╨▒╨╛╨║╤Б 	2025-02-14 13:55:50.765754	\N	2025-02-14 13:55:50.765754	2025-02-14 13:55:50.765754
24	idea	33	40	╨Э╨╛╨▓╨╕╨╣ ╨Я╤А╨╛╤Ф╨║╤В	╨Я╤А╨╕╨▓╤Ц╤В ╨▓╤Б╤Ц╨╝ ╨░╨▓╤В╨╛╨╝╨░╨│╤Ц╤Б╤В╤А╨░╨╗╤М	2025-02-16 15:30:36.695842	\N	2025-02-16 15:30:36.695842	2025-02-16 15:30:36.695842
25	idea	34	40	test	test	2025-02-17 11:32:02.911515	\N	2025-02-17 11:32:02.911515	2025-02-17 11:32:02.911515
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (id, title, content, author_id, status, created_at, updated_at) FROM stdin;
1	New Feature Release	Updated content for the feature release.	1	draft	2024-12-16 14:44:43.704447	2024-12-16 14:45:08.493801
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, blog_id, user_id, comment, created_at, idea_id, updated_at, content, problem_id) FROM stdin;
17	16	37	╨Т╨Р╨г╨г	2025-02-05 14:00:43.194077	\N	2025-02-05 14:00:43.194077	\N	\N
18	16	37	╨┐╨░╤А╨░	2025-02-05 14:06:36.514677	\N	2025-02-05 14:06:36.514677	\N	\N
19	16	37	╤Д╨╡╨▓	2025-02-05 14:33:06.224706	\N	2025-02-05 14:33:06.224706	\N	\N
20	16	37	╨Я╨а╨Ш╨Т╨Ж╨в	2025-02-05 17:19:14.62775	\N	2025-02-05 17:19:14.62775	\N	\N
21	\N	38	dfdf	2025-02-07 08:18:00.58213	23	2025-02-07 08:18:00.58213	\N	\N
22	22	40	rgdrgfg	2025-02-14 09:36:14.803003	\N	2025-02-14 09:36:14.803003	\N	\N
23	22	40	ghjgj	2025-02-14 10:03:50.041612	\N	2025-02-14 10:03:50.041612	\N	\N
24	22	40	fjjjf	2025-02-14 10:08:26.391257	\N	2025-02-14 10:08:26.391257	\N	\N
25	22	40	sdsd	2025-02-14 10:15:00.322419	\N	2025-02-14 10:15:00.322419	\N	\N
26	22	40	gdgdg	2025-02-14 10:19:05.82008	\N	2025-02-14 10:19:05.82008	\N	\N
27	19	40	adad	2025-02-14 10:40:43.517487	\N	2025-02-14 10:40:43.517487	\N	\N
28	22	40	dgfdg	2025-02-14 10:52:21.90175	\N	2025-02-14 10:52:21.90175	\N	\N
29	20	40	456	2025-02-14 10:54:47.866203	\N	2025-02-14 10:54:47.866203	\N	\N
30	15	40	sasa	2025-02-14 10:57:49.153303	\N	2025-02-14 10:57:49.153303	\N	\N
31	23	40	jgjk	2025-02-15 07:50:24.179856	\N	2025-02-15 07:50:24.179856	\N	\N
32	24	40	╨Ь╨░╨│╤Ц╤Б╤В╤А╨░╨╗╤М	2025-02-16 15:31:30.752315	\N	2025-02-16 15:31:30.752315	\N	\N
\.


--
-- Data for Name: feedback_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback_messages (id, problem_id, idea_id, user_id, ambassador_id, sender, text, created_at, sender_id, sender_role, recipient_id) FROM stdin;
19	\N	25	\N	\N	\N	dqwd	2025-02-07 13:43:32.925665	37	user	\N
20	\N	23	\N	\N	\N	efef	2025-02-07 13:47:05.555289	38	user	\N
21	\N	24	\N	\N	\N	effefe	2025-02-07 13:47:10.569414	38	user	\N
22	\N	25	\N	\N	\N	╨Ф╨╛╨▒╤А╨╡ ╨┐╨╡╤А╨╡╨┤╨░╨▓╨░╨╣╤В╨╡ ╤Ц╨┤╨╡╤О 	2025-02-07 14:28:55.259232	37	user	\N
23	\N	25	\N	\N	\N	cdd	2025-02-07 14:46:20.022821	37	user	\N
24	\N	25	\N	\N	\N	╨Т╤Ц╨┤╨┐╤А╨░╨▓╨╗╤П╨╣╤В╨╡ ╤Б╨╡╨║╤А╨╡╤В╨░╤А╤О ╨╢╤Г╤А╤Ц ╤В╨░ ╤А╨╡╨┤╨░╨│╤Г╨╣╤В╨╡ 	2025-02-07 14:49:04.225926	38	user	\N
25	\N	26	\N	\N	\N	╨и╨░╨╜╨╛╨▓╨╜╨╕╨╣ ╨░╨╝╨▒╨░╤Б╨░╨┤╨╛╤А ╨▓╨╕ ╨╜╨╡ ╨▓╨╕╤Е╨╛╨┤╨╕╤В╨╡ ╨╜╨░ ╨╖╨▓╤П╨╖╨╛╨║ ╤В╨╛╨╝╤Г ╤П ╨┐╨╛╨┤╨░╤О ╤Ч╤Ч ╤Б╨░╨╝╨╛╤Б╤В╤Ц╨╣╨╜╨╛ ╨╗╨┤╨╛ ╤Б╨╡╨║╤А╨╡╤В╨░╤А╤П ╨╢╤Г╤А╤Ц 	2025-02-10 06:58:38.228738	40	user	\N
26	\N	29	\N	\N	\N	dqwre	2025-02-11 10:33:41.052675	40	user	\N
27	\N	31	\N	\N	\N	dgggd	2025-02-15 09:49:44.765978	38	user	\N
28	\N	23	\N	\N	\N	yuyt	2025-02-15 09:53:07.959569	38	user	\N
29	\N	24	\N	\N	\N	gugug	2025-02-15 10:02:39.860548	38	user	\N
30	\N	30	\N	\N	\N	sfsfs	2025-02-15 10:05:33.513919	38	user	\N
31	\N	28	\N	\N	\N	dggd	2025-02-15 10:07:50.030585	38	user	\N
32	\N	23	\N	\N	\N	ghg	2025-02-15 10:13:58.849772	38	user	\N
33	\N	31	\N	\N	\N	123	2025-02-15 10:21:44.776649	38	user	\N
34	\N	32	\N	\N	\N	gjgjgj	2025-02-15 10:29:22.911901	38	user	\N
35	\N	32	\N	\N	\N	555	2025-02-15 10:32:38.715559	38	user	\N
36	\N	32	\N	\N	\N	╨Ф╨╛╨▒╤А╨╡ ╨▓╤Ц╨┤╨┐╤А╨░╨▓╨╗╤П╤О	2025-02-15 10:37:10.247637	40	user	\N
37	\N	34	\N	\N	\N	╨┐╨╛╨┤╨░╨▓╨░╨╣╤В╨╡	2025-02-17 11:37:43.786546	38	user	\N
38	\N	34	\N	\N	\N	uitiutuy	2025-04-17 11:23:08.716672	38	user	\N
\.


--
-- Data for Name: final_jury_decisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.final_jury_decisions (id, project_id, user_id, jury_member_id, decision, decision_text, decision_date, agenda_id, final_decision, submission_date) FROM stdin;
2	\N	41	6	rejected	sfs	2025-02-16 09:16:37.740778	2	rejected	2025-02-16 09:16:37.740778
3	\N	41	6	review_allowed	tyete	2025-02-16 09:25:23.371425	4	review_allowed	2025-02-16 09:25:23.371425
4	\N	41	6	review_allowed	adaa	2025-02-17 08:12:38.068287	6	review_allowed	2025-02-17 08:12:38.068287
5	\N	41	6	approved	hfhf	2025-02-16 10:19:28.984702	3	approved	2025-02-16 10:19:28.984702
6	\N	41	6	approved	gdg	2025-02-17 08:15:33.702609	7	approved	2025-02-17 08:15:33.702609
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_transactions (id, treasurer_id, transaction_type, amount, description, transaction_date, created_at) FROM stdin;
1	1	expense	200.00	1	2024-12-16 14:48:55.015663	2024-12-16 14:48:55.015663
\.


--
-- Data for Name: ideas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ideas (id, user_id, ambassador_id, title, description, status, created_at, updated_at, priority, "createdAt", "updatedAt", author_first_name, author_last_name, type, secretary_id, decision_type) FROM stdin;
28	40	7	add	reqawq	pending	2025-02-11 06:50:49.30068	2025-02-11 06:50:49.30068	0	2025-02-11 06:50:49.30068	2025-02-11 06:50:49.30068	╨Ж╨▓╨░╨╜	Ivan	\N	\N	\N
29	40	7	╨Я╨╛╨▓╨╡╤А╨╜╨╕ ╤Б╨╡╨║╤А╨░╤В╨░╤А	╨░╨╛╨▓╨╡╤А╨╜╨╡╨╜╤П ╤Ж╤Ц╤Ф╤Ч ╤Ц╨┤╨╡╤Ч	pending	2025-02-11 09:44:38.257113	2025-02-11 09:44:38.257113	0	2025-02-11 09:44:38.257113	2025-02-11 09:44:38.257113	╨Ж╨▓╨░╨╜	Ivan	\N	\N	\N
30	40	7	HELLOWORLD2025	╨Я╤А╨╕╨▓╤Ц╤В ╨▓ ╨╝╨╡╨╜╨╡ ╤Ф ╤Ц╨┤╨╡╤П 	pending	2025-02-12 09:07:15.422097	2025-02-12 09:07:15.422097	0	2025-02-12 09:07:15.422097	2025-02-12 09:07:15.422097	╨Ж╨▓╨░╨╜	Ivan	\N	\N	\N
31	40	7	1233	Hello World 	pending	2025-02-14 09:31:06.779444	2025-02-14 09:31:06.779444	0	2025-02-14 09:31:06.779444	2025-02-14 09:31:06.779444	╨Ж╨▓╨░╨╜	Ivan	\N	\N	\N
32	40	7	╨Т╤Ц╤В╨░╨╗╤М╨╜╨╕╨╣ ╨С╨╛╨║╤Б 	╤Г╤Б╤Ц╨╝ ╨▓╤Ц╤В╨░╨╗╤М╨╜╨╕╨╣ ╨▒╨╛╨║╤Б 	pending	2025-02-14 13:55:50.765754	2025-02-14 13:55:50.765754	0	2025-02-14 13:55:50.765754	2025-02-14 13:55:50.765754	╨Ж╨▓╨░╨╜	Ivan	\N	\N	\N
33	40	\N	╨Э╨╛╨▓╨╕╨╣ ╨Я╤А╨╛╤Ф╨║╤В	╨Я╤А╨╕╨▓╤Ц╤В ╨▓╤Б╤Ц╨╝ ╨░╨▓╤В╨╛╨╝╨░╨│╤Ц╤Б╤В╤А╨░╨╗╤М	pending	2025-02-16 15:30:36.695842	2025-02-16 15:30:36.695842	0	2025-02-16 15:30:36.695842	2025-02-16 15:30:36.695842	\N	\N	\N	\N	\N
34	40	7	test	test	pending	2025-02-17 11:32:02.911515	2025-02-17 11:32:02.911515	0	2025-02-17 11:32:02.911515	2025-02-17 11:32:02.911515	\N	\N	\N	\N	\N
23	37	7	╨Ч╨╜╨╡╨▒╨░ ╤Ц╨┤╨╡╤П	╨ж╨╡ ╨┐╨╡╤А╤И╨░ ╤Ц╨┤╨╡╤П ╨▓ ╤Ж╤М╨╛╨╝╤Г ╤А╨╛╤Ж╤Ц  	pending	2025-02-04 08:10:49.267089	2025-02-04 08:10:49.267089	0	2025-02-04 08:10:49.267089	2025-02-04 08:10:49.267089	╨Ж╨▓╨░╨╜	╨С╤Г╨┤╤М╨╛╨╜╨╜╨╕╨╣	\N	\N	\N
24	38	7	╨Я╤А╨╕╨▓╤Ц╤В ╨║╨╛╨┤╤Г╨▓╨░╨╜╨╜╤П	╤Б╨┐╨╛╨┤╤Ц╨▓╨░╤О╤Б╤М ╨┐╨╛╨▒╨░╤З╨╕╤В╨╕ ╤Ж╨╡ ╨╝╨╛╤Ф ╤Ц╨╝╤П	pending	2025-02-04 08:31:58.077556	2025-02-04 08:31:58.077556	0	2025-02-04 08:31:58.077556	2025-02-04 08:31:58.077556	Amassador	Kop	\N	\N	\N
25	37	7	123	wszxcfrre	pending	2025-02-04 14:50:16.972703	2025-02-08 13:14:14.252354	0	2025-02-04 14:50:16.972703	2025-02-04 14:50:16.972703	╨Ж╨▓╨░╨╜	╨С╤Г╨┤╤М╨╛╨╜╨╜╨╕╨╣	idea	\N	\N
26	40	7	╨Я╤А╨╛╨┐╨╛╨╜╤Г╤О ╨┐╨╛╨║╤А╨░╤Й╨╡╨╜╨╜╤П 	╨Ч╨░╨╝╤Ц╨╜╨╕╤В╨╕ ╤Е╨╡╤И╨╛╨▓╨░╨╜╨╕╨╣ ╨┐╨░╤А╨╛╨╗╤М ╨╜╨░ ╤Б╤Г╤З╨░╤Б╨╜╨│╤Ц ╤В╨╡╤Е╨╜╨╛╨╗╨╛╨│╤Ц╤Ч	pending	2025-02-10 06:57:26.583082	2025-02-10 06:57:26.583082	0	2025-02-10 06:57:26.583082	2025-02-10 06:57:26.583082	╨Ж╨▓╨░╨╜	Ivan	\N	\N	\N
27	40	7	╨Я╨╡╤А╨╡╨┤╨░╨╣╤В╨╡ ╤Б╨╡╨║╤А╨╡╤В╨░╤А╤О ╨╢╤Г╤А╤Ц	╨Щ╤П ╤Ц╨┤╨╡╤П ╨┐╨╛╨║╨╗╨╕╨║╨░╨╜╨░ ╨╜╨░ ╤В╨╡ ╤Й╨╛ 	pending	2025-02-10 14:27:37.281734	2025-02-10 14:27:37.281734	0	2025-02-10 14:27:37.281734	2025-02-10 14:27:37.281734	╨Ж╨▓╨░╨╜	Ivan	\N	\N	\N
\.


--
-- Data for Name: ideas_backup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ideas_backup (id, user_id, ambassador_id, title, description, status, created_at, updated_at, priority, "createdAt", "updatedAt") FROM stdin;
3	1	3	?┬д╥Р╨┐ ╨З┬о╨Д╨░┬а╨╣╥Р┬н┬н╨┐ ┬л┬о╨И?╨▒╨▓╨Б╨Д╨Б	╨П╨░┬о╨З┬о┬з╨Б╨╢?╨┐ ╨╣┬о┬д┬о ┬о╨З╨▓╨Б┬м?┬з┬а╨╢?╤Е ┬м┬а╨░╨╕╨░╨│╨▓?╤Ю ┬д┬о╨▒╨▓┬а╤Ю╨Д╨Б.	pending	2024-12-16 12:24:57.83506	2025-01-27 10:35:16.525516	0	2025-01-27 10:25:02.19245	2025-01-27 10:25:02.19245
4	1	2	?┬д╥Р╨┐ ╨З┬о╨Д╨░┬а╨╣╥Р┬н┬н╨┐ ┬л┬о╨И?╨▒╨▓╨Б╨Д╨Б	╨П╨░┬о╨З┬о┬з╨Б╨╢?╨┐ ╨╣┬о┬д┬о ┬о╨З╨▓╨Б┬м?┬з┬а╨╢?╤Е ┬м┬а╨░╨╕╨░╨│╨▓?╤Ю ┬д┬о╨▒╨▓┬а╤Ю╨Д╨Б.	pending	2024-12-16 12:25:19.217877	2025-01-27 10:35:16.525516	0	2025-01-27 10:25:02.19245	2025-01-27 10:25:02.19245
\.


--
-- Data for Name: jira_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jira_tasks (id, project_id, title, description, status, assigned_to, created_by_pm_id, priority, created_at, updated_at) FROM stdin;
1	1	Optimize Delivery Routes	Analyze current routes and improve efficiency.	To Do	\N	1	High	2024-12-16 14:07:09.140758	2024-12-16 14:07:09.140758
\.


--
-- Data for Name: jury_decisions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jury_decisions (id, project_id, user_id, jury_member_id, decision, bonus_amount, decision_date, payment_status, agenda_id, decision_text, decision_type, submission_date, review_date, pm_id, approved, final_decision) FROM stdin;
3	\N	41	6	rejected	0.00	2025-02-16 09:16:37.740778	pending	2	sfs	rejected	2025-02-16 09:16:37.740778	\N	\N	f	rejected
4	\N	41	6	review_allowed	0.00	2025-02-16 09:25:23.371425	pending	4	tyete	review_allowed	2025-02-16 09:25:23.371425	\N	\N	f	review_allowed
6	\N	41	6	review_allowed	0.00	2025-02-17 08:12:38.068287	pending	6	adaa	review_allowed	2025-02-17 08:12:38.068287	\N	\N	f	review_allowed
5	\N	41	6	approved	232.00	2025-02-16 10:19:28.984702	approved	3	hfhf	approved	2025-02-16 10:19:28.984702	\N	\N	f	approved
7	\N	41	6	approved	234.00	2025-02-17 08:15:33.702609	approved	7	gdg	approved	2025-02-17 08:15:33.702609	\N	\N	f	approved
8	\N	41	6	approved	5757.00	2025-04-17 11:54:46.217828	approved	11	fcngvnvnc	approved	2025-04-17 11:54:46.217828	\N	\N	f	\N
\.


--
-- Data for Name: jury_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jury_logs (id, jury_member_id, action, log_time) FROM stdin;
2	6	INSERT	2025-02-15 15:14:51.139379
\.


--
-- Data for Name: jury_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jury_members (id, first_name, last_name, phone, email, photo, created_at, updated_at, user_id) FROM stdin;
6	jury	members	04326634645	567@ya.ua	\N	2025-02-15 15:14:51.139379	2025-02-15 15:14:51.139379	41
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.likes (id, blog_id, user_id, created_at, idea_id) FROM stdin;
71	\N	37	2025-02-04 09:20:23.664293	23
72	\N	37	2025-02-04 09:29:30.935935	15
73	\N	37	2025-02-04 11:58:43.508543	14
74	\N	37	2025-02-04 11:58:46.839741	24
76	\N	37	2025-02-05 13:47:58.511531	25
77	16	37	2025-02-05 13:57:41.22278	\N
79	\N	40	2025-02-14 09:49:27.913853	28
80	\N	40	2025-02-14 09:49:43.298204	7
84	21	40	2025-02-14 10:08:20.506425	\N
87	\N	40	2025-02-14 10:15:56.740651	30
88	\N	40	2025-02-14 10:16:00.090546	31
89	22	40	2025-02-14 11:02:24.345248	\N
90	19	40	2025-02-14 13:54:10.497965	\N
91	23	40	2025-02-15 07:50:09.887843	\N
93	24	40	2025-02-17 06:05:27.463632	\N
94	\N	40	2025-04-17 11:42:31.183023	5
\.


--
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_attempts (id, user_id, login_time, status, ip_address) FROM stdin;
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_files (id, uploader_id, file_name, file_path, file_size, uploaded_at) FROM stdin;
1	1	new_feature_image.png	/uploads/new_feature_image.png	2048000	2024-12-16 14:44:49.998132
\.


--
-- Data for Name: media_managers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media_managers (id, first_name, last_name, phone, email, created_at, updated_at) FROM stdin;
1	Jane	Smith	0509876543	jane.smith@example.com	2024-12-16 14:44:39.662853	2024-12-16 14:44:39.662853
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_id, recipient_id, subject, content, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, message, status, created_at, comment) FROM stdin;
1	\N	тАШ╨▓┬а╨▓╨│╨▒ ╤Ю┬а╨╕┬о╤Е ┬а╨З┬л?╨Д┬а╨╢?╤Е #3 ┬з┬м?┬н╥Р┬н┬о ┬н┬а: reviewed	unread	2024-12-16 12:12:46.435407	\N
12	456	New problem created!	unread	2025-02-04 14:37:42.469226	\N
16	37	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "dsgd" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-04 14:49:25.954813	\N
17	38	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "dsgd" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-04 14:49:25.954813	\N
18	123	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "dsgd" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-04 14:49:25.954813	\N
19	456	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "dsgd" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-04 14:49:25.954813	\N
20	40	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #6 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-10 08:03:24.984775	\N
21	\N	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #6 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-10 08:03:24.984775	\N
22	40	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #7 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-10 14:58:00.852613	\N
23	\N	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #7 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-10 14:58:00.852613	\N
24	40	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "fsasf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-11 10:33:20.780362	\N
25	38	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "fsasf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-11 10:33:20.780362	\N
26	123	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "fsasf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-11 10:33:20.780362	\N
27	456	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "fsasf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-11 10:33:20.780362	\N
28	39	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "fsasf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-11 10:33:20.780362	\N
29	37	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "fsasf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-11 10:33:20.780362	\N
30	40	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "sdkfjkf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-14 09:31:23.282167	\N
31	38	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "sdkfjkf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-14 09:31:23.282167	\N
32	123	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "sdkfjkf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-14 09:31:23.282167	\N
33	456	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "sdkfjkf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-14 09:31:23.282167	\N
34	39	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "sdkfjkf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-14 09:31:23.282167	\N
35	37	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "sdkfjkf" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-14 09:31:23.282167	\N
36	37	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #4 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
37	\N	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #4 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
38	40	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #6 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
39	\N	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #6 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
40	40	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #7 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
41	\N	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #7 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
42	40	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #8 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
43	\N	тАФ╥Р╨░┬н╥Р╨▓╨Д┬а ┬а╨З┬л?╨Д┬а╨╢?╤Е #8 ╨О╨│┬л┬а ┬о┬н┬о╤Ю┬л╥Р┬н┬а.	unread	2025-02-15 11:25:53.673687	\N
44	40	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
45	42	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
46	41	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
47	38	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
48	123	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
49	456	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
50	39	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
51	37	╨М┬о╤Ю┬а ╨З╨░┬о╨О┬л╥Р┬м┬а "Problem" ┬д┬о╨▒╨▓╨│╨З┬н┬а ┬д┬л╨┐ ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│. ╨П?┬д╨З╨Б╨╕?╨▓╨╝╨▒╨┐, ╨╣┬о╨О ┬о╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ┬о┬н┬о╤Ю┬л╥Р┬н┬н╨┐.	unread	2025-02-17 11:33:58.989884	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, description) FROM stdin;
1	view	тАЮ┬о╨▒╨▓╨│╨З ┬д┬о ╨З╥Р╨░╥Р╨И┬л╨┐┬д╨│
2	edit	╤Т╥Р┬д┬а╨И╨│╤Ю┬а┬н┬н╨┐ ┬з┬а╨З╨Б╨▒?╤Ю
3	delete	тАЪ╨Б┬д┬а┬л╥Р┬н┬н╨┐ ┬з┬а╨З╨Б╨▒?╤Ю
4	assign_roles	╨П╨░╨Б┬з┬н┬а╨╖╥Р┬н┬н╨┐ ╨░┬о┬л╥Р┬й
5	update_profile	╨Л┬н┬о╤Ю┬л╨╛╤Ю┬а╨▓╨Б ?┬н╨┤┬о╨░┬м┬а╨╢?╨╛ ╨З╨░┬о ╨▒╥Р╨О╥Р
6	submit_idea	╨П┬о┬д┬а╤Ю┬а╨▓╨Б ┬н┬о╤Ю? ?┬д╥Р╤Е
7	submit_problem	╨П┬о┬д┬а╤Ю┬а╨▓╨Б ┬н┬о╤Ю? ╨З╨░┬о╨О┬л╥Р┬м╨Б
8	highlight_idea_problem	тАЪ╨Б╨▒╤Ю?╨▓┬л╨╛╤Ю┬а╨▓╨Б ?┬д╥Р╤Е/╨З╨░┬о╨О┬л╥Р┬м╨Б ╨│ ╨З╨░┬о╨┤?┬л?
9	choose_ambassador	╨Л╨О╨Б╨░┬а╨▓╨Б ┬а┬м╨О┬а╨▒┬а┬д┬о╨░┬а ┬д┬л╨┐ ?┬д╥Р╤Е/╨З╨░┬о╨О┬л╥Р┬м╨Б
10	send_message	тАЪ?┬д╨З╨░┬а╤Ю┬л╨┐╨▓╨Б ╨З┬о╤Ю?┬д┬о┬м┬л╥Р┬н┬н╨┐
11	receive_message	╨П╨░╨Б┬й┬м┬а╨▓╨Б ╨З┬о╤Ю?┬д┬о┬м┬л╥Р┬н┬н╨┐
12	receive_notifications	╨П╨░╨Б┬й┬м┬а╨▓╨Б ╨▒╨З┬о╤Ю?╨╣╥Р┬н┬н╨┐
13	comment	╨Й┬о┬м╥Р┬н╨▓╨│╤Ю┬а╨▓╨Б
14	like	тА╣┬а┬й╨Д┬а╨▓╨Б
15	participate_projects	╨П╨░╨Б┬й┬м┬а╨▓╨Б ╨│╨╖┬а╨▒╨▓╨╝ ╨│ ╨З╨░┬о╤Г╨Д╨▓┬а╨╡
16	subscribe_notifications	╨Л╨▓╨░╨Б┬м╨│╤Ю┬а╨▓╨Б ╨▒╨З┬о╤Ю?╨╣╥Р┬н┬н╨┐ ╨З╨░┬о ┬н┬о╤Ю? ?┬д╥Р╤Е/╨З╨░┬о╨О┬л╥Р┬м╨Б
17	subscribe_ideas	╨П?┬д╨З╨Б╨▒╨│╤Ю┬а╨▓╨Б╨▒╨┐ ┬н┬а ?┬д╥Р╤Е
19	receive_application_notification	╨Л╨▓╨░╨Б┬м╨│╤Г ╨З┬о╤Ю?┬д┬о┬м┬л╥Р┬н┬н╨┐ ╨З╨░┬о ╨З┬о┬д┬а┬н┬н╨┐ ┬а╨З┬л?╨Д┬а╨╢?╤Е
20	evaluate_application	╨Л╨╢?┬н╨╛╤Г ┬а╨З┬л?╨Д┬а╨╢?╨╛
21	notify_ambassador_revision	╨П┬о╤Ю?┬д┬о┬м┬л╨┐╤Г ┬а┬м╨О┬а╨▒┬а┬д┬о╨░┬а ╨З╨░┬о ┬н╥Р┬о╨О╨╡?┬д┬н?╨▒╨▓╨╝ ┬д┬о╨З╨░┬а╨╢╨╛╤Ю┬а┬н┬н╨┐ ┬а╨З┬л?╨Д┬а╨╢?╤Е
22	provide_revision_feedback	╨М┬а┬д┬а╤Г ╨З┬о╨░┬а┬д╨Б ╨╣┬о┬д┬о ┬д┬о╨З╨░┬а╨╢╨╛╤Ю┬а┬н┬н╨┐ ┬а╨З┬л?╨Д┬а╨╢?╤Е
23	form_agenda	тАЭ┬о╨░┬м╨│╤Г ╨З┬о╨░╨┐┬д┬о╨Д ┬д╥Р┬н┬н╨Б┬й ? ╨▒╨З╨Б╨▒┬о╨Д ╨З╨░┬о╨З┬о┬з╨Б╨╢?┬й ┬н┬а ┬з┬а╨▒?┬д┬а┬н┬н╨┐ ┬ж╨│╨░?
24	schedule_meeting	╨П┬о╤Ю?┬д┬о┬м┬л╨┐╤Г ┬д┬а╨▓╨│/╨╖┬а╨▒/┬м?╨▒╨╢╥Р ┬з┬а╨▒?┬д┬а┬н┬н╨┐ ┬ж╨│╨░?, ┬о╨░╨И┬а┬н?┬з┬о╤Ю╨│╤Г ┬й┬о╨И┬о ╨З╨░┬о╤Ю╥Р┬д╥Р┬н┬н╨┐
25	participate_meeting	╨Г╥Р╨░╥Р ╨│╨╖┬а╨▒╨▓╨╝ ╨│ ┬з┬а╨▒?┬д┬а┬н┬н? ┬ж╨│╨░? ╨▓┬а ╨И┬о┬л┬о╨▒╨│╤Г
26	record_meeting_minutes	тАЪ╥Р┬д╥Р ╨З╨░┬о╨▓┬о╨Д┬о┬л ┬з┬а╨▒?┬д┬а┬н┬н╨┐ ┬ж╨│╨░?
27	record_jury_results	тАЪ┬н┬о╨▒╨Б╨▓╨╝ ╨░╥Р┬з╨│┬л╨╝╨▓┬а╨▓╨Б ╨░┬о╨О┬о╨▓╨Б ┬ж╨│╨░? ╤Ю ╨▒╨Б╨▒╨▓╥Р┬м╨│
28	manage_users	Full control over users.
29	manage_roles	Full control over roles and permissions.
30	manage_projects	Full control over all projects.
31	manage_tasks	Full control over all tasks.
32	manage_financials	Full control over financial data.
33	view_audit_logs	View all audit logs.
34	send_notifications	Send notifications to all users.
35	manage_jira	Full access to JIRA boards and tasks.
36	manage_media	Full control over media uploads and posts.
37	manage_jury	Manage jury and decision-making processes.
38	view_reports	View and generate all system reports.
39	manage_system_settings	Manage system-wide configurations.
\.


--
-- Data for Name: pm_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_logs (id, pm_id, action, log_time) FROM stdin;
1	1	INSERT action on Project Manager	2024-12-16 13:55:12.698431
2	2	INSERT action on Project Manager	2025-02-16 13:03:54.714546
\.


--
-- Data for Name: pm_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_permissions (id, name, description) FROM stdin;
1	update_profile	Update their own profile
2	create_project	Create a new project
3	delete_project	Delete a project
4	update_project	Update project details
5	invite_users	Invite new users to the project
6	assign_roles	Assign roles to users in a project
7	comment_issues	Comment on project issues or ideas
8	manage_notifications	Manage team notifications
\.


--
-- Data for Name: pm_permissions_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_permissions_assignment (pm_id, permission_id, granted_at) FROM stdin;
1	1	2024-12-16 13:55:12.698431
1	2	2024-12-16 13:55:12.698431
1	3	2024-12-16 13:55:12.698431
1	4	2024-12-16 13:55:12.698431
1	5	2024-12-16 13:55:12.698431
1	6	2024-12-16 13:55:12.698431
1	7	2024-12-16 13:55:12.698431
1	8	2024-12-16 13:55:12.698431
2	1	2025-02-16 13:03:54.714546
2	2	2025-02-16 13:03:54.714546
2	3	2025-02-16 13:03:54.714546
2	4	2025-02-16 13:03:54.714546
2	5	2025-02-16 13:03:54.714546
2	6	2025-02-16 13:03:54.714546
2	7	2025-02-16 13:03:54.714546
2	8	2025-02-16 13:03:54.714546
\.


--
-- Data for Name: problems; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problems (id, user_id, ambassador_id, title, description, status, created_at, updated_at) FROM stdin;
5	37	7	dsgd	dsfsdf	pending	2025-02-04 14:49:25.954813	2025-02-04 14:49:25.954813
6	40	7	fsasf	sff	pending	2025-02-11 10:33:20.780362	2025-02-11 10:33:20.780362
7	40	7	sdkfjkf	sddsd	pending	2025-02-14 09:31:23.282167	2025-02-14 09:31:23.282167
8	40	7	Problem	Problem	pending	2025-02-17 11:33:58.989884	2025-02-17 11:33:58.989884
\.


--
-- Data for Name: project_budgets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_budgets (id, project_id, treasurer_id, allocated_amount, spent_amount, description, created_at, updated_at) FROM stdin;
1	1	1	5000.00	200.00	Initial budget allocation for logistics optimization.	2024-12-16 14:48:49.362314	2024-12-16 14:48:49.362314
\.


--
-- Data for Name: project_invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_invitations (id, project_id, invited_user_id, invited_by_pm_id, status, created_at) FROM stdin;
\.


--
-- Data for Name: project_managers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_managers (id, first_name, last_name, phone, email, photo, created_at, updated_at) FROM stdin;
1	John	Doe	0501234567	john.doe@example.com	/photos/john_doe.jpg	2024-12-16 13:55:12.698431	2024-12-16 13:55:12.698431
2	Project	Manager	0958578784	890@ya.ua	\N	2025-02-16 13:03:54.714546	2025-02-16 13:03:54.714546
\.


--
-- Data for Name: project_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_messages (id, project_id, sender_pm_id, recipient_user_id, message, created_at) FROM stdin;
\.


--
-- Data for Name: project_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_users (project_id, user_id) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, description, created_by, created_at, updated_at, jury_decision_id, pm_id, status) FROM stdin;
1	Logistics Optimization	Optimizing delivery routes.	1	2024-12-16 14:00:39.196523	2024-12-16 14:00:39.196523	\N	\N	pending
3	New Project	Description for Project 3	1	2024-12-16 14:17:33.263169	2024-12-16 14:17:33.263169	\N	\N	pending
2	Audit Test Project	Testing audit logging.	\N	2024-12-16 14:39:16.110247	2024-12-16 14:39:16.110247	\N	\N	pending
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description) FROM stdin;
1	Ambassador	╨В┬м╨О┬а╨▒┬а┬д┬о╨░, ╨┐╨Д╨Б┬й ╨З╨░┬а╨╢╨╛╤Г ┬з ?┬д╥Р╨┐┬м╨Б
2	Secretary	тАШ╥Р╨Д╨░╥Р╨▓┬а╨░ ┬ж╨│╨░?, ╤Ю?┬д╨З┬о╤Ю?┬д┬а╤Г ┬з┬а ┬д┬о╨Д╨│┬м╥Р┬н╨▓╨Б
3	Jury Member	тАФ┬л╥Р┬н ┬ж╨│╨░?, ╨И┬о┬л┬о╨▒╨│╤Г ┬з┬а ?┬д╥Р╤Е
4	PM	╨П╨░┬о╤Г╨Д╨▓┬н╨Б┬й ┬м╥Р┬н╥Р┬д┬ж╥Р╨░
5	Supervisor	тАШ╨│╨З╥Р╨░╤Ю?┬з┬о╨░, ╨┐╨Д╨Б┬й ╨Д┬о┬о╨░┬д╨Б┬н╨│╤Г ╨З╨░┬о╨╢╥Р╨▒╨Б
6	Media Manager	╨К╥Р┬д?┬а-┬м╥Р┬н╥Р┬д┬ж╥Р╨░, ╤Ю?┬д╨З┬о╤Ю?┬д┬а╤Г ┬з┬а ┬м╥Р┬д?┬а
7	Treasurer	╨Й┬а┬з┬н┬а╨╖╥Р┬й, ╨┐╨Д╨Б┬й ┬з┬а┬й┬м┬а╤Г╨▓╨╝╨▒╨┐ ╨┤?┬н┬а┬н╨▒┬а┬м╨Б
11	Administrator	Full system access
12	project_manager	\N
\.


--
-- Data for Name: secretaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secretaries (id, phone, email, first_name, last_name, photo, created_at, updated_at, user_id, role) FROM stdin;
39	078345722	345@ya.ua	SECRETAR	JURY	\N	2025-02-10 11:45:42.809352	2025-02-10 11:45:42.809352	39	jury_secretary
4	0783456722	example@ya.ua	JURY	SECRETARY	\N	2025-02-12 15:28:18.22959	2025-02-12 15:28:18.22959	50	jury_secretary
\.


--
-- Data for Name: secretary_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secretary_permissions (secretary_id, permission_id, assigned_at) FROM stdin;
39	19	2025-02-10 11:45:42.809352
39	20	2025-02-10 11:45:42.809352
39	21	2025-02-10 11:45:42.809352
39	22	2025-02-10 11:45:42.809352
39	23	2025-02-10 11:45:42.809352
39	24	2025-02-10 11:45:42.809352
39	25	2025-02-10 11:45:42.809352
39	26	2025-02-10 11:45:42.809352
39	27	2025-02-10 11:45:42.809352
4	19	2025-02-12 15:28:18.22959
4	20	2025-02-12 15:28:18.22959
4	21	2025-02-12 15:28:18.22959
4	22	2025-02-12 15:28:18.22959
4	23	2025-02-12 15:28:18.22959
4	24	2025-02-12 15:28:18.22959
4	25	2025-02-12 15:28:18.22959
4	26	2025-02-12 15:28:18.22959
4	27	2025-02-12 15:28:18.22959
\.


--
-- Data for Name: selected_ideas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.selected_ideas (id, user_id, idea_id, created_at, selected_at) FROM stdin;
1	37	25	2025-02-08 14:07:33.465808	2025-02-10 07:15:26.923152
2	40	28	2025-02-10 07:21:51.404545	2025-02-11 06:51:51.038982
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, blog_id, user_id, created_at, idea_id, updated_at, problem_id) FROM stdin;
22	15	37	2025-02-04 12:08:36.941933	\N	2025-02-04 12:08:36.941933	\N
23	14	37	2025-02-04 12:26:19.654222	\N	2025-02-04 12:26:19.654222	\N
25	16	37	2025-02-05 14:00:28.559879	\N	2025-02-05 14:00:28.559879	\N
26	\N	37	2025-02-05 14:15:40.58122	23	2025-02-05 14:15:40.58122	\N
27	\N	37	2025-02-05 14:15:46.999799	\N	2025-02-05 14:15:46.999799	5
28	\N	37	2025-02-05 14:17:05.913156	24	2025-02-05 14:17:05.913156	\N
29	\N	37	2025-02-05 14:17:10.356572	25	2025-02-05 14:17:10.356572	\N
30	14	38	2025-02-07 08:18:09.920951	\N	2025-02-07 08:18:09.920951	\N
31	17	40	2025-02-10 06:57:42.734733	\N	2025-02-10 06:57:42.734733	\N
34	20	40	2025-02-14 10:07:51.574775	\N	2025-02-14 10:07:51.574775	\N
35	21	40	2025-02-14 10:08:16.630862	\N	2025-02-14 10:08:16.630862	\N
36	\N	40	2025-02-14 10:16:54.694074	26	2025-02-14 10:16:54.694074	\N
37	18	40	2025-02-14 10:49:32.953216	\N	2025-02-14 10:49:32.953216	\N
39	23	40	2025-02-15 07:50:12.926204	\N	2025-02-15 07:50:12.926204	\N
40	24	40	2025-02-16 15:31:15.630084	\N	2025-02-16 15:31:15.630084	\N
42	\N	40	2025-04-17 11:42:15.806381	\N	2025-04-17 11:42:15.806381	5
\.


--
-- Data for Name: supervisor_projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supervisor_projects (supervisor_id, project_id, assigned_by_pm_id, assigned_at) FROM stdin;
4	1	1	2024-12-16 14:22:46.482033
\.


--
-- Data for Name: supervisors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supervisors (id, first_name, last_name, phone, email, photo, created_at, updated_at) FROM stdin;
4	Alice	Johnson	0501239876	alice.johnson@example.com	/photos/alice.jpg	2024-12-16 14:22:41.379913	2024-12-16 14:22:41.379913
\.


--
-- Data for Name: task_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_comments (id, task_id, user_id, comment, created_at) FROM stdin;
\.


--
-- Data for Name: task_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_logs (id, task_id, action, log_time) FROM stdin;
1	2	UPDATE task status updated	2025-02-03 17:19:40.323136
2	3	UPDATE task status updated	2025-02-03 17:19:40.323136
3	1	UPDATE task status updated	2025-02-03 17:19:40.323136
\.


--
-- Data for Name: task_status_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_status_log (id, task_id, old_status, new_status, changed_at) FROM stdin;
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, project_id, assigned_to, created_by_pm_id, title, description, status, created_at, updated_at) FROM stdin;
2	2	\N	\N	тАб┬а╤Ю┬д┬а┬н┬н╨┐ 2	╨Л╨З╨Б╨▒ ┬д┬л╨┐ ┬н┬о╤Ю┬о╨И┬о ╨З╨░┬о╤Г╨Д╨▓╨│	To Do	2024-12-17 07:59:00.701046	2024-12-17 07:59:00.701046
3	3	\N	\N	тАб┬а╤Ю┬д┬а┬н┬н╨┐ 3	тАЩ╥Р╨▒╨▓╨│╤Ю┬а┬н┬н╨┐ ┬а╨│┬д╨Б╨▓╨│	Done	2024-12-17 07:59:00.701046	2024-12-17 07:59:00.701046
1	1	\N	\N	тАб┬а╤Ю┬д┬а┬н┬н╨┐ 1	╨Л╨З╨▓╨Б┬м?┬з┬а╨╢?╨┐ ┬л┬о╨И?╨▒╨▓╨Б╨Д╨Б	In Progress	2024-12-17 07:59:00.701046	2024-12-17 07:59:00.701046
\.


--
-- Data for Name: treasurers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treasurers (id, first_name, last_name, phone, email, created_at, updated_at) FROM stdin;
1	Michael	Brown	0501234567	michael.brown@example.com	2024-12-16 14:48:42.468305	2024-12-16 14:48:42.468305
\.


--
-- Data for Name: user_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_logs (id, user_id, action, logged_at, details, "timestamp") FROM stdin;
1	\N	GET_ENTRIES	2025-02-03 11:03:05.5748	╨Ю╤В╤А╨╕╨╝╨░╨╜╨╛ 7 ╨▒╨╗╨╛╨│╤Ц╨▓ ╤В╨░ 5 ╤Ц╨┤╨╡╨╣. ╨Ъ╨╛╤А╨╕╤Б╤В╤Г╨▓╨░╤З IP: 192.168.0.116	2025-02-03 11:03:05.5748
2	\N	GET_ENTRIES	2025-02-03 11:04:24.458045	╨Ю╤В╤А╨╕╨╝╨░╨╜╨╛ 7 ╨▒╨╗╨╛╨│╤Ц╨▓ ╤В╨░ 5 ╤Ц╨┤╨╡╨╣. ╨Ъ╨╛╤А╨╕╤Б╤В╤Г╨▓╨░╤З IP: 192.168.0.116	2025-02-03 11:04:24.458045
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions (user_id, permission_id) FROM stdin;
37	1
37	2
37	3
37	4
37	6
37	7
37	8
37	9
37	10
123	1
123	2
123	3
123	4
123	6
123	7
123	8
123	9
123	10
456	1
456	2
456	3
456	4
456	6
456	7
456	8
456	9
456	10
39	1
39	2
39	3
39	4
39	6
39	7
39	8
39	9
39	10
40	1
40	2
40	3
40	4
40	6
40	7
40	8
40	9
40	10
41	1
41	2
41	3
41	4
41	6
41	7
41	8
41	9
41	10
42	1
42	2
42	3
42	4
42	6
42	7
42	8
42	9
42	10
43	1
43	2
43	3
43	4
43	6
43	7
43	8
43	9
43	10
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id, assigned_at, assigned_by) FROM stdin;
38	1	2025-02-06 07:08:03.406887	\N
41	3	2025-02-15 15:08:20.437222	\N
42	12	2025-02-16 12:58:12.560318	40
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, first_name, last_name, phone, email, password, created_at, updated_at, profile_picture, role) FROM stdin;
40	╨Ж╨▓╨░╨╜	Ivan	0654343142	0123@ya.ua	$2b$10$iDi2qQ7GrUOm6aTsrJqWTORnl9m4VEnscE.x/OJqU88/GiP58aGFG	2025-02-10 06:55:54.14404	2025-02-10 06:55:54.14404	\N	user
42	Project	Manager	0958578784	890@ya.ua	$2b$10$FfHRWi2j37QDx3647eUvq.B56pv5D3bk/DzS.Yu2TLQagOxLZnVB6	2025-02-16 12:45:40.908308	2025-02-16 12:50:10.482931	\N	project_manager
41	 jury	members	04326634645	567@ya.ua	$2b$10$IxsS5AB1JGCzYYqxtx2.4eTUOqTjqM9igBZ1MNa4.oLsQm52v/Yr.	2025-02-15 15:01:05.788219	2025-02-15 15:01:05.788219	\N	user
43	123	Ivan	0932525252	polandgdansk2029@gmail.com	$2b$10$0CH1MGqn1oswkO1P2//rBeDHWlMVsXrHkkRwwZpalB8.MUQrZDbHy	2025-04-17 10:38:26.663042	2025-04-17 10:38:26.663042	\N	user
38	Amassador	Kop	0975643423	123@ya.ua	$2b$10$vl0szV8EX0FXfhOGDoaOXeBEnKvI6jJcM51QP8BEqE.yMnaWzjDzW	2025-02-03 17:24:15.163	2025-02-04 14:25:33.470388	\N	ambassador
123	Test	User	123456789	test@example.com	hashed_password	2025-02-04 14:37:26.233076	2025-02-04 14:37:26.233076	\N	user
456	John	Doe	0975643424	newtest@example.com	hashed_password	2025-02-04 14:43:35.027646	2025-02-04 14:43:35.027646	\N	user
39	SECRETAR	JURY	0783456722	345@ya.ua	$2b$10$Ijgn2A77eBiWZWchjqNpjeUGwaMttwayzuMJDFTWxREk4ORbrran.	2025-02-08 14:15:31.367171	2025-02-08 14:19:01.582654	\N	jury_secretary
37	╨Ж╨▓╨░╨╜	╨С╤Г╨┤╤М╨╛╨╜╨╜╨╕╨╣	0932724652	polandgdansk2020@gmail.com	Pmzpolska2024	2025-02-03 17:22:26.759	2025-02-10 06:54:38.88117	\N	user
\.


--
-- Name: administrators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administrators_id_seq', 1, true);


--
-- Name: agenda_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agenda_id_seq', 11, true);


--
-- Name: agenda_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.agenda_items_id_seq', 2, true);


--
-- Name: ambassadors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ambassadors_id_seq', 9, true);


--
-- Name: application_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_logs_id_seq', 1, false);


--
-- Name: application_returns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_returns_id_seq', 12, true);


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_id_seq', 12, true);


--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attachments_id_seq', 3, true);


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 7, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 3, true);


--
-- Name: audit_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_reports_id_seq', 2, true);


--
-- Name: auditors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditors_id_seq', 1, false);


--
-- Name: blog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_id_seq', 25, true);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 1, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 32, true);


--
-- Name: feedback_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feedback_messages_id_seq', 38, true);


--
-- Name: final_jury_decisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.final_jury_decisions_id_seq', 6, true);


--
-- Name: financial_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financial_transactions_id_seq', 1, true);


--
-- Name: ideas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ideas_id_seq', 34, true);


--
-- Name: jira_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jira_tasks_id_seq', 1, true);


--
-- Name: jury_decisions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jury_decisions_id_seq', 8, true);


--
-- Name: jury_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jury_logs_id_seq', 11, true);


--
-- Name: jury_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jury_members_id_seq', 6, true);


--
-- Name: likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.likes_id_seq', 94, true);


--
-- Name: login_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_attempts_id_seq', 1, true);


--
-- Name: media_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_files_id_seq', 1, true);


--
-- Name: media_managers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_managers_id_seq', 1, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 5, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 51, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 40, true);


--
-- Name: pm_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_logs_id_seq', 2, true);


--
-- Name: pm_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_permissions_id_seq', 8, true);


--
-- Name: problems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.problems_id_seq', 8, true);


--
-- Name: project_budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_budgets_id_seq', 1, true);


--
-- Name: project_invitations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_invitations_id_seq', 2, true);


--
-- Name: project_managers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_managers_id_seq', 2, true);


--
-- Name: project_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_messages_id_seq', 1, false);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 2, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 12, true);


--
-- Name: secretaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secretaries_id_seq', 4, true);


--
-- Name: selected_ideas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.selected_ideas_id_seq', 2, true);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 42, true);


--
-- Name: supervisors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.supervisors_id_seq', 1, false);


--
-- Name: task_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_comments_id_seq', 6, true);


--
-- Name: task_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_logs_id_seq', 3, true);


--
-- Name: task_status_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_status_log_id_seq', 1, false);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 3, true);


--
-- Name: treasurers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.treasurers_id_seq', 1, true);


--
-- Name: user_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_logs_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 43, true);


--
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (admin_id, permission_id);


--
-- Name: administrators administrators_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_email_key UNIQUE (email);


--
-- Name: administrators administrators_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_phone_key UNIQUE (phone);


--
-- Name: administrators administrators_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administrators
    ADD CONSTRAINT administrators_pkey PRIMARY KEY (id);


--
-- Name: agenda_items agenda_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda_items
    ADD CONSTRAINT agenda_items_pkey PRIMARY KEY (id);


--
-- Name: agenda agenda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT agenda_pkey PRIMARY KEY (id);


--
-- Name: ambassador_permissions ambassador_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassador_permissions
    ADD CONSTRAINT ambassador_permissions_pkey PRIMARY KEY (ambassador_id, permission_id);


--
-- Name: ambassadors ambassadors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassadors
    ADD CONSTRAINT ambassadors_email_key UNIQUE (email);


--
-- Name: ambassadors ambassadors_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassadors
    ADD CONSTRAINT ambassadors_phone_key UNIQUE (phone);


--
-- Name: ambassadors ambassadors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassadors
    ADD CONSTRAINT ambassadors_pkey PRIMARY KEY (id);


--
-- Name: application_logs application_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_logs
    ADD CONSTRAINT application_logs_pkey PRIMARY KEY (id);


--
-- Name: application_returns application_returns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_returns
    ADD CONSTRAINT application_returns_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: audit_reports audit_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_reports
    ADD CONSTRAINT audit_reports_pkey PRIMARY KEY (id);


--
-- Name: auditors auditors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditors
    ADD CONSTRAINT auditors_email_key UNIQUE (email);


--
-- Name: auditors auditors_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditors
    ADD CONSTRAINT auditors_phone_key UNIQUE (phone);


--
-- Name: auditors auditors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditors
    ADD CONSTRAINT auditors_pkey PRIMARY KEY (id);


--
-- Name: blog blog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: feedback_messages feedback_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages
    ADD CONSTRAINT feedback_messages_pkey PRIMARY KEY (id);


--
-- Name: final_jury_decisions final_jury_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_jury_decisions
    ADD CONSTRAINT final_jury_decisions_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: ideas ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT ideas_pkey PRIMARY KEY (id);


--
-- Name: jira_tasks jira_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jira_tasks
    ADD CONSTRAINT jira_tasks_pkey PRIMARY KEY (id);


--
-- Name: jury_decisions jury_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_decisions
    ADD CONSTRAINT jury_decisions_pkey PRIMARY KEY (id);


--
-- Name: jury_logs jury_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_logs
    ADD CONSTRAINT jury_logs_pkey PRIMARY KEY (id);


--
-- Name: jury_members jury_members_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_members
    ADD CONSTRAINT jury_members_email_key UNIQUE (email);


--
-- Name: jury_members jury_members_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_members
    ADD CONSTRAINT jury_members_phone_key UNIQUE (phone);


--
-- Name: jury_members jury_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_members
    ADD CONSTRAINT jury_members_pkey PRIMARY KEY (id);


--
-- Name: jury_members jury_members_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_members
    ADD CONSTRAINT jury_members_user_id_key UNIQUE (user_id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: media_managers media_managers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_managers
    ADD CONSTRAINT media_managers_email_key UNIQUE (email);


--
-- Name: media_managers media_managers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_managers
    ADD CONSTRAINT media_managers_phone_key UNIQUE (phone);


--
-- Name: media_managers media_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_managers
    ADD CONSTRAINT media_managers_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: pm_logs pm_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_logs
    ADD CONSTRAINT pm_logs_pkey PRIMARY KEY (id);


--
-- Name: pm_permissions_assignment pm_permissions_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_permissions_assignment
    ADD CONSTRAINT pm_permissions_assignment_pkey PRIMARY KEY (pm_id, permission_id);


--
-- Name: pm_permissions pm_permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_permissions
    ADD CONSTRAINT pm_permissions_name_key UNIQUE (name);


--
-- Name: pm_permissions pm_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_permissions
    ADD CONSTRAINT pm_permissions_pkey PRIMARY KEY (id);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (id);


--
-- Name: project_budgets project_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_pkey PRIMARY KEY (id);


--
-- Name: project_invitations project_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_pkey PRIMARY KEY (id);


--
-- Name: project_managers project_managers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_managers
    ADD CONSTRAINT project_managers_email_key UNIQUE (email);


--
-- Name: project_managers project_managers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_managers
    ADD CONSTRAINT project_managers_phone_key UNIQUE (phone);


--
-- Name: project_managers project_managers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_managers
    ADD CONSTRAINT project_managers_pkey PRIMARY KEY (id);


--
-- Name: project_messages project_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_pkey PRIMARY KEY (id);


--
-- Name: project_users project_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_pkey PRIMARY KEY (project_id, user_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: secretaries secretaries_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries
    ADD CONSTRAINT secretaries_email_key UNIQUE (email);


--
-- Name: secretaries secretaries_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries
    ADD CONSTRAINT secretaries_phone_key UNIQUE (phone);


--
-- Name: secretaries secretaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretaries
    ADD CONSTRAINT secretaries_pkey PRIMARY KEY (id);


--
-- Name: secretary_permissions secretary_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_permissions
    ADD CONSTRAINT secretary_permissions_pkey PRIMARY KEY (secretary_id, permission_id);


--
-- Name: selected_ideas selected_ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.selected_ideas
    ADD CONSTRAINT selected_ideas_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: supervisor_projects supervisor_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_projects
    ADD CONSTRAINT supervisor_projects_pkey PRIMARY KEY (supervisor_id, project_id);


--
-- Name: supervisors supervisors_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisors
    ADD CONSTRAINT supervisors_email_key UNIQUE (email);


--
-- Name: supervisors supervisors_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisors
    ADD CONSTRAINT supervisors_phone_key UNIQUE (phone);


--
-- Name: supervisors supervisors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisors
    ADD CONSTRAINT supervisors_pkey PRIMARY KEY (id);


--
-- Name: task_comments task_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_pkey PRIMARY KEY (id);


--
-- Name: task_logs task_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_logs
    ADD CONSTRAINT task_logs_pkey PRIMARY KEY (id);


--
-- Name: task_status_log task_status_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_status_log
    ADD CONSTRAINT task_status_log_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: treasurers treasurers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasurers
    ADD CONSTRAINT treasurers_email_key UNIQUE (email);


--
-- Name: treasurers treasurers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasurers
    ADD CONSTRAINT treasurers_phone_key UNIQUE (phone);


--
-- Name: treasurers treasurers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treasurers
    ADD CONSTRAINT treasurers_pkey PRIMARY KEY (id);


--
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: likes unique_like; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT unique_like UNIQUE (blog_id, user_id);


--
-- Name: users unique_phone; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_phone UNIQUE (phone);


--
-- Name: user_logs user_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_logs
    ADD CONSTRAINT user_logs_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (user_id, permission_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_ideas_ambassador_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ideas_ambassador_id ON public.ideas USING btree (ambassador_id);


--
-- Name: idx_ideas_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ideas_user_id ON public.ideas USING btree (user_id);


--
-- Name: idx_jira_tasks_assigned_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jira_tasks_assigned_to ON public.jira_tasks USING btree (assigned_to);


--
-- Name: idx_jira_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jira_tasks_status ON public.jira_tasks USING btree (status);


--
-- Name: ideas after_new_idea_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_new_idea_insert AFTER INSERT ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.copy_new_idea_to_blog();


--
-- Name: agenda_items on_agenda_item_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_agenda_item_update BEFORE UPDATE ON public.agenda_items FOR EACH ROW EXECUTE FUNCTION public.update_agenda_item_timestamp();


--
-- Name: ambassadors on_ambassador_creation; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_ambassador_creation AFTER INSERT ON public.ambassadors FOR EACH ROW EXECUTE FUNCTION public.assign_default_ambassador_permissions();


--
-- Name: agenda_items on_application_status_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_application_status_change AFTER UPDATE OF status ON public.agenda_items FOR EACH ROW EXECUTE FUNCTION public.notify_ambassador_on_status_change();


--
-- Name: user_roles on_role_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_role_change BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.clear_user_permissions();


--
-- Name: secretaries on_secretary_creation; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_secretary_creation AFTER INSERT ON public.secretaries FOR EACH ROW EXECUTE FUNCTION public.assign_default_secretary_permissions();


--
-- Name: users on_user_creation; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_user_creation AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.add_default_permissions();


--
-- Name: users on_user_deletion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER on_user_deletion BEFORE DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.delete_user_permissions();


--
-- Name: ideas set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: administrators trigger_assign_admin_permissions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_assign_admin_permissions AFTER INSERT ON public.administrators FOR EACH ROW EXECUTE FUNCTION public.assign_full_admin_permissions();


--
-- Name: project_managers trigger_assign_pm_permissions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_assign_pm_permissions AFTER INSERT ON public.project_managers FOR EACH ROW EXECUTE FUNCTION public.assign_pm_default_permissions();


--
-- Name: messages trigger_audit_messages; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_messages AFTER INSERT OR DELETE OR UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();


--
-- Name: projects trigger_audit_projects; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_projects AFTER INSERT OR DELETE OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();


--
-- Name: jira_tasks trigger_audit_tasks; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_tasks AFTER INSERT OR DELETE OR UPDATE ON public.jira_tasks FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();


--
-- Name: jira_tasks trigger_audit_tasks_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_tasks_delete AFTER DELETE ON public.jira_tasks FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();


--
-- Name: jira_tasks trigger_audit_tasks_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_tasks_insert AFTER INSERT ON public.jira_tasks FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();


--
-- Name: jira_tasks trigger_audit_tasks_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_tasks_update AFTER UPDATE ON public.jira_tasks FOR EACH ROW EXECUTE FUNCTION public.log_audit_action();


--
-- Name: task_comments trigger_check_task_access; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_check_task_access BEFORE INSERT ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.check_task_access();


--
-- Name: jury_decisions trigger_finalize_decision; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_finalize_decision AFTER INSERT ON public.jury_decisions FOR EACH ROW EXECUTE FUNCTION public.finalize_decision_immediately();


--
-- Name: financial_transactions trigger_log_financial_transactions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_financial_transactions AFTER INSERT OR UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.log_financial_actions();


--
-- Name: jury_members trigger_log_jury_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_jury_delete AFTER DELETE ON public.jury_members FOR EACH ROW EXECUTE FUNCTION public.log_jury_actions();


--
-- Name: jury_members trigger_log_jury_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_jury_insert AFTER INSERT ON public.jury_members FOR EACH ROW EXECUTE FUNCTION public.log_jury_actions();


--
-- Name: media_files trigger_log_media_upload; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_media_upload AFTER INSERT ON public.media_files FOR EACH ROW EXECUTE FUNCTION public.log_media_upload();


--
-- Name: project_managers trigger_log_pm_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_pm_insert AFTER INSERT ON public.project_managers FOR EACH ROW EXECUTE FUNCTION public.log_pm_actions();


--
-- Name: project_managers trigger_log_pm_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_pm_update AFTER UPDATE ON public.project_managers FOR EACH ROW EXECUTE FUNCTION public.log_pm_actions();


--
-- Name: jira_tasks trigger_log_task_status_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_task_status_change AFTER UPDATE OF status ON public.jira_tasks FOR EACH ROW EXECUTE FUNCTION public.log_task_status_change();


--
-- Name: tasks trigger_log_task_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_log_task_update AFTER UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_task_updates();


--
-- Name: problems trigger_notify_all_new_problem; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_all_new_problem AFTER INSERT ON public.problems FOR EACH ROW EXECUTE FUNCTION public.notify_all_users();


--
-- Name: applications trigger_notify_draft_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_draft_update AFTER UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.notify_about_draft_update();


--
-- Name: blog trigger_notify_new_idea; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_new_idea AFTER INSERT ON public.blog FOR EACH ROW WHEN (((new.type)::text = 'idea'::text)) EXECUTE FUNCTION public.notify_subscribers('?┬д╥Р╨┐');


--
-- Name: blog trigger_notify_new_problem; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_new_problem AFTER INSERT ON public.blog FOR EACH ROW WHEN (((new.type)::text = 'problem'::text)) EXECUTE FUNCTION public.notify_subscribers('╨З╨░┬о╨О┬л╥Р┬м┬а');


--
-- Name: jury_decisions trigger_notify_treasurer; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_treasurer AFTER INSERT OR UPDATE ON public.jury_decisions FOR EACH ROW EXECUTE FUNCTION public.notify_treasurer_on_decision();


--
-- Name: jury_decisions trigger_notify_user_payment; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_notify_user_payment AFTER UPDATE ON public.jury_decisions FOR EACH ROW EXECUTE FUNCTION public.notify_user_on_payment();


--
-- Name: blog_posts trigger_update_blog_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_blog_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_blog_updated_at();


--
-- Name: financial_transactions trigger_update_budget; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_budget AFTER INSERT ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_budget_on_transaction();


--
-- Name: jury_members trigger_update_jury_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_jury_timestamp BEFORE UPDATE ON public.jury_members FOR EACH ROW EXECUTE FUNCTION public.update_jury_updated_at();


--
-- Name: subscriptions trigger_update_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_timestamp BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: applications update_application_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_application_trigger BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_application_timestamp();


--
-- Name: users update_user_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_trigger BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_user_trigger_function();


--
-- Name: admin_permissions admin_permissions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.administrators(id) ON DELETE CASCADE;


--
-- Name: admin_permissions admin_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: agenda agenda_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT agenda_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: agenda agenda_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda
    ADD CONSTRAINT agenda_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.secretaries(id) ON DELETE SET NULL;


--
-- Name: agenda_items agenda_items_agenda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agenda_items
    ADD CONSTRAINT agenda_items_agenda_id_fkey FOREIGN KEY (agenda_id) REFERENCES public.agenda(id) ON DELETE CASCADE;


--
-- Name: ambassador_permissions ambassador_permissions_ambassador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassador_permissions
    ADD CONSTRAINT ambassador_permissions_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.ambassadors(id) ON DELETE CASCADE;


--
-- Name: ambassador_permissions ambassador_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassador_permissions
    ADD CONSTRAINT ambassador_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: application_logs application_logs_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_logs
    ADD CONSTRAINT application_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: application_logs application_logs_editor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_logs
    ADD CONSTRAINT application_logs_editor_id_fkey FOREIGN KEY (editor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: application_returns application_returns_ambassador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_returns
    ADD CONSTRAINT application_returns_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: application_returns application_returns_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_returns
    ADD CONSTRAINT application_returns_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: application_returns application_returns_secretary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_returns
    ADD CONSTRAINT application_returns_secretary_id_fkey FOREIGN KEY (secretary_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: applications applications_ambassador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.ambassadors(id) ON DELETE CASCADE;


--
-- Name: applications applications_idea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.ideas(id) ON DELETE SET NULL;


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: audit_reports audit_reports_auditor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_reports
    ADD CONSTRAINT audit_reports_auditor_id_fkey FOREIGN KEY (auditor_id) REFERENCES public.auditors(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.media_managers(id) ON DELETE SET NULL;


--
-- Name: blog blog_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog
    ADD CONSTRAINT blog_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_blog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feedback_messages feedback_messages_ambassador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages
    ADD CONSTRAINT feedback_messages_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.ambassadors(id) ON DELETE CASCADE;


--
-- Name: feedback_messages feedback_messages_idea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages
    ADD CONSTRAINT feedback_messages_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.ideas(id) ON DELETE CASCADE;


--
-- Name: feedback_messages feedback_messages_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages
    ADD CONSTRAINT feedback_messages_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: feedback_messages feedback_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages
    ADD CONSTRAINT feedback_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feedback_messages feedback_recipient_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages
    ADD CONSTRAINT feedback_recipient_fk FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: feedback_messages feedback_sender_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_messages
    ADD CONSTRAINT feedback_sender_fk FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: final_jury_decisions final_jury_decisions_jury_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_jury_decisions
    ADD CONSTRAINT final_jury_decisions_jury_member_id_fkey FOREIGN KEY (jury_member_id) REFERENCES public.jury_members(id) ON DELETE CASCADE;


--
-- Name: final_jury_decisions final_jury_decisions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_jury_decisions
    ADD CONSTRAINT final_jury_decisions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: final_jury_decisions final_jury_decisions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.final_jury_decisions
    ADD CONSTRAINT final_jury_decisions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: financial_transactions financial_transactions_treasurer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_treasurer_id_fkey FOREIGN KEY (treasurer_id) REFERENCES public.treasurers(id) ON DELETE SET NULL;


--
-- Name: applications fk_ambassador; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_ambassador FOREIGN KEY (ambassador_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: applications fk_applications_idea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT fk_applications_idea FOREIGN KEY (reference_id) REFERENCES public.ideas(id) ON DELETE CASCADE;


--
-- Name: comments fk_comments_idea; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_comments_idea FOREIGN KEY (idea_id) REFERENCES public.ideas(id) ON DELETE CASCADE;


--
-- Name: comments fk_comments_problem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT fk_comments_problem FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: subscriptions fk_subscriptions_problem; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT fk_subscriptions_problem FOREIGN KEY (problem_id) REFERENCES public.problems(id) ON DELETE CASCADE;


--
-- Name: ambassadors fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ambassadors
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ideas fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ideas ideas_ambassador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT ideas_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.ambassadors(id) ON DELETE SET NULL;


--
-- Name: ideas ideas_secretary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT ideas_secretary_id_fkey FOREIGN KEY (secretary_id) REFERENCES public.secretaries(id);


--
-- Name: ideas ideas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ideas
    ADD CONSTRAINT ideas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: jira_tasks jira_tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jira_tasks
    ADD CONSTRAINT jira_tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jira_tasks jira_tasks_created_by_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jira_tasks
    ADD CONSTRAINT jira_tasks_created_by_pm_id_fkey FOREIGN KEY (created_by_pm_id) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: jira_tasks jira_tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jira_tasks
    ADD CONSTRAINT jira_tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: jury_decisions jury_decisions_agenda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_decisions
    ADD CONSTRAINT jury_decisions_agenda_id_fkey FOREIGN KEY (agenda_id) REFERENCES public.agenda(id) ON DELETE CASCADE;


--
-- Name: jury_decisions jury_decisions_jury_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_decisions
    ADD CONSTRAINT jury_decisions_jury_member_id_fkey FOREIGN KEY (jury_member_id) REFERENCES public.jury_members(id) ON DELETE SET NULL;


--
-- Name: jury_decisions jury_decisions_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_decisions
    ADD CONSTRAINT jury_decisions_pm_id_fkey FOREIGN KEY (pm_id) REFERENCES public.project_managers(id) ON DELETE SET NULL;


--
-- Name: jury_decisions jury_decisions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_decisions
    ADD CONSTRAINT jury_decisions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: jury_decisions jury_decisions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_decisions
    ADD CONSTRAINT jury_decisions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: jury_logs jury_logs_jury_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_logs
    ADD CONSTRAINT jury_logs_jury_member_id_fkey FOREIGN KEY (jury_member_id) REFERENCES public.jury_members(id) ON DELETE CASCADE;


--
-- Name: jury_members jury_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jury_members
    ADD CONSTRAINT jury_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: likes likes_blog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE;


--
-- Name: likes likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: login_attempts login_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: media_files media_files_uploader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.media_managers(id) ON DELETE SET NULL;


--
-- Name: messages messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pm_logs pm_logs_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_logs
    ADD CONSTRAINT pm_logs_pm_id_fkey FOREIGN KEY (pm_id) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: pm_permissions_assignment pm_permissions_assignment_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_permissions_assignment
    ADD CONSTRAINT pm_permissions_assignment_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.pm_permissions(id) ON DELETE CASCADE;


--
-- Name: pm_permissions_assignment pm_permissions_assignment_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_permissions_assignment
    ADD CONSTRAINT pm_permissions_assignment_pm_id_fkey FOREIGN KEY (pm_id) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: problems problems_ambassador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.ambassadors(id) ON DELETE SET NULL;


--
-- Name: problems problems_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_budgets project_budgets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_budgets project_budgets_treasurer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_budgets
    ADD CONSTRAINT project_budgets_treasurer_id_fkey FOREIGN KEY (treasurer_id) REFERENCES public.treasurers(id) ON DELETE SET NULL;


--
-- Name: project_invitations project_invitations_invited_by_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_invited_by_pm_id_fkey FOREIGN KEY (invited_by_pm_id) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: project_invitations project_invitations_invited_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_invitations project_invitations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_invitations
    ADD CONSTRAINT project_invitations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_messages project_messages_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_messages project_messages_recipient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_messages project_messages_sender_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_messages
    ADD CONSTRAINT project_messages_sender_pm_id_fkey FOREIGN KEY (sender_pm_id) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: project_users project_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_users project_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_users
    ADD CONSTRAINT project_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: projects projects_jury_decision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_jury_decision_id_fkey FOREIGN KEY (jury_decision_id) REFERENCES public.jury_decisions(id) ON DELETE SET NULL;


--
-- Name: projects projects_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pm_id_fkey FOREIGN KEY (pm_id) REFERENCES public.project_managers(id) ON DELETE SET NULL;


--
-- Name: secretary_permissions secretary_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_permissions
    ADD CONSTRAINT secretary_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: secretary_permissions secretary_permissions_secretary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretary_permissions
    ADD CONSTRAINT secretary_permissions_secretary_id_fkey FOREIGN KEY (secretary_id) REFERENCES public.secretaries(id) ON DELETE CASCADE;


--
-- Name: selected_ideas selected_ideas_idea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.selected_ideas
    ADD CONSTRAINT selected_ideas_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.ideas(id) ON DELETE CASCADE;


--
-- Name: selected_ideas selected_ideas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.selected_ideas
    ADD CONSTRAINT selected_ideas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_blog_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blog(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_idea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_idea_id_fkey FOREIGN KEY (idea_id) REFERENCES public.ideas(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: supervisor_projects supervisor_projects_assigned_by_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_projects
    ADD CONSTRAINT supervisor_projects_assigned_by_pm_id_fkey FOREIGN KEY (assigned_by_pm_id) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: supervisor_projects supervisor_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_projects
    ADD CONSTRAINT supervisor_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: supervisor_projects supervisor_projects_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supervisor_projects
    ADD CONSTRAINT supervisor_projects_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.supervisors(id) ON DELETE CASCADE;


--
-- Name: task_comments task_comments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.jira_tasks(id) ON DELETE CASCADE;


--
-- Name: task_comments task_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_comments
    ADD CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: task_logs task_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_logs
    ADD CONSTRAINT task_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_created_by_pm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_created_by_pm_id_fkey FOREIGN KEY (created_by_pm_id) REFERENCES public.project_managers(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: user_logs user_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_logs
    ADD CONSTRAINT user_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

