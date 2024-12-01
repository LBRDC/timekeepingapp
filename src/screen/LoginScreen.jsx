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
import React, {useState, useEffect} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
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
import {syncAccount} from '../helper/database';

const databaseFilePath = `${RNFS.DocumentDirectoryPath}/mobile_timekeeping.db`;
const fileUrl =
  'https://www.dropbox.com/scl/fi/8ev6f115s7igu7gulm600/mobile_timekeeping.db?rlkey=xfbttezo7m2eei61j02eo4icy&st=1hdi0m1z&dl=1';
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

  // USEEFFECT
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const dbExist = await checkDatabaseExists();
    if (!dbExist) {
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

  const checkDatabaseExists = async () => {
    try {
      const fileExists = await RNFS.exists(databaseFilePath);
      return fileExists;
    } catch (error) {
      console.error('Error checking database existence:', error);
      return false;
    }
  };

  const login = async () => {
    const dbExist = await checkDatabaseExists();
    if (!dbExist) {
      init();
      return;
    }
    if (!dbExist) {
      return;
    }

    if (!idNumber || !password) {
      Alert.alert('Warning', 'Please fill in all fields.');
      return;
    }

    executeRequest(
      URL().login,
      'POST',
      JSON.stringify({username: idNumber, password: password}),
      async res => {
        setloadermsg('Loading...');
        setLoading(true);
        if (!res.loading) {
          setLoading(false);
          if (!res.error && !res.data.Error) {
            //Login Success
            // console.log(res.data);
            setAccountID(res.data.data.accountID);
            setAccPassword(res.data.data.Password);
            if (res.data.data.Email.length === 0) {
              navigation.navigate('EmailBox');
              return;
            }
            if (res.data.data.Password == 'LBRDC') {
              navigation.navigate('ChangePassword');
              return;
            }
            console.log(res.data.data);
            await syncAccount(res.data.data);
            setIsAuthenticated(true);
          } else {
            Alert.alert('Ooops!', res.data.msg);
          }
        }
      },
    );
  };

  const checkConnectivity = async () => {
    try {
      const req = await fetch('https://www.google.com');
      if (req.ok) {
        downloadDB();
      }
    } catch (error) {
      Alert.alert(
        'No Internet',
        'You need an internet connection to download dataset.',
      );
    }
  };

  const downloadDB = async () => {
    try {
      // setIsDownloading(true);
      setloadermsg('Downloading...');
      setLoading(true);
      const downloadResult = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: databaseFilePath,
      }).promise;

      if (downloadResult.statusCode === 200) {
        // setIsDownloading(false);
        setLoading(false);
        Alert.alert('Success', 'Dataset downloaded successfully!');
      } else {
        // setIsDownloading(false);
        setLoading(false);
        console.error(
          'Download failed with status code:',
          downloadResult.statusCode,
        );
        Alert.alert('Error', 'Download failed!');
      }
    } catch (error) {
      // setIsDownloading(false);
      setLoading(false);
      console.error('Error downloading database:', error);
      Alert.alert('Error', 'Error downloading database!');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <TouchableOpacity>
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
