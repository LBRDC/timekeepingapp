import React, {useState, useEffect} from 'react';
import {Modal, View, Text, StyleSheet} from 'react-native';

const CountdownModal = ({visible, onClose, initialTime}) => {
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.timerText}>
            {formatTime(initialTime)} minutes left
          </Text>
          <Text style={styles.instructionText}>
            Please stay within the vicinity for the specified time to mark your
            check-in.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: 'gray',
  },
});

export default CountdownModal;
