import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CTextInput from '../components/CTextInput';

//Components
import Loader from '../components/Loader';

//Services
import {URL, executeRequest} from '../services/urls';

export default function PasswordChangeForm({navigation, password, accountID}) {
  const [currentPassword, setCurrentPassword] = useState();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadermsg, setloadermsg] = useState('Downloading...');
  const validatePassword = password => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = () => {
    if (currentPassword != password) {
      Alert.alert('Error', 'Incorrect current password');
      return;
    }
    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Error',
        'New password must be at least 8 characters long and contain at least one number, one lowercase and one uppercase letter.',
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    executeRequest(
      URL().updatePassword,
      'POST',
      JSON.stringify({accountID: accountID, password: newPassword}),
      res => {
        setloadermsg('Changing password...');
        setLoading(true);
        if (!res.loading) {
          setLoading(false);
          if (!res.data.Error) {
            navigation.navigate('Login');
          } else {
            Alert.alert('Error', res.data.msg);
          }
        }
      },
    );
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Loader loading={loading} message={loadermsg} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.form}>
          <Text style={styles.title}>Change Password</Text>

          <CTextInput
            placeholder="Current Password"
            onChangeText={setCurrentPassword}
            value={currentPassword}
            secureTxt={!showCurrentPassword}
            setShowPassword={setShowCurrentPassword}
            showPassword={showCurrentPassword}
            leftIcon="lock-closed-outline"
            ispw={true}
          />

          <CTextInput
            placeholder="New Password"
            onChangeText={setNewPassword}
            value={newPassword}
            secureTxt={!showNewPassword}
            setShowPassword={setShowNewPassword}
            showPassword={showNewPassword}
            leftIcon="lock-closed-outline"
            ispw={true}
          />

          <CTextInput
            placeholder="Confirm New Password"
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            secureTxt={!showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
            showPassword={showConfirmPassword}
            leftIcon="lock-closed-outline"
            ispw={true}
          />

          <Text style={styles.passwordRequirements}>
            Password must be at least 8 characters long and contain at least one
            number, one lowercase and one uppercase letter.
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              !currentPassword || !newPassword || !confirmPassword
                ? styles.buttonDisabled
                : newPassword == confirmPassword
                ? styles.button
                : styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={
              (!currentPassword || !newPassword || !confirmPassword) &&
              newPassword == confirmPassword
            }>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006341',
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordRequirements: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#006341',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
