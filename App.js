import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import DeviceInfo from 'react-native-device-info';
import JailMonkey from 'jail-monkey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS, {exists} from 'react-native-fs';
// COMPONENTS
import LocationError from './src/components/LocationError';
import DeveloperEnabled from './src/components/DeveloperEnabled';
import DateTimeError from './src/components/DateTimeError';
import DownloadingPage from './src/components/DownloadingPage';
// NAVIGATORS
import MainNavigator from './src/navigation/MainNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import CheckDeviceAutoTime from 'react-native-check-device-auto-time';
// GEOLOCATION
import Geolocation from 'react-native-geolocation-service';
import {Platform, Alert, PermissionsAndroid, Linking} from 'react-native';

//HELPER
import NotificationManager from './src/helper/NotificationManager';
import {
  checkAutoDateTime,
  checkAutoTimeZone,
} from './src/helper/DeveloperOptions';
import {checkDatasetExists, readDetails} from './src/helper/database';

//SERVICES
import {URL, executeRequest} from './src/services/urls';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locStatus, setLocStatus] = useState(true);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isAutoDateTime, setIsAutoDateTime] = useState(true);
  const [isUpdating, setUpdating] = useState(false);
  const intervalIdRef = useRef(null);
  const downloadPath = RNFS.DocumentDirectoryPath + '/timekeeping.apk';

  useEffect(() => {
    const checkAutoTime = async () => {
      const isEnabled = await CheckDeviceAutoTime.isAutomaticTimeEnabled();
      Alert.alert('Auto Time', isEnabled ? 'Enabled' : 'Disabled');
    };

    checkAutoTime();
  }, []);

  useEffect(() => {
    NotificationManager.requestNotificationPermission();
    const testOut = async () => {
      const appversion = await DeviceInfo.getVersion();
      if (Platform.OS === 'android') {
        NotificationManager.createNotificationChannel();
        executeRequest(URL().updateApp, 'GET', null, async res => {
          if (!res.loading) {
            if (appversion != res.data.appVersion) {
              setUpdating(res.data.download);
            } else {
              if (await RNFS.exists(downloadPath)) {
                await RNFS.unlink(downloadPath);
              }
            }
          }
        });
      }
    };
    testOut();
  }, []);

  useEffect(() => {
    checkLocal();
    isLoggedIn();
    intervalIdRef.current = setInterval(() => {
      requestPermission();
      isGpsEnable();
      // devOptions();
      dateTime();
    }, 1000);

    return () => clearInterval(intervalIdRef.current);
  }, []);

  const checkLocal = async () => {
    try {
      const value = await AsyncStorage.getItem('isFisrtTime');
      if (value === null) {
        await AsyncStorage.setItem('isFisrtTime', 'true');
        console.log(value);
      }
    } catch (e) {
      console.log(e);

      // saving error
    }
  };

  const isGpsEnable = async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await Geolocation.requestAuthorization('always');
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
      {isUpdating ? (
        <DownloadingPage />
      ) : isAuthenticated ? (
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
