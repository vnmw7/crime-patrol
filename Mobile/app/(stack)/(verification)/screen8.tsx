import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PhotoVerificationScreen = () => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Uploaded Document Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/300x150' }} style={styles.image} />
      </View>
      
      {/* Verification Checklist */}
      <Text style={styles.sectionTitle}>After detected, your photo</Text>
      <Text style={styles.checkItem}>✅ Readable, clear and not blurry</Text>
      <Text style={styles.checkItem}>✅ Well-lit, not reflective, not too dark</Text>
      <Text style={styles.checkItem}>✅ ID occupies most of the image</Text>
      
      {/* Confirmation Checklist */}
      <Text style={styles.sectionTitle}>Please confirm that</Text>
      <Text style={styles.confirmItem}>• Document is within 3 months</Text>
      <Text style={styles.confirmItem}>• Document includes your name and Hong Kong address</Text>
      
      {/* Confirm and Retake Buttons */}
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
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
  imageContainer: {
    width: '100%',
    height: 200,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  checkItem: {
    fontSize: 14,
    color: 'green',
    marginTop: 5,
  },
  confirmItem: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  confirmButton: {
    backgroundColor: '#000',
    padding: 15,
    alignItems: 'center',
    borderRadius: 25,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retakeButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  retakeText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default PhotoVerificationScreen;