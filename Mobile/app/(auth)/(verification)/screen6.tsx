import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProofOfAddressScreen = () => {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
      {/* Address Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: 'https://via.placeholder.com/300x150' }} style={styles.image} />
      </View>
      
      {/* Title and Description */}
      <Text style={styles.title}>Proof of address</Text>
      <Text style={styles.description}>
        We need proof of address to confirm that you live in Hong Kong
      </Text>
      
      {/* Document Requirements */}
      <View style={styles.requirements}>
        <Text style={styles.bullet}>• You can use any of the following documents as proof of address documentation: Utility bills / Bank statement / Communication billing</Text>
        <Text style={styles.bullet}>• The document must contain your name, address in Hong Kong, date within the last 3 months</Text>
        <Text style={styles.bullet}>• Please provide supporting documents in English</Text>
      </View>
      
      {/* Take Photo Button */}
      <TouchableOpacity style={styles.photoButton}>
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
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
  imageContainer: {
    width: '100%',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 10,
  },
  requirements: {
    marginTop: 10,
  },
  bullet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  photoButton: {
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
});

export default ProofOfAddressScreen;