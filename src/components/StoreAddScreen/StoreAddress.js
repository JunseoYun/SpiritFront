import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const StoreAddress = ({
  address,
  detailedAddress,
  setDetailedAddress,
  navigation,
}) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태

  const isFocused = (key) => focusedInput === key;

  return (
    <View>
      <View style={styles.storeinputview}>
        {address && <Text style={styles.storeinputtext}>매장 주소</Text>}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('address') && styles.focusedInput, // 활성화 상태 스타일
          ]}
          placeholder="매장 주소"
          placeholderTextColor="#999"
          value={address}
          onPress={() => navigation.navigate('StoreAddressSearch')}
          onFocus={() => setFocusedInput('address')} // 활성화 상태 설정
          onBlur={() => setFocusedInput(null)} // 비활성화 상태로 변경
        />
      </View>

      <View style={styles.storeinputview}>
        {detailedAddress && (
          <Text style={styles.storeinputtext}>상세 주소</Text>
        )}
        <TextInput
          style={[
            styles.storeinput,
            isFocused('detailedAddress') && styles.focusedInput, // 활성화 상태 스타일
          ]}
          placeholder="상세 주소, 건물 층수, 호수 등"
          placeholderTextColor="#999"
          value={detailedAddress}
          onChangeText={setDetailedAddress} // setDetailedAddress를 직접 사용
          onFocus={() => setFocusedInput('detailedAddress')} // 활성화 상태 설정
          onBlur={() => setFocusedInput(null)} // 비활성화 상태로 변경
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
    paddingVertical: 7, // 상하 간격 조절
    paddingLeft: 1,
  },
  focusedInput: {
    borderBottomColor: '#16BBFF', // 활성화 상태 색상
    borderBottomWidth: 2, // 두껍게 표시
  },
  textarea: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 18,
    fontWeight: '400',
    paddingVertical: 5, // 상하 간격 조절
    paddingLeft: 1,
  },
});

export default StoreAddress;
