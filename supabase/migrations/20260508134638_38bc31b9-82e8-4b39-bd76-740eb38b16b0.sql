
-- Notify signer when a new signature request is created
CREATE OR REPLACE FUNCTION public.notify_signature_request_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.signer_user_id IS NOT NULL THEN
    INSERT INTO public.user_notifications (user_id, cabinet_id, type, severity, title, body, action_path)
    VALUES (
      NEW.signer_user_id, NEW.cabinet_id, 'signature_pending', 'warning',
      'Документ очікує вашого підпису',
      'Тип: ' || NEW.document_kind || (CASE WHEN NEW.is_auto_sign THEN ' (авто-підпис)' ELSE '' END),
      '/signing/' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_signature_request ON public.signature_requests;
CREATE TRIGGER trg_notify_signature_request
AFTER INSERT ON public.signature_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_signature_request_created();

-- Notify both parties when delegation contract goes pending_sign
CREATE OR REPLACE FUNCTION public.notify_delegation_contract_pending()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'pending_sign' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'pending_sign') THEN
    INSERT INTO public.user_notifications (user_id, cabinet_id, type, severity, title, body, action_path)
    VALUES
      (NEW.cabinet_owner_user_id, NEW.cabinet_id, 'contract_pending_sign', 'warning',
       'Договір делегування потребує підпису',
       'Підпишіть договір з делегатом, щоб активувати доступ.',
       '/cabinet/' || NEW.cabinet_id || '/settings?tab=delegation&contract=' || NEW.id),
      (NEW.delegate_user_id, NEW.cabinet_id, 'contract_pending_sign', 'warning',
       'Договір делегування потребує підпису',
       'Підпишіть договір з власником кабінету, щоб отримати доступ.',
       '/contracts/' || NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_contract_pending ON public.delegation_contracts;
CREATE TRIGGER trg_notify_contract_pending
AFTER INSERT OR UPDATE OF status ON public.delegation_contracts
FOR EACH ROW EXECUTE FUNCTION public.notify_delegation_contract_pending();

-- Notify delegate when direct delegation is revoked
CREATE OR REPLACE FUNCTION public.notify_direct_delegation_revoked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('revoked','ended') AND OLD.status = 'active' THEN
    INSERT INTO public.user_notifications (user_id, cabinet_id, type, severity, title, body, action_path)
    VALUES (
      NEW.delegate_user_id, NEW.cabinet_id, 'delegation_revoked', 'warning',
      'Доступ до кабінету відкликано',
      'Власник кабінету відкликав вашу делегацію. Доступ припинено.',
      '/me/overview'
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_direct_revoked ON public.direct_delegations;
CREATE TRIGGER trg_notify_direct_revoked
AFTER UPDATE OF status ON public.direct_delegations
FOR EACH ROW EXECUTE FUNCTION public.notify_direct_delegation_revoked();

-- Notify partner when partner_client_link is ended
CREATE OR REPLACE FUNCTION public.notify_partner_link_ended()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status = 'active' THEN
    INSERT INTO public.user_notifications (user_id, cabinet_id, type, severity, title, body, action_path)
    VALUES (
      NEW.partner_user_id, NEW.cabinet_id, 'partner_link_ended', 'warning',
      'Договір з клієнтом припинено',
      'Клієнт відкликав договір. Усі ваші співробітники втратили доступ до кабінету.',
      '/partner/clients'
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_partner_link_ended ON public.partner_client_links;
CREATE TRIGGER trg_notify_partner_link_ended
AFTER UPDATE OF status ON public.partner_client_links
FOR EACH ROW EXECUTE FUNCTION public.notify_partner_link_ended();

-- Notify employee when partner_employee_assignment is revoked
CREATE OR REPLACE FUNCTION public.notify_employee_assignment_revoked()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('revoked','ended') AND OLD.status = 'active' THEN
    INSERT INTO public.user_notifications (user_id, type, severity, title, body, action_path)
    VALUES (
      NEW.employee_user_id, 'employee_access_revoked', 'warning',
      'Доступ до клієнта відкликано',
      'Ваш доступ до кабінету клієнта припинено.',
      '/partner/clients'
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_employee_revoked ON public.partner_employee_assignments;
CREATE TRIGGER trg_notify_employee_revoked
AFTER UPDATE OF status ON public.partner_employee_assignments
FOR EACH ROW EXECUTE FUNCTION public.notify_employee_assignment_revoked();

-- Notify wallet owner on low balance crossing
CREATE OR REPLACE FUNCTION public.notify_low_credit_balance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _user_id uuid; _members uuid[];
BEGIN
  IF NEW.balance_credits < NEW.low_balance_threshold
     AND OLD.balance_credits >= NEW.low_balance_threshold THEN
    IF NEW.owner_type IN ('user','partner_company') THEN
      BEGIN _user_id := NEW.owner_id::uuid; EXCEPTION WHEN others THEN _user_id := NULL; END;
      IF _user_id IS NOT NULL THEN
        INSERT INTO public.user_notifications (user_id, type, severity, title, body, action_path)
        VALUES (_user_id, 'credits_low', 'warning',
          'Низький баланс AI-кредитів',
          'Залишилось ' || NEW.balance_credits::text || ' кредитів. Поповніть баланс, щоб AI-операції не зупинились.',
          '/top-up');
      END IF;
    ELSIF NEW.owner_type = 'cabinet' THEN
      SELECT array_agg(user_id) INTO _members FROM public.cabinet_members
        WHERE cabinet_id = NEW.owner_id AND role IN ('owner','admin') AND status='active';
      IF _members IS NOT NULL THEN
        INSERT INTO public.user_notifications (user_id, cabinet_id, type, severity, title, body, action_path)
        SELECT u, NEW.owner_id, 'credits_low', 'warning',
          'Низький баланс AI-кредитів кабінету',
          'Залишилось ' || NEW.balance_credits::text || ' кредитів.',
          '/top-up'
        FROM unnest(_members) AS u;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_low_balance ON public.ai_credit_wallets;
CREATE TRIGGER trg_notify_low_balance
AFTER UPDATE OF balance_credits ON public.ai_credit_wallets
FOR EACH ROW EXECUTE FUNCTION public.notify_low_credit_balance();
