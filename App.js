import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import DeviceInfo from 'react-native-device-info';
import JailMonkey from 'jail-monkey';
// COMPONENTS
import LocationError from './src/components/LocationError';
import DeveloperEnabled from './src/components/DeveloperEnabled';
import DateTimeError from './src/components/DateTimeError';

// NAVIGATORS
import MainNavigator from './src/navigation/MainNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

// GEOLOCATION
import Geolocation from 'react-native-geolocation-service';
import {Platform, Alert, PermissionsAndroid, Linking} from 'react-native';
import {
  checkAutoDateTime,
  checkAutoTimeZone,
} from './src/helper/DeveloperOptions';
import {checkDatasetExists, readDetails} from './src/helper/database';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locStatus, setLocStatus] = useState(true);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isAutoDateTime, setIsAutoDateTime] = useState(true);
  const intervalIdRef = useRef(null);
  useEffect(() => {
    isLoggedIn();
    intervalIdRef.current = setInterval(() => {
      requestPermission();
      isGpsEnable();
      devOptions();
      dateTime();
    }, 1000);

    return () => clearInterval(intervalIdRef.current);
  }, []);

  const isGpsEnable = async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await Geolocation.requestAuthorization('whenInUse');
      setLocStatus(authStatus === 'granted');
    } else if (Platform.OS === 'android') {
      const isLocationEnabled = await DeviceInfo.isLocationEnabled();
      setLocStatus(isLocationEnabled);
    }
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const check = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (!check) {
        const request = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (request === 'never_ask_again') {
          clearInterval(intervalIdRef.current);
          Alert.alert(
            'Required',
            'In order to use timekeeping you need to enable location permission in app settings',
            [
              {
                text: 'Ok',
                onPress: () => {
                  Linking.openSettings();
                  intervalIdRef.current = setInterval(() => {
                    requestPermission();
                  }, 1000);
                },
              },
            ],
          );
        } else if (request !== 'granted') {
          intervalIdRef.current = setInterval(() => {
            isGpsEnable();
            devOptions();
            dateTime();
          }, 1000);
          Alert.alert(
            'Required',
            'In order to use timekeeping you need to enable location permission',
            [{text: 'Ok', onPress: () => requestPermission()}],
          );
        }
      }
    }
  };

  const devOptions = async () => {
    const res = await JailMonkey.isDevelopmentSettingsMode();
    setIsDebugMode(res);
  };

  const dateTime = async () => {
    if (Platform.OS === 'android') {
      const date = await checkAutoDateTime();
      const timezone = await checkAutoTimeZone();
      setIsAutoDateTime(date && timezone);
    }
  };

  const isLoggedIn = async () => {
    const check = await checkDatasetExists();
    if (check) {
      const data = await readDetails();
      if (data.rememberMe) {
        setIsAuthenticated(true);
      }
    }
  };

  const NavContainer = () => (
    <NavigationContainer>
      {isAuthenticated ? (
        <MainNavigator setIsAuthenticated={setIsAuthenticated} />
      ) : (
        <AuthNavigator setIsAuthenticated={setIsAuthenticated} />
      )}
    </NavigationContainer>
  );

  return (
    <>
      {isDebugMode ? (
        <DeveloperEnabled />
      ) : locStatus ? (
        isAutoDateTime ? (
          <NavContainer />
        ) : (
          <DateTimeError />
        )
      ) : (
        <LocationError />
      )}
    </>
  );
};

export default App;
