# Guía de Configuración: WPPConnect (WhatsApp Open Source)

Esta guía te llevará paso a paso para configurar WPPConnect, la alternativa gratuita y de código abierto a la API oficial de Meta.

## 🎯 ¿Qué es WPPConnect?

WPPConnect es una biblioteca de Node.js que permite automatizar WhatsApp mediante WhatsApp Web. Es completamente **gratuito** y **sin límites de mensajes**.

### ✅ Ventajas
- 💰 **100% gratuito** - Sin costos mensuales ni por mensaje
- 🚀 **Sin aprobación necesaria** - No necesitas verificación de Meta
- 🔓 **Código abierto** - Totalmente auditable y personalizable
- 📱 **Todas las funciones** - Acceso completo a WhatsApp Web
- ⚡ **Rápido de implementar** - Solo escanea un QR y listo

### ⚠️ Consideraciones
- No es una API oficial de Meta (usa WhatsApp Web)
- Requiere que el servidor esté corriendo 24/7
- WhatsApp puede actualizar su interfaz web (requiere actualización ocasional)
- Riesgo teórico de baneo si WhatsApp detecta automatización excesiva

---

## 📋 Requisitos Previos

✅ Número de teléfono con WhatsApp activo (puede ser tu número personal)
✅ Node.js instalado (v16 o superior)
✅ Servidor que corra 24/7 (tu PC, VPS, o cloud hosting)
✅ 5 minutos de tu tiempo

---

## 🚀 Instalación Rápida

### Paso 1: Las dependencias ya están instaladas

WPPConnect ya está instalado en tu proyecto. No necesitas hacer nada.

```bash
# Ya ejecutado:
npm install @wppconnect-team/wppconnect
```

### Paso 2: Iniciar el servidor

```bash
npm run dev
```

### Paso 3: Acceder al panel de WhatsApp

1. Abre tu navegador
2. Ve a: `http://localhost:3000/admin/whatsapp`
3. Inicia sesión con tus credenciales de admin

### Paso 4: Escanear el código QR

1. En la página `/admin/whatsapp` verás un código QR
2. Abre WhatsApp en tu teléfono
3. Ve a **Configuración** → **Dispositivos vinculados**
4. Toca **"Vincular un dispositivo"**
5. Escanea el código QR que aparece en la pantalla
6. ¡Listo! El estado cambiará a "Connected"

---

## 🎨 Uso de la Interfaz Admin

### Panel de Conexión (`/admin/whatsapp`)

**Indicadores de estado:**

| Estado | Descripción | Acción |
|--------|-------------|--------|
| 🔴 Disconnected | WhatsApp no conectado | Escanea el QR code |
| 🟡 Connecting | Iniciando conexión | Espera unos segundos |
| 🔵 QR | Esperando escaneo | Escanea con tu teléfono |
| 🟢 Connected | ¡Conectado y funcionando! | Ya puedes recibir mensajes |

**Botón "Reiniciar":**
- Útil si la conexión se cae
- Genera un nuevo código QR
- Reinicia la sesión de WhatsApp

---

## 📱 Funcionalidades Disponibles

### 1. Recepción Automática de Mensajes

Los clientes pueden enviar WhatsApp a tu número y el bot responderá automáticamente:

**Comandos que entiende el bot:**
- "Hola" → Menú de bienvenida con botones
- "Reservar" / "Mesa" → Inicia proceso de reserva
- "Menú" → Muestra los platillos y precios
- "Horario" → Muestra el horario del restaurante
- "Ubicación" / "Dónde están" → Envía la ubicación en el mapa

### 2. Creación Automática de Reservas

El cliente puede escribir:
```
"Quiero una mesa para 4 personas mañana a las 7 PM"
```

El bot:
1. Extrae la información (4 personas, mañana, 7 PM)
2. Verifica disponibilidad
3. Crea la reserva automáticamente
4. Envía confirmación con ID de reserva

### 3. Mensajes Interactivos

El bot puede enviar mensajes con botones:
- ✅ Hasta 3 botones por mensaje
- ✅ Respuestas rápidas para el cliente
- ✅ Mejor experiencia de usuario

### 4. Envío de Ubicación

El bot envía automáticamente la ubicación del restaurante en Google Maps cuando el cliente pregunta "¿Dónde están?"

---

## 🔧 Configuración Avanzada

### Cambiar el Comportamiento del Bot

Edita: `lib/whatsapp/message-handler.ts`

**Ejemplo: Agregar nuevo comando**

```typescript
// Detectar intent personalizado
if (/promocion|descuento|oferta/i.test(lowerContent)) {
    return 'promotion_inquiry';
}

// Manejar el nuevo intent
async function handlePromotionInquiry(conversationId: number, phoneNumber: string) {
    const message = `🎉 Promociones Especiales

    🦐 Martes de Camarones: 2x1 en camarones al coco
    🍹 Happy Hour: 5-7 PM bebidas al 50%

    ¿Te gustaría reservar?`;

    await sendTextMessage(phoneNumber, message);
}
```

### Personalizar Plantillas de Mensajes

En `lib/whatsapp/message-handler.ts` encontrarás todas las plantillas de mensajes:

