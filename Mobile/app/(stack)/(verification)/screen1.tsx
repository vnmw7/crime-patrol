import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const VerificationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let's get started</Text>
      <Text style={styles.description}>
        To ensure the security of your account and protect against fraud, we require you to complete our identity verification process
      </Text>
      
      <View style={styles.item}>
        <Icon name="photo" size={24} color="#4CAF50" />
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>Photo ID</Text>
          <Text style={styles.itemDescription}>ID card, passport, driver license supported</Text>
        </View>
      </View>
      
      <View style={styles.item}>
        <Icon name="location-on" size={24} color="#4CAF50" />
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>Proof of address</Text>
          <Text style={styles.itemDescription}>Documents that can prove the address, such as utility bills, etc</Text>
        </View>
      </View>
      
      <View style={styles.item}>
        <Icon name="face" size={24} color="#4CAF50" />
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>Facial recognition</Text>
          <Text style={styles.itemDescription}>Confirm that the portrait matches the picture on the identification document.</Text>
        </View>
      </View>
      
      <Text style={styles.footerText}>
        Clicking the continue button means that I have read and agreed to the
        <Text style={styles.linkText}> user identity authentication information statement</Text>
      </Text>
      
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Agree and continue</Text>
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
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    marginLeft: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 20,
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
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

export default VerificationScreen;
