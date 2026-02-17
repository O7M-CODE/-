-- Insert an initial activation code so the first user can sign up
INSERT INTO public.activation_codes (code, is_used)
VALUES ('ADMIN2026', false)
ON CONFLICT DO NOTHING;
