-- Brainjar Media — seed data
-- All 33 clients scraped from the live portfolio page, with the exact slugs the
-- 301 map in next.config.ts points at. Categories match the four columns on the
-- old /brainjar-media-portfolio/ page.
--
-- Taglines and summaries are BLANK on purpose. Fill them in via /admin (or edit
-- and re-run this file). Nothing 404s in the meantime — the card renders the
-- client name and services, and hides the tagline/stat row when empty.
--
-- Run AFTER schema.sql.

insert into public.clients (slug, name, category, is_featured, sort_order) values
  -- CORPORATIONS
  ('tikipets',                            'Tiki Pets',                            'corporation',    true,  1),
  ('bird-gard',                           'Bird Gard',                            'corporation',    false, 10),
  ('sasquatch-coffee',                    'The Sasquatch Coffee Company',         'corporation',    false, 11),
  ('best-solar-oregon',                   'Best Solar Oregon',                    'corporation',    false, 12),
  ('health-plans-in-oregon',              'Health Plans in Oregon',               'corporation',    false, 13),
  ('stonebridge-mortgage-group',          'Stonebridge Mortgage Group',           'corporation',    false, 14),
  ('presage-consulting',                  'Presage Consulting & Training',        'corporation',    false, 15),
  ('t-sleeve',                            'T-Sleeve',                             'corporation',    false, 16),
  ('zipline-x',                           'Zipline X',                            'corporation',    false, 17),

  -- ORGANIZATIONS
  ('also',                                'ALSO',                                 'organization',   false, 20),
  ('west-columbia-gorge-chamber-of-commerce','West Columbia Gorge Chamber of Commerce','organization', false, 21),
  ('midway-business-association',         'Midway Business Association',          'organization',   false, 22),
  ('gresham-center-for-the-arts',         'Gresham Center for the Arts',          'organization',   false, 23),
  ('little-genius-montessori',            'Little Genius Montessori',             'organization',   false, 24),
  ('hood-gorge',                          'Hood Gorge',                           'organization',   false, 25),
  ('student-crossword-puzzles',           'Student Crossword Puzzles',            'organization',   false, 26),

  -- LOCAL BUSINESS
  ('all-about-automotive',                'All About Automotive',                 'local-business', false, 30),
  ('brainwave-computers',                 'Brainwave Computers',                  'local-business', false, 31),
  ('skyland-pub',                         'Skyland Pub',                          'local-business', false, 32),
  ('the-hoppy-brewer',                    'The Hoppy Brewer',                     'local-business', false, 33),
  ('cafe-delirium',                       'Cafe Delirium',                        'local-business', false, 34),
  ('frenzi-frozen-yogurt',                'Frenzi Frozen Yogurt',                 'local-business', false, 35),
  ('cindys-window-fashions',              'Cindy''s Window Fashions',              'local-business', false, 36),
  ('roedel-tile',                         'Roedel Tile',                          'local-business', false, 37),
  ('laser-smooth-company',                'Laser Smooth Company',                 'local-business', false, 38),
  ('mr-geek',                             'Mr. Geek',                             'local-business', false, 39),
  ('wildwoods-pest-control',              'Wildwoods Pest Control',               'local-business', false, 40),
  ('dr-della-parker',                     'Dr. Della Parker',                     'local-business', false, 41),
  ('bend-kitty-lodge',                    'Bend Kitty Lodge',                     'local-business', false, 42),
  ('retro-hypno',                         'Retro Hypno',                          'local-business', false, 43),
  ('ron-morehead',                        'Ron Morehead',                         'local-business', false, 44),
  ('paesano-bocce-club',                  'Paesano Bocce Club',                   'local-business', false, 45),

  -- PUBLIC EVENTS
  ('jim-neill-golf-tournament',           'Jim Neill Golf Tournament',            'public-event',   false, 50),
  ('springwater-half-marathon',           'Springwater Half Marathon',            'public-event',   false, 51),
  ('sand-in-the-city',                    'Sand in the City',                     'public-event',   false, 52)
on conflict (slug) do nothing;

-- A project row for every client, so /work/{slug} resolves for all 33 old URLs
-- from day one. Services default to {} — set them in /admin and the filter chips
-- start working.
insert into public.projects (client_id, slug, title, is_published)
select c.id, c.slug, c.name, true
from public.clients c
on conflict (slug) do nothing;

-- The featured case study on the home page. This is the one the old site
-- already led with, so the copy is real.
update public.projects p
set
  services = '{web,seo}',
  tagline  = 'Nutrition data, findable in seconds.',
  summary  = 'Petropics is the national leader in gourmet pet food. Brainjar was tasked with building a site that made dense nutritional information easy to navigate.',
  year     = 2017
from public.clients c
where c.id = p.client_id and c.slug = 'tikipets';

-- Example of how a stat chip works. Delete this row, or add three more.
-- insert into public.project_stats (project_id, value, label, is_headline)
-- select id, '+212%', 'ORGANIC TRAFFIC', true from public.projects where slug = 'tikipets';

-- One blog post so /blog isn't an empty room on launch day.
insert into public.posts (slug, title, excerpt, body, is_published, published_at) values
  ('a-new-shelf',
   'A new shelf',
   'After fifteen years, Brainjar has a new website. Here is what changed and why.',
   E'The old site served us well for fifteen years. It also loaded slowly, was hard to update, and buried the work.\n\nThe new one puts the portfolio first.',
   true, now())
on conflict (slug) do nothing;
