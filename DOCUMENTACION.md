# Documentación: Mapas y Localización (React Native + Expo)

Este documento resume cómo funciona la integración de mapas (`react-native-maps`) y la localización (`expo-location`) en esta aplicación, ejemplos de uso, notas para emuladores y dispositivos, y cómo interactúa con el servidor local creado para persistir canchas.

---

## 1) Dependencias principales

- `react-native-maps`: componente `MapView`, `Marker`, `Callout` y gestión de regiones.
- `expo-location`: permiso y obtención de la ubicación del dispositivo (solo para apps Expo/managed).

Estos paquetes ya están instalados en el proyecto y aparecen en `package.json`.

## 2) Archivos importantes del proyecto

- `App.js`: componente principal que muestra el `MapView`, carga las canchas desde la API local y gestiona filtros por distancia.
- `src/components/FieldInfoModal.js`: modal que muestra detalles de una cancha.
- `src/components/AddFieldModal.js`: formulario para agregar una nueva cancha (usa la ubicación seleccionada en el mapa).
- `src/components/NearbyFilter.js`: control para activar el filtro de canchas cercanas, elegir radio y actualizar ubicación.
- `src/data/soccerFields.js`: datos iniciales locales (fallback si la API no está disponible).
- `server/index.js`: API de ejemplo (endpoints `GET /fields` y `POST /fields`).
- `server/data/fields.json`: persistencia simple en JSON para simular una base de datos.

## 3) Uso básico de `react-native-maps`

- Importar:

```js
import MapView, { Marker, Callout } from 'react-native-maps';
```

- Prop clave: `initialRegion` o `region` — ambos esperan { latitude, longitude, latitudeDelta, longitudeDelta }.
- `Marker` muestra un pin; usar la prop `coordinate={{ latitude, longitude }}`. `title` y `description` se muestran en el callout.

Ejemplo mínimo:

```jsx
<MapView initialRegion={{ latitude: -32.9442, longitude: -60.6505, latitudeDelta: 0.1, longitudeDelta: 0.1 }}>
  <Marker coordinate={{ latitude: -32.9442, longitude: -60.6505 }} title="Mi cancha" />
</MapView>
```

## 4) Permisos y `expo-location`

- Solicitar permiso en primer uso:

```js
import * as Location from 'expo-location';

const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  // manejar permiso denegado
}
const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
// loc.coords.latitude, loc.coords.longitude
```

- Notas:
  - En Expo Go el flujo de permisos funciona normalmente.
  - En emuladores Android debes habilitar la simulación de ubicación (Android Studio AVD). En iOS Simulator también puedes establecer una ubicación simulada.

## 5) Filtrado por distancia (ejemplo en la app)

- Se utiliza la fórmula de Haversine para calcular distancia en km entre dos coordenadas:

```js
const distanceKm = (lat1, lon1, lat2, lon2) => {
  // calcular en km (ver App.js para la implementación)
}
```

- En `App.js` se calcula la distancia desde `currentLocation` a cada cancha y se filtran en función del `radiusKm` elegido.

## 6) Notas sobre redes / servidor local

- El servidor de ejemplo corre en `server/index.js` y por defecto en `http://localhost:3000`.
- Si pruebas desde un dispositivo físico con Expo Go, reemplaza `localhost` por la IP local de tu PC (ej. `http://192.168.18.39:3000`). Ejecute en Windows:

```powershell
ipconfig
# usar la IPv4 del adaptador Wi‑Fi/Ethernet
```

- Emuladores:
  - Android emulator (AVD) -> `10.0.2.2` mapea al `localhost` del host (emulador estándar).
  - Genymotion -> `10.0.3.2`.
  - iOS Simulator en macOS normalmente puede usar `localhost` directamente.

## 7) Google Maps API keys (Android / iOS)

- `react-native-maps` puede usar distintos proveedores de mapas. En Android y iOS, para usar Google Maps nativo debes configurar las API keys:
  - Android: agrega `googleMaps.apiKey` en `app.json` (campo `android.config.googleMaps.apiKey`) y configura `AndroidManifest` si usas bare workflow.
  - iOS: configura `ios.config.googleMapsApiKey` y pod install si es bare.

