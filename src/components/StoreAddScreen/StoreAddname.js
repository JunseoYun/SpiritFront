import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreAddname = ({storename, setStorename, error}) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태
  const [errors, setErrors] = useState({}); // 각 필드별 에러 메시지 상태
  const storeNameInputRef = useRef(null); // 매장 이름 입력 필드 ref 생성

  useEffect(() => {
    if (error === 'storename' && storeNameInputRef.current) {
      storeNameInputRef.current.focus(); // 에러가 있을 경우 포커스 자동 지정
    }
  }, [error]);
  const handleChange = (key, value) => {
    // 금지 단어 검사
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    // 에러 메시지 업데이트
    setErrors(prevErrors => ({
      ...prevErrors,
      [key]: containsForbiddenWord ? '비속어 사용 금지' : null,
    }));

    // 비속어가 없을 경우에만 데이터 업데이트
    if (!containsForbiddenWord) {
      setStorename(value); // 단순한 문자열이라면 이렇게
    }
  };

  const isFocused = key => focusedInput === key;

  return (
    <View>
      {/* 매장 이름 입력 */}
      <View style={styles.storeinputview}>
        {storename && <Text style={styles.storeinputtext}>매장 이름*</Text>}
        <TextInput
          ref={storeNameInputRef}
          style={[
            styles.storeinput,
            isFocused('storename') && styles.focusedInput,
          ]}
          value={storename}
          onChangeText={text => handleChange('storename', text)}
          placeholder="매장 이름*"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storename')}
          onBlur={() => setFocusedInput(null)}
          returnKeyType="done"
        />
        {errors.storename && (
          <Text style={styles.errorText}>{errors.storename}</Text>
        )}
      </View>
      {error === 'storename' && storename === '' && (
        <Text style={styles.errorMessage}>매장이름을 입력해주세요.</Text>
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
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  focusedInput: {
    borderBottomColor: '#16BBFF', // 활성화 상태 색상
    borderBottomWidth: 2,
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Pretendard-Medium',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    marginTop: 5,
    marginHorizontal: 18,
    fontFamily: 'Pretendard-Medium',
  },
});

export default StoreAddname;
