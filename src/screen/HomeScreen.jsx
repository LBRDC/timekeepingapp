import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  Alert,
  RefreshControl,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import * as turf from '@turf/turf';
import DeviceInfo from 'react-native-device-info';
//ICON
import Icon from 'react-native-vector-icons/Ionicons';
//COMPONENTS
import GButton from '../components/GButton';
import LocationError from '../components/LocationError';
//GEOLOCATION
//BIOMETRICS
import ReactNativeBiometrics from 'react-native-biometrics';

//Helper
import {readDetails} from '../helper/database';

//Location
import {getCurrentLocation} from '../services/getLocation';

//BIOMETRICS
const Biometrics = new ReactNativeBiometrics();
const HomeScreen = ({setIsAuthenticated, currentCoordinates}) => {
  const [currentDateTime, setCurrentDateTime] = useState('Loading time...');
  const [location, setLocation] = useState('Loading location...');
  const [lastAction, setLastAction] = useState('No recent action');
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [coordinates, setCoordinates] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  /*
   * USE EFFECT
   */

  //Check Location Permission
  useEffect(() => {
    requestPermission();
    loadDetails();
    syncLocation();
    const timer = setInterval(() => {
      checkConnectivity();
      dateTime();
    }, 1000);
    return () => {
      clearInterval(timer);
      backhandler.remove();
    };
  }, []);

  useEffect(() => {
    syncLocation();
  }, [currentCoordinates.Coordinates]);

  //PERMISSION
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const check = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (!check) {
        const request = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (request == 'never_ask_again') {
          Linking.openSettings();
        }

        if (request !== PermissionsAndroid.RESULTS.GRANTED) {
          requestPermission();
        }
      }
      requestPermission();
    }
  };

  const syncLocation = async () => {
    const mylocation = await getCurrentLocation(
      currentCoordinates.Latitude,
      currentCoordinates.Longitude,
    );
    const current_loc = mylocation.results[0]?.formatted_address;
    console.log(current_loc);
    setLocation(current_loc);
  };
  const dateTime = () => {
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const currentDate = new Date();
    const currentDay = weekdays[currentDate.getDay()];
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();
    setCurrentDateTime(`${formattedDate} ${formattedTime}`);
    setStatus(currentDay);
  };

  const loadDetails = async () => {
    const {account} = await readDetails();
    setName(account.name);
    setIdNumber(account.employee);
  };

  //FUNCTIONS
  // const watchCurrentLocation = () => {
  //   const id = Geolocation.watchPosition(
  //     position => {
  //       const {latitude, longitude} = position.coords;
  //       const str = `${latitude},${longitude}`;
  //       setLatitude(latitude);
  //       setLongitude(longitude);
  //       setCoordinates(str);
  //       console.log(str);
  //     },
  //     error => {
  //       console.error(error.message);
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       distanceFilter: 0,
  //       interval: 2000,
  //       fastestInterval: 1000,
  //     },
  //   );

  //   setWatchId(id);
  // };

  const backhandler = BackHandler.addEventListener('hardwareBackPress', e => {
    Alert.alert('Heyy', 'Are you sure you want to exit?', [
      {text: 'Cancel', onPress: () => null, style: 'cancel'},
      {text: 'Yes', onPress: () => BackHandler.exitApp()},
    ]);
    return true;
  });
  const checkConnectivity = async () => {
    try {
      const req = await fetch('https://www.google.com');
      if (req.ok) {
        setIsConnected(true);
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  // const isValid = () => {
  //   const userLocation = [longitude, latitude];
  //   const geofenceCenter = [120.99674507047705, 14.741638157279192];
  //   const geofenceRadius = 6.398233881168904;
  //   const distance = turf.distance(
  //     turf.point(userLocation),
  //     turf.point(geofenceCenter),
  //     {units: 'meters'},
  //   );

  //   if (distance <= geofenceRadius) {
  //     console.log('You are inside the geofence.');
  //   } else {
  //     console.log('You are outside the geofence.');
  //   }
  // };

  //Refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    syncLocation();
    setRefreshing(false);
  }, []);

  // Event Listeners
  const logout = () => {
    setIsAuthenticated(false);
  };
  const checkIn = async () => {};

  const biometricsChecker = () => {
    Biometrics.isSensorAvailable()
      .then(result => {
        const {available, biometryType} = result;
        if (available) {
          Biometrics.simplePrompt({
            promptMessage: 'Scan your fingerprint to check in.',
          }).then(result => {
            const {success} = result;
            if (success) {
              console.log('Authenticated Success');
            } else {
              console.log('Authentication Failed');
            }
          });
        } else {
          Alert.alert('Biometrics', 'Biometrics are not available.');
        }
      })
      .catch(err => {
        console.log(err);
      });
  };
  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View key={name + idNumber} style={styles.userInfo}>
            <Text style={styles.userName}>{name || 'Name'}</Text>
            <Text style={styles.employeeId}>ID: {idNumber}</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Icon name="log-out-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{padding: 16}}
          bounces
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Status</Text>
            <Text style={styles.status}>{status}</Text>
            <Text style={styles.dateTime}>{currentDateTime}</Text>
            <Text
              style={
                (styles.location,
                [
                  {
                    color: isConnected ? '#363636' : 'red',
                    fontWeight: isConnected ? 'normal' : 'bold',
                    fontSize: 13,
                  },
                ])
              }>
              {isConnected ? location : 'Offline mode'}
            </Text>
            <Text style={(styles.location, [{marginTop: 5}])}>
              {currentCoordinates.Coordinates}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Time Tracking</Text>
          <View style={styles.Grid}>
            <GButton
              title="Check In"
              icon="log-in-outline"
              color="#006341"
              textColor="#FFFFFF"
              handleAction={checkIn}
            />
            <GButton
              title="Check Out"
              icon="log-out-outline"
              color="#006341"
              textColor="#FFFFFF"
              handleAction={checkIn}
            />
            <GButton
              title="Break In"
              icon="cafe-outline"
              color="#006341"
              textColor="#FFFFFF"
            />
            <GButton
              title="Break Out"
              icon="restaurant-outline"
              color="#006341"
              textColor="#FFFFFF"
            />
          </View>

          <Text style={styles.sectionTitle}>Special Actions</Text>
          <View style={styles.Grid}>
            <GButton
              title="Overtime In"
              icon="time-outline"
              color="#FDB913"
              textColor="#006341"
              handleAction={checkIn}
            />
            <GButton
              title="Overtime Out"
              icon="timer-outline"
              color="#FDB913"
              textColor="#006341"
              handleAction={e => checkDetails()}
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <Text style={styles.lastAction}>{lastAction}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#006341',
    borderBottomWidth: 1,
    borderBottomColor: '#004D31',
  },
  userInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  employeeId: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#006341',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#006341',
    marginBottom: 12,
  },
  status: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#006341',
    marginBottom: 12,
  },
  dateTime: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 6,
  },
  location: {
    fontSize: 14,
    color: '#333333',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#006341',
    marginTop: 24,
    marginBottom: 16,
  },
  Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
});
