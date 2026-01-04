import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NearbyFilter({ nearbyOnly, setNearbyOnly, radiusKm, setRadiusKm, onRefresh }) {
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    // if filter is turned off externally, expand so user sees controls
    if (!nearbyOnly) setMinimized(false);
  }, [nearbyOnly]);

  if (minimized) {
    return (
      <TouchableOpacity style={styles.chip} onPress={() => setMinimized(false)}>
        <Text style={styles.chipText}>{nearbyOnly ? `Cercanas ${radiusKm}km` : 'Filtro'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.filterButton, nearbyOnly && styles.filterButtonActive]} onPress={() => setNearbyOnly(!nearbyOnly)}>
        <Text style={styles.filterText}>{nearbyOnly ? 'Mostrando cercanas' : 'Mostrar cercanas'}</Text>
      </TouchableOpacity>

      <View style={styles.radiusRow}>
        <Text style={styles.radiusLabel}>Radio:</Text>
        {[1,3,5].map((r) => (
          <TouchableOpacity key={r} style={[styles.radiusButton, radiusKm === r && styles.radiusButtonActive]} onPress={() => setRadiusKm(r)}>
            <Text style={styles.radiusText}>{r} km</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshText}>Actualizar ubicación</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.minimize} onPress={() => setMinimized(true)}>
        <Text style={styles.minimizeText}>—</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 10,
    elevation: 6,
  },
  chip: {
    position: 'absolute',
    top: 40,
    left: 12,
    backgroundColor: 'rgba(46,134,222,0.95)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    elevation: 6,
  },
  chipText: {
    color: 'white',
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginRight: 30,
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
    marginBottom: 8,
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
    backgroundColor: '#95a5a6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshText: {
    color: 'white',
    fontWeight: '600',
  },
  minimize: {
    position: 'absolute',
    right: 8,
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bdc3c7',
  },
  minimizeText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '700',
  }
});
