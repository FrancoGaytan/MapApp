# 🚀 Guía de Deployment a Google Play Store

## ⚠️ IMPORTANTE: Sobre el Servidor

### Problema actual
Tu servidor está corriendo **localmente** en `http://192.168.0.103:3000`. Esto significa:
- ❌ Solo funciona en tu red local (WiFi de tu casa)
- ❌ NO funcionará para usuarios que descarguen tu app desde Play Store
- ❌ Cuando publiques la app, los usuarios NO podrán conectarse a tu servidor

### Soluciones antes de deployar:

#### Opción 1: Servidor en la Nube (RECOMENDADO)
Debes hospedar tu servidor en internet. Opciones gratuitas/baratas:

**A) Vercel (GRATIS - Recomendado para empezar)**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desde la carpeta server/
cd server
vercel

# 3. Seguir los pasos, te dará una URL tipo: https://tu-app.vercel.app
```

**B) Railway (GRATIS hasta cierto uso)**
1. Ir a https://railway.app
2. Crear proyecto desde GitHub
3. Conectar tu repositorio
4. Te da una URL automáticamente

**C) Render (GRATIS)**
1. Ir a https://render.com
2. Crear Web Service
3. Conectar repositorio
4. Deploy automático

**D) Heroku (Tiene plan gratuito limitado)**
```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Crear app
heroku create mapapp-rosario

# 4. Deploy
git push heroku main
```

#### Opción 2: Firebase (RECOMENDADO si quieres algo más robusto)
```bash
# 1. Instalar Firebase
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar
firebase init functions

# 4. Migrar tu código a Firebase Functions
# 5. Deploy
firebase deploy
```

### Cambios necesarios en el código después de deployar el servidor

Una vez tengas tu servidor en la nube (ejemplo: `https://tu-app.vercel.app`), actualiza:

**Archivo: `src/config/api.js`**
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://tu-app.vercel.app', // ← Tu URL real del servidor
  ENDPOINTS: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FIELDS: '/fields',
  },
};
```

**Archivo: `src/config/ApiConnector.js`**
```javascript
static async findWorkingUrl() {
  const testUrls = [
    'https://tu-app.vercel.app', // Tu servidor en producción
    'http://10.0.2.2:3000', // Android emulator (desarrollo)
    'http://localhost:3000', // iOS simulator (desarrollo)
  ];
  // ... resto del código
}
```

---

## 📱 Proceso de Build y Deploy a Play Store

### Paso 1: Preparar Cuenta de Google Play Console
1. Ir a https://play.google.com/console
2. Crear cuenta de desarrollador ($25 USD pago único)
3. Completar información de la cuenta

### Paso 2: Instalar EAS CLI (Expo Application Services)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en tu cuenta de Expo
eas login
```

### Paso 3: Configurar EAS Build

```bash
# Inicializar configuración de build
eas build:configure
```

Esto crea un archivo `eas.json` con:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Paso 4: Crear Keystore (Firma de la app)

```bash
# EAS genera automáticamente tu keystore
eas credentials
```

Selecciona:
- Android
- Production
- Set up a new keystore

**¡IMPORTANTE!** Guarda las credenciales que te genera, las necesitarás para futuras actualizaciones.

### Paso 5: Build de Producción

```bash
# Build para Google Play Store (AAB - Android App Bundle)
eas build --platform android --profile production

# Esto puede tardar 10-20 minutos
# Al finalizar te da un link para descargar el .aab
```

### Paso 6: Preparar Assets para Play Store

Antes de subir, necesitas:

**1. Ícono de la app (512x512 px)**
- Crear un ícono cuadrado de alta calidad
- Formato PNG, sin transparencias

**2. Screenshots (mínimo 2)**
- Capturas de pantalla de tu app funcionando
- Resoluciones: 
  - Teléfono: 1080x1920 o 1080x2400
  - Tablet (opcional): 1200x1920

**3. Feature Graphic (1024x500 px)**
- Banner horizontal promocional
- Formato PNG o JPG

**4. Descripción de la app**
```
Título corto (máx 50 caracteres):
MapApp - Canchas de Fútbol

Descripción corta (máx 80 caracteres):
Encuentra y comparte canchas de fútbol en Rosario

Descripción larga (máx 4000 caracteres):
MapApp te permite descubrir canchas de fútbol cerca de ti en la ciudad de Rosario.

Características:
• Mapa interactivo con todas las canchas de la ciudad
• Filtro por proximidad a tu ubicación
• Agrega nuevas canchas que encuentres
• Información detallada de cada cancha
• Sistema de autenticación de usuarios

¡Descarga MapApp y nunca más te quedarás sin lugar para jugar!
```

### Paso 7: Subir a Google Play Console

