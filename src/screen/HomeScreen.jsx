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
import React, {useState, useEffect, useRef} from 'react';
import * as turf from '@turf/turf';
import moment from 'moment';
import TouchID from 'react-native-touch-id';
import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';

//ICON
import Icon from 'react-native-vector-icons/Ionicons';
//COMPONENTS
import GButton from '../components/GButton';
import PasswordInputModal from '../components/PasswordInputModal';
import RecordsModal from '../components/RecordsModal';
import Loader from '../components/Loader';
import NavMenu from '../components/NavMenu';
import CountdownModal from '../components/CountdownModal';
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
import NotificationManager from '../helper/NotificationManager';
import BackgroundGeoService from '../helper/BackgroundGeolocationService';
//Location
import {getCurrentLocation} from '../services/getLocation';

//Services
import {URL, executeRequest} from '../services/urls';
import SystemInfoModal from '../components/systemInfoModal';
import AllRecordModal from '../components/AllRecordModal';
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
  const [allrecords, setAllRecords] = useState([]);
  const [showAllrecords, setShowAllRecords] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [appInfoModal, setAppInfoModal] = useState(false);
  const [countdownModal, setCountdownModal] = useState(false);
  const [timer, setTimer] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [curr_distance, setCurrDistance] = useState(null);
  const [REQUIRED_DURATION, setREQUIRED_DURATION] = useState(20);
  let timerInterval = null;
  let entryTimestamp = null;
  let bgWatchID = null;
  // useEffect(() => {
  //   const start = async () => {
  //     await startBackgroundTracking();
  //   };
  //   start();
  //   // return () => Geolocation.clearWatch(watchId);
  // }, []);

  useEffect(() => {
    // startBackgroundTracking();
    setLoading(false);
    syncLocation();
    syncActivity();
    const timer = setInterval(() => {
      syncAccount();
      loadDetails();
      checkConnectivity();
      dateTime();
    }, 2000);
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
    if (!isConnected) return;
    executeRequest(
      URL().syncAccount,
      'POST',
      JSON.stringify({accountID: data.account.accountid}),
      async res => {
        if (!res.loading) {
          if (res.data.data?.Status == 0) {
            Alert.alert(
              'Notice',
              'Your account is deactivated. Please contact your administrator.',
            );
            setIsAuthenticated(false);
          }

          if (!res.data.data?.Location) return;
          if (res.data.data.Location != data.location.name) {
            data.location.name = res.data.data?.Location;
            data.location.latitude = res.data.data?.latitude;
            data.location.longitude = res.data.data?.longitude;
            data.location.radius = res.data.data?.radius;
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
    // overtimeFunction();
  };

  const syncActivity = async () => {
    const {records, account} = await readDetails();
    const res = records.length > 0 ? records[records.length - 1] : [];
    if (res.length == 0) {
      setRecentActivity([]);
      return;
    }
    const data = [
      {
        title: 'Check In',
        time: unix_to_time(res?.check_in),
        date: unix_to_date(res?.check_in),
      },
      {
        title: 'Break Out',
        time: unix_to_time(res?.break_out),
        date: unix_to_date(res?.break_out),
      },
      {
        title: 'Break In',
        time: unix_to_time(res?.break_in),
        date: unix_to_date(res?.break_in),
      },
      {
        title: 'Check Out',
        time: unix_to_time(res?.check_out),
        date: unix_to_date(res?.check_out),
      },
      {
        title: 'OT In',
        time: unix_to_time(res?.ot_in),
        date: unix_to_date(res?.ot_in),
      },
      {
        title: 'OT Out',
        time: unix_to_time(res?.ot_out),
        date: unix_to_date(res?.ot_out),
      },
    ];
    setRecentActivity(data);
  };

  function unix_to_time(res) {
    if (res.length != 0) {
      const date = new Date(res * 1000);
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
    } else {
      return 'N/A';
    }
  }

  function unix_to_date(res) {
    if (res.length != 0) {
      const date = new Date(res * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${month}-${day}-${year}`;
      return formattedDate;
    } else {
      return '';
    }
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

    return distance <= geofenceRadius;
  };

  const overtimeFunction = async () => {
    Alert.alert('Notice', 'This feature is not yet available.');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    syncLocation();
    syncActivity();
    loadDetails();
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
          {
            text: 'Yes',
            onPress: () => {
              if (Platform.OS === 'android') {
                biometricsChecker(key);
              } else if (Platform.OS === 'ios') {
                iosBiometrics(key);
              }
            },
          },
          {text: 'No', onPress: () => null},
        ],
      );
    } else {
      if (Platform.OS === 'android') {
        biometricsChecker(key);
      } else if (Platform.OS === 'ios') {
        iosBiometrics(key);
      }
    }
  };

  const androidBiometrics = key => {
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
  };

  const iosBiometrics = key => {
    const config = {
      unifiedErrors: false,
      passcodeFallback: false,
    };
    TouchID.isSupported(config)
      .then(async biometryType => {
        Alert.alert(
          'Notice',
          'Would you like to continue with Touch/Face ID authentication? Choosing no you will be prompted with your password.',
          [
            {
              text: 'Yes',
              onPress: () => {
                if (biometryType === 'FaceID') {
                  const config = {
                    title: 'use face id to record you attendance',
                  };
                  TouchID.authenticate('Pakita mo mukha mo', config)
                    .then(async res => {
                      if (res) {
                        const {account} = await readDetails();
                        await sendTimekeepRequest(account.accountid, key);
                      } else {
                        console.log('Authentication Failed');
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }
                if (biometryType === 'TouchID') {
                  const config = {
                    title: 'use touch id to record you attendance',
                  };
                  TouchID.authenticate('Place your finger', config)
                    .then(async res => {
                      if (res) {
                        const {account} = await readDetails();
                        await sendTimekeepRequest(account.accountid, key);
                      } else {
                        console.log('Authentication Failed');
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }
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
      })
      .catch(err => {
        setShown(true);
      });
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
                  androidBiometrics(key);
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

  const _10mins = async () => {
    const {location} = await readDetails();

    return new Promise(resolve => {
      let timer = 10 * 60; // 10 minutes in seconds
      const interval = setInterval(() => {
        if (
          mycoords.current.Latitude === null ||
          mycoords.current.Longitude === null
        ) {
          console.log('Coordinates not available');
          return;
        }

        const userLocation = [
          mycoords.current.Longitude,
          mycoords.current.Latitude,
        ];
        const geofenceCenter = [location.longitude, location.latitude];
        const geofenceRadius = location.radius;
        const distance = turf.distance(
          turf.point(userLocation),
          turf.point(geofenceCenter),
          {units: 'meters'},
        );

        if (distance > geofenceRadius) {
          if (!isPaused) {
            setIsPaused(true);
            setTimer(10 * 60);
            timer = 1 * 60; // Reset the timer if the user is out of vicinity
          }
        } else {
          if (isPaused) {
            setIsPaused(false);
            timer = 1 * 60; // Reset the timer when the user comes back into the vicinity
            setTimer(10 * 60);
          }
          timer -= 1;
          setTimer(timer);
          setIsPaused(false);
          if (timer <= 0) {
            setIsPaused(false);
            clearInterval(interval);
            resolve(true);
          }
        }
      }, 1000); // Check every second
    });
  };

  const startBackgroundTracking = () => {
    setloadermsg('Please wait to activate...');
    setLoading(true);
    return new Promise((resolve, reject) => {
      const watchId = Geolocation.watchPosition(
        position => {
          handleLocationUpdate(position)
            .then(resolve) // 🔥 Resolve the promise properly
            .catch(reject);
        },
        error => {
          console.log(error);
          setCountdownModal(false);
          // reject(error); // Reject if there's an error
        },
        {enableHighAccuracy: true, distanceFilter: 1},
      );
      bgWatchID = watchId;
    });
  };

  const handleLocationUpdate = async position => {
    return new Promise(async (resolve, reject) => {
      setLoading(false);
      setCountdownModal(true);
      const {location} = await readDetails();
      const VALID_LAT = location.latitude;
      const VALID_LNG = location.longitude;
      const RADIUS_METERS = location.radius;

      const {latitude, longitude} = position.coords;
      const distance = calculateDistance(
        latitude,
        longitude,
        VALID_LAT,
        VALID_LNG,
      );
      setCurrDistance(distance);

      if (distance <= RADIUS_METERS) {
        if (!entryTimestamp) {
          setIsPaused(false);
          console.log('✅ Entered valid area, starting timer. ' + Platform.OS);
          entryTimestamp = moment();

          if (timerInterval) return;

          timerInterval = setInterval(() => {
            const elapsed = moment().diff(entryTimestamp, 'seconds');
            const remaining = REQUIRED_DURATION - elapsed;
            setTimer(remaining);
            console.log('⏰ Remaining:', remaining);

            if (remaining <= 0) {
              stopTracking(bgWatchID);
              resolve(true); // ✅ Now it correctly resolves the promise
              NotificationManager.sendCompleteLocalNotif();
              setCountdownModal(false);
            } else {
              NotificationManager.sendLocalNotification(remaining, distance);
            }
          }, 1000);
        }
      } else {
        console.log('🚫 Outside valid area, timer reset. ' + Platform.OS);
        setIsPaused(true);
        stopTimer();
        // reject(false); // ✅ Reject when moving outside the area
      }
    });
  };

  const stopTracking = watchId => {
    console.log('🛑 Stopping tracking...');
    Geolocation.clearWatch(watchId);
    stopTimer();
  };

  const stopTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    entryTimestamp = null;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

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
      setCountdownModal(true);
      const isGood = await startBackgroundTracking();
      if (!isGood) {
        return;
      }
      //check if in vicinity for atleast 10mins
      // const inVicinity = await _10mins();
      // if (!inVicinity) {
      //   return;
      // }

      setCountdownModal(false);
      data.records.push({
        accountID: account,
        check_in: unix,
        check_out: '',
        break_in: '',
        break_out: '',
        ot_in: '',
        ot_out: '',
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
      if (lastRecord[key] !== '') {
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

  const getAllRecords = async () => {
    const {account} = await readDetails();
    const data = {accountID: account.accountid};

    executeRequest(URL().allRecords, 'POST', JSON.stringify(data), res => {
      setloadermsg('Fetching Data...');
      setLoading(true);
      if (!res.loading) {
        setLoading(false);
        setAllRecords(res.data);
        setShowAllRecords(true);
      }
    });
  };

  const syncBtn = async () => {
    closeMenu();
    syncActivity();
    const {records} = await readDetails();

    if (records.length <= 0) {
      Alert.alert('Notice', 'You have no records to sync.');
      return;
    }
    setShowSyncModal(true);
  };

  const sendSyncRequest = async records => {
    if (!isConnected) {
      Alert.alert(
        'Notice',
        'You are in offline mode. Please connect to the internet to sync your records.',
      );
      setShowSyncModal(false);
      return;
    }

    executeRequest(
      URL().syncRecords,
      'POST',
      JSON.stringify({records: records}),
      async res => {
        console.log(res);
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
  };

  const syncRecords = async () => {
    const validate = await validateLocal();
    const {records} = await readDetails();
    if (validate) {
      sendSyncRequest(records);
    } else {
      Alert.alert(
        'Notice',
        'Your record is incomplete do you want to continue?',
        [
          {
            text: 'No',
            onPress: () => {
              setShowSyncModal(false);
            },
          },
          {
            text: 'Yes',
            onPress: () => {
              sendSyncRequest(records);
            },
          },
        ],
      );
    }
  };

  const helpMenu = async () => {
    closeMenu();
    await startBackgroundTracking();
    // console.log(await startBackgroundTracking());
    overtimeFunction();
  };

  const onInfo = async () => {
    closeMenu();
    setAppInfoModal(true);
  };

  return (
    <>
      <AllRecordModal
        visible={showAllrecords}
        onClose={setShowAllRecords}
        records={allrecords}
      />
      <RecordsModal
        records={records}
        visible={showSyncModal}
        onClose={setShowSyncModal}
        SyncData={syncRecords}
      />
      <CountdownModal
        visible={countdownModal}
        onClose={() => setCountdownModal(false)}
        initialTime={timer}
        status={isPaused}
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
              records={getAllRecords}
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
              title="Break Out"
              icon="restaurant-outline"
              color="#006341"
              textColor="#FFFFFF"
              handleAction={e => make_timekeep('break_out')}
            />
            <GButton
              title="Break In"
              icon="cafe-outline"
              color="#006341"
              textColor="#FFFFFF"
              handleAction={e => make_timekeep('break_in')}
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
