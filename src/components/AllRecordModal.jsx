import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const AllRecordModal = ({records, visible, onClose}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  useEffect(() => {
    if (visible == true) {
      console.log(records);
    }
  }, []);

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

  const validator = data => {
    return data ? unix_to_time(data) : '--';
  };
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setSelectedRecord(item)}>
      <Text style={styles.dateText}>Date: {item.timestamps}</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Check-In:</Text>
        <Text style={styles.detailText}>{validator(item.check_in)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Check-Out:</Text>
        <Text style={styles.detailText}>{validator(item.check_out)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Break-In:</Text>
        <Text style={styles.detailText}>{validator(item.break_in)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>Break-Out:</Text>
        <Text style={styles.detailText}>{validator(item.break_out)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>OT-In:</Text>
        <Text style={styles.detailText}>{validator(item.ot_in)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailTitle}>OT-Out:</Text>
        <Text style={styles.detailText}>{validator(item.ot_out)}</Text>
      </View>
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
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Date:</Text>
                  <Text style={styles.detailText}>
                    {selectedRecord.timestamps}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Check-In:</Text>
                  <Text style={styles.detailText}>
                    {validator(selectedRecord.check_in)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Check-Out:</Text>
                  <Text style={styles.detailText}>
                    {validator(selectedRecord.check_out)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Break-In:</Text>
                  <Text style={styles.detailText}>
                    {validator(selectedRecord.break_in)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailTitle}>Break-Out:</Text>
                  <Text style={styles.detailText}>
                    {validator(selectedRecord.break_out)}
                  </Text>
                </View>
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
    maxHeight: '90%',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006341',
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#006341',
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#006341',
    width: '50%',
  },
  detailText: {
    fontSize: 16,
    color: '#363636',
    textAlign: 'right',
    width: '50%',
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#006341',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#004D33',
  },
  syncButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FDB913',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDB999',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AllRecordModal;
