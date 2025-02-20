import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {PermissionsAndroid, Platform} from 'react-native';

const NotificationManager = {
  requestNotificationPermission: async () => {
    if (Platform.OS === 'ios') {
      const request = await PushNotificationIOS.requestPermissions();
    }

    if (Platform.OS === 'android') {
      try {
        const check = PermissionsAndroid.check(
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
            channelId: 'local-notification-channel', // Unique ID
            channelName: 'Local Notifications',
            channelDescription: 'A channel for local notifications',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          created => console.log(`Channel created: ${created}`), // Debug log
        );
      } catch (error) {
        console.log(error);
      }
    }
  },

  sendLocalNotification: (message, distance) => {
    try {
      if (Platform.OS === 'android') {
        PushNotification.localNotification({
          channelId: 'local-notification-channel',
          id: 0,
          title: 'My Notification Title',
          message: 'My Notification Message',
          picture: 'https://www.example.tld/picture.jpg',
          userInfo: {},
          playSound: false,
          soundName: 'default',
          number: 10,
          repeatType: 'day',
          ongoing: true,
        });
      } else if (Platform.OS === 'ios') {
        PushNotificationIOS.addNotificationRequest({
          id: '0',
          title: 'Timekeeping',
          body: `${message}${distance && '      📍' + distance}`,
          userInfo: {},
          sound: 'default',
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
};

export default NotificationManager;
