import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PassportVerificationScreen = () => {
  return (
    <View style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Passport Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/300x150' }} style={styles.image} />
      </View>
      
      {/* Instructions */}
      <Text style={styles.title}>After detected, your photo</Text>
      <View style={styles.instructions}>
        <Text style={styles.checkItem}>✅ Readable, clear and not blurry</Text>
        <Text style={[styles.checkItem, styles.strikeThrough]}>✅ Well lit, not reflective, not too dark</Text>
        <Text style={styles.checkItem}>✅ ID occupies most of the image</Text>
      </View>
      
      {/* Confirmation */}
      <Text style={styles.subTitle}>Please confirm that</Text>
      <Text style={styles.bullet}>• ID is not expired</Text>
      
      {/* Buttons */}
      <TouchableOpacity style={styles.confirmButton}>
        <Text style={styles.buttonText}>Confirm</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.retakeButton}>
        <Text style={styles.retakeText}>Retake</Text>
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
    marginTop: 20,
    width: '90%',
  },
  instructions: {
    width: '90%',
    marginTop: 10,
  },
  checkItem: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  strikeThrough: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    width: '90%',
  },
  bullet: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  confirmButton: {
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
  retakeButton: {
    marginTop: 10,
  },
  retakeText: {
    fontSize: 16,
    color: '#666',
    textDecorationLine: 'underline',
  },
});

export default PassportVerificationScreen;