# Guía de Configuración: WhatsApp Business API

Esta guía te llevará paso a paso para configurar WhatsApp Business API para Paititi del Mar.

## ⏱️ Tiempo estimado: 2-3 horas

## 📋 Requisitos Previos

- ✅ Número de teléfono dedicado al negocio (NO puede ser número personal)
- ✅ Documentos de la empresa (RFC, comprobante de domicilio)
- ✅ Cuenta de correo electrónico empresarial
- ✅ Tarjeta de crédito/débito para verificación (no se cobrará hasta pasar 1,000 mensajes/mes)

---

## Paso 1: Crear Cuenta de Meta Business Suite

### 1.1 Acceder a Meta Business Suite
1. Ve a https://business.facebook.com/
2. Haz clic en **"Crear cuenta"**
3. Ingresa:
   - Nombre del negocio: `Paititi del Mar`
   - Tu nombre completo
   - Correo electrónico empresarial

### 1.2 Verificar Correo Electrónico
1. Revisa tu correo y haz clic en el enlace de verificación
2. Completa tu perfil de negocio

---

## Paso 2: Configurar WhatsApp Business

### 2.1 Agregar WhatsApp a tu Cuenta
1. En Meta Business Suite, ve a **Configuración** → **Cuentas** → **Cuentas de WhatsApp**
2. Haz clic en **"+Agregar"**
3. Selecciona **"Crear una cuenta de WhatsApp Business"**
4. Ingresa la información del negocio:
   - Nombre: `Paititi del Mar`
   - Categoría: `Restaurante`
   - Descripción: `Restaurante de mariscos en Acapulco Diamante`

### 2.2 Agregar Número de Teléfono
1. Haz clic en **"+Agregar número de teléfono"**
2. Selecciona tu país: **México (+52)**
3. Ingresa tu número de teléfono (sin el +52)
   - ⚠️ **IMPORTANTE**: Este número NO puede estar registrado en WhatsApp personal
   - Si ya está registrado, tendrás que usar un número diferente
4. Selecciona método de verificación: **SMS** o **Llamada**
5. Ingresa el código de verificación que recibas

### 2.3 Configurar Perfil de WhatsApp
1. Sube la foto de perfil (logo de Paititi del Mar)
2. Completa la descripción del negocio
3. Agrega:
   - Dirección: `Av. Costera de las Palmas, Acapulco Diamante, Guerrero`
   - Horario de atención
   - Sitio web: `https://paititidelmar.com`
   - Correo de contacto

---

## Paso 3: Verificación Empresarial

### 3.1 Iniciar Verificación
1. En Meta Business Suite → **Seguridad** → **Verificación empresarial**
2. Haz clic en **"Iniciar verificación"**

### 3.2 Documentos Requeridos
Prepara **UNO** de los siguientes documentos:
- ✅ RFC (Registro Federal de Contribuyentes)
- ✅ Comprobante de domicilio fiscal reciente (menos de 3 meses)
- ✅ Licencia comercial o permiso municipal

### 3.3 Proceso de Revisión
- ⏱️ **Tiempo de espera**: 1-3 días hábiles
- 📧 Recibirás un correo con el resultado
- Si se requiere más información, Meta te contactará

---

## Paso 4: Crear Aplicación de Desarrollador

### 4.1 Acceder a Meta for Developers
1. Ve a https://developers.facebook.com/apps
2. Haz clic en **"Crear aplicación"**
3. Selecciona tipo: **"Empresa"**
4. Información de la app:
   - Nombre: `Paititi Reservas`
   - Correo de contacto: tu correo empresarial
   - Cuenta de negocio: Selecciona tu cuenta de Meta Business

### 4.2 Agregar Producto WhatsApp
1. En el dashboard de tu app, busca **"WhatsApp"**
2. Haz clic en **"Configurar"**
3. Se abrirá la consola de WhatsApp

### 4.3 Generar Token de Acceso Permanente
1. En WhatsApp → **Configuración** → **Configuración de API**
2. Busca **"Generar token de acceso"**
3. Selecciona tu número de WhatsApp Business
4. Permisos necesarios:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
5. Haz clic en **"Generar token"**
6. ⚠️ **MUY IMPORTANTE**: Copia y guarda este token en un lugar seguro
   - Este token **NO se mostrará de nuevo**
   - Lo necesitarás para configurar tu aplicación

### 4.4 Obtener IDs Importantes
Copia y guarda:
- **Phone Number ID**: En la pestaña "Número de teléfono" (formato: `123456789012345`)
- **WhatsApp Business Account ID**: En la URL o sección de configuración (formato: `123456789012345`)
- **App ID**: En Configuración → Básica (formato: `123456789012345`)

---

## Paso 5: Configurar Webhook

### 5.1 En tu Aplicación Next.js
1. Abre tu archivo `.env.local`
2. Agrega las siguientes variables:

```bash
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aquí
WHATSAPP_ACCESS_TOKEN=tu_token_permanente_aquí
WHATSAPP_VERIFY_TOKEN=paititi_webhook_verify_2026
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id_aquí
```

3. Guarda el archivo

### 5.2 Desplegar tu Aplicación
Tu webhook debe estar públicamente accesible. Opciones:

**Opción A: Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel Dashboard
```

**Opción B: Ngrok (Para desarrollo/pruebas)**
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer tu servidor local
ngrok http 3000

# Copia la URL HTTPS que te da (ej: https://abc123.ngrok.io)
```

