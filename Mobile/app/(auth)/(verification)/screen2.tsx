import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNPickerSelect from 'react-native-picker-select';

const SelectIDTypeScreen = () => {
  const [selectedID, setSelectedID] = useState('Passport');
  const [selectedCountry, setSelectedCountry] = useState('Yemen');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select ID type</Text>
      
      <Text style={styles.subtitle}>Document Issuing Country/Region</Text>
      <View style={styles.pickerContainer}>
        <Image source={{ uri: 'https://flagcdn.com/w40/ye.png' }} style={styles.flag} />
        <RNPickerSelect
          onValueChange={(value) => setSelectedCountry(value)}
          items={[{ label: 'Yemen', value: 'Yemen' }, { label: 'Philippines', value: 'Philippines' }]}
          value={selectedCountry}
          style={pickerSelectStyles}
        />
      </View>

      <Text style={styles.subtitle}>What method would you prefer to use?</Text>
      
      {['ID card', 'Passport', "Driver's license"].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.option, selectedID === item && styles.selectedOption]}
          onPress={() => setSelectedID(item)}
        >
          <Icon name="credit-card" size={24} color="#4CAF50" />
          <Text style={styles.optionText}>{item}</Text>
          {selectedID === item && <Icon name="check-circle" size={24} color="black" />}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  flag: {
    width: 24,
    height: 16,
    marginRight: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginTop: 10,
  },
  selectedOption: {
    borderColor: 'black',
    backgroundColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    color: 'black',
  },
  inputAndroid: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    color: 'black',
  },
};

export default SelectIDTypeScreen;