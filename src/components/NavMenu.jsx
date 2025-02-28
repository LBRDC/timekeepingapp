import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
const NavMenu = ({
  onClose,
  onLogout,
  onSettings,
  onSync,
  onHelp,
  onInfo,
  records,
}) => {
  const insets = useSafeAreaInsets();
  const statusBarHieght =
    Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      onTouchCancel={onClose}>
      <TouchableOpacity
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={1}
        onPress={onClose}>
        <View
          style={{
            width: 120,
            position: 'absolute',
            top: 0,
            right: 5,
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 5,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
            marginTop:
              Platform.OS === 'ios' ? statusBarHieght + 20 : statusBarHieght,
          }}
          onStartShouldSetResponder={() => true}>
          <TouchableOpacity
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={onSync}>
            <Icon
              name="sync-outline"
              style={{marginRight: 10, color: '#333333', fontSize: 18}}
            />
            <Text style={{color: '#333333', fontSize: 16}}>Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={records}>
            <Icon
              name="list-circle-outline"
              style={{marginRight: 10, color: '#333333', fontSize: 18}}
            />
            <Text style={{color: '#333333', fontSize: 16}}>Records</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={onSettings}>
            <Icon
              name="settings-outline"
              style={{marginRight: 10, color: '#333333', fontSize: 18}}
            />
            <Text style={{color: '#333333', fontSize: 16}}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={onHelp}>
            <Icon
              name="help-outline"
              style={{marginRight: 10, color: '#333333', fontSize: 18}}
            />
            <Text style={{color: '#333333', fontSize: 16}}>Help</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={onInfo}>
            <Icon
              name="information-circle-outline"
              style={{marginRight: 10, color: '#333333', fontSize: 18}}
            />
            <Text style={{color: '#333333', fontSize: 16}}>Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginBottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={onLogout}>
            <Icon
              name="exit-outline"
              style={{marginRight: 10, color: '#333333', fontSize: 18}}
            />
            <Text style={{color: '#333333', fontSize: 16}}>Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default NavMenu;
