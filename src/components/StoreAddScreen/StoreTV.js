import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const StoreTV = ({
  selectedscreenOption,
  setselectedscreenOption,
  index,
  error,
}) => {
  const handleCheckBoxscreenChange = index => {
    if (index === 0 && selectedscreenOption !== true) {
      setselectedscreenOption(true);
    } else if (index === 1 && selectedscreenOption !== false) {
      setselectedscreenOption(false);
    }
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storeinputtext}>
          {index
            ? '매장 내 스크린(TV) 설치 여부*'
            : '매장 내 스크린(TV) 설치 여부'}
        </Text>
      </View>
      <View style={styles.storeCheckView}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedscreenOption === true && styles.checkboxSelected,
          ]}
          onPress={() => handleCheckBoxscreenChange(0)}>
          <Text
            style={[
              styles.checkboxText,
              selectedscreenOption === true && styles.checkboxTextSelected,
            ]}>
            설치
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedscreenOption === false && styles.checkboxSelected,
          ]}
          onPress={() => handleCheckBoxscreenChange(1)}>
          <Text
            style={[
              styles.checkboxText,
              selectedscreenOption === false && styles.checkboxTextSelected,
            ]}>
            미설치
          </Text>
        </TouchableOpacity>
      </View>
      {error === 'StoreScreen' && selectedscreenOption === null && (
        <Text style={styles.errorMessage}>
          매장 내 스크린(TV) 설치 여부를 선택해 주세요.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 30,
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

export default StoreTV;
