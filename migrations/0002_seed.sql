INSERT OR IGNORE INTO site_profiles (
  id, site_name, site_url, description, tagline, niche,
  primary_monetization, module_local_seo, module_affiliate, module_multisite
) VALUES (
  1,
  'Satuska',
  'https://gushdesign.com',
  'Home improvement blog engine for practical guides, decor inspiration, and guest-post monetization.',
  'Practical home improvement ideas, room guides, and publish-ready editorial workflows.',
  'Home improvement',
  'guest_post',
  0,
  1,
  1
);

INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
(1, 'Room Guides', 'room-guides', 'Room-by-room improvement and styling advice.'),
(2, 'Renovation Tips', 'renovation-tips', 'Practical renovation and upgrade guidance.'),
(3, 'Decor & Styling', 'decor-styling', 'Visual refresh, decor choices, and finishing ideas.'),
(4, 'Buying Guides', 'buying-guides', 'Commercial-intent and comparison content.');

INSERT OR IGNORE INTO posts (
  id, title, slug, excerpt, content, category, status, intent, monetization, featured,
  seo_title, seo_description, tags, read_time, published_at, updated_at
) VALUES
(1, 'Small Kitchen Makeover Ideas That Feel Expensive Without Blowing the Budget', 'small-kitchen-makeover-ideas-budget', 'Layout, lighting, hardware, and storage upgrades that make a compact kitchen look cleaner, brighter, and more premium.', '# Small Kitchen Makeover Ideas That Feel Expensive Without Blowing the Budget', 'Room Guides', 'published', 'informational', 'editorial', 1, 'Small Kitchen Makeover Ideas on a Budget', 'Affordable small kitchen makeover ideas covering lighting, storage, hardware, and finish choices that look more premium.', 'small kitchen,makeover ideas,budget remodel', '7 min read', '2026-06-18', '2026-06-24'),
(2, 'Living Room Lighting Upgrades That Instantly Improve Mood and Function', 'living-room-lighting-upgrades', 'A layered lighting plan for living rooms that need to feel warmer, more flexible, and better for real evening use.', '# Living Room Lighting Upgrades That Instantly Improve Mood and Function', 'Decor & Styling', 'published', 'informational', 'editorial', 1, 'Living Room Lighting Upgrades for Better Mood and Function', 'Learn how to layer ambient, task, and accent lighting in a living room so it feels warmer and works better every day.', 'living room,lighting,interior styling', '6 min read', '2026-06-20', '2026-06-24'),
(3, 'Best Peel-and-Stick Backsplash Options for Renters and Quick Refresh Projects', 'best-peel-and-stick-backsplash-options', 'A commercial-intent roundup for people who want a faster backsplash refresh without committing to a full tile install.', '# Best Peel-and-Stick Backsplash Options for Renters and Quick Refresh Projects', 'Buying Guides', 'published', 'commercial', 'affiliate', 1, 'Best Peel-and-Stick Backsplash Options', 'Compare peel-and-stick backsplash options for kitchens and rentals, including finish quality, durability, and installation tradeoffs.', 'backsplash,renters,buying guide', '8 min read', '2026-06-22', '2026-06-24'),
(4, 'How to Pitch a Home Improvement Guest Post That Actually Fits the Site', 'how-to-pitch-home-improvement-guest-post', 'Editorial rules for contributors: topical fit, angle quality, commercial boundaries, and what makes a post publishable.', '# How to Pitch a Home Improvement Guest Post That Actually Fits the Site', 'Renovation Tips', 'published', 'informational', 'guest_post', 0, 'How to Pitch a Home Improvement Guest Post', 'Editorial rules for home-improvement guest posts: topical fit, useful angles, contributor expectations, and monetization boundaries.', 'guest post,editorial process,home improvement blog', '5 min read', '2026-06-24', '2026-06-24');
