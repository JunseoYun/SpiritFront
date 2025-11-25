import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../common/CustomText';

const UpdateStoreGroup = ({
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <CustomText style={styles.title}>단체 방문 가능 여부</CustomText>
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
          <CustomText style={styles.checkboxText}>가능</CustomText>
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
          <CustomText style={styles.checkboxText}>불가능</CustomText>
        </TouchableOpacity>
      </View>
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreGroup;

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
    borderColor: '#3CBBFF',
    margin: 5,
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3CBBFF',
  },
  checkboxText: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    padding: 3,
  },
});
