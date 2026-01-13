# MapApp - Aplicación de Mapas con React Native

## Descripción
Aplicación React Native que permite visualizar y agregar canchas de fútbol en un mapa interactivo de la ciudad de Rosario.

## Estructura del Proyecto

### Frontend (React Native + Expo)
```
src/
├── components/           # Componentes reutilizables
│   ├── AddFieldModal.js     # Modal para agregar nuevas canchas
│   ├── CustomImageMarker.js # Marcadores personalizados para el mapa
│   ├── FieldInfoModal.js    # Modal de información de canchas
│   └── NearbyFilter.js      # Filtro de canchas cercanas
├── config/              # Configuración
│   ├── api.js              # Configuración de endpoints
│   └── ApiConnector.js     # Conector inteligente de API
├── context/             # Context providers
│   └── AuthContext.js      # Context de autenticación
├── data/               # Datos iniciales
│   └── soccerFields.js     # Datos de canchas por defecto
└── screens/            # Pantallas principales
    ├── LoginScreen.js      # Pantalla de login
    ├── ProfileScreen.js    # Pantalla de perfil
    └── SignupScreen.js     # Pantalla de registro
```

### Backend (Node.js + Express)
```
server/
├── data/               # Datos persistentes
│   ├── fields.json        # Base de datos de canchas
│   └── users.json         # Base de datos de usuarios
└── index.js            # Servidor principal
```

**Nota**: El backend utiliza las mismas dependencias del package.json principal (estructura unificada).

## Características

### Mapa Interactivo
- Visualización de canchas en el mapa de Rosario
- Marcadores personalizados según el tipo de cancha
- Filtros por proximidad al usuario
- Agregar nuevas canchas tocando el mapa

### Autenticación
- Registro de nuevos usuarios
- Login con email y contraseña
- Gestión de sesión con AsyncStorage

### API Inteligente
- Detección automática de IP del servidor
- Fallback a datos locales si no hay conexión
- Manejo robusto de errores de red

## Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- Expo CLI
- Emulador Android o dispositivo físico

### Frontend
```bash
npm install
npm start
```

### Backend
El servidor usa las mismas dependencias que el frontend. Solo necesitas ejecutar:
```bash
npm run server
```

## Scripts Disponibles

- `npm start` - Inicia el cliente Expo
- `npm run android` - Ejecuta en Android
- `npm run server` - Inicia el servidor backend

## Configuración de Red

El ApiConnector automáticamente detecta la IP correcta probando:
1. `http://10.0.2.2:3000` (Android emulator)
2. `http://localhost:3000` (iOS simulator)
3. `http://192.168.0.103:3000` (Red local)
4. `http://127.0.0.1:3000` (Localhost)

## Uso

1. Ejecuta el servidor backend
2. Inicia la aplicación Expo
3. Regístrate o inicia sesión
4. Explora las canchas en el mapa
5. Toca "Agregar Cancha" para añadir nuevas ubicaciones

## Tecnologías Utilizadas

- **Frontend**: React Native, Expo, React Native Maps
- **Backend**: Node.js, Express, Crypto (autenticación)
- **Almacenamiento**: AsyncStorage (cliente), JSON files (servidor)
- **Geolocalización**: Expo Location