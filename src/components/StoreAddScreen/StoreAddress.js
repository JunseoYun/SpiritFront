import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import forbiddenWords from '../../hooks/forbiddenWords';

import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreAddress = ({
  address,
  detailedAddress,
  setDetailedAddress,
  navigation,
  onAddressSelect,
  index,
  error,
  location,
}) => {
  const [focusedInput, setFocusedInput] = useState(null); // 활성화된 입력 필드 상태
  const [errors, setErrors] = useState(null); // 에러 메시지 상태

  const labelAnim = useRef(new Animated.Value(detailedAddress ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue:
        focusedInput === 'detailedAddress' || detailedAddress !== '' ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focusedInput, detailedAddress]);

  const isFocused = key => focusedInput === key;

  const handleDetailedAddressChange = value => {
    // 금지 단어 검사
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    if (containsForbiddenWord) {
      setErrors('비속어 사용 금지'); // 에러 메시지 설정
      return; // 입력값 업데이트 중단
    }

    setErrors(null); // 에러 메시지 초기화
    setDetailedAddress(value); // 입력값 업데이트
  };
  //매장 권한 등록 뷰
  const inputViewStyle = [
    styles.storeinputview,
    index === 1 && {marginTop: 40},
  ];

  const labelStyle = {
    position: 'absolute',
    left: 1,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [22, 16],
    }),
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  };

  return (
    <View>
      <View style={inputViewStyle}>
        <View style={styles.storeinput}>
          <TouchableOpacity
            style={styles.addressTouchable}
            onPress={() =>
              navigation.navigate('StoreAddressSearch', {onAddressSelect})
            }>
            {address ? (
              <>
                <Text
                  style={[
                    styles.storeinputtext,
                    index === 1 && {color: '#333'},
                  ]}>
                  {index === 1 ? '사업장 소재지*' : '매장 주소*'}
                </Text>
                <Text style={styles.inputText}>{address}</Text>
              </>
            ) : (
              <Text style={styles.inputHideText}>
                {index === 1 ? '사업장 소재지*' : '매장 주소*'}
              </Text>
            )}
          </TouchableOpacity>

          {/* 지도 아이콘 버튼 */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('StoreAddMapScreen', {
                location,
                onAddressSelect,
              })
            }
            style={styles.mapIconButton}>
            <Ionicons name="map-outline" size={30} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {error === 'StoreAddress' && address === '' && (
        <Text style={styles.errorMessage}>매장주소를 입력해주세요.</Text>
      )}
      <View style={inputViewStyle}>
        <Animated.Text style={labelStyle}>
          상세 주소, 건물 층수, 호수 등
        </Animated.Text>
        <TextInput
          style={[
            styles.storeinput,
            isFocused('detailedAddress') && styles.focusedInput,
            {paddingBottom: 7, paddingTop: 20, paddingLeft: 1}, // 활성화 상태 스타일
          ]}
          placeholder=""
          placeholderTextColor="#999"
          value={detailedAddress}
          onChangeText={handleDetailedAddressChange} // 상세 주소 업데이트 핸들러 사용
          onFocus={() => setFocusedInput('detailedAddress')} // 활성화 상태 설정
          onBlur={() => setFocusedInput(null)} // 비활성화 상태로 변경
          returnKeyType="done"
        />
        {errors && <Text style={styles.errorText}>{errors}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    marginTop: 5,
    marginHorizontal: 18,
    fontFamily: 'Pretendard-Medium',
  },
  storeinputtext: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  addressTouchable: {
    flex: 1,
  },
  storeinput: {
    width: '100%',
    flexDirection: 'row',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7, // 상하 간격 조절
    paddingLeft: 1,
  },
  inputHideText: {
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 1,
    paddingLeft: 1,
    color: '#999',
  },
  inputText: {
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 1,
    paddingLeft: 1,
  },
  focusedInput: {
    borderBottomColor: '#16BBFF', // 활성화 상태 색상
    borderBottomWidth: 2, // 두껍게 표시
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Pretendard-Medium',
  },
  mapIconButton: {
    alignSelf: 'flex-end',
    paddingVertical: 1, // 상하 간격 조절
    paddingLeft: 1,
  },
});

export default StoreAddress;
