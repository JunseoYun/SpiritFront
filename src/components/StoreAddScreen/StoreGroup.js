import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const StoreGroup = ({selectedOption, setSelectedOption}) => {
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
        <Text style={styles.storeinputtext}>10인 이상 단체 가능 여부</Text>
      </View>
      <View style={styles.storeCheckView}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedOption === true && styles.checkboxSelected,
          ]}
          onPress={() => handleCheckBoxChange(0)}>
          <Text
            style={[
              styles.checkboxText,
              selectedOption === true && styles.checkboxTextSelected,
            ]}>
            가능
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedOption === false && styles.checkboxSelected,
          ]}
          onPress={() => handleCheckBoxChange(1)}>
          <Text
            style={[
              styles.checkboxText,
              selectedOption === false && styles.checkboxTextSelected,
            ]}>
            불가능
          </Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#45C9FF',
  },
  checkboxText: {
    color: '#45C9FF',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    padding: 3,
  },
  checkboxTextSelected: {
    color: '#FFF', // 선택된 경우 흰색
  },
});

export default StoreGroup;
