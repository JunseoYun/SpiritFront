import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreInfo = ({storeData, setStoreData, error}) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태
  const [errors, setErrors] = useState({}); // 각 필드별 에러 메시지 상태
  const [overText, setOverText] = useState(false);

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
      setStoreData({...storeData, [key]: value});
    }
  };

  const isFocused = key => focusedInput === key;

  const handleContentChange = text => {
    const lines = text.split('\n'); // 🔥 입력된 줄 개수 확인
    const maxLines = 5; // 최대 줄 개수
    const maxChars = 100; // 최대 글자 수

    if (lines.length > maxLines || text.length > maxChars) {
      setOverText(true);
      return; // 🔥 5줄 이상이거나 100자 초과하면 입력 차단
    } else {
      setOverText(false);
    }

    handleChange('storeContent', text);
  };

  return (
    <View>
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
          returnKeyType="done"
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
          // maxLength={100} // 🔥 너무 긴 텍스트 방지 (선택 사항)
          value={storeData.storeContent}
          onChangeText={handleContentChange}
          placeholder="매장을 간단하게 소개해주세요."
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('storeContent')}
          onBlur={() => setFocusedInput(null)}
          returnKeyType="done"
        />
        {errors.storeContent && (
          <Text style={styles.errorText}>{errors.storeContent}</Text>
        )}
        {overText && (
          <Text style={styles.errorText}>
            매장 소개는 최대 5줄, 최대 100자입니다.
          </Text>
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
  textarea: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    paddingVertical: 5,
    paddingLeft: 1,
    maxHeight: 120,
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

export default StoreInfo;
