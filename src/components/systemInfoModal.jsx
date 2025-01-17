import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const SystemInfoModal = ({visible, onClose}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          onClose(false);
        }}
        style={styles.openButton}></TouchableOpacity>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Timekeeping Mobile Application{' '}
              <Text style={styles.versiontxt}>v1.0.2024</Text>
            </Text>
            <Text style={styles.modalDescription}>
              The "Timekeeping Mobile Application" is designed to streamline and
              simplify employee attendance tracking. It enables real-time
              check-in, check-out, and break monitoring, providing an intuitive
              and seamless experience for both users and administrators. This
              system ensures accurate timekeeping, with offline capabilities for
              uninterrupted functionality.
            </Text>

            {/* Developer Section */}
            <View style={styles.developersSection}>
              <Text style={styles.sectionTitle}>Developers</Text>
              <View style={styles.developerCard}>
                <Text style={styles.developerName}>Mark Aldrin J. Fule</Text>
                <Text style={styles.developerRole}>
                  IT Specialist/Chief Information Officer
                </Text>
              </View>
              <View style={styles.developerCard}>
                <Text style={styles.developerName}>
                  John Christopher V. Cruz
                </Text>
                <Text style={styles.developerRole}>Software Engineer</Text>
              </View>
              <View style={styles.developerCard}>
                <Text style={styles.developerName}>
                  Ed Emmanuel C. Perpetua
                </Text>
                <Text style={styles.developerRole}>FullStack Developer</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => onClose(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006341',
    textAlign: 'center',
    marginBottom: 16,
  },
  versiontxt: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666666',
  },
  modalDescription: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'justify',
    marginBottom: 24,
    lineHeight: 22,
  },
  developersSection: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006341',
    marginBottom: 12,
    textAlign: 'center',
  },
  developerCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  developerRole: {
    fontSize: 16,
    color: '#666666',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#006341',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SystemInfoModal;
