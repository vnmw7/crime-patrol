import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PassportPhotoScreen = () => {
  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Placeholder Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/300x150' }} style={styles.image} />
      </View>
      
      {/* Instructions */}
      <Text style={styles.title}>Before taking your passport photo, please make sure that</Text>
      <View style={styles.instructions}>
        <Text style={styles.bullet}>• Your ID isn’t expired</Text>
        <Text style={styles.bullet}>• Take a clear photo</Text>
        <Text style={styles.bullet}>• Capture your entire ID</Text>
      </View>
      
      {/* Take Photo Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Take photo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
  imageContainer: {
    width: '90%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 60,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 20,
    width: '90%',
  },
  instructions: {
    width: '90%',
    marginTop: 10,
  },
  bullet: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 30,
    width: '90%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PassportPhotoScreen;