### 5.3 Configurar Webhook en Meta
1. En tu app de Facebook → WhatsApp → **Configuración**
2. En la sección **"Webhook"**:
   - **URL de callback**: `https://tu-dominio.com/api/webhooks/whatsapp`
     - Si usas ngrok: `https://abc123.ngrok.io/api/webhooks/whatsapp`
   - **Token de verificación**: `paititi_webhook_verify_2026`
3. Haz clic en **"Verificar y guardar"**
   - Debe aparecer ✅ "Verificado correctamente"

### 5.4 Suscribirse a Eventos
1. En la misma sección de Webhook
2. Haz clic en **"Suscribirse a este objeto"**
3. Selecciona los eventos:
   - ✅ `messages` (mensajes entrantes)
   - ✅ `message_status` (estado de mensajes enviados)
4. Haz clic en **"Suscribirse"**

---

## Paso 6: Crear Plantillas de Mensajes

### 6.1 Acceder a Plantillas
1. En Meta Business Suite → WhatsApp → **Plantillas de mensaje**
2. Haz clic en **"+Crear plantilla"**

### 6.2 Crear Plantilla de Confirmación
1. **Nombre de plantilla**: `confirmacion_reserva`
2. **Categoría**: Transaccional
3. **Idiomas**: Español
4. **Contenido del mensaje**:
```
Hola {{1}}, tu reserva para {{2}} personas el {{3}} a las {{4}} ha sido confirmada. ¡Te esperamos en Paititi del Mar! 🌊

ID de reserva: #{{5}}
```
5. **Variables**:
   - {{1}} = Nombre del cliente
   - {{2}} = Número de personas
   - {{3}} = Fecha
   - {{4}} = Hora
   - {{5}} = ID de reserva
6. Haz clic en **"Enviar"**

### 6.3 Crear Plantilla de Recordatorio
1. **Nombre**: `recordatorio_24h`
2. **Contenido**:
```
Hola {{1}}, te recordamos tu reserva mañana a las {{2}} para {{3}} personas en Paititi del Mar. ¡Nos vemos pronto! 🦐
```
3. **Enviar** y esperar aprobación

### 6.4 Esperar Aprobación
- ⏱️ Las plantillas son revisadas por Meta (24-48 horas)
- ✅ Recibirás un correo cuando sean aprobadas
- Solo puedes usar plantillas **aprobadas** para iniciar conversaciones

---

## Paso 7: Probar la Integración

### 7.1 Enviar Mensaje de Prueba
1. Envía un WhatsApp a tu número de negocio desde tu teléfono personal
2. Mensaje de prueba: `Hola`
3. Deberías recibir una respuesta automática del bot

### 7.2 Verificar en el Admin
1. Accede a `https://tu-dominio.com/admin/mensajes`
2. Deberías ver la conversación
3. Verifica que el mensaje se guardó correctamente

### 7.3 Probar Reserva
Envía: `Quiero reservar una mesa para 4 personas mañana a las 7 PM`
1. El bot debe responder solicitando más detalles o confirmando
2. Verifica que la reserva se creó en `/admin/reservas`

---

## ✅ Checklist Final

Antes de poner en producción, verifica:

- [ ] Número de WhatsApp verificado
- [ ] Empresa verificada en Meta
- [ ] Token de acceso permanente generado y guardado
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Aplicación desplegada en servidor público (Vercel/tu hosting)
- [ ] Webhook verificado y funcionando
- [ ] Suscrito a eventos `messages` y `message_status`
- [ ] Al menos una plantilla aprobada
- [ ] Prueba de envío/recepción exitosa
- [ ] Bot responde correctamente
- [ ] Reservas se crean en la base de datos

---

## 🆘 Solución de Problemas

### Error: "Webhook verification failed"
**Solución**: Verifica que:
- La URL del webhook es correcta y accesible públicamente
- El `WHATSAPP_VERIFY_TOKEN` en `.env.local` coincide exactamente con el token en Meta
- Tu servidor está corriendo

### Error: "Invalid phone number"
**Solución**: 
- Asegúrate de incluir el código de país (52 para México)
- Formato correcto: `5217441234567` (no espacios, guiones ni paréntesis)

### No recibo mensajes
**Solución**:
- Verifica que estás suscrito a los eventos en el webhook
- Revisa los logs de tu servidor (`ngrok http` muestra tráfico HTTP)
- Verifica que el token de acceso es válido

### Las plantillas no se aprueban
**Solución**:
- Evita lenguaje promocional excesivo
- No incluyas URLs no autorizadas
- Mantén el mensaje claro y profesional
- Si rechazaron, lee la razón y ajusta

---

## 📞 Soporte

- Meta Business Help Center: https://business.facebook.com/business/help
- WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp
- Soporte de Desarrollo: https://developers.facebook.com/support/bugs/

---

## 🎉 ¡Felicidades!

Has configurado exitosamente WhatsApp Business API para Paititi del Mar. Tus clientes ahora pueden hacer reservas directamente por WhatsApp.

**Próximos pasos recomendados**:
1. Configurar recordatorios automáticos (24h y 2h antes)
2. Crear más plantillas para casos de uso comunes
3. Configurar respuestas automáticas fuera de horario
4. Integrar con el sistema de mesas para asignación automática
5. Configurar Facebook Messenger (sigue la guía de Messenger)
