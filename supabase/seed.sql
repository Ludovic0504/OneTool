-- Exemple de données de test (seed)

insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'OneTool Test Organization');

insert into public.profiles (user_id, organization_id, full_name)
values ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Jean Limonta');

insert into public.companies (id, organization_id, name, domain)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Piscines Bleues', 'piscinesbleues.fr'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Jardin Pro', 'jardinpro.fr');

insert into public.contacts (id, organization_id, company_id, first_name, last_name, email)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Luc', 'Martin', 'luc@piscinesbleues.fr'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Emma', 'Durand', 'emma@jardinpro.fr');

insert into public.deals (id, organization_id, company_id, title, amount, stage)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Contrat entretien piscine', 3500, 'qualified');
