import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';
import JailMonkey from 'jail-monkey';

//COMPONENTS
import LocationError from './src/components/LocationError';
import DeveloperEnabled from './src/components/DeveloperEnabled';
//Navigator
import MainNavigator from './src/navigation/MainNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';

//GEOLOCATION
import Geolocation from 'react-native-geolocation-service';
import {Platform, Alert} from 'react-native';
import {
  checkAutoDateTime,
  checkAutoTimeZone,
} from './src/helper/DeveloperOptions';
import DateTimeError from './src/components/DateTimeError';
import {checkDatasetExists, readDetails} from './src/helper/database';
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locStatus, setLocStatus] = useState(true);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isAutoDateTime, setIsAutoDateTime] = useState(true);
  useEffect(() => {
    isLoggedIn();
    setInterval(() => {
      isGpsEnable();
      // devOptions();
      // dateTime();
    }, 1000);
  }, []);

  //FUNCTIONS
  const isGpsEnable = async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await Geolocation.requestAuthorization('whenInUse');
      if (authStatus === 'granted') {
        setLocStatus(true);
      } else {
        setLocStatus(false);
      }
    }
    if (Platform.OS === 'android') {
      const isLocationEnabled = await DeviceInfo.isLocationEnabled();
      setLocStatus(isLocationEnabled);
    }
  };

  const devOptions = async () => {
    const res = await JailMonkey.isDevelopmentSettingsMode();
    setIsDebugMode(res);
  };

  const dateTime = async () => {
    if (Platform.OS == 'android') {
      const date = await checkAutoDateTime();
      const timezone = await checkAutoTimeZone();

      if (!date || !timezone) {
        setIsAutoDateTime(false);
      } else {
        setIsAutoDateTime(true);
      }
    }
  };

  const isLoggedIn = async () => {
    const check = await checkDatasetExists();
    if (check) {
      const data = await readDetails();
      if (data.rememberMe == true) {
        setIsAuthenticated(true);
      }
    }
  };
  const NavContainer = () => {
    return (
      <NavigationContainer>
        {isAuthenticated ? (
          <MainNavigator setIsAuthenticated={setIsAuthenticated} />
        ) : (
          <AuthNavigator setIsAuthenticated={setIsAuthenticated} />
        )}
      </NavigationContainer>
    );
  };
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
