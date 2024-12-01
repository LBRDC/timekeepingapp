import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
const GButton = props => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, {backgroundColor: props.color}]}
      onPress={props.handleAction}>
      <Icon name={props.icon} size={32} color={props.textColor} />
      <Text style={[styles.actionButtonText, {color: props.textColor}]}>
        {props.title}
      </Text>
    </TouchableOpacity>
  );
};

export default GButton;

const styles = StyleSheet.create({
  actionButton: {
    width: '48%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
