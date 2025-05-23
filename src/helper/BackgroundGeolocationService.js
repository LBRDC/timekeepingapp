import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import moment from 'moment';

import NotificationManager from './NotificationManager';

let curr_distance = null;
let entryTimestamp = null;
let timerInterval = null;
const VALID_LAT = 14.572732777884;
const VALID_LNG = 120.98312437534;
const RADIUS_METERS = 46.532275387312;
const REQUIRED_DURATION = 20; // 5 minutes
const BackgroundGeoService = {
  startBackgroundTracking: () => {
    const watchId = Geolocation.watchPosition(
      position => {
        console.log(
          'Position updated:',
          position.coords.latitude,
          position.coords.longitude,
        );
        handleLocationUpdate(position);
      },
      error => console.log(error),
      {enableHighAccuracy: true, distanceFilter: 1},
    );

    setBgWatchID(watchId);
  },
  handleLocationUpdate: position => {
    const {latitude, longitude} = position.coords;
    const distance = BackgroundGeoService.calculateDistance(
      latitude,
      longitude,
      VALID_LAT,
      VALID_LNG,
    );
    // console.log(`📍 Distance: ${distance.toFixed(2)}m`);
    curr_distance = distance;
    if (distance <= RADIUS_METERS) {
      if (!entryTimestamp) {
        NotificationManager.sendLocalNotification(
          '✅ Entered valid area',
          curr_distance.toFixed(2) + 'm',
        );
        // console.log('✅ Entered valid area, starting timer. ' + Platform.OS);
        entryTimestamp = moment();
        BackgroundGeoService.startTimer();
      }
    } else {
      NotificationManager.sendLocalNotification(
        '🚫 Outside valid area, timer reset.',
        curr_distance.toFixed(2) + 'm',
      );
      // console.log('🚫 Outside valid area, timer reset. ' + Platform.OS);
      BackgroundGeoService.stopTimer();
    }
  },
  startTimer: () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
      const elapsed = moment().diff(entryTimestamp, 'seconds');
      const remaining = REQUIRED_DURATION - elapsed;
      // console.log(`⏳ Remaining: ${remaining}s`);
      if (remaining <= 0) {
        BackgroundGeoService.confirmAttendance();
        BackgroundGeoService.stopTimer();
      } else {
        if (remaining > 0) {
          NotificationManager.sendLocalNotification(
            `⏳: ${BackgroundGeoService.formatTime(remaining)}`,
            curr_distance.toFixed(2) + 'm',
          );
        }
      }
    }, 1000);
  },

  stopTimer: () => {
    clearInterval(timerInterval);
    timerInterval = null;
    entryTimestamp = null;
  },

  formatTime: seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  },

  confirmAttendance: () => {
    NotificationManager.sendLocalNotification('🎯 Check in Confirmed!', '');
    BackgroundGeoService.stopTimer();
  },

  calculateDistance: (lat1, lon1, lat2, lon2) => {
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
  },
};

export default BackgroundGeoService;
