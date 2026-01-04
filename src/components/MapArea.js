import React, { useState, useRef } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import CustomImageMarker from './CustomImageMarker';
import { ROSARIO_CENTER } from '../../constants';

export default function MapArea({
  soccerFields = [],
  currentLocation,
  nearbyOnly,
  radiusKm,
  addingMode,
  onStartAddAtLocation,
  onSelectField,
}) {
  const [mapRegion, setMapRegion] = useState(null);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const mapRef = useRef(null);

  const distanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleRegionChangeComplete = (region) => {
    try {
      const THRESHOLD = 0.06;
      if (region && typeof region.latitudeDelta === 'number') {
        setMapRegion(region);
        setClusteringEnabled(region.latitudeDelta > THRESHOLD);
      }
    } catch (e) {
      console.warn('MapArea handleRegionChangeComplete', e);
    }
  };

  const handleMapPress = (event) => {
    if (addingMode && typeof onStartAddAtLocation === 'function') {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onStartAddAtLocation({ latitude, longitude });
    }
  };

  return (
    <MapView
      style={{ width: '100%', height: '100%' }}
      onPress={handleMapPress}
      onRegionChangeComplete={handleRegionChangeComplete}
      ref={mapRef}
      initialRegion={currentLocation ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      } : ROSARIO_CENTER}
    >
      {(() => {
        const items = [];
        if (!Array.isArray(soccerFields)) return null;

        const filtered = soccerFields.filter((field) => {
          if (!field) return false;
          const lat = parseFloat(field.latitude);
          const lon = parseFloat(field.longitude);
          if (Number.isNaN(lat) || Number.isNaN(lon)) return false;
          if (!nearbyOnly || !currentLocation) return true;
          const d = distanceKm(currentLocation.latitude, currentLocation.longitude, lat, lon);
          return d <= radiusKm;
        });

        if (clusteringEnabled) {
          const effectiveRegion = mapRegion || (currentLocation ? { ...currentLocation, latitudeDelta: 0.1, longitudeDelta: 0.1 } : ROSARIO_CENTER);
          let decimals = 2;
          const ld = effectiveRegion.latitudeDelta || 0.1;
          if (ld > 0.5) decimals = 0;
          else if (ld > 0.1) decimals = 2;
          else decimals = 3;
          const groups = {};
          filtered.forEach((f) => {
            const lat = parseFloat(f.latitude);
            const lon = parseFloat(f.longitude);
            const key = `${lat.toFixed(decimals)}|${lon.toFixed(decimals)}`;
            if (!groups[key]) groups[key] = { latSum: 0, lonSum: 0, count: 0, items: [] };
            groups[key].latSum += lat;
            groups[key].lonSum += lon;
            groups[key].count += 1;
            groups[key].items.push(f);
          });
          Object.keys(groups).forEach((k) => {
            const g = groups[k];
            if (g.count === 1) items.push({ type: 'single', field: g.items[0] });
            else items.push({ type: 'cluster', latitude: g.latSum / g.count, longitude: g.lonSum / g.count, count: g.count, members: g.items });
          });
        } else {
          filtered.forEach((field) => items.push({ type: 'single', field }));
        }

        return items.map((it, idx) => {
          if (it.type === 'single') {
            const field = it.field;
            const lat = parseFloat(field.latitude);
            const lon = parseFloat(field.longitude);
            const d = currentLocation ? distanceKm(currentLocation.latitude, currentLocation.longitude, lat, lon) : null;
            const desc = d ? `${field.type} — ${d.toFixed(1)} km` : field.type;
            return (
              <CustomImageMarker
                key={field.id || `f-${idx}-${lat}-${lon}`}
                coordinate={{ latitude: lat, longitude: lon }}
                type="field"
                sport={field.type}
                title={field.name || 'Cancha'}
                description={desc}
                onPress={() => typeof onSelectField === 'function' && onSelectField(field)}
              />
            );
          }

          return (
            <Marker
              key={`c-${idx}-${it.latitude}-${it.longitude}`}
              coordinate={{ latitude: it.latitude, longitude: it.longitude }}
              onPress={() => {
                try {
                  const newDelta = mapRegion && mapRegion.latitudeDelta ? Math.max(mapRegion.latitudeDelta / 2, 0.001) : 0.05;
                  if (mapRef.current && typeof mapRef.current.animateToRegion === 'function') {
                    mapRef.current.animateToRegion({ latitude: it.latitude, longitude: it.longitude, latitudeDelta: newDelta, longitudeDelta: newDelta }, 300);
                  }
                } catch (e) {
                  console.warn('MapArea cluster press', e);
                }
              }}
            >
              <View style={{
                backgroundColor: 'rgba(52,152,219,0.95)',
                padding: 4,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: 'white',
                minWidth: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',

              }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>{it.count}</Text>
              </View>
            </Marker>
          );
        });
      })()}

      {currentLocation && (
        <CustomImageMarker coordinate={currentLocation} type="user" title="Tu ubicación" />
      )}
    </MapView>
  );
}
