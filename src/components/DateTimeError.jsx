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
import {openDateTime, openDeveloperOptions} from '../helper/DeveloperOptions';
const DateTimeError = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/developer.png')} style={styles.image} />
      <Text style={styles.title}>Automatic Date & Time Settings</Text>
      <Text style={styles.message}>
        For optimal performance and accuracy, please enable automatic date,
        time, and timezone settings in your device.
      </Text>
      <TouchableOpacity style={styles.button} onPress={openDateTime}>
        <Text style={styles.buttonText}>Open Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DateTimeError;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F0FE',
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 30,
    borderRadius: 50,
    borderWidth: 0,
    borderColor: '#005EB8',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#003C5A',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#005EB8',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
