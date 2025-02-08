import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreInfo = ({storeData, setStoreData}) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태
  const [errors, setErrors] = useState({}); // 각 필드별 에러 메시지 상태

  const handleChange = (key, value) => {
    // 금지 단어 검사
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    if (key === 'storeNumber') {
      // 숫자만 입력되도록 필터링
      value = value.replace(/[^0-9]/g, '');
    }

    // 에러 메시지 업데이트
    setErrors(prevErrors => ({
      ...prevErrors,
      [key]: containsForbiddenWord ? '비속어 사용 금지' : null,
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
          <Text style={styles.storeinputtext}>매장 이름*</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('storeName') && styles.focusedInput,
          ]}
          value={storeData.storeName}
          onChangeText={text => handleChange('storeName', text)}
          placeholder="매장 이름*"
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
          <Text style={styles.storeinputtext}>전화번호</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('storeNumber') && styles.focusedInput,
          ]}
          value={storeData.storeNumber}
          onChangeText={text => handleChange('storeNumber', text)}
          keyboardType="numeric"
          placeholder="전화번호"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeNumber')}
          onBlur={() => setFocusedInput(null)}
        />
        {errors.storeNumber && (
          <Text style={styles.errorText}>{errors.storeNumber}</Text>
        )}
      </View>

      {/* 매장 소개 입력 */}
      <View style={styles.storeinputview}>
        {storeData.storeContent && (
          <Text style={styles.storeinputtext}>매장 소개</Text>
        )}
        <TextInput
          style={[
            styles.textarea,
            isFocused('storeContent') && styles.focusedInput,
          ]}
          multiline
          value={storeData.storeContent}
          onChangeText={text => handleChange('storeContent', text)}
          placeholder="매장을 간단하게 소개해주세요."
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeContent')}
          onBlur={() => setFocusedInput(null)}
        />
        {errors.storeContent && (
          <Text style={styles.errorText}>{errors.storeContent}</Text>
        )}
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
  },
  textarea: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 18,
    fontWeight: '400',
    paddingVertical: 5,
    paddingLeft: 1,
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

export default StoreInfo;
