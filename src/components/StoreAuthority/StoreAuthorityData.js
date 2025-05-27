import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreAuthorityData = ({storeData, setStoreData, errors, setErrors}) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태
  // const [errors, setErrors] = useState({}); // 각 필드별 에러 메시지 상태

  const handleChange = (key, value) => {
    // 금지 단어 검사
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    if (key === 'storeNumber') {
      // 숫자만 입력되도록 필터링
      value = value.replace(/[^0-9]/g, '');
    }

    if (key === 'userContact') {
      // 숫자만 입력되도록 필터링
      value = value.replace(/[^0-9]/g, '');
    }

    // 에러 메시지 업데이트
    setErrors(prevErrors => ({
      ...prevErrors,
      [key]: containsForbiddenWord ? '가이드라인 위반' : null,
    }));

    // 비속어가 없을 경우에만 데이터 업데이트
    if (!containsForbiddenWord) {
      setStoreData({...storeData, [key]: value});
    }
  };

  const isFocused = key => focusedInput === key;

  return (
    <View>
      {/* 매장 이름 입력 */}
      <View style={styles.storeinputview}>
        {storeData.storeName && (
          <Text style={styles.storeinputtext}>매장 이름(상호명)</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('storeName') && styles.focusedInput,
          ]}
          value={storeData.storeName}
          onChangeText={text => handleChange('storeName', text)}
          placeholder="매장 이름(상호명)"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeName')}
          onBlur={() => setFocusedInput(null)}
        />
        {errors.storeName && (
          <Text style={styles.errorText}>{errors.storeName}</Text>
        )}
      </View>

      {/* 전화번호 입력 */}
      <View style={styles.storeinputview}>
        {storeData.storeNumber && (
          <Text style={styles.storeinputtext}>매장 연락처</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('storeNumber') && styles.focusedInput,
          ]}
          value={storeData.storeNumber}
          onChangeText={text => handleChange('storeNumber', text)}
          keyboardType="number-pad"
          placeholder="매장 연락처"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeNumber')}
          onBlur={() => setFocusedInput(null)}
        />
        {errors.storeNumber && (
          <Text style={styles.errorText}>{errors.storeNumber}</Text>
        )}
      </View>

      <View style={styles.storeinputview}>
        {storeData.userContact && (
          <Text style={styles.storeinputtext}>신청자 연락처</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('userContact') && styles.focusedInput,
          ]}
          value={storeData.userContact}
          onChangeText={text => handleChange('userContact', text)}
          keyboardType="number-pad"
          placeholder="신청자 연락처"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('userContact')}
          onBlur={() => setFocusedInput(null)}
        />
        {errors.userContact && (
          <Text style={styles.errorText}>{errors.userContact}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 40,
    marginHorizontal: 20,
  },
  storeinputtext: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
    color: 'black',
  },
  focusedInput: {
    borderBottomColor: '#16BBFF', // 활성화 상태 색상
    borderBottomWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});

export default StoreAuthorityData;
