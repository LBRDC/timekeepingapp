import React from 'react';
import {
  View,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';

const Loader = ({
  loading,
  size = 'large',
  color = '#0070B8',
  message = 'Downloading...',
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={loading}
      onRequestClose={() => {}}>
      <TouchableWithoutFeedback>
        <View style={styles.container}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={size} color={color} />
            <Text style={styles.loadingText}>{message}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loaderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0070B8',
    fontWeight: '600',
  },
});

export default Loader;
