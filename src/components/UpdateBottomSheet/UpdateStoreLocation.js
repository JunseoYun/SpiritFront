import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreLocation = ({
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
  navigation,
}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 주소</Text>
      <TouchableOpacity
        style={styles.storeinput}
        onPress={() =>
          navigation.navigate('StoreAddressSearch', {
            onAddressSelect: selectedData =>
              setUpdatedValue(prev => ({
                ...prev,
                address: selectedData.address,
                latitude: selectedData.coords.latitude,
                longitude: selectedData.coords.longitude,
              })),
          })
        }>
        {updatedValue.address ? (
          <Text style={styles.inputText}>{updatedValue.address}</Text>
        ) : (
          <Text style={styles.inputHideText}>매장 주소*</Text>
        )}
      </TouchableOpacity>
      <View style={styles.storeinputview}>
        {updatedValue.addressDetail && (
          <Text style={styles.storeinputtext}>상세 주소</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            updatedValue.addressDetail && styles.focusedInput,
          ]}
          placeholder="상세 주소, 건물 층수, 호수 등"
          placeholderTextColor="#999"
          value={updatedValue.addressDetail}
          onChangeText={text =>
            setUpdatedValue(prev => ({...prev, addressDetail: text}))
          }
        />
      </View>
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreLocation;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  inputHideText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
    color: '#999',
  },
  inputText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
  },
  storeinputview: {
    marginTop: 30,
  },
  storeinputtext: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  focusedInput: {
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 2,
  },
});
