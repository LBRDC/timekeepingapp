import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {PermissionsAndroid, Platform} from 'react-native';

const NotificationManager = {
  requestNotificationPermission: async () => {
    if (Platform.OS === 'ios') {
      await PushNotificationIOS.requestPermissions();
    }

    if (Platform.OS === 'android') {
      try {
        const check = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (!check) {
          const request = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          console.log(request);
        }
      } catch (error) {
        console.log(error);
      }
    }
  },

  createNotificationChannel: () => {
    if (Platform.OS === 'android') {
      try {
        PushNotification.createChannel(
          {
            channelId: 'local-notification-channel',
            channelName: 'Local Notifications',
            channelDescription: 'A channel for local notifications',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          created => console.log(`Channel created: ${created}`),
        );
      } catch (error) {
        console.log(error);
      }
    }
  },

  sendLocalNotification: (remainingTime, distance) => {
    try {
      const timeMessage =
        remainingTime >= 60
          ? `${Math.floor(remainingTime / 60)} min ${remainingTime % 60} sec`
          : `${remainingTime} sec`;

      const message = `Time left: ${timeMessage} | Distance: ${distance.toFixed(
        2,
      )}m`;

      if (Platform.OS === 'android') {
        PushNotification.localNotification({
          channelId: 'local-notification-channel',
          title: 'Timekeeping Alert',
          id: 0,
          message: message,
          playSound: true,
          soundName: 'default',
        });
      } else if (Platform.OS === 'ios') {
        PushNotificationIOS.addNotificationRequest({
          id: '0',
          title: 'Timekeeping Alert',
          body: message,
          sound: 'default',
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

export default NotificationManager;
