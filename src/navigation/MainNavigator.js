import React, {useEffect, useState} from 'react';
import HomeScreen from '../screen/HomeScreen';
import {createStackNavigator} from '@react-navigation/stack';
//GEOLOCATION
import Geolocation from 'react-native-geolocation-service';
const Stack = createStackNavigator();
const MainNavigator = ({setIsAuthenticated}) => {
  const [watchId, setWatchId] = useState(null);
  const [location, setLocation] = useState({
    Latitude: null,
    Longitude: null,
    Coordinates: null,
  });

  useEffect(() => {
    const id = watchCurrentLocation();

    // return () => {
    //   Geolocation.clearWatch(id); // Clear the watch on unmount
    // };
  }, []);

  const watchCurrentLocation = () => {
    const id = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        const str = `${latitude}, ${longitude}`;
        setLocation(prev => ({
          ...prev,
          Latitude: latitude,
          Longitude: longitude,
          Coordinates: str,
        }));
      },
      error => {
        console.error(error.message);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 1,
        interval: 2000,
        fastestInterval: 1500,
        maximumAge: 1500,
      },
    );

    setWatchId(id);
  };
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{headerShown: false}}>
        {props => (
          <HomeScreen
            {...props}
            setIsAuthenticated={setIsAuthenticated}
            currentCoordinates={location}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainNavigator;
