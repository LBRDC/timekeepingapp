import React from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const PrivacyPolicyModal = ({visible, onClose}) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.modalText}>
              We are committed to protecting the privacy and security of our
              users' personal information. This Privacy Policy outlines how we
              collect, use, and protect your personal data when you use our
              website, applications, or services.
            </Text>
            <Text style={styles.sectionTitle}>What Information We Collect</Text>
            <Text style={styles.modalText}>
              1. <Text style={styles.subtitle}>Personal Data</Text>: When you
              create an account or sign up for our services, we collect personal
              data such as your name, email address, phone number, and password.
              {'\n'}2. <Text style={styles.subtitle}>Usage Data</Text>: We
              collect information about how you use our services, including your
              IP address, browser type, operating system, and device type.{'\n'}
              3. <Text style={styles.subtitle}>Location Data</Text>: We may
              collect location data from your device if you enable location
              services.
            </Text>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.modalText}>
              1. To Provide Our Services: We use your personal data to provide
              our services to you.{'\n'}2.To Improve Our Services: We use data
              usage and other information to improve our services and make them
              more relevant to you.{'\n'}3. To Communicate with You: We use your
              contact information to communicate with you about our services and
              any issues that may arise.
            </Text>
            <Text style={styles.sectionTitle}>
              How We Protect Your Information
            </Text>
            <Text style={styles.modalText}>
              We take reasonable measures to protect your personal data from
              unauthorized access, disclosure, alteration, or destruction. These
              measures include:{'\n'}1. Encryption: We encrypt sensitive
              information such as payment data.{'\n'}2. Access Controls: Only
              authorized personnel have access to your personal data.{'\n'}3.
              Secure Servers: Our servers are secured with firewalls and other
              security measures.
            </Text>
            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.modalText}>
              1. Access Your Data: You can access and review your personal data
              at any time.{'\n'}2. Modify Your Data: You can modify or correct
              inaccuracies in your personal data.{'\n'}3. Delete Your Data: You
              can request deletion of your account and associated data.
            </Text>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
            <Text style={styles.modalText}>
              We reserve the right to modify this Privacy Policy at any time
              without notice to you. By using our website, applications, or
              services, you acknowledge that you have read and understood this
              Privacy Policy. If you have any questions or concerns about this
              policy or how we handle your personal information please contact
              us directly via email at customerservice@lbpresources.com.
            </Text>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  subtitle: {
    fontWeight: 'bold',
    color: 'black',
  },
  sectionTitle: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  modalText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PrivacyPolicyModal;
