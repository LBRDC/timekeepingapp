import {View, Text} from 'react-native';
import React from 'react';
import HomeScreen from '../screen/HomeScreen';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();
const MainNavigator = ({setIsAuthenticated}) => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" options={{headerShown: false}}>
        {props => (
          <HomeScreen {...props} setIsAuthenticated={setIsAuthenticated} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default MainNavigator;
