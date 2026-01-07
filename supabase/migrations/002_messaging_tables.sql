-- Paititi del Mar - Messaging Integration Schema
-- Migration 002: Tables for WhatsApp and Messenger integrations

-- ============================================================================
-- CONVERSATIONS: Message threads
-- ============================================================================
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('whatsapp', 'messenger')),
  external_id VARCHAR(255) NOT NULL, -- phone number for WhatsApp or PSID for Messenger
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, platform, external_id)
);

CREATE INDEX idx_conversations_venue_status ON conversations(venue_id, status) WHERE status = 'active';
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to) WHERE status = 'active';
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================================================
-- MESSAGES: Individual messages
-- ============================================================================
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  external_id VARCHAR(255), -- message ID from platform
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'bot', 'agent')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- if sent by agent
  content_type VARCHAR(20) DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'document', 'location', 'template')),
  content TEXT,
  metadata JSONB DEFAULT '{}', -- attachments, buttons, etc.
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_external ON messages(platform, external_id);
CREATE INDEX idx_messages_status ON messages(status) WHERE status IN ('pending', 'failed');

-- ============================================================================
-- MESSAGE TEMPLATES: Reusable message templates
-- ============================================================================
CREATE TABLE message_templates (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  platform VARCHAR(20), -- null = all platforms, or specific to 'whatsapp'/'messenger'
  category VARCHAR(50) NOT NULL,
  language VARCHAR(5) DEFAULT 'es',
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- array of variable names like ["name", "date", "time"]
  button_config JSONB DEFAULT '{}', -- for interactive messages
  active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_venue_active ON message_templates(venue_id, active) WHERE active = TRUE;
CREATE INDEX idx_templates_category ON message_templates(category);

-- ============================================================================
-- MESSAGING SETTINGS: Configuration per venue
-- ============================================================================
CREATE TABLE messaging_settings (
  id SERIAL PRIMARY KEY,
  venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE UNIQUE,
  
  -- WhatsApp settings
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_phone VARCHAR(20),
  whatsapp_phone_number_id VARCHAR(255),
  whatsapp_business_account_id VARCHAR(255),
  whatsapp_access_token TEXT,
  whatsapp_verify_token VARCHAR(255),
  
  -- Messenger settings
  messenger_enabled BOOLEAN DEFAULT FALSE,
  messenger_page_id VARCHAR(255),
  messenger_page_access_token TEXT,
  messenger_verify_token VARCHAR(255),
  messenger_app_secret VARCHAR(255),
  
  -- General settings
  auto_reply_enabled BOOLEAN DEFAULT TRUE,
  auto_assign_enabled BOOLEAN DEFAULT TRUE,
  business_hours_only BOOLEAN DEFAULT FALSE,
  welcome_message TEXT,
  away_message TEXT,
  
  -- AI settings (optional)
  ai_enabled BOOLEAN DEFAULT FALSE,
  ai_model VARCHAR(50) DEFAULT 'gpt-4',
  ai_temperature NUMERIC DEFAULT 0.7,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONVERSATION NOTES: Internal notes about conversations
-- ============================================================================
CREATE TABLE conversation_notes (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_conversation ON conversation_notes(conversation_id, created_at DESC);

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON message_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON messaging_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRIGGERS: Auto-update conversation on new message
-- ============================================================================
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        unread_count = CASE 
            WHEN NEW.direction = 'inbound' THEN unread_count + 1
            ELSE unread_count
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_after_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_notes ENABLE ROW LEVEL SECURITY;

-- Staff can view all conversations for their venue
CREATE POLICY "Staff can view conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE staff_profiles.user_id = auth.uid()
      AND staff_profiles.venue_id = conversations.venue_id
    )
  );

CREATE POLICY "Staff can manage conversations" ON conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE staff_profiles.user_id = auth.uid()
      AND staff_profiles.venue_id = conversations.venue_id
    )
  );

-- Messages follow conversation permissions
CREATE POLICY "Staff can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN staff_profiles sp ON sp.venue_id = c.venue_id
      WHERE c.id = messages.conversation_id
      AND sp.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can create messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN staff_profiles sp ON sp.venue_id = c.venue_id
      WHERE c.id = conversation_id
      AND sp.user_id = auth.uid()
    )
  );

-- Templates, settings, and notes follow similar patterns
CREATE POLICY "Staff can manage templates" ON message_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE staff_profiles.user_id = auth.uid()
      AND staff_profiles.venue_id = message_templates.venue_id
    )
  );

CREATE POLICY "Staff can manage settings" ON messaging_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM staff_profiles
      WHERE staff_profiles.user_id = auth.uid()
      AND staff_profiles.venue_id = messaging_settings.venue_id
    )
  );

CREATE POLICY "Staff can manage notes" ON conversation_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN staff_profiles sp ON sp.venue_id = c.venue_id
      WHERE c.id = conversation_notes.conversation_id
      AND sp.user_id = auth.uid()
    )
  );
