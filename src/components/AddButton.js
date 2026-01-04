import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from './buttonStyles';

export default function AddButton({ addingMode, toggleAddingMode }) {
  return (
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
  );
}
