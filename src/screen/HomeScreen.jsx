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
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import * as turf from '@turf/turf';
import DeviceInfo from 'react-native-device-info';
import CryptoJS from 'crypto-js';
//ICON
import Icon from 'react-native-vector-icons/Ionicons';
//COMPONENTS
import GButton from '../components/GButton';
import PasswordInputModal from '../components/PasswordInputModal';
import RecordsModal from '../components/RecordsModal';
import Loader from '../components/Loader';
import NavMenu from '../components/NavMenu';
//GEOLOCATION
//BIOMETRICS
import ReactNativeBiometrics from 'react-native-biometrics';

//Helper
import {
  readDetails,
  writeRecords,
  validateLocal,
  resetRecords,
  writeInFile,
} from '../helper/database';

//Location
import {getCurrentLocation} from '../services/getLocation';

//Services
import {URL, executeRequest} from '../services/urls';
import SystemInfoModal from '../components/systemInfoModal';
//BIOMETRICS
const Biometrics = new ReactNativeBiometrics();

const HomeScreen = ({setIsAuthenticated, currentCoordinates}) => {
  const [currentDateTime, setCurrentDateTime] = useState('Loading time...');
  const [location, setLocation] = useState('Loading location...');
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shown, setShown] = useState(false);
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [modalKey, setModalKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadermsg, setloadermsg] = useState('Downloading...');
  const [recentActivity, setRecentActivity] = useState([]);
  const [designatedLocation, setDesignatedLocation] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [records, setRecords] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [appInfoModal, setAppInfoModal] = useState(false);
  useEffect(() => {
    setLoading(false);
    // requestPermission();
    syncLocation();
    syncActivity();
    // loadDetails();
    const timer = setInterval(() => {
      syncAccount();
      loadDetails();
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

  const syncAccount = async () => {
    const data = await readDetails();
    executeRequest(
      URL().syncAccount,
      'POST',
      JSON.stringify({accountID: data.account.accountid}),
      async res => {
        if (!res.loading) {
          if (res.data.data.Status == 0) {
            Alert.alert(
              'Notice',
              'Your account is deactivated. Please contact your administrator.',
            );
            setIsAuthenticated(false);
          }

          if (res.data.data.Location != data.location.name) {
            data.location.name = res.data.data.Location;
            data.location.latitude = res.data.data.latitude;
            data.location.longitude = res.data.data.longitude;
            data.location.radius = res.data.data.radius;
            await writeInFile(data);
          }
        }
      },
    );
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  const settings = () => {
    closeMenu();
    overtimeFunction();
  };

  const syncActivity = async () => {
    const {records, account} = await readDetails();
    const res = records[records.length - 1];

    const data = [
      {
        title: 'Check In',
        time: res?.check_in != null ? unix_to_time(res.check_in) : 'N/A',
        date: res?.check_in != null ? unix_to_date(res.check_in) : '',
      },
      {
        title: 'Break Out',
        time: res?.break_out != null ? unix_to_time(res.break_out) : 'N/A',
        date: res?.break_out != null ? unix_to_date(res.break_out) : '',
      },
      {
        title: 'Break In',
        time: res?.break_in != null ? unix_to_time(res.break_in) : 'N/A',
        date: res?.break_in != null ? unix_to_date(res.break_in) : '',
      },
      {
        title: 'Check Out',
        time: res?.check_out != null ? unix_to_time(res.check_out) : 'N/A',
        date: res?.check_out != null ? unix_to_date(res.check_out) : '',
      },
      {
        title: 'OT In',
        time: res?.ot_in != null ? unix_to_time(res.ot_in) : 'N/A',
        date: res?.ot_in != null ? unix_to_date(res.ot_in) : '',
      },
      {
        title: 'OT Out',
        time: res?.ot_out != null ? unix_to_time(res.ot_out) : 'N/A',
        date: res?.ot_out != null ? unix_to_date(res.ot_out) : '',
      },
    ];
    setRecentActivity(data);
  };

  function unix_to_time(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')} ${ampm}`;

    return formattedTime;
  }

  function unix_to_date(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${month}-${day}-${year}`;
    return formattedDate;
  }

  const syncLocation = async () => {
    const mylocation = await getCurrentLocation(
      currentCoordinates.Latitude,
      currentCoordinates.Longitude,
    );
    const current_loc = mylocation.results[0]?.formatted_address;
    if (current_loc !== undefined) {
      setLocation(current_loc);
    }
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
    const {account, location, records} = await readDetails();
    setRecords(records);
    setName(account.name);
    setIdNumber(account.employee);
    setDesignatedLocation(location.name);
  };

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

  const isValid = async () => {
    const {location} = await readDetails();
    if (
      currentCoordinates.Latitude === null ||
      currentCoordinates.Longitude === null
    ) {
      return;
    }
    const userLocation = [
      currentCoordinates.Longitude,
      currentCoordinates.Latitude,
    ];
    const geofenceCenter = [location.longitude, location.latitude];
    const geofenceRadius = location.radius;
    const distance = turf.distance(
      turf.point(userLocation),
      turf.point(geofenceCenter),
      {units: 'meters'},
    );

    if (distance <= geofenceRadius) {
      return true;
    } else {
      return false;
    }
  };

  const overtimeFunction = async () => {
    Alert.alert('Notice', 'This feature is not yet available.');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    syncLocation();
    syncActivity();
    setRefreshing(false);
  }, []);

  const logout = async () => {
    closeMenu();
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', onPress: () => null, style: 'cancel'},
      {
        text: 'Yes',
        onPress: async () => {
          const data = await readDetails();
          setIsAuthenticated(false);
          if (data.rememberMe == true) {
            data.rememberMe = false;
            await writeInFile(data);
          }
        },
      },
    ]);
  };

  const make_timekeep = async key => {
    setModalKey(key);
    if (!isConnected) {
      Alert.alert(
        'Notice',
        'You are in offline mode. Any action you make will be saved on your device \n \n Do you want to continue?',
        [
          {text: 'Yes', onPress: () => biometricsChecker(key)},
          {text: 'No', onPress: () => null},
        ],
      );
    } else {
      biometricsChecker(key);
    }
  };

  const biometricsChecker = key => {
    Biometrics.isSensorAvailable()
      .then(async result => {
        const {available, biometryType} = result;
        if (available) {
          Alert.alert(
            'Notice',
            'Would you like to continue with fingerprint authentication? Choosing no you will be prompted with your password.',
            [
              {
                text: 'Yes',
                onPress: () => {
                  Biometrics.simplePrompt({
                    promptMessage: 'Scan your fingerprint to check in.',
                  }).then(async result => {
                    const {success} = result;
                    if (success) {
                      const {account} = await readDetails();
                      await sendTimekeepRequest(account.accountid, key);
                    } else {
                      console.log('Authentication Failed');
                    }
                  });
                },
              },
              {
                text: 'No',
                onPress: () => {
                  setShown(true);
                },
              },
            ],
          );
        } else {
          {
            setShown(true);
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  const passwordTimekeep = async (password, key) => {
    const {account} = await readDetails();
    if (password === account.password) {
      await sendTimekeepRequest(account.accountid, modalKey);
    } else {
      Alert.alert('Error', 'Password is incorrect.', [
        {text: 'OK', onPress: () => setShown(true)},
      ]);
    }
  };

  const syncUserDetails = async () => {};

  const sendTimekeepRequest = async (account, key) => {
    const valid = await isValid();
    const data = await readDetails();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const curr_date = `${month}-${day}-${year}`;
    const unix = Math.floor(Date.now() / 1000);
    const isDuplicated = data.records.some(record => record.date === curr_date);
    if (!valid) {
      Alert.alert('Oopss', 'You are out of vicinity.');
      return;
    }
    if (key === 'check_in') {
      if (isDuplicated) {
        Alert.alert('Error', 'Duplicated Check In.');
        return;
      }
      data.records.push({
        accountID: account,
        check_in: unix,
        check_out: null,
        break_in: null,
        break_out: null,
        ot_in: null,
        ot_out: null,
        date: curr_date,
      });
      const writing = await writeRecords(data);
      if (writing) {
        Alert.alert('Success', 'Check In Successful');
      }
    } else {
      //find check in record base on date today
      const record = data.records.find(record => record.date === curr_date);
      if (data.records.length === 0 || record === undefined) {
        Alert.alert('Error', 'No check in record found.');
        return;
      }
      const lastRecord = data.records[data.records.length - 1];
      if (lastRecord[key] !== null) {
        Alert.alert('Error', `Duplicated ${key.replace('_', ' ')}.`);
        return;
      }
      lastRecord[key] = unix;
      const writing = await writeRecords(data);
      if (writing) {
        Alert.alert('Success', `${key.replace('_', ' ')} Successful`);
      }
    }
    syncActivity();
  };

  const syncBtn = async () => {
    closeMenu();
    const {records} = await readDetails();

    if (records.length <= 0) {
      Alert.alert('Notice', 'You have no records to sync.');
      return;
    }
    setShowSyncModal(true);
  };

  const syncRecords = async () => {
    const validate = await validateLocal();
    const {records} = await readDetails();

    if (validate) {
      executeRequest(
        URL().syncRecords,
        'POST',
        JSON.stringify({records: records}),
        async res => {
          console.log(res.data);
          setloadermsg('Loading...');
          setLoading(true);
          if (!res.loading) {
            setLoading(false);
            if (!res.data.Error) {
              await resetRecords();
              syncActivity();
              setShowSyncModal(false);
            }
            Alert.alert('Timekeeping', res.data.msg);
          }
        },
      );
    } else {
      Alert.alert(
        'Notice',
        'Your record is incomplete please contact your HR.',
      );
    }
  };

  const helpMenu = async () => {
    closeMenu();
    const data = await readDetails();
    console.log(data);

    overtimeFunction();
  };

  const onInfo = () => {
    closeMenu();
    setAppInfoModal(true);
  };

  return (
    <>
      <RecordsModal
        records={records}
        visible={showSyncModal}
        onClose={setShowSyncModal}
        SyncData={syncRecords}
      />
      <SystemInfoModal visible={appInfoModal} onClose={setAppInfoModal} />
      <SafeAreaView style={styles.container}>
        {shown && (
          <PasswordInputModal
            isShown={setShown}
            onSubmit={passwordTimekeep}
            modalKey={modalKey}
          />
        )}
        <Loader loading={loading} message={loadermsg} />
        <View style={styles.header}>
          <View key={name + idNumber} style={styles.userInfo}>
            <Text style={styles.userName}>{name || 'Name'}</Text>
            <Text style={styles.employeeId}>
              ID: {`${idNumber}  (${designatedLocation})`}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Icon name="menu-outline" size={30} color="#fff" />
          </TouchableOpacity>
          {showMenu && (
            <NavMenu
              onClose={closeMenu}
              onLogout={logout}
              onSettings={settings}
              onSync={syncBtn}
              onHelp={helpMenu}
              onInfo={onInfo}
            />
          )}
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
            <Text style={(styles.location, [{marginTop: 6, color: 'black'}])}>
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
              handleAction={e => make_timekeep('check_in')}
            />
            <GButton
              title="Check Out"
              icon="log-out-outline"
              color="#006341"
              textColor="#FFFFFF"
              handleAction={e => make_timekeep('check_out')}
            />
            <GButton
              title="Break In"
              icon="cafe-outline"
              color="#006341"
              textColor="#FFFFFF"
              handleAction={e => make_timekeep('break_in')}
            />
            <GButton
              title="Break Out"
              icon="restaurant-outline"
              color="#006341"
              textColor="#FFFFFF"
              handleAction={e => make_timekeep('break_out')}
            />
          </View>

          <Text style={styles.sectionTitle}>Special Actions</Text>
          <View style={styles.Grid}>
            <GButton
              title="Overtime In"
              icon="time-outline"
              color="#FDB913"
              textColor="#006341"
              handleAction={overtimeFunction}
            />
            <GButton
              title="Overtime Out"
              icon="timer-outline"
              color="#FDB913"
              textColor="#006341"
              handleAction={overtimeFunction}
            />
          </View>
          <View style={styles.card}>
            {/* <Text style={styles.cardTitle}>Recent Activity</Text>
            <Text style={styles.lastAction}>{lastAction}</Text> */}
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeader}>Action</Text>
                <Text style={styles.tableHeader}>Timestamp</Text>
              </View>
              {recentActivity.length > 0 ? (
                recentActivity.map((item, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.title}</Text>
                    <Text style={styles.tableCell}>
                      {`${item.date}  ${item.time}`}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No recent activity</Text>
              )}
            </View>
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
    padding: 15,
    backgroundColor: '#006341',
    borderBottomWidth: 1,
    borderBottomColor: '#004D31',
    position: 'relative',
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
  },
  table: {
    marginTop: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006341',
  },
  tableCell: {
    fontSize: 14,
    color: '#363636',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
});
