import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import MapView from 'react-native-maps';
import FieldInfoModal from './src/components/FieldInfoModal';
import AddFieldModal from './src/components/AddFieldModal';
import NearbyFilter from './src/components/NearbyFilter';
import CustomImageMarker from './src/components/CustomImageMarker';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { initialSoccerFields } from './src/data/soccerFields';
import ApiConnector from './src/config/ApiConnector';

function MapScreen() {
  const [soccerFields, setSoccerFields] = useState(initialSoccerFields);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [addingMode, setAddingMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);

  // Coordenadas del centro de Rosario
  const ROSARIO_CENTER = {
    latitude: -32.9442,
    longitude: -60.6505,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const handleMarkerPress = (field) => {
    if (!addingMode) {
      setSelectedField(field);
      setShowInfoModal(true);
    }
  };

  const handleMapPress = (event) => {
    if (addingMode) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setSelectedLocation({ latitude, longitude });
      setShowAddModal(true);
    }
  };

  // Haversine formula to compute distance in kilometers
  const distanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleAddField = async (newField) => {
    try {
      const response = await ApiConnector.makeRequest('/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newField),
      });
      
      if (response.ok) {
        const saved = await response.json();
        setSoccerFields((prev) => [...prev, saved]);
        setShowAddModal(false);
        setAddingMode(false);
        setSelectedLocation(null);
        Alert.alert('¡Éxito!', 'Cancha agregada correctamente');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      // Si falla, guardamos localmente como fallback
      setSoccerFields((prev) => [...prev, newField]);
      setShowAddModal(false);
      setAddingMode(false);
      setSelectedLocation(null);
      Alert.alert('Aviso', 'No se pudo guardar en la API; guardado localmente');
    }
  };

  useEffect(() => {
    // Intentamos cargar desde la API, si falla usamos los datos iniciales
    const loadFields = async () => {
      try {
        const data = await ApiConnector.makeRequest('/fields');
        if (Array.isArray(data)) {
          setSoccerFields(data);
        } else {
          setSoccerFields(initialSoccerFields);
        }
      } catch (error) {
        setSoccerFields(initialSoccerFields);
      }
    };
    
    loadFields();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationPermissionGranted(false);
          Alert.alert('Permiso denegado', 'No se pudo acceder a la ubicación. Activa el permiso en la configuración si quieres ver canchas cercanas.');
          return;
        }
        setLocationPermissionGranted(true);
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (e) {
        console.warn('Error obteniendo ubicación:', e);
      }
    })();
  }, []);

  const toggleAddingMode = () => {
    setAddingMode(!addingMode);
    if (addingMode) {
      setSelectedLocation(null);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={currentLocation ? {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        } : ROSARIO_CENTER}
        onPress={handleMapPress}
      >
        {Array.isArray(soccerFields) && soccerFields.filter((field) => {
          if (!field) return false;
          const lat = parseFloat(field.latitude);
          const lon = parseFloat(field.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
          if (!nearbyOnly || !currentLocation) return true;
          const d = distanceKm(currentLocation.latitude, currentLocation.longitude, lat, lon);
          return d <= radiusKm;
        }).map((field) => {
          if (!field) return null;
          const lat = parseFloat(field.latitude);
          const lon = parseFloat(field.longitude);
          const d = currentLocation ? distanceKm(currentLocation.latitude, currentLocation.longitude, lat, lon) : null;
          const desc = d ? `${field.type} — ${d.toFixed(1)} km` : field.type;
          return (
            <CustomImageMarker
              key={field.id || Math.random().toString()}
              coordinate={{ latitude: lat, longitude: lon }}
              type="field"
              sport={field.type}
              title={field.name || 'Cancha'}
              description={desc}
              onPress={() => handleMarkerPress(field)}
            />
          );
        })}

        {selectedLocation && (
          <CustomImageMarker coordinate={selectedLocation} type="field" title="Nueva ubicación" />
        )}

        {currentLocation && (
          <CustomImageMarker coordinate={currentLocation} type="user" title="Tu ubicación" />
        )}
      </MapView>

      <TouchableOpacity
        style={[
          styles.addButton,
          addingMode && styles.addButtonActive
        ]}
        onPress={toggleAddingMode}
      >
        <Text style={styles.addButtonText}>
          {addingMode ? '✕ Cancelar' : '➕ Agregar Cancha'}
        </Text>
      </TouchableOpacity>

      <NearbyFilter
        nearbyOnly={nearbyOnly}
        setNearbyOnly={setNearbyOnly}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        onRefresh={async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            Alert.alert('Ubicación actualizada');
          } catch (e) {
            Alert.alert('Error', 'No se pudo actualizar la ubicación');
          }
        }}
      />

      {addingMode && (
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            📍 Toca el mapa donde quieras agregar una cancha
          </Text>
        </View>
      )}

      <FieldInfoModal
        visible={showInfoModal}
        field={selectedField}
        onClose={() => {
          setShowInfoModal(false);
          setSelectedField(null);
        }}
      />

      <AddFieldModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedLocation(null);
        }}
        onAddField={handleAddField}
        selectedLocation={selectedLocation}
      />

      <StatusBar style="auto" />
    </View>
  );
}

// Main App Component with Authentication Navigation
function AuthNavigationScreen() {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('main'); // 'login', 'signup', 'main', 'profile'

  useEffect(() => {
    // Set initial screen based on auth status
    if (isAuthenticated) {
      setCurrentScreen('main');
    } else {
      setCurrentScreen('login');
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        {currentScreen === 'main' && <MapScreen />}
        {currentScreen === 'profile' && (
          <ProfileScreen onBackToMap={() => setCurrentScreen('main')} />
        )}
        
        {/* Navigation bar for authenticated users */}
        {currentScreen === 'main' && (
          <View style={styles.navigationBar}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setCurrentScreen('profile')}
            >
              <Text style={styles.navButtonText}>👤 Perfil</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'login' && (
        <LoginScreen onNavigateToSignup={() => setCurrentScreen('signup')} />
      )}
      {currentScreen === 'signup' && (
        <SignupScreen onNavigateToLogin={() => setCurrentScreen('login')} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthNavigationScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonActive: {
    backgroundColor: '#e74c3c',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionBox: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  navigationBar: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  navButton: {
    paddingVertical: 5,
  },
  navButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
});