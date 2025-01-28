/* eslint-disable prettier/prettier */
import {View, Text} from 'react-native';
import React, {useState} from 'react';
import LoginScreen from '../screen/LoginScreen';
import EmailAddForm from '../screen/EmailForm';
import RegDevice from "../components/RegDevice"
import PasswordChangeForm from '../screen/ChangePassword';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();
const AuthNavigator = ({setIsAuthenticated}) => {
  const [accountID, setAccountID] = useState('');
  const [accountPW, setAccountPW] = useState('');
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" options={{headerShown: false}}>
        {props => (
          <LoginScreen
            {...props}
            setIsAuthenticated={setIsAuthenticated}
            setAccountID={setAccountID}
            setAccPassword={setAccountPW}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="EmailBox" options={{headerShown: false}}>
        {props => (
          <EmailAddForm {...props} accountID={accountID} password={accountPW} />
        )}
      </Stack.Screen>
      <Stack.Screen name="RegDevice" options={{headerShown: false}}>
        {props => (
          <RegDevice {...props} accountID={accountID}/>
        )}
      </Stack.Screen>
      <Stack.Screen name="ChangePassword" options={{headerShown: false}}>
        {props => (
          <PasswordChangeForm
            {...props}
            accountID={accountID}
            password={accountPW}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AuthNavigator;
