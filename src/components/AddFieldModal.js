import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export default function AddFieldModal({ visible, onClose, onAddField, selectedLocation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('');
  const [sport, setSport] = useState('');
  const [subtype, setSubtype] = useState('Fútbol 5');
  const [phone, setPhone] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const selectedType = sport === 'Fútbol' ? subtype : sport;
    if (!name || !address || !selectedType) {
      Alert.alert('Error', 'Por favor completa al menos nombre, dirección y deporte');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Error', 'Por favor selecciona una ubicación en el mapa');
      return;
    }

    const newField = {
      id: Date.now().toString(),
      name,
      address,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      type: selectedType,
      phone: phone || 'No disponible',
      price: price || 'Consultar',
      description: description || 'Sin descripción',
    };

    onAddField(newField);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setType('');
    setSport('');
    setSubtype('Fútbol 5');
    setPhone('');
    setPrice('');
    setDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>➕ Agregar Nueva Cancha</Text>
            
            {selectedLocation && (
              <Text style={styles.locationInfo}>
                📍 Ubicación seleccionada: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </Text>
            )}

            <TextInput
              style={styles.input}
              placeholder="Nombre de la cancha *"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#95a5a6"
            />

            <TextInput
              style={styles.input}
              placeholder="Dirección *"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor="#95a5a6"
            />

            {/* Sport selector */}
            <Text style={styles.label}>Deporte *</Text>
            <View style={styles.selectorRow}>
              {['Fútbol', 'Básquet', 'Tenis', 'Vóley', 'Hockey', 'Rugby'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.optionButton,
                    sport === s && styles.optionButtonActive,
                  ]}
                  onPress={() => {
                    setSport(s);
                    if (s !== 'Fútbol') setSubtype('');
                    else setSubtype('Fútbol 5');
                  }}
                >
                  <Text style={[styles.optionText, sport === s && styles.optionTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {sport === 'Fútbol' && (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>Tipo de Fútbol *</Text>
                <View style={styles.selectorRow}>
                  {['Fútbol 5', 'Fútbol 7', 'Fútbol 11'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.optionButtonSmall,
                        subtype === st && styles.optionButtonActive,
                      ]}
                      onPress={() => setSubtype(st)}
                    >
                      <Text style={[styles.optionText, subtype === st && styles.optionTextActive]}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <TextInput
              style={styles.input}
              placeholder="Teléfono (opcional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#95a5a6"
            />

            <TextInput
              style={styles.input}
              placeholder="Precio por hora (opcional)"
              value={price}
              onChangeText={setPrice}
              placeholderTextColor="#95a5a6"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#95a5a6"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>Guardar Cancha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    textAlign: 'center',
  },
  locationInfo: {
    fontSize: 12,
    color: '#27ae60',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#27ae60',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonActive: {
    backgroundColor: '#3498db',
  },
  optionText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  optionTextActive: {
    color: 'white',
  },
});