1. **Ir a Play Console** → https://play.google.com/console
2. **Crear nueva aplicación**
   - Nombre: MapApp - Canchas Rosario
   - Idioma predeterminado: Español
   - Tipo: App o Juego → App
   - Categoría: Mapas y navegación

3. **Configurar ficha de Play Store**
   - Subir ícono (512x512)
   - Subir Feature Graphic (1024x500)
   - Agregar screenshots (mínimo 2)
   - Completar descripción corta y larga
   - Agregar categoría: Mapas y navegación

4. **Configurar clasificación de contenido**
   - Completar cuestionario
   - Para MapApp: "Todos"

5. **Política de privacidad**
   - Necesitas crear una (puedes usar generadores online)
   - Ejemplo: https://app-privacy-policy-generator.firebaseapp.com/

6. **Subir el AAB**
   - Ir a "Producción" → "Crear nueva versión"
   - Subir el archivo .aab descargado de EAS
   - Agregar notas de la versión

7. **Enviar para revisión**
   - Revisar toda la información
   - Enviar para revisión
   - **Espera: 1-7 días** para aprobación

### Paso 8: Actualizaciones futuras

Cuando quieras actualizar la app:

**1. Incrementar versión en app.json**
```json
{
  "expo": {
    "version": "1.0.1",  // ← Cambiar aquí
    "android": {
      "versionCode": 2   // ← Incrementar siempre +1
    }
  }
}
```

**2. Hacer nuevo build**
```bash
eas build --platform android --profile production
```

**3. Subir nueva versión en Play Console**
- Ir a "Producción" → "Crear nueva versión"
- Subir nuevo .aab
- Agregar notas de qué cambió

---

## 🔧 Testing antes de publicar

### Probar en APK local (sin subir a Play Store)

```bash
# Build de preview (APK para testing)
eas build --platform android --profile preview

# Instalar en tu teléfono físico
# 1. Descargar el APK del link que te da EAS
# 2. Transferir a tu teléfono
# 3. Instalar (necesitas habilitar "Fuentes desconocidas")
```

### Testing interno en Play Console

1. En Play Console → "Testing" → "Testing interno"
2. Crear versión de prueba
3. Agregar testers (emails)
4. Ellos pueden descargar desde Play Store (versión beta)

---

## 📝 Checklist antes de publicar

- [ ] ¿Servidor deployado en la nube? (Vercel/Railway/Firebase)
- [ ] ¿URLs del servidor actualizadas en el código?
- [ ] ¿Ícono de 512x512 creado?
- [ ] ¿Mínimo 2 screenshots tomados?
- [ ] ¿Feature graphic de 1024x500 creado?
- [ ] ¿Descripción escrita?
- [ ] ¿Política de privacidad creada?
- [ ] ¿Cuenta de Play Console creada ($25 USD)?
- [ ] ¿App testeada con APK en dispositivo real?
- [ ] ¿Permisos de ubicación funcionando?
- [ ] ¿Login/Signup funcionando con servidor en la nube?

---

## 💰 Costos

- **Google Play Console**: $25 USD (pago único)
- **Expo/EAS Build**: 
  - Gratis: 30 builds/mes
  - Si necesitas más: $29/mes
- **Hosting del servidor**:
  - Vercel: GRATIS
  - Railway: GRATIS (hasta cierto uso)
  - Render: GRATIS
  - Heroku: GRATIS/Limitado
  - VPS (DigitalOcean/Linode): ~$5/mes

**Total mínimo**: $25 USD + tiempo

---

## 🆘 Problemas comunes

### "App no se conecta al servidor"
→ Revisa que el servidor esté deployado y la URL actualizada en `api.js`

### "Keystore perdido"
→ Si pierdes el keystore, NO podrás actualizar la app. Tendrás que publicar una nueva.

### "Build falla en EAS"
→ Revisa logs, usualmente es por:
- package.json mal configurado
- Versión de Node incorrecta
- Dependencias faltantes

### "Play Console rechaza la app"
→ Razones comunes:
- Falta política de privacidad
- Contenido inapropiado
- Permisos mal explicados
- Screenshots de mala calidad

---

## 📚 Recursos útiles

- Expo Docs: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/
- Play Console: https://support.google.com/googleplay/android-developer
- Generador de Privacy Policy: https://app-privacy-policy-generator.firebaseapp.com/
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/

---

## 🎯 Próximos pasos recomendados

1. **Deploy del servidor primero** (sin esto la app no funcionará para usuarios externos)
2. Testear con APK en tu teléfono
3. Crear assets visuales (ícono, screenshots)
4. Crear cuenta Play Console
5. Build de producción con EAS
6. Subir a Play Store en testing interno
7. Invitar testers
8. Corregir bugs
9. Publicar en producción

**¡Éxito con tu app! 🚀**
