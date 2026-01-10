import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import MapView, { UrlTile } from 'react-native-maps';
import FieldInfoModal from './src/components/FieldInfoModal';
import AddFieldModal from './src/components/AddFieldModal';
import NearbyFilter from './src/components/NearbyFilter';
import CustomImageMarker from './src/components/CustomImageMarker';
import { initialSoccerFields } from './src/data/soccerFields';

export default function App() {
  const [soccerFields, setSoccerFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [addingMode, setAddingMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);

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

  const handleAddField = (newField) => {
    // Simulamos llamada a API POST /fields
    fetch('http://192.168.18.39:3000/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newField),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al guardar');
        return res.json();
      })
      .then((saved) => {
        setSoccerFields((prev) => [...prev, saved]);
        setShowAddModal(false);
        setAddingMode(false);
        setSelectedLocation(null);
        Alert.alert('¡Éxito!', 'Cancha agregada correctamente');
      })
      .catch(() => {
        // Si falla, guardamos localmente como fallback
        setSoccerFields((prev) => [...prev, newField]);
        setShowAddModal(false);
        setAddingMode(false);
        setSelectedLocation(null);
        Alert.alert('Aviso', 'No se pudo guardar en la API; guardado localmente');
      });
  };

  useEffect(() => {
    // Intentamos cargar desde la API, si falla usamos los datos iniciales
    fetch('http://192.168.18.39:3000/fields')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSoccerFields(data);
        } else {
          setSoccerFields(initialSoccerFields);
        }
      })
      .catch(() => setSoccerFields(initialSoccerFields));
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
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        
        {Array.isArray(soccerFields) && soccerFields.filter((field) => {
          if (!field) return false;
          // ensure numeric coords
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

      {/* Botón para activar modo agregar */}
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

      {/* Modal de información */}
      <FieldInfoModal
        visible={showInfoModal}
        field={selectedField}
        onClose={() => {
          setShowInfoModal(false);
          setSelectedField(null);
        }}
      />

      {/* Modal para agregar cancha */}
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
  filterBox: {
    position: 'absolute',
    top: 40,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 10,
    elevation: 6,
  },
  filterButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2ecc71',
  },
  filterText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radiusLabel: {
    marginRight: 8,
    fontWeight: '600',
    color: '#34495e',
  },
  radiusButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
  },
  radiusButtonActive: {
    backgroundColor: '#3498db',
  },
  radiusText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  refreshButton: {
    marginTop: 8,
    backgroundColor: '#95a5a6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshText: {
    color: 'white',
    fontWeight: '600',
  }
});
