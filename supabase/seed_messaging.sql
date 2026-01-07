-- Insert default messaging settings for venue 1
INSERT INTO messaging_settings (venue_id, whatsapp_verify_token, messenger_verify_token, welcome_message, away_message)
VALUES (
  1,
  'paititi_webhook_verify_2026',
  'paititi_messenger_verify_2026',
  '¡Hola! Bienvenido a Paititi del Mar 🌊 ¿En qué podemos ayudarte hoy?',
  'Gracias por tu mensaje. En este momento estamos fuera del horario de atención. Te responderemos lo antes posible.'
);

-- Insert default message templates
INSERT INTO message_templates (venue_id, name, platform, category, content, variables) VALUES
(1, 'Confirmación de Reserva', 'whatsapp', 'reservation_confirmation', 
 'Hola {{name}}, tu reserva para {{party_size}} personas el {{date}} a las {{time}} ha sido confirmada. ¡Te esperamos en Paititi del Mar! 🌊', 
 '["name", "party_size", "date", "time"]'),

(1, 'Recordatorio 24h', 'whatsapp', 'reminder_24h',
 'Hola {{name}}, te recordamos tu reserva mañana a las {{time}} para {{party_size}} personas. ¡Nos vemos pronto! 🦐',
 '["name", "time", "party_size"]'),

(1, 'Recordatorio 2h', 'whatsapp', 'reminder_2h',
 'Hola {{name}}, tu reserva es en 2 horas ({{time}}). ¡Te esperamos en Paititi del Mar! Si necesitas hacer algún cambio, responde a este mensaje.',
 '["name", "time"]'),

(1, 'Cancelación de Reserva', 'whatsapp', 'reservation_cancelled',
 'Hola {{name}}, tu reserva para {{date}} a las {{time}} ha sido cancelada. Esperamos verte pronto en Paititi del Mar.',
 '["name", "date", "time"]'),

(1, 'Solicitud de Feedback', 'whatsapp', 'feedback_request',
 '¡Gracias por visitarnos {{name}}! Nos encantaría conocer tu opinión. ¿Cómo fue tu experiencia en Paititi del Mar? 🌟',
 '["name"]'),

(1, 'Respuesta Rápida - Horarios', null, 'quick_reply',
 'Nuestro horario de atención es:\n🕐 Lunes a Jueves: 1:00 PM - 10:00 PM\n🕐 Viernes a Domingo: 1:00 PM - 11:00 PM',
 '[]'),

(1, 'Respuesta Rápida - Ubicación', null, 'quick_reply',
 'Estamos ubicados en Av. Costera de las Palmas, Acapulco Diamante, Guerrero. ¡Frente al mar! 🌊',
 '[]'),

(1, 'Respuesta Rápida - Menú', null, 'quick_reply',
 'Puedes ver nuestro menú completo en: https://paititidelmar.com/menu\n\nEspecialidades:\n🦐 Camarones al coco\n🐟 Pescado zarandeado\n🦪 Ostiones frescos\n🍤 Ceviche de camarón',
 '[]'),

(1, 'Messenger - Bienvenida', 'messenger', 'welcome',
 '¡Hola! 👋 Bienvenido a Paititi del Mar, tu restaurante de mariscos en Acapulco Diamante.\n\n¿En qué podemos ayudarte?',
 '[]'),

(1, 'Messenger - Confirmación Reserva', 'messenger', 'reservation_confirmation',
 '✅ ¡Reserva confirmada!\n\n📅 Fecha: {{date}}\n🕐 Hora: {{time}}\n👥 Personas: {{party_size}}\n\n¡Te esperamos en Paititi del Mar!',
 '["date", "time", "party_size"]');
