import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트
import Ionicons from 'react-native-vector-icons/Ionicons';

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
      <View style={styles.storeinputmap}>
        <TouchableOpacity
          style={styles.addressTouchable}
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
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('StoreAddMapScreen', {
              location: {
                latitude: updatedValue.latitude,
                longitude: updatedValue.longitude,
              },
              onAddressSelect: selectedData =>
                setUpdatedValue(prev => ({
                  ...prev,
                  address: selectedData.address,
                  latitude: selectedData.coords.latitude,
                  longitude: selectedData.coords.longitude,
                })),
            })
          }
          style={styles.mapIconButton}>
          <Ionicons name="map-outline" size={30} color="#999" />
        </TouchableOpacity>
      </View>
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
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 20,
  },
  storeinputmap: {
    width: '100%',
    flexDirection: 'row',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7, // 상하 간격 조절
    paddingLeft: 1,
  },
  addressTouchable: {
    flex: 1,
  },
  mapIconButton: {
    alignSelf: 'flex-end',
    paddingVertical: 1, // 상하 간격 조절
    paddingLeft: 2,
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  inputHideText: {
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 1,
    paddingLeft: 1,
    color: '#999',
  },
  inputText: {
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 1,
    paddingLeft: 1,
  },
  storeinputview: {
    marginTop: 30,
  },
  storeinputtext: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  focusedInput: {
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 2,
  },
});
