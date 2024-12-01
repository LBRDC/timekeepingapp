import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
} from 'react-native';
import {openLocationSettings} from '../helper/DeveloperOptions';
const LocationError = () => {
  const openSettings = () => {
    Linking.openSettings();
  };
  return (
    <View style={styles.container}>
      <Image source={require('../assets/error.png')} style={styles.image} />
      <Text style={styles.title}>Location Services Disabled</Text>
      <Text style={styles.message}>
        To provide you with the best banking experience, please enable location
        services in your device settings.
      </Text>
      <TouchableOpacity style={styles.button} onPress={openLocationSettings}>
        <Text style={styles.buttonText}>Open Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationError;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F0FE', // Light background color for a modern feel
  },
  image: {
    width: 180, // Adjusted size for a modern look
    height: 180,
    marginBottom: 30,
    borderRadius: 90, // Circular image
    borderWidth: 3,
    borderColor: '#005EB8', // Primary Landbank blue
  },
  title: {
    fontSize: 28, // Increased font size for modern aesthetics
    fontWeight: '700',
    color: '#003C5A', // Darker blue for the title
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555', // Softer color for the message
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#005EB8', // Landbank blue
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25, // Rounded button
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
