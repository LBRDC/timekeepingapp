import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
const CTextInput = props => {
  return (
    <View style={styles.inputContainer}>
      <Icon
        name={props.leftIcon}
        size={24}
        color="#006341"
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder={props.placeholder}
        placeholderTextColor="#999"
        value={props.value}
        onChangeText={props.onChangeText}
        secureTextEntry={props.secureTxt}
      />
      {props.ispw && (
        <TouchableOpacity
          onPress={() => props.setShowPassword(!props.showPassword)}
          style={styles.eyeIcon}>
          <Icon
            name={props.showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color="#006341"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CTextInput;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#006341',
    borderRadius: 8,
    marginBottom: 15,
  },
  icon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
});
