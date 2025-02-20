import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  Switch,
  TouchableOpacity,
  BackHandler,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import React, {useState, useEffect, act} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import RNFS, {writeFile} from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
// const logo = require('../assets/lbrdc-logo-rnd.webp');
const logo = require('../assets/animatedLogo.gif');
const {width, height} = Dimensions.get('window');

//Components
import InputText from '../components/InputText';
import Button from '../components/Button';
import Loader from '../components/Loader';
import CTextInput from '../components/CTextInput';
//Services
import {URL, executeRequest} from '../services/urls';

//Helper
import {
  saveDetails,
  checkDatasetExists,
  readDetails,
  writeInFile,
} from '../helper/database';
import {getDeviceUniqueId} from '../helper/DeveloperOptions';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
const datasetFilePath = `${RNFS.DocumentDirectoryPath}/timekeeping_data.json`;
const fileUrl =
  'https://www.dropbox.com/scl/fi/zxswy1jis5r5uq89epu5l/timekeeping_data.json?rlkey=2cg0pkhw4xksat6e5wchyz5cs&st=z5p4owti&dl=1';
// const fileUrl =
//   'https://www.dropbox.com/scl/fi/8ev6f115s7igu7gulm600/mobile_timekeeping.db?rlkey=xfbttezo7m2eei61j02eo4icy&st=1hdi0m1z&dl=1';
const LoginScreen = ({
  navigation,
  setIsAuthenticated,
  setAccountID,
  setAccPassword,
}) => {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  // const [isDownloading, setIsDownloading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadermsg, setloadermsg] = useState('Downloading...');
  const [showPassword, setShowPassword] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  // USEEFFECT
  useEffect(() => {
    // async function test() {
    //   console.log('hgello');
    //   const id = await DeviceInfo.getUniqueId();
    //   const name = await DeviceInfo.getDeviceName();
    //   console.log(`${id} ${name}`);
    // }
    // if (Platform.OS === 'android') {
    //   test();
    // }
    init();
  }, []);

  const checkLocal = async value => {
    try {
      const value = await AsyncStorage.getItem('isFisrtTime');
      console.log(value);

      if (value == 'true') {
        setIsFirstTime(true);
      }
    } catch (e) {
      console.log(e);

      // saving error
    }
  };

  const acceptPolicy = () => {
    try {
      AsyncStorage.setItem('isFisrtTime', 'false');
      setIsFirstTime(false);
    } catch (e) {
      // saving error
    }
  };

  const init = async () => {
    const dataset = await checkDatasetExists();
    if (!dataset) {
      Alert.alert(
        'Notice',
        'We need to sync dataset in order to use this app.',
        [
          {text: 'OK', onPress: () => checkConnectivity(), style: 'default'},
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
        ],
      );
    }
  };

  const loginOffline = async () => {
    const data = await readDetails();

    if (
      data.account.employee == idNumber &&
      data.account.password == password
    ) {
      if (data.rememberMe != rememberMe) {
        data.rememberMe = rememberMe;
        writeInFile(data);
      }
      setIsAuthenticated(true);
    } else {
      Alert.alert('Ooops!', 'Incorrect Password');
    }
  };

  const login = async () => {
    const dsExist = await checkDatasetExists();
    if (!dsExist) {
      init();
      return;
    }
    if (!dsExist) {
      return;
    }

    if (!idNumber || !password) {
      Alert.alert('Warning', 'Please fill in all fields.');
      return;
    }

    const active = await isOnline();
    const data = await readDetails();

    if (!active && dsExist && !data.account.employee) {
      Alert.alert(
        'Notice',
        'In order to enable offline features you need to login as online user first.',
      );
      return;
    }

    if (!active) {
      Alert.alert('No Internet', 'You will login as offline mode', [
        {text: 'OK', onPress: () => loginOffline()},
        {text: 'Cancel', onPress: () => null},
      ]);
      return;
    }

    executeRequest(
      URL().login,
      'POST',
      JSON.stringify({username: idNumber.trim(), password: password.trim()}),
      async res => {
        setloadermsg('Loading...');
        setLoading(true);

        if (!res.loading) {
          setLoading(false);
          if (!res.error && !res.data.Error) {
            //Login Success

            setAccountID(res.data.data.accountID);
            setAccPassword(res.data.data.Password);
            if (res.data.data.Email.length === 0) {
              navigation.navigate('EmailBox');
              return;
            }
            if (
              res.data.data.Password ==
              'cea0cc97fbc0829268790a1773ee637416b3611f2e1c2c4825a186486fa1c4c9'
            ) {
              navigation.navigate('ChangePassword');
              return;
            }

            if (res.data.data.identifier.length == 0) {
              navigation.navigate('RegDevice');
              return;
            }

            if (res.data.data.Status == 0) {
              Alert.alert('Account Problem', 'Account is deactivated');
              return;
            }
            const DEVICE_ID = await getDeviceUniqueId();
            if (res.data.data.identifier !== DEVICE_ID) {
              Alert.alert(
                'Invalid Device',
                'Please use the device you registered with',
              );
              return;
            }
            const {error, message} = await saveDetails(
              res.data.data,
              rememberMe,
            );
            if (error) {
              Alert.alert('Error', message);
              return;
            }
            setIsAuthenticated(true);
          } else {
            Alert.alert('Ooops!', res.data.msg);
          }
        }
      },
    );
  };

  const checkConnectivity = async () => {
    const dataset = await checkDatasetExists();
    try {
      const req = await fetch('https://www.google.com');
      if (req.ok) {
        setIsConnected(true);
        if (!dataset) {
          downloadDB();
        }
      }
    } catch (error) {
      setIsConnected(false);
      Alert.alert(
        'No Internet',
        'You need an internet connection to download dataset.',
      );
    }
  };

  const isOnline = async () => {
    try {
      const req = await fetch('https://www.google.com');
      if (req.ok) {
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const downloadDB = async () => {
    try {
      setloadermsg('Downloading...');
      setLoading(true);
      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: datasetFilePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        setLoading(false);
        Alert.alert('Success', 'Dataset downloaded successfully!');
        checkLocal();
      } else {
        setLoading(false);
        console.error(
          'Download failed with status code:',
          downloadResult.statusCode,
        );
        Alert.alert('Error', 'Download failed!');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error downloading database:', error);
      Alert.alert('Error', 'Error downloading database!');
    }
  };

  const forgotPassword = async () => {
    Alert.alert('Notice', 'This feature is not yet available.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PrivacyPolicyModal visible={isFirstTime} onClose={acceptPolicy} />
      <StatusBar barStyle={'dark-content'} />
      <Loader loading={loading} message={loadermsg} />
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.container}>
        <View style={styles.logoContainer}>
          <Image style={styles.img} source={logo} />
          <Text style={styles.appTitle}>LBRDC Timekeeper</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.wctxt}>Welcome Back</Text>
          {/* <InputText
            placeholder={'ID Number'}
            value={idNumber}
            onChange={value => setIdNumber(value)}
          />
          <InputText
            placeholder={'Password'}
            value={password}
            onChange={value => setPassword(value)}
          /> */}
          <CTextInput
            ispw={false}
            placeholder="Employee ID"
            value={idNumber}
            onChangeText={setIdNumber}
            secureTxt={false}
            leftIcon="person-circle-outline"
          />
          <CTextInput
            ispw={true}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            leftIcon="lock-closed-outline"
            showPassword={showPassword}
            secureTxt={!showPassword}
            setShowPassword={setShowPassword}
          />

          <View style={styles.rememberForgotContainer}>
            <View style={styles.rememberMeContainer}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={rememberMe ? '#4CAF50' : '#f4f3f4'}
              />
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </View>
            <TouchableOpacity onPress={forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <Button onClick={login} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: '5%',
  },
  img: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  wctxt: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#666',
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
