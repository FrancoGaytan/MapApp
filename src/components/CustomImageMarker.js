import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';

const CustomImageMarker = memo(({ coordinate, title, description, onPress, type = 'field', sport }) => {
  // tracksViewChanges optimization to prevent flickering
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    // After initial render, stop tracking view changes to improve performance and stop flickering
    // Re-enable briefly when coordinate/type/sport change
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [coordinate, type, sport]); // Re-enable if coordinate, type or sport changes

  // Define styles based on type
  const isUser = type === 'user';
  
  // Colors
  const backgroundColor = isUser ? '#2196F3' : '#4CAF50'; // Blue for user, Green for field
  const borderColor = 'white';
  
  // Emoji/Icon mapping by sport
  let icon = '⚽';
  if (isUser) icon = '👤';
  else if (sport) {
    const s = (sport || '').toLowerCase();
    if (s.includes('fútbol')) {
      // show subtype number if present (e.g., 'Fútbol 5')
      const m = sport.match(/(5|7|11)/);
      icon = m ? `${m[0]}⚽` : '⚽';
    } else if (s.includes('básquet') || s.includes('basket')) icon = '🏀';
    else if (s.includes('tenis')) icon = '🎾';
    else if (s.includes('vóley') || s.includes('voley')) icon = '🏐';
    else if (s.includes('hockey')) icon = '🏑';
    else if (s.includes('rugby')) icon = '🏉';
    else icon = '⚽';
  } else {
    icon = '⚽';
  }

  return (
    <Marker 
      coordinate={coordinate} 
      onPress={onPress}
      title={title}
      description={description}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={styles.shadowContainer}>
        <View style={[styles.innerCircle, { backgroundColor, borderColor }]}>
          <Text style={styles.markerIcon}>{icon}</Text>
        </View>
      </View>
    </Marker>
  );
});

export default CustomImageMarker;

const styles = StyleSheet.create({
  shadowContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 5,
    backgroundColor: 'transparent',
  },
  innerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures content doesn't spill out
  },
  markerIcon: {
    fontSize: 16,
    textAlign: 'center',
    // Adjust line height or margin if needed for vertical centering
    includeFontPadding: false, // Android specific fix for vertical alignment
  }
});
