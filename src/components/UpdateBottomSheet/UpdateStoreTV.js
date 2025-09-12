import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const UpdateStoreTV = ({updatedValue, setUpdatedValue, onCancel, onSave}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>스크린 설치 여부</Text>

      {/* 스크린 설치 여부 선택 */}
      <View style={styles.storeCheckView}>
        <TouchableOpacity
          style={styles.storeCheckView}
          onPress={() => setUpdatedValue(true)}>
          <View
            style={[
              styles.checkbox,
              updatedValue === true && styles.checkboxSelected,
            ]}>
            {updatedValue === true && (
              <MaterialIcons name="check" size={25} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxText}>설치</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.storeCheckView}
          onPress={() => setUpdatedValue(false)}>
          <View
            style={[
              styles.checkbox,
              updatedValue === false && styles.checkboxSelected,
            ]}>
            {updatedValue === false && (
              <MaterialIcons name="check" size={25} color="#fff" />
            )}
          </View>
          <Text style={styles.checkboxText}>미설치</Text>
        </TouchableOpacity>
      </View>

      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreTV;

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
  storeCheckView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 5,
    marginHorizontal: 20,
  },
  checkbox: {
    width: 30,
    height: 30,
    backgroundColor: '#F2F2F2',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#45C9FF',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#45C9FF',
  },
  checkboxText: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    padding: 3,
  },
});
