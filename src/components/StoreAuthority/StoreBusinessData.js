import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import forbiddenWords from '../../hooks/forbiddenWords';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../common/CustomText';
import CustomTextInput from '../common/CustomTextInput';

// validateDate 함수 정의 (예시)
const validateDate = dateStr => {
  // 8자리 숫자 형식인지 체크
  if (!/^\d{8}$/.test(dateStr)) {
    return false;
  }
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);

  // new Date는 월이 0부터 시작하므로 month - 1 사용
  const date = new Date(year, month - 1, day);

  // 생성된 Date 객체의 년, 월, 일이 실제 입력과 일치하는지 확인
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const StoreBusinessData = ({
  businessData,
  setBusinessData,
  businessNumberRef,
  openDateRef,
  drink_sales_numberRef,
  error,
  errorMessage,
}) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태
  const [errors, setErrors] = useState({}); // 각 필드별 에러 메시지 상태

  const handleChange = (key, value) => {
    // 금지 단어 검사
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    if (key) {
      // 숫자만 입력되도록 필터링
      value = value.replace(/[^0-9]/g, '');
    }

    // 에러 메시지 업데이트 (비속어 사용 여부)
    setErrors(prevErrors => ({
      ...prevErrors,
      [key]: containsForbiddenWord ? '비속어 사용 금지' : null,
    }));

    // 비속어가 없을 경우에만 데이터 업데이트
    if (!containsForbiddenWord) {
      setBusinessData({...businessData, [key]: value});
    }
  };

  const handleBlur = () => {
    if (
      businessData.openDate.length !== 8 ||
      !validateDate(businessData.openDate)
    ) {
      setErrors(prev => ({
        ...prev,
        openDate: '유효한 날짜를 입력해 주세요. (19000101 형식)',
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        openDate: null,
      }));
    }
  };

  const isFocused = key => focusedInput === key;

  return (
    <View>
      {/* 사업자등록번호 입력 */}
      <View style={styles.storeinputview}>
        {businessData.businessNumber && (
          <CustomText style={styles.storeinputtext}>사업자등록번호*</CustomText>
        )}
        <CustomTextInput
          style={[
            styles.storeinput,
            isFocused('businessNumber') && styles.focusedInput,
          ]}
          ref={businessNumberRef}
          value={businessData.businessNumber}
          onChangeText={text => handleChange('businessNumber', text)}
          keyboardType="number-pad"
          placeholder="사업자등록번호*"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('businessNumber')}
          onBlur={() => setFocusedInput(null)}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (!businessData.openDate) {
              openDateRef.current?.focus();
            }
          }}
        />
        {businessData.businessNumber.length > 0 &&
          isFocused('businessNumber') && (
            <CancelText
              rightnum={0}
              topnum={normalizeFont(45)}
              paddingnum={0}
              handlecancel={() => handleChange('businessNumber', '')}
              size={normalizeFont(20)}
            />
          )}
        {error === 'businessData.businessNumber' &&
          !businessData.businessNumber && (
            <CustomText style={styles.errorText}>{errorMessage}</CustomText>
          )}
      </View>

      {/* 개업연월일 입력 */}
      <View style={styles.storeinputview}>
        {businessData.openDate && (
          <CustomText style={styles.storeinputtext}>개업연월일*</CustomText>
        )}
        <CustomTextInput
          style={[
            styles.storeinput,
            isFocused('openDate') && styles.focusedInput,
          ]}
          ref={openDateRef}
          value={businessData.openDate}
          onChangeText={text => handleChange('openDate', text)}
          keyboardType="number-pad"
          placeholder="개업연월일* 19000101"
          placeholderTextColor="#999"
          maxLength={8}
          onFocus={() => setFocusedInput('openDate')}
          onBlur={() => {
            setFocusedInput(null);
            handleBlur();
          }}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (!businessData.drink_sales_number) {
              drink_sales_numberRef.current?.focus();
            }
          }}
        />
        {businessData.openDate.length > 0 && isFocused('openDate') && (
          <CancelText
            rightnum={0}
            topnum={normalizeFont(45)}
            paddingnum={0}
            handlecancel={() => handleChange('openDate', '')}
            size={normalizeFont(20)}
          />
        )}
        {errors.openDate && (
          <CustomText style={styles.errorText}>{errors.openDate}</CustomText>
        )}
        {error === 'businessData.openDate' &&
          !businessData.openDate &&
          !errors.openDate && (
            <CustomText style={styles.errorText}>{errorMessage}</CustomText>
          )}
      </View>

      {/* 주류판매신고번호 입력 */}
      <View style={styles.storeinputview}>
        {businessData.drink_sales_number && (
          <CustomText style={styles.storeinputtext}>
            주류판매신고번호*
          </CustomText>
        )}
        <CustomTextInput
          style={[
            styles.storeinput,
            isFocused('drink_sales_number') && styles.focusedInput,
          ]}
          ref={drink_sales_numberRef}
          value={businessData.drink_sales_number}
          onChangeText={text => handleChange('drink_sales_number', text)}
          keyboardType="number-pad"
          placeholder="주류판매신고번호*"
          placeholderTextColor="#999"
          onFocus={() => setFocusedInput('drink_sales_number')}
          onBlur={() => setFocusedInput(null)}
        />
        {/* {errors.drink_sales_number && (
          <CustomText style={styles.errorText}>{errors.drink_sales_number}</CustomText>
        )} */}
        {businessData.drink_sales_number.length > 0 &&
          isFocused('drink_sales_number') && (
            <CancelText
              rightnum={0}
              topnum={normalizeFont(45)}
              paddingnum={0}
              handlecancel={() => handleChange('drink_sales_number', '')}
              size={normalizeFont(20)}
            />
          )}
        {error === 'businessData.drink_sales_number' &&
          !businessData.drink_sales_number && (
            <CustomText style={styles.errorText}>{errorMessage}</CustomText>
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
    fontFamily: 'Pretendard-Medium',
    color: '#333',
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
    color: 'black',
  },
  focusedInput: {
    borderBottomColor: '#3CBBFF',
    borderBottomWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Pretendard-Regular',
  },
});

export default StoreBusinessData;
