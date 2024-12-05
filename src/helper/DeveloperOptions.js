import { Linking, Platform } from 'react-native';
import {NativeModules} from 'react-native';
import 'react-native-get-random-values';
import * as Keychain from 'react-native-keychain';
import EncryptedStorage from 'react-native-encrypted-storage';
import { v4 as uuidv4 } from 'uuid';
const {DeveloperOptions} = NativeModules;

export const openDeveloperOptions = () => {
  DeveloperOptions.openDeveloperOptions();
};


export const openLocationSettings = () => {
  if(Platform.OS == "android"){
  DeveloperOptions.openLocationSettings();
  }
  if(Platform.OS == "ios"){
    Linking.openURL('App-Prefs:Privacy&path=LOCATION')
  }
};

// Function to check if auto date and time are enabled
export const checkAutoDateTime = async () => {
  return await DeveloperOptions.isAutoDateTimeEnabled();
};

// Function to check if auto timezone is enabled
export const checkAutoTimeZone = async () => {
  try {
    const isAutoTimeZone = await DeveloperOptions.isAutoTimeZoneEnabled();
    return isAutoTimeZone;
  } catch (error) {
    console.error('Error checking auto timezone:', error);
  }
  return false;
};

export const openDateTime = () => {
  DeveloperOptions.openDateTimeSettings();
};

//CONS: Permission Denied in Android OS version 10 and above
export const androidSN = ()=>{
 if(Platform.OS === 'android'){
  return new Promise((resolve, reject)=>{
    DeveloperOptions.getSerialNumber().then((sn)=>{
      resolve(sn);
    }).catch((e)=>{
      reject(e)
    })
  })
 }
}


export async function getDeviceUniqueId() {
  if(Platform.OS === 'android'){
    try {
    const storedId = await EncryptedStorage.getItem('deviceUniqueId');
    if (storedId) {
      return storedId;
    }
    const newId = uuidv4();
    await EncryptedStorage.setItem('deviceUniqueId', newId);
    return newId;
  } catch (error) {
    console.error('Error accessing Encrypted Storage:', error);
    return null;
  }
  }

  if(Platform.OS === 'ios'){
    const DEVICE_ID_KEY = "deviceUniqueId"
     try {
    const credentials = await Keychain.getGenericPassword({ service: DEVICE_ID_KEY });
    if (credentials) {
      return credentials.password;
    }
    const newId = uuidv4();
    await Keychain.setGenericPassword(DEVICE_ID_KEY, newId, { service: DEVICE_ID_KEY });
    return newId;
  } catch (error) {
    console.error('Error accessing Keychain', error);
    return null; 
  }
  }
deviceUniqueId}