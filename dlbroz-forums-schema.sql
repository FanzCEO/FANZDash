-- DLBroz Forums & Chat Rooms Schema
-- The Underground Community Hub for FanzDiscreet Brotherhood

-- =====================================================
-- FORUM CATEGORIES (The Dens)
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Lucide icon name
  color VARCHAR(20) DEFAULT '#00ff88', -- Neon accent color
  sort_order INTEGER DEFAULT 0,
  is_nsfw BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  requires_verification BOOLEAN DEFAULT false,
  min_age INTEGER DEFAULT 18,
  post_count INTEGER DEFAULT 0,
  thread_count INTEGER DEFAULT 0,
  last_post_at TIMESTAMP,
  last_post_user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- FORUM THREADS (The Discussions)
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT, -- Rendered markdown
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_alias VARCHAR(50), -- Generated alias for anonymous posts
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP,
  last_reply_user_id UUID,
  tags TEXT[], -- Array of tags
  media_urls TEXT[], -- Attached media
  is_nsfw BOOLEAN DEFAULT false,
  is_spoiler BOOLEAN DEFAULT false,
  poll_id UUID, -- Optional poll
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- FORUM POSTS (The Replies)
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_post_id UUID REFERENCES forum_posts(id), -- For nested replies
  content TEXT NOT NULL,
  content_html TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_alias VARCHAR(50),
  like_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT false, -- Marked as best answer
  media_urls TEXT[],
  mentions UUID[], -- Mentioned user IDs
  reactions JSONB DEFAULT '{}', -- {emoji: [userIds]}
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CHAT ROOMS (The Underground Hangouts)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  room_type VARCHAR(20) DEFAULT 'public', -- public, private, vip, creator
  theme_color VARCHAR(20) DEFAULT '#ff00ff',
  background_url TEXT, -- Custom background
  max_members INTEGER DEFAULT 500,
  member_count INTEGER DEFAULT 0,
  online_count INTEGER DEFAULT 0,
  is_nsfw BOOLEAN DEFAULT false,
  is_slow_mode BOOLEAN DEFAULT false,
  slow_mode_seconds INTEGER DEFAULT 10,
  owner_id UUID NOT NULL,
  moderator_ids UUID[],
  banned_user_ids UUID[],
  muted_user_ids UUID[],
  entry_price_cents INTEGER DEFAULT 0, -- Paid room access
  requires_verification BOOLEAN DEFAULT false,
  auto_delete_hours INTEGER, -- Messages auto-delete after X hours
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CHAT MESSAGES (Real-time Messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, image, video, gif, sticker, tip, system
  content TEXT,
  media_url TEXT,
  reply_to_id UUID REFERENCES chat_messages(id),
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_alias VARCHAR(50),
  reactions JSONB DEFAULT '{}',
  tip_amount_cents INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ROOM MEMBERS (Who's In)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(20) DEFAULT 'member', -- owner, admin, moderator, vip, member
  nickname VARCHAR(50),
  joined_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT false,
  muted_until TIMESTAMP,
  notification_level VARCHAR(20) DEFAULT 'all', -- all, mentions, none
  UNIQUE(room_id, user_id)
);

-- =====================================================
-- POLLS (Interactive Voting)
-- =====================================================
CREATE TABLE IF NOT EXISTS forum_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{id, text, votes}]
  is_multiple_choice BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  ends_at TIMESTAMP,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES forum_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(poll_id, user_id, option_id)
);

-- =====================================================
-- USER REPUTATION (The Clout System)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  title VARCHAR(50) DEFAULT 'Newcomer',
  posts_count INTEGER DEFAULT 0,
  threads_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  likes_given INTEGER DEFAULT 0,
  solutions_count INTEGER DEFAULT 0,
  chat_messages_count INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]', -- [{id, name, icon, earnedAt}]
  achievements JSONB DEFAULT '[]',
  streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- THREAD SUBSCRIPTIONS (Stay Updated)
-- =====================================================
CREATE TABLE IF NOT EXISTS thread_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_level VARCHAR(20) DEFAULT 'all', -- all, replies, none
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(thread_id, user_id)
);

-- =====================================================
-- DEFAULT CATEGORIES (The Underground Dens)
-- =====================================================
INSERT INTO forum_categories (name, slug, description, icon, color, sort_order, is_nsfw) VALUES
('General Discussion', 'general', 'Talk about anything and everything', 'MessageCircle', '#00ff88', 1, false),
('Introductions', 'introductions', 'New here? Say hello to the community', 'UserPlus', '#00d4ff', 2, false),
('Creator Corner', 'creator-corner', 'Tips, tricks, and advice for creators', 'Sparkles', '#ff00ff', 3, false),
('Tech & Gear', 'tech-gear', 'Equipment, software, and tech discussions', 'Cpu', '#ffaa00', 4, false),
('After Dark', 'after-dark', 'NSFW discussions for verified adults only', 'Moon', '#ff0066', 5, true),
('Hookups & Meetups', 'hookups', 'Connect with others in your area', 'MapPin', '#ff3366', 6, true),
('Confessions', 'confessions', 'Anonymous confessions and stories', 'Eye', '#9900ff', 7, true),
('Kinks & Fetishes', 'kinks', 'Explore your interests with like-minded people', 'Flame', '#ff6600', 8, true),
('Marketplace', 'marketplace', 'Buy, sell, trade content and services', 'ShoppingBag', '#00ffcc', 9, false),
('Support & Help', 'support', 'Get help from the community', 'HelpCircle', '#ffffff', 10, false)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DEFAULT CHAT ROOMS (The Hangouts)
-- =====================================================
INSERT INTO chat_rooms (name, slug, description, icon, room_type, theme_color, is_nsfw, owner_id) VALUES
('The Lobby', 'lobby', 'Main hangout for everyone', 'Home', 'public', '#00ff88', false, '00000000-0000-0000-0000-000000000001'),
('Late Night Vibes', 'late-night', 'Chill chat after hours', 'Moon', 'public', '#9900ff', true, '00000000-0000-0000-0000-000000000001'),
('Creator Lounge', 'creator-lounge', 'Exclusive chat for verified creators', 'Crown', 'vip', '#ffaa00', false, '00000000-0000-0000-0000-000000000001'),
('Hookup Central', 'hookup-central', 'Find your next adventure', 'Heart', 'public', '#ff0066', true, '00000000-0000-0000-0000-000000000001'),
('Confessional', 'confessional', 'Share anonymously, no judgment', 'Eye', 'public', '#ff00ff', true, '00000000-0000-0000-0000-000000000001'),
('Tech Talk', 'tech-talk', 'Geek out on gear and software', 'Cpu', '#00d4ff', false, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (slug) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_author ON forum_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);
