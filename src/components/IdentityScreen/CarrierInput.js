import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import CustomText from '../common/CustomText';

const CarrierInput = ({
  carrierRef,
  error,
  selectedCarrier,
  setIsCarrierModalVisible,
}) => {
  return (
    <View style={[styles.labeledInputContainer, {marginBottom: 20}]}>
      <CustomText style={styles.inputLabel}>통신사</CustomText>
      <TouchableOpacity
        ref={carrierRef}
        onPress={() => setIsCarrierModalVisible(true)}
        style={[
          styles.input,
          error === 'selectedCarrier' && styles.errorFocused,
        ]}>
        <CustomText
       
          style={{
            color: selectedCarrier ? '#000' : '#aaa',
            fontSize: 16,
          }}>
          {selectedCarrier || '통신사 선택'}
        </CustomText>
      </TouchableOpacity>
      {error === 'selectedCarrier' && selectedCarrier === '' && (
        <CustomText style={styles.errorMessage}>
          통신사를 선택 해주세요.
        </CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labeledInputContainer: {
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    top: -7,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#999',
    zIndex: 1,
    fontFamily: 'Pretendard-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorFocused: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 5,
    fontFamily: 'Pretendard-Medium',
  },
});
export default CarrierInput;
