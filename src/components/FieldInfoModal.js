import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export default function FieldInfoModal({ visible, field, onClose }) {
  if (!field) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{field.name}</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>📍 Dirección:</Text>
              <Text style={styles.value}>{field.address}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>⚽ Tipo:</Text>
              <Text style={styles.value}>{field.type}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>💰 Precio:</Text>
              <Text style={styles.value}>{field.price}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>📞 Teléfono:</Text>
              <Text style={styles.value}>{field.phone}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>ℹ️ Descripción:</Text>
              <Text style={styles.value}>{field.description}</Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalMinimized: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '75%',
    maxHeight: 100,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalTitleMin: {
    fontSize: 16,
    marginBottom: 0,
    textAlign: 'left',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleIcon: {
    fontSize: 16,
    color: '#34495e',
    marginLeft: 10,
  },
  contentScroll: {
    maxHeight: '65%',
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 5,
  },
  value: {
    fontSize: 15,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonMin: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
