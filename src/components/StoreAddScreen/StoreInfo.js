import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const StoreInfo = ({ storeData, setStoreData }) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태

  const handleChange = (key, value) => {
    setStoreData({ ...storeData, [key]: value });
  };

  const isFocused = (key) => focusedInput === key;

  return (
    <View>
      <View style={styles.storeinputview}>
        {storeData.storeName && ( // 입력값이 있거나 포커스된 경우만 보이기
          <Text style={styles.storeinputtext}>매장 이름</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('storeName') && styles.focusedInput, // 활성화 상태 스타일
          ]}
          value={storeData.storeName}
          onChangeText={(text) => handleChange('storeName', text)}
          placeholder="매장 이름"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeName')} // 활성화 상태 설정
          onBlur={() => setFocusedInput(null)} // 비활성화 상태로 변경
        />
      </View>
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
          onChangeText={(text) => handleChange('storeNumber', text)}
          keyboardType="numeric"
          placeholder="전화번호"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeNumber')}
          onBlur={() => setFocusedInput(null)}
        />
      </View>
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
          onChangeText={(text) => handleChange('storeContent', text)}
          placeholder="매장을 간단하게 소개해주세요."
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeContent')}
          onBlur={() => setFocusedInput(null)}
        />
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
    fontWeight: '400',
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
});

export default StoreInfo;
