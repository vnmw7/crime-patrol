import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const VerifiedScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/verified.png')} // Replace with the actual path to your image
        style={styles.image}
      />
      <Text style={styles.title}>Verified</Text>
      <Text style={styles.description}>
        You currently have access to all of VAEX's features and high limits
      </Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerifiedScreen;
