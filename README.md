# 🌊 Paititi del Mar - Sistema de Reservas con Automatización WhatsApp

Sistema completo de reservaciones para restaurante con automatización inteligente de WhatsApp, gestión de mesas 2D, walk-ins y panel administrativo.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![WPPConnect](https://img.shields.io/badge/WPPConnect-Free-brightgreen)

---

## ✨ Características Principales

### 🎯 Para Clientes
- ✅ **Reservas Online** - Sistema de reservas en tiempo real con verificación de disponibilidad
- ✅ **WhatsApp Bot** - Reservas automáticas por WhatsApp (100% gratis con WPPConnect)
- ✅ **Mensajes Interactivos** - Botones, menús, ubicación automática
- ✅ **Confirmaciones Instantáneas** - Confirmación y ID de reserva al instante
- ✅ **Consulta de Reservas** - Ver, modificar o cancelar reservas por WhatsApp
- ✅ **Responsive** - Funciona perfecto en móvil, tablet y desktop

### 👨‍💼 Para Administradores
- ✅ **Panel Administrativo** - Dashboard completo con métricas en tiempo real
- ✅ **Gestión de Reservas** - Crear, editar, cancelar y filtrar reservas
- ✅ **Mapa de Mesas 2D** - Editor visual drag & drop con estado en tiempo real
- ✅ **Walk-ins** - Gestión de clientes sin reserva
- ✅ **Chat de Mensajería** - Ver y responder conversaciones de WhatsApp/Messenger
- ✅ **Bloqueos de Horario** - Cerrar fechas/horas específicas
- ✅ **Configuración** - Horarios, capacidad, tiempos de reserva

### 🤖 Automatización Inteligente
- ✅ **Bot de WhatsApp** - Responde automáticamente 24/7
- ✅ **Detección de Intención** - Entiende lenguaje natural
- ✅ **Creación Automática** - Extrae fecha, hora y personas del mensaje
- ✅ **Verificación de Disponibilidad** - Consulta en tiempo real
- ✅ **Sin Costos de API** - Usa WPPConnect (código abierto y gratis)

---

## 🚀 Instalación Rápida (5 minutos)

### Requisitos Previos
- Node.js 18+ ([Descargar](https://nodejs.org/))
- Cuenta de Supabase ([Crear gratis](https://supabase.com))
- Git
- Número de WhatsApp (puede ser personal)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Luexi/PAITITI.git
cd PAITITI
npm install
```

### Paso 2: Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Espera 2-3 minutos a que se inicialice

2. **Ejecutar migraciones:**
   - Ve a tu proyecto → SQL Editor
   - Copia y ejecuta: `supabase/migrations/001_initial_schema.sql`
   - Copia y ejecuta: `supabase/migrations/002_messaging_tables.sql`
   - Copia y ejecuta: `supabase/seed.sql` (datos de ejemplo)
   - Copia y ejecuta: `supabase/seed_messaging.sql` (opcional)

3. **Obtener credenciales:**
   - Ve a Settings → API
   - Copia `Project URL` y `anon/public key`

### Paso 3: Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```bash
# Supabase (OBLIGATORIO)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aquí
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aquí

# Venue ID (por defecto 1)
NEXT_PUBLIC_VENUE_ID=1

# WhatsApp - WPPConnect (NO necesita configuración adicional)
# La conexión se hace escaneando QR code en /admin/whatsapp

# Messenger (OPCIONAL - solo si quieres Facebook Messenger)
MESSENGER_PAGE_ACCESS_TOKEN=tu_token_aquí
MESSENGER_VERIFY_TOKEN=tu_verify_token_aquí
MESSENGER_APP_SECRET=tu_app_secret_aquí
```

### Paso 4: Crear Usuario Administrador

En Supabase SQL Editor:

```sql
-- Primero crea un usuario en Authentication → Users
-- Luego ejecuta esto con el UUID del usuario:

INSERT INTO staff_profiles (user_id, venue_id, role)
VALUES ('tu_user_uuid_aquí', 1, 'owner');
```

### Paso 5: Iniciar el Servidor

```bash
npm run dev
```

**¡Listo!** Abre http://localhost:3000

---

## 📱 Configurar WhatsApp en 3 Pasos

### 1. Acceder al Panel de WhatsApp

```
http://localhost:3000/admin/whatsapp
```

### 2. Escanear QR Code

1. En la pantalla aparecerá un código QR
2. Abre WhatsApp en tu teléfono
3. Ve a **Configuración** → **Dispositivos vinculados**
4. Toca **"Vincular un dispositivo"**
5. Escanea el código QR

### 3. ¡Ya está!

- ✅ Estado cambiará a "Connected"
- ✅ Ya puedes recibir mensajes
- ✅ El bot responderá automáticamente

**Documentación completa:** [docs/wppconnect-setup.md](docs/wppconnect-setup.md)

---

## 🗂️ Estructura del Proyecto

```
PAITITI/
├── app/
│   ├── page.tsx                 # Home page
│   ├── menu/                    # Página del menú
│   ├── galeria/                 # Galería de fotos
│   ├── contacto/                # Página de contacto
│   ├── reservar/                # Sistema de reservas online
│   ├── admin/
│   │   ├── page.tsx             # Dashboard con métricas
│   │   ├── reservas/            # Gestión de reservas (CRUD)
│   │   ├── mesas/               # Editor de mesas 2D
│   │   ├── walkins/             # Gestión de walk-ins
│   │   ├── mensajes/            # Chat de WhatsApp/Messenger
│   │   ├── whatsapp/            # Conexión WhatsApp (QR code)
│   │   ├── bloqueos/            # Bloquear fechas/horas
│   │   └── configuracion/       # Configuración general
│   └── api/
│       ├── availability/        # Check disponibilidad
│       ├── reservations/        # CRUD reservas
│       ├── whatsapp/            # WPPConnect endpoints
│       └── webhooks/            # Webhooks Messenger
├── components/
│   ├── layout/                  # Header, Footer
│   └── admin/
│       ├── TableMap.tsx         # Mapa 2D de mesas
│       ├── TableEditor.tsx      # Editor de mesas
│       └── WalkinCard.tsx       # Tarjeta de walk-in
├── lib/
│   ├── supabase/                # Cliente Supabase
│   ├── whatsapp/
│   │   ├── wppconnect-client.ts    # Cliente WPPConnect
│   │   ├── message-handler.ts      # Bot de WhatsApp
│   │   └── client.ts                # (Antiguo - Meta API)
│   └── messenger/
│       ├── client.ts            # Cliente Messenger
│       └── message-handler.ts   # Bot de Messenger
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql       # Schema principal
│   │   └── 002_messaging_tables.sql     # Tablas de mensajería
│   ├── seed.sql                 # Datos de ejemplo
│   └── seed_messaging.sql       # Datos de mensajes
└── docs/
    ├── wppconnect-setup.md      # Guía WPPConnect
    └── whatsapp-setup.md        # Guía Meta API (deprecated)
```

---

## 🎨 Funcionalidades Detalladas

### 1. Sistema de Reservas Online

**Características:**
- Calendario interactivo con días disponibles
- Selección de hora con verificación en tiempo real
- Validación de capacidad (1-20 personas)
- Formulario con validación de teléfono y email
- Confirmación instantánea con ID de reserva

**Tecnología:**
- React Hook Form + Zod validation
- date-fns para manejo de fechas
- Supabase Realtime para disponibilidad

### 2. Bot de WhatsApp Inteligente

**Comandos que entiende:**

| Cliente escribe | Bot responde |
|----------------|--------------|
| "Hola" | Menú de bienvenida con botones |
| "Reservar" / "Mesa" | Solicita detalles de reserva |
| "Para 4 personas mañana a las 7 PM" | Crea la reserva automáticamente |
| "Menú" | Muestra platillos y precios |
| "Horario" | Muestra horarios del restaurante |
| "Ubicación" / "Dirección" | Envía ubicación en mapa |
| "Ver mi reserva" | Muestra reservas activas |
| "Cancelar reserva #123" | Cancela la reserva |

**Personalización:**
- Edita `lib/whatsapp/message-handler.ts`
- Agrega nuevos intents y respuestas
- Personaliza plantillas de mensajes

### 3. Editor de Mesas 2D

**Funcionalidades:**
- Drag & drop para mover mesas
- Redimensionar mesas (ancho/alto)
- Rotar mesas (0°, 90°, 180°, 270°)
- 3 formas: cuadrada, rectangular, redonda
- Grid ajustable para alineación
- Modo edición ON/OFF
- Estado en tiempo real (disponible/ocupada/reservada)
- Guardar layout

**Uso:**
1. Activa "Modo Edición"
2. Arrastra mesas para moverlas
3. Click en mesa → "Editar" para cambiar propiedades
4. Click "Guardar Layout" cuando termines

### 4. Panel Administrativo

**Dashboard:**
- 📊 Reservas hoy/semana/mes
- 📈 Gráficas de ocupación
- 🔔 Notificaciones de nuevas reservas
- 📱 Mensajes sin leer
- 🚶 Walk-ins activos

**Gestión de Reservas:**
- Vista de lista con filtros (fecha, estado, fuente)
- Búsqueda por nombre/teléfono
- Crear reserva manual
- Editar detalles de reserva
- Cambiar estado (confirmada/pendiente/cancelada/completada)
- Asignar mesa
- Notas internas

**Walk-ins:**
- Crear walk-in rápido
- Asignar mesa directamente
- Timer de tiempo de espera
- Notificar cuando mesa esté lista

### 5. Sistema de Mensajería

**Características:**
- Vista de todas las conversaciones (WhatsApp + Messenger)
- Lista de conversaciones con último mensaje
- Chat en tiempo real
- Marcar como leído
- Responder directamente desde admin
- Filtrar por plataforma
- Estados de mensaje (enviado/entregado/leído)

---

## 🔧 Personalización

### Cambiar Nombre del Restaurante

**1. Variables de entorno:**
```bash
# .env.local
NEXT_PUBLIC_VENUE_NAME="Tu Restaurante"
```

**2. Base de datos:**
```sql
UPDATE venues SET name = 'Tu Restaurante' WHERE id = 1;
```

**3. Archivos:**
- `app/layout.tsx` - Título y metadatos
- `components/layout/Header.tsx` - Nombre en header
- `components/layout/Footer.tsx` - Copyright

### Cambiar Colores del Tema

Edita `tailwind.config.ts`:

```typescript
colors: {
  ocean: {
    50: '#tu-color-aquí',
    100: '#...',
    // ... más tonos
  },
}
```

### Agregar Nuevos Comandos al Bot

Edita `lib/whatsapp/message-handler.ts`:

```typescript
// 1. Detectar intent
function detectIntent(content: string): string {
  if (/promocion|oferta|descuento/i.test(content)) {
    return 'promotion_inquiry';
  }
}

// 2. Manejar intent
async function handlePromotionInquiry(conversationId, phoneNumber) {
  const message = `🎉 Promociones de la semana:\n...`;
  await sendTextMessage(phoneNumber, message);
}

// 3. Agregar al switch
switch (intent) {
  case 'promotion_inquiry':
    await handlePromotionInquiry(conversationId, phoneNumber);
    break;
}
```

### Cambiar Horarios del Restaurante

**Admin panel:**
1. Ve a `/admin/configuracion`
2. Edita horarios por día
3. Guarda cambios

**Base de datos directa:**
```sql
UPDATE opening_hours
SET open_time = '13:00', close_time = '22:00'
WHERE venue_id = 1 AND day_of_week = 1; -- Lunes
```

---

## 🌐 Despliegue en Producción

### Opción 1: Vercel (Frontend) + VPS (WhatsApp Bot)

**Frontend en Vercel:**
```bash
npm install -g vercel
vercel login
vercel
# Configura variables de entorno en Vercel Dashboard
```

**Bot de WhatsApp en VPS:**
```bash
# En tu VPS (DigitalOcean, AWS, etc.)
git clone https://github.com/Luexi/PAITITI.git
cd PAITITI
npm install
npm run build

# Usar PM2 para mantener corriendo
npm install -g pm2
pm2 start npm --name "paititi-bot" -- start
pm2 save
pm2 startup
```

**⚠️ Importante:** WPPConnect necesita un servidor que esté corriendo 24/7. Vercel usa funciones serverless que se apagan, por lo que el bot de WhatsApp debe estar en un VPS aparte.

### Opción 2: VPS Completo (Railway, Render, DigitalOcean)

```bash
# Todo en un servidor
git clone https://github.com/Luexi/PAITITI.git
cd PAITITI
npm install
npm run build

# Variables de entorno
cp .env.example .env.local
nano .env.local

# Iniciar con PM2
pm2 start npm --name "paititi" -- start
pm2 save
pm2 startup
```

### Configurar Dominio

**Vercel:**
1. Ve a Settings → Domains
2. Agrega tu dominio: `restaurante.com`
3. Configura DNS según instrucciones

**VPS:**
```bash
# Nginx config
server {
    server_name restaurante.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Certbot para SSL
sudo certbot --nginx -d restaurante.com
```

---

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

```sql
-- Clientes solo pueden crear reservas
CREATE POLICY "Public can insert reservations"
ON reservations FOR INSERT
TO anon WITH CHECK (true);

-- Solo staff autenticado puede ver todo
CREATE POLICY "Staff can view all"
ON reservations FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM staff_profiles
  WHERE user_id = auth.uid()
));
```

### Variables de Entorno

**NUNCA subas al repositorio:**
- `.env.local` (está en `.gitignore`)
- Tokens de WhatsApp/Messenger
- Service role key de Supabase

### Sesiones de WhatsApp

WPPConnect guarda sesiones en `tokens/` (ya está en `.gitignore`).

**Backup de sesión:**
```bash
cp -r tokens/ backup-tokens/
```

---

## 🐛 Solución de Problemas

### WhatsApp no conecta

**Problema:** QR code no aparece
```bash
# Revisar logs
npm run dev
# Busca errores en consola
```

**Solución:**
1. Reinicia el servidor
2. Click en "Reiniciar" en `/admin/whatsapp`
3. Limpia cache del navegador
4. Verifica que `@wppconnect-team/wppconnect` esté instalado

**Problema:** Se desconecta constantemente
- Asegura que el servidor no se suspenda
- Usa PM2 en producción: `pm2 start npm -- start`
- Verifica RAM disponible (mín. 512MB)

### Errores de Base de Datos

**Problema:** "relation does not exist"
```bash
# Ejecuta las migraciones en orden
001_initial_schema.sql
002_messaging_tables.sql
```

**Problema:** Permission denied
```bash
# Verifica RLS policies
SELECT * FROM staff_profiles WHERE user_id = auth.uid();
```

### Reservas no se crean

**Problema:** Disponibilidad siempre dice "no hay"
```sql
-- Verifica opening_hours
SELECT * FROM opening_hours WHERE venue_id = 1;

-- Verifica blocks
SELECT * FROM blocks WHERE venue_id = 1;
```

---

## 📚 Documentación Adicional

- **[Guía de WPPConnect](docs/wppconnect-setup.md)** - Configuración detallada de WhatsApp
- **[API de Meta (deprecated)](docs/whatsapp-setup.md)** - API oficial (ya no se usa)
- **[Supabase Docs](https://supabase.com/docs)** - Documentación de Supabase
- **[Next.js Docs](https://nextjs.org/docs)** - Documentación de Next.js

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Framework** | Next.js | 15.1 |
| **Lenguaje** | TypeScript | 5.7 |
| **Styling** | Tailwind CSS | 3.4 |
| **Base de Datos** | Supabase (PostgreSQL) | Latest |
| **Auth** | Supabase Auth | Latest |
| **WhatsApp** | WPPConnect | Latest |
| **Validación** | Zod | 3.x |
| **Formularios** | React Hook Form | 7.x |
| **Fechas** | date-fns | 4.x |
| **Iconos** | Lucide React | Latest |
| **Realtime** | Supabase Realtime | Latest |

---

## 📊 Características Técnicas

- ✅ **Multi-tenant** - Soporta múltiples restaurantes
- ✅ **Real-time** - Actualizaciones en vivo con Supabase
- ✅ **Responsive** - Mobile-first design
- ✅ **SEO Optimizado** - Metadatos y sitemap
- ✅ **TypeScript** - 100% type-safe
- ✅ **RLS** - Row Level Security habilitado
- ✅ **API REST** - Endpoints bien estructurados
- ✅ **Serverless** - Funciones Edge de Vercel
- ✅ **Audit Trail** - Log de todos los cambios

---

## 🤝 Contribuir

Este es un proyecto privado para Paititi del Mar. Para sugerencias o reportar bugs, contacta al equipo de desarrollo.

---

## 📄 Licencia

Propietario - Paititi del Mar © 2026

---

## 🎉 ¡Gracias por usar Paititi del Mar!

Si tienes preguntas o necesitas ayuda, no dudes en contactarnos.

**Características próximamente:**
- 📧 Confirmaciones por email
- 📅 Google Calendar sync
- 📱 App móvil nativa
- 💳 Prepago de reservas
- ⭐ Sistema de reseñas
- 📊 Analytics avanzados

---

**Desarrollado con ❤️ para Paititi del Mar**
