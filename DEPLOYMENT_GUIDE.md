# 🚀 Guía Completa de Deployment (Full-Stack)

Esta guía detalla el proceso exacto que seguimos para desplegar **MapApp - Canchas Rosario**, cubriendo el Backend (Vercel), el Frontend (Expo/EAS) y los requisitos legales (GitHub Pages).

---

## 🌐 1. Backend: API Express en Vercel

### Conexión con GitHub
Para que los cambios se actualicen automáticamente:
1. Sube el código a GitHub (`git push origin master`).
2. En el panel de **Vercel**, crea un nuevo proyecto e impórtalo desde GitHub.
3. **CONFIGURACIÓN CRÍTICA:** 
   - Ve a **Settings > General**.
   - En **Root Directory**, escribe `server`. Esto le indica a Vercel que el código del servidor está en esa carpeta específica.
   - En **Build & Development Settings**, verifica que el Framework Preset sea "Other" o "Express" (Vercel lo detecta automáticamente).

### Manejo de Datos (JSON)
En entornos serverless como Vercel, el sistema de archivos es de solo lectura en ejecución. 
- **Lectura de datos iniciales:** Usamos `fieldsMemory = require('./data/fields.json');`. El uso de `require` asegura que el JSON se incluya en el despliegue de Vercel.
- **Persistencia:** En este MVP, los datos nuevos (canchas agregadas) se guardan en la memoria RAM del servidor. *Nota: Se reinician si el servidor entra en reposo.* Para producción real, se recomienda conectar una base de datos como MongoDB o PostgreSQL.

---

## 📄 2. Requisitos Legales: Política de Privacidad

Google Play exige obligatoriamente un link público para la política de privacidad.
1. El archivo se encuentra en `docs/PRIVACY_POLICY.html`.
2. **Hosting vía GitHub Pages:**
   - Ve a tu repositorio en GitHub -> **Settings > Pages**.
   - En "Build and deployment", selecciona la rama `master` y la carpeta `/docs`.
3. **Link Oficial:** `https://francogaytan.github.io/MapApp/PRIVACY_POLICY.html`
   *Este link es el que debes pegar en Google Play Console > Contenido de la app > Política de privacidad.*

---

## 📱 3. Frontend: App en Expo (EAS Build)

### Preparación del `app.json`
Antes de compilar, cada nueva subida requiere:
- `"version": "1.0.1"` (Visible para el usuario).
- `"versionCode": 3` (Número interno, debe ser mayor al anterior).
- **Google Maps Key:** Asegúrate de tener tu API Key en `android.config.googleMaps.apiKey`.

### Comandos de Compilación
Usamos **EAS (Expo Application Services)**:

```bash
# PASO A: Login (si no lo estás)
eas login

# PASO B: Para probar (Genera un APK para instalar manualmente)
eas build --profile preview --platform android

# PASO C: Para la tienda (Genera un AAB - Android App Bundle)
eas build --profile production --platform android
```

---

## 🏪 4. Proceso en Google Play Console

### Subida del Archivo
1. Descarga el archivo `.aab` desde el enlace que te da Expo al finalizar el build.
2. En la consola de Google Play, ve a **Pruebas internas** (para testeo rápido) o **Producción**.
3. Sube el archivo `.aab`.
4. **Notas de versión:** Describe los cambios (ej: "Añadidas 30 canchas de Rosario"). Usa la etiqueta `<es-419>` para español latino.

### Ficha de Play Store (Assets Necesarios)
- **Icono:** 512x512 pxl PNG.
- **Imagen de cabecera:** 1024x500 pxl.
- **Capturas de pantalla:** Saca al menos 2 screenshots de la app (Mapa y Login).
- **Categoría:** Mapas y navegación / Deportes.

---

## 🛠️ Solución de Problemas (Troubleshooting)

- **¿El mapa se ve gris?** 
  - Verifica que la API Key de Google Maps esté habilitada en Google Cloud Console.
  - El nombre del paquete (`com.mapapp.rosario`) debe coincidir exactamente en la consola de Google Cloud y en `app.json`.
- **¿Los datos no se actualizan?**
  - Hemos implementado un sistema de "cache-busting" en `ApiConnector.js` que añade un timestamp (`?t=...`) a las URLs. Esto obliga a la App a pedir datos frescos al servidor cada vez.
- **¿Vercel no despliega mis cambios de GitHub?**
  - Ve a la pestaña **Deployments** en Vercel, busca el último commit y dale a **"Redeploy"** o **"Promote to Production"**.

---
*Documento actualizado el 15 de Enero de 2026 para reflejar el proceso real seguido durante el desarrollo.*

---
*Documento actualizado el 15 de Enero de 2026 para reflejar el proceso real seguido durante el desarrollo.*
- Generador de Privacy Policy: https://app-privacy-policy-generator.firebaseapp.com/
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