Nota: con Expo Managed, `react-native-maps` funciona sin clave en modo desarrollo usando el proveedor estándar, pero para builds nativos y producción se requiere clave de Google Maps si eliges Google.

## 8) Integración en esta app (cómo fluyen las cosas)

1. Al arrancar `App.js` intenta cargar `/fields` desde la API local (`server/index.js`). Si falla, usa `src/data/soccerFields.js` como fallback.
2. La app pide permiso de ubicación y obtiene `currentLocation` con `expo-location`.
3. El componente `NearbyFilter` permite activar el filtro y elegir `radiusKm` (1/3/5 km) y actualizar la ubicación.
4. Si `nearbyOnly` está activo, `App.js` filtra `soccerFields` usando Haversine y muestra solo los marcadores dentro del radio.
5. Al agregar una cancha con `AddFieldModal`, la app hace `POST /fields` para persistir en `server/data/fields.json` y añade el marcador en la UI.

## 9) Ejecución / pruebas

En dos terminales:

```bash
cd "C:\Users\gayta\Documents\Proyectos Fran\React Native\MapApp"
npm run server   # arranca API local en :3000
npm start        # inicia Expo
```

- Si usas un dispositivo físico con Expo Go, asegúrate de usar la IP local en `App.js` o mejor: configurar la app para tomar la IP desde una variable/env.

## 10) Troubleshooting rápido

- Error `PluginError: Failed to resolve plugin for module "expo-location"`: instala `expo-location` con `npx expo install expo-location` y reinicia Expo con cache limpia `npx expo start -c`.
- Si la app no recibe la ubicación en un dispositivo real: revisar permisos del sistema (Settings → App → Permisos) y el firewall que podría bloquear el acceso al servidor local.
- Si el filtro no funciona: verificar que `currentLocation` tenga valores válidos (`console.log`) y que las coordenadas de las canchas sean números (no strings).

- Si el filtro no funciona: verificar que `currentLocation` tenga valores válidos (`console.log`) y que las coordenadas de las canchas sean números (no strings).

## 11) Clustering in‑App (implementación de esta rama)

Se implementó un clustering simple y seguro dentro de la app para evitar tocar `node_modules` y mitigar problemas observados con la librería externa.

- Componentes creados:
  - `src/components/MapArea.js`: concentra la lógica del `MapView`, filtrado, agrupado (clustering) y renderizado de marcadores y clusters.
  - `src/components/AddButton.js` y `src/components/buttonStyles.js`: componente modular para el botón de "Agregar Cancha".
  - `constants.js`: valores constantes (p. ej. `ROSARIO_CENTER`).

- Algoritmo de clustering:
  - Agrupado por grilla: las canchas se agrupan redondeando latitud/longitud a un número de decimales variable según el zoom.
  - Precisión dinámica: el número de decimales depende de `latitudeDelta` (zoom). A mayor zoom, más decimales → menos agrupamiento; a menor zoom, menos decimales → más agrupamiento.
  - Cada grupo produce un cluster con centro (promedio) y conteo; grupos de 1 se muestran como marcadores individuales.

- Comportamiento UI:
  - Los clusters son `Marker` con un `View` que muestra el conteo.
  - Presionar un cluster hace `animateToRegion` hacia su centro para hacer zoom y desplegar miembros.
  - Los marcadores individuales usan `src/components/CustomImageMarker.js`.

- Cómo probarlo:
  1. Iniciar servidor local (`npm run server`) y Expo (`npm start`).
  2. Abrir la app en Expo Go (emulador o dispositivo físico). Verificar que aparezcan marcadores.
  3. Alejar/Acercar el mapa y observar cómo cambian los clusters según el zoom.
  4. Presionar un cluster: el mapa debe animar hacia el centro y, tras suficiente zoom, mostrar miembros individuales.

- Notas:
  - La lógica del mapa quedó aislada en `MapArea` para facilitar futuras integraciones con librerías externas.
  - No se editaron archivos en `node_modules`; cualquier corrección a la librería externa debe proponerse como PR upstream.

---
