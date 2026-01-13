# 🚀 Comandos Rápidos para Deploy

## Deploy del Servidor (PRIMERO)

### Opción 1: Vercel (Recomendado - GRATIS)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Ir a carpeta del servidor
cd server

# Crear vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
EOF

# Deploy
vercel

# Para deploy de producción
vercel --prod
```

### Opción 2: Railway (GRATIS)
```bash
# 1. Crear cuenta en https://railway.app
# 2. Conectar con GitHub
# 3. Seleccionar tu repo
# 4. Railway detecta automáticamente y deploya
```

---

## Build de la App para Play Store

### 1. Instalar EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configurar EAS
```bash
eas build:configure
```

### 3. Build APK de prueba (para testear en tu teléfono)
```bash
eas build --platform android --profile preview
```

### 4. Build AAB para Play Store (producción)
```bash
eas build --platform android --profile production
```

### 5. Actualizar versión antes de nueva release
```bash
# Editar app.json manualmente:
# "version": "1.0.1"  (incrementar)
# "versionCode": 2    (incrementar +1)

# Luego build de nuevo
eas build --platform android --profile production
```

---

## Testing Local

### Correr la app en desarrollo
```bash
npm start
```

### Correr el servidor local
```bash
npm run server
```

### Instalar APK en dispositivo Android
```bash
# 1. Hacer build de preview
eas build --platform android --profile preview

# 2. Descargar APK del link que te da
# 3. Transferir a tu teléfono
# 4. Instalar (habilitar "Fuentes desconocidas" si es necesario)
```

---

## Actualizar URL del servidor en el código

Después de deployar el servidor, actualiza estos archivos:

### src/config/api.js
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://TU-APP.vercel.app', // ← CAMBIAR
  ENDPOINTS: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FIELDS: '/fields',
  },
};
```

### src/config/ApiConnector.js
```javascript
static async findWorkingUrl() {
  const testUrls = [
    'https://TU-APP.vercel.app', // ← CAMBIAR
    'http://10.0.2.2:3000', // Emulador (dev)
    'http://localhost:3000', // Local (dev)
  ];
  // ...
}
```

---

## Workflow completo de Deploy

```bash
# 1. Deploy del servidor
cd server
vercel --prod
# Copiar la URL que te da (ej: https://mapapp-server.vercel.app)

# 2. Actualizar URLs en el código
# Editar src/config/api.js y src/config/ApiConnector.js

# 3. Testear localmente
npm start
# Verificar que se conecta al servidor en la nube

# 4. Build de producción
eas build --platform android --profile production

# 5. Descargar el .aab del link que te da EAS

# 6. Subir a Google Play Console
# https://play.google.com/console
# Crear nueva versión → Subir .aab

# 7. Esperar aprobación (1-7 días)
```

---

## Comandos útiles

### Ver builds de EAS
```bash
eas build:list
```

### Cancelar build
```bash
eas build:cancel [BUILD_ID]
```

### Ver credenciales
```bash
eas credentials
```

### Submit a Play Store (alternativa a manual)
```bash
eas submit --platform android
```

### Limpiar caché
```bash
npm start -- --clear
```

---

## Troubleshooting

### Error: "Unable to resolve module"
```bash
npm install
npm start -- --clear
```

### Error en build de EAS
```bash
# Ver logs completos
eas build:view [BUILD_ID]
```

### Servidor no responde
```bash
# Verificar que está corriendo
curl https://TU-APP.vercel.app/fields

# Ver logs en Vercel
vercel logs
```

---

## Checklist rápido

Antes de deployar a producción:

```bash
# ✓ Servidor deployado
vercel --prod

# ✓ URLs actualizadas
# Revisar: src/config/api.js y src/config/ApiConnector.js

# ✓ Versión incrementada
# Revisar: app.json

# ✓ Testeado localmente
npm start

# ✓ Build exitoso
eas build --platform android --profile production

# ✓ APK testeado en dispositivo real
eas build --platform android --profile preview

# ✓ Assets creados
# - Ícono 512x512
# - Screenshots
# - Feature graphic 1024x500

# ✓ Cuenta Play Console lista
# https://play.google.com/console

# ✓ Política de privacidad
# https://app-privacy-policy-generator.firebaseapp.com/
```

¡Listo para deployar! 🎉
