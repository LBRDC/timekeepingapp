import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
//helper
import {getDeviceUniqueId} from '../helper/DeveloperOptions';

//services
import {URL, executeRequest} from '../services/urls';

//components
import Loader from './Loader';

const RegDevice = ({navigation, accountID}) => {
  const [loading, setLoading] = useState(false);
  const [loadermsg, setloadermsg] = useState('Downloading...');

  async function requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: 'Phone State Permission',
          message: "This app needs access to your phone's state",
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission granted');
      } else {
        console.log('Permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  const registerDevice = async () => {
    const deviceId = await getDeviceUniqueId();
    executeRequest(
      URL().registerDevice,
      'POST',
      JSON.stringify({accountID: accountID, serialNumber: deviceId}),
      res => {
        setloadermsg('Please wait...');
        setLoading(true);
        if (!res.loading) {
          setLoading(false);
          setTimeout(() => {
            navigation.navigate('Login');
          }, 1611);
        }
      },
    );
  };
  return (
    <View style={styles.container}>
      <Loader loading={loading} message={loadermsg} />
      <Image source={require('../assets/mobile.png')} style={styles.image} />
      <Text style={styles.title}>Register Your Device</Text>
      <Text style={styles.message}>
        To provide you with the best banking experience, please register your
        device.
      </Text>
      <TouchableOpacity style={styles.button} onPress={registerDevice}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegDevice;

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