```typescript
// Mensaje de bienvenida
async function handleGreeting() {
    const message = `¡Hola! Bienvenido a Paititi del Mar 🌊`;
    // Personaliza aquí...
}

// Confirmación de reserva
const confirmationMessage = `✅ ¡Reserva confirmada!`;
// Personaliza aquí...
```

---

## 🐛 Solución de Problemas

### Problema: El QR code no aparece

**Solución:**
1. Verifica que el servidor esté corriendo (`npm run dev`)
2. Revisa la consola del navegador (F12) para errores
3. Intenta reiniciar el servidor
4. Haz clic en "Reiniciar" en el panel de admin

### Problema: El QR se escanea pero no conecta

**Solución:**
1. Asegúrate de tener internet estable
2. Verifica que WhatsApp esté actualizado en tu teléfono
3. Cierra otras sesiones de WhatsApp Web si las tienes
4. Intenta con otro número de teléfono

### Problema: Conexión se cae constantemente

**Solución:**
1. Verifica que tu servidor tenga suficiente RAM (mínimo 512MB)
2. Asegúrate de que el servidor no se apague
3. Si usas Windows, deshabilita el modo de suspensión
4. Considera usar un VPS o cloud hosting para mayor estabilidad

### Problema: No recibo mensajes

**Solución:**
1. Verifica en `/admin/whatsapp` que el estado sea "Connected"
2. Revisa los logs de la consola del servidor
3. Envía un mensaje de prueba desde otro teléfono
4. Verifica que la función `onMessage` esté registrada correctamente

### Problema: Los mensajes se envían pero no los veo en WhatsApp

**Solución:**
1. Verifica que el número de teléfono tenga el formato correcto: `52XXXXXXXXXX` (sin + ni espacios)
2. Para México: `52` + número de 10 dígitos
3. El bot no puede iniciar conversaciones, el cliente debe escribir primero

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

```bash
# En la terminal donde corre tu servidor verás:
[WPPConnect] QR Code received, attempt: 1
[WPPConnect] Status: qrReadSuccess
[WPPConnect] Connected successfully!
[WhatsApp] Message received: Hola
[WhatsApp] Intent detected: greeting
```

### Verificar Estado de Conexión

Puedes verificar el estado desde código:

```typescript
import { getConnectionStatus } from '@/lib/whatsapp/wppconnect-client';

const status = getConnectionStatus();
console.log(status);
// { status: 'connected', isConnected: true, message: '...' }
```

---

## 🚀 Despliegue en Producción

### Opción 1: VPS (DigitalOcean, Linode, AWS EC2)

```bash
# 1. Instalar Node.js en el servidor
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clonar tu repositorio
git clone https://github.com/tu-usuario/PAITITI.git
cd PAITITI

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
cp .env.example .env.local
nano .env.local

# 5. Iniciar con PM2 (mantiene el proceso corriendo)
npm install -g pm2
npm run build
pm2 start npm --name "paititi" -- start
pm2 save
pm2 startup
```

### Opción 2: Railway / Render

1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno
3. Despliega automáticamente
4. **Importante:** Estos servicios deben estar en plan "Always On" para que WPPConnect funcione

### Opción 3: Vercel (⚠️ No recomendado)

Vercel usa funciones serverless que se apagan después de cada request. WPPConnect necesita un servidor que esté corriendo 24/7, por lo que **no es compatible con Vercel**.

---

## 🔒 Seguridad

### Sesiones de WhatsApp

WPPConnect guarda las sesiones en la carpeta `tokens/` (ya está en `.gitignore`).

**NO subas esta carpeta a GitHub** - contiene tu sesión activa de WhatsApp.

### Rate Limiting

WhatsApp puede detectar automatización excesiva. Recomendaciones:

- No envíes más de 40 mensajes por minuto
- Usa delays entre mensajes (500ms-1s)
- No hagas spam a los usuarios

### Backup de Sesión

Si necesitas mover el servidor:

```bash
# Respaldar sesión
cp -r tokens/ backup/

# Restaurar en nuevo servidor
cp -r backup/tokens/ ./tokens/
```

---

## 📞 Soporte

### Recursos Útiles

- [Documentación oficial de WPPConnect](https://wppconnect.io/)
- [GitHub de WPPConnect](https://github.com/wppconnect-team/wppconnect)
- [Ejemplos de código](https://github.com/wppconnect-team/wppconnect/tree/main/examples)

### Reportar Problemas

Si encuentras un bug en la integración de WPPConnect con Paititi del Mar, puedes:

1. Revisar los logs del servidor
2. Verificar la versión de WPPConnect: `npm list @wppconnect-team/wppconnect`
3. Actualizar WPPConnect: `npm update @wppconnect-team/wppconnect`

---

## 🎉 ¡Felicidades!

Has configurado exitosamente WPPConnect para Paititi del Mar. Tus clientes ahora pueden hacer reservas por WhatsApp de forma gratuita e ilimitada.

**Próximos pasos recomendados:**

1. ✅ Personaliza los mensajes del bot en `message-handler.ts`
2. ✅ Configura respuestas automáticas fuera de horario
3. ✅ Agrega más comandos según las necesidades de tu negocio
4. ✅ Prueba la integración enviándote mensajes de prueba
5. ✅ Despliega en un servidor de producción

**¡Disfruta de tu sistema de reservas automatizado!** 🌊🦐
