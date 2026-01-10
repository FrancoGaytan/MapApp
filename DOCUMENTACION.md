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



 - Si el filtro no funciona: verificar que `currentLocation` tenga valores válidos (`console.log`) y que las coordenadas de las canchas sean números (no strings).

## 12) Configurar Google Maps para producción (paso a paso)

Si en producción decidís usar Google Maps como proveedor nativo, sigue estos pasos mínimos para que la app funcione correctamente y de forma segura:

1. Crear proyecto en Google Cloud
  - Ve a https://console.cloud.google.com/ y crea un proyecto nuevo (o usa uno existente).

2. Activar facturación (billing)
  - Añade un método de pago al proyecto. Google requiere billing activo para emitir API keys funcionales aunque el uso básico en mobile sea gratuito.

3. Habilitar APIs necesarias
  - Para visualización y ubicación básica habilita **Maps SDK for Android** y **Maps SDK for iOS**.
  - Si vas a usar Places/Routes/Geocoding, habilita también **Places API**, **Directions API**, **Geocoding API**, etc.

4. Crear una API Key
  - En la consola, crea una nueva API Key (Credentials → Create Credentials → API key).

5. Restringir la API Key (muy recomendable)
  - Android: restringir por paquete (`com.mapapp.rosario`) + certificado SHA‑1 (si tenés build release).
  - iOS: restringir por bundle identifier (`com.mapapp.rosario`).
  - Opcional: restringir por APIs (Maps SDK for Android / iOS) para minimizar riesgo si la key se filtra.

6. Configurar la key en la app
  - Managed Expo (recomendado): no comites la key en `app.json`. Usá `app.config.js` para leer desde variables de entorno y exportar la configuración. Ejemplo mínimo:

```js
// app.config.js
import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  ios: {
   ...config.ios,
   config: { googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_KEY }
  },
  android: {
   ...config.android,
   config: { googleMaps: { apiKey: process.env.ANDROID_GOOGLE_MAPS_KEY } }
  }
});
```

  - Durante el build (EAS / CI) exportá las variables `IOS_GOOGLE_MAPS_KEY` y `ANDROID_GOOGLE_MAPS_KEY` desde secrets/variables del pipeline.

7. No subir keys a Git
  - Nunca comitees keys a `git`. Usa variables de entorno o el sistema de secretos de tu CI/Expo.

8. Probar en builds nativos
  - En desarrollo `expo start` suele funcionar sin key en muchos casos, pero para `eas build` o builds nativos confirma que la key está presente y que la app muestra mapas en dispositivos reales.

9. Monitorización y límites
  - Aunque la visualización móvil es gratuita, monitoriza el uso en la consola de Google Cloud y habilita alertas de presupuesto si te preocupa el consumo.

Comprobá estos pasos y luego decidimos si querés que añada `app.config.js` y un script de ejemplo para CI (EAS) en el repo.

---

## 13) Integración con OpenStreetMap (rama open-street-map-integration)

Para evitar costes y dependencias de Google Maps, esta rama usa tiles de **OpenStreetMap** mediante el componente `UrlTile` de `react-native-maps`.

### Implementación

En `App.js` se agregó:

```js
import MapView, { UrlTile } from 'react-native-maps';

// Dentro del MapView:
<UrlTile
  urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
  maximumZ={19}
  flipY={false}
/>
```

**Nota importante:** Inicialmente usamos `tile.openstreetmap.org` pero ese servidor bloquea apps móviles por políticas estrictas (requiere User-Agent específico y tiene límites muy bajos). Por eso cambiamos a **CartoDB** que es más permisivo para desarrollo.

### Consideraciones importantes

1. **Proveedor actual: CartoDB Positron**  
   - Estilo claro y minimalista, ideal para mostrar marcadores.
   - Más permisivo que `tile.openstreetmap.org` para apps en desarrollo.
   - Para producción, verifica los [términos de uso de CartoDB](https://carto.com/legal/).

2. **Alternativas de proveedores de tiles**  
   - **CartoDB** (actual, gratis con límites razonables): https://carto.com/
     - Otros estilos: `dark_all`, `rastertiles/voyager`
   - **MapTiler** (tiles vectoriales y raster, plan gratuito limitado): https://www.maptiler.com/
   - **Thunderforest** (tiles especializados, requiere API key): https://www.thunderforest.com/
   - **Stamen Design** tiles (estilos artísticos): http://maps.stamen.com/
   - **Self-hosting**: montar tu propio servidor de tiles usando `tileserver-gl` u `OpenMapTiles`.
   - **NO recomendado**: `tile.openstreetmap.org` bloquea apps móviles.

3. **Atribución obligatoria**  
   - Debes mostrar créditos de OpenStreetMap en la app. Ejemplo mínimo: agregar un `<Text>` fijo en la esquina del mapa:
     ```jsx
     <Text style={styles.attribution}>
       © OpenStreetMap contributors
     </Text>
     ```
   - Más info: https://www.openstreetmap.org/copyright

4. **Cómo cambiar el proveedor de tiles**  
   - Para usar otro servidor, cambia el `urlTemplate`. Ejemplo con MapTiler:
     ```js
     <UrlTile
       urlTemplate="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_MAPTILER_KEY"
       maximumZ={19}
     />
     ```

5. **Rendimiento**  
   - Los tiles raster (PNG) funcionan bien para apps pequeñas/medias.
   - Para mejor rendimiento (especialmente offline o mapas complejos), considera migrar a **MapLibre GL** con tiles vectoriales.

### Ventajas de OpenStreetMap

- **Sin coste por API calls** (respetando políticas de uso).
- **Datos abiertos** y actualizables por la comunidad.
- **Sin vendor lock-in**: podés cambiar de proveedor o self-hostear.

### Próximos pasos opcionales

- Añadir atribución visible en el mapa.
- Configurar un proveedor de tiles para producción (MapTiler/self-host).
- Si necesitás estilos personalizados o mejor rendimiento, evaluar migración a MapLibre.

```

