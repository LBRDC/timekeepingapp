import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const RecordsModal = ({records, visible, onClose}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  if (visible == true) {
    console.log(records);
  }

  function unix_to_time(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(seconds).padStart(2, '0')} ${ampm}`;

    return formattedTime;
  }
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setSelectedRecord(item)}>
      <Text style={styles.dateText}>Date: {item.date}</Text>
      <Text style={styles.detailText}>
        Check-In: {unix_to_time(item.check_in)}
      </Text>
      <Text style={styles.detailText}>
        Check-Out:{unix_to_time(item.check_out)}
      </Text>
      <Text style={styles.detailText}>
        Break-In: {unix_to_time(item.break_in)}
      </Text>
      <Text style={styles.detailText}>
        Break-Out: {unix_to_time(item.break_out)}
      </Text>
      <Text style={styles.detailText}>OT-In:{unix_to_time(item.ot_in)}</Text>
      <Text style={styles.detailText}>OT-Out:{unix_to_time(item.ot_out)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Timekeeping Records</Text>
          <FlatList
            data={records}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onClose(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>

        {/* Detailed Record Modal */}
        {selectedRecord && (
          <Modal
            visible={!!selectedRecord}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setSelectedRecord(null)}>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Record Details</Text>
                <Text style={styles.detailText}>
                  Date: {selectedRecord.date}
                </Text>
                <Text style={styles.detailText}>
                  Check-In:{unix_to_time(selectedRecord.check_in)}
                </Text>
                <Text style={styles.detailText}>
                  Check-Out:{unix_to_time(selectedRecord.check_out)}
                </Text>
                <Text style={styles.detailText}>
                  Break-In:{unix_to_time(selectedRecord.break_in)}
                </Text>
                <Text style={styles.detailText}>
                  Break-Out:{unix_to_time(selectedRecord.break_out)}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedRecord(null)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
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
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#006341',
    marginBottom: 12,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#006341',
  },
  statusText: {
    fontSize: 14,
    color: '#757575',
  },
  detailText: {
    fontSize: 16,
    color: '#363636',
    marginBottom: 8,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#006341',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default RecordsModal;
