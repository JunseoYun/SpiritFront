import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import CustomText from '../../utils/CustomText';

const StoreGroup = ({selectedOption, setSelectedOption, index, error}) => {
  const handleCheckBoxChange = index => {
    if (index === 0 && selectedOption !== true) {
      setSelectedOption(true);
    } else if (index === 1 && selectedOption !== false) {
      setSelectedOption(false);
    }
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <CustomText style={styles.storeinputtext}>
          {index ? '단체 방문 가능 여부*' : '단체 방문 가능 여부'}
        </CustomText>
      </View>

      <View style={styles.storeCheckView}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedOption === true && styles.checkboxSelected,
          ]}
          onPress={() => handleCheckBoxChange(0)}>
          <CustomText
            style={[
              styles.checkboxText,
              selectedOption === true && styles.checkboxTextSelected,
            ]}>
            가능
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedOption === false && styles.checkboxSelected,
          ]}
          onPress={() => handleCheckBoxChange(1)}>
          <CustomText
            style={[
              styles.checkboxText,
              selectedOption === false && styles.checkboxTextSelected,
            ]}>
            불가능
          </CustomText>
        </TouchableOpacity>
      </View>
      {error === 'StoreGroup' && selectedOption === null && (
        <CustomText style={styles.errorMessage}>
          단체 방문 가능 여부를 선택해 주세요.
        </CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  storeinputtext: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  storeCheckView: {
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  checkbox: {
    backgroundColor: '#F7F8FA',
    borderRadius: 5,
    padding: 10,
    margin: 5,
    width: '48%',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3CBBFF',
  },
  checkboxText: {
    color: '#3CBBFF',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    padding: 3,
  },
  checkboxTextSelected: {
    color: '#FFF', // 선택된 경우 흰색
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginTop: 5,
    marginBottom: 15,
    marginHorizontal: 22,
  },
});

export default StoreGroup;
