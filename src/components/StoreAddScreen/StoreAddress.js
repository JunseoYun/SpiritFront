import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {useToast} from '../../context/ToastContext';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreAddress = ({
  address,
  detailedAddress,
  setDetailedAddress,
  navigation,
  onAddressSelect,
  index,
  error,
  location,
  storeAddressRef,
}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState(null);
  const {showToast} = useToast();
  const MAX_DETAIL = 100;
  const [overText, setOverText] = useState(false);

  const labelAnim = useSharedValue(detailedAddress !== '' ? 1 : 0);

  const isFocused = key => focusedInput === key;

  useEffect(() => {
    labelAnim.value = withTiming(
      isFocused('detailedAddress') || detailedAddress !== '' ? 1 : 0,
      {duration: 120},
    );
  }, [focusedInput, detailedAddress]);

  const animatedLabelStyle = useAnimatedStyle(() => {
    const isActive = labelAnim.value === 1;
    return {
      position: 'absolute',
      left: 1,
      transform: [
        {
          translateY: withTiming(isActive ? -8 : 16, {
            duration: 120,
          }),
        },
      ],
      fontSize: withTiming(isActive ? 16 : 22, {
        duration: 120,
      }),
      color: detailedAddress !== '' ? '#121212' : '#999', // ← 값 있을 때 검정
      fontFamily: 'Pretendard-Medium',
    };
  });

  const handleDetailedAddressChange = value => {
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    if (containsForbiddenWord) {
      setErrors('비속어 사용 금지');
      return;
    }
    setDetailedAddress(value);
    setErrors(null);
  };

  const inputViewStyle = [
    styles.storeinputview,
    index === 1 && {marginTop: 40},
  ];

  return (
    <View>
      {/* 매장 주소/사업장 소재지 */}
      <View style={inputViewStyle}>
        <View style={styles.storeinput} ref={storeAddressRef}>
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

      {/* 상세주소 */}
      <View style={inputViewStyle}>
        <View style={{position: 'relative'}}>
          <Animated.Text style={animatedLabelStyle}>
            상세 주소, 건물 층수, 호수 등
          </Animated.Text>
          <TextInput
            style={[
              styles.storeinput,
              isFocused('detailedAddress') && styles.focusedInput,
              {paddingBottom: 7, paddingTop: 20, paddingLeft: 1},
            ]}
            placeholder=""
            placeholderTextColor="#999"
            value={detailedAddress}
            onChangeText={text => {
              handleDetailedAddressChange(text);
              setOverText(text.length >= MAX_DETAIL);
            }}
            onFocus={() => setFocusedInput('detailedAddress')}
            onBlur={() => setFocusedInput(null)}
            returnKeyType="done"
            maxLength={MAX_DETAIL}
          />
          {overText && (
            <Text style={styles.errorText}>
              상세 주소는 최대 100자까지 입력 가능합니다.
            </Text>
          )}
        </View>

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
    paddingVertical: 7,
    paddingLeft: 1,
    color: 'black',
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
    borderBottomColor: '#3CBBFF',
    borderBottomWidth: 2,
  },
  errorText: {
    color: 'red',
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
  mapIconButton: {
    alignSelf: 'flex-end',
    paddingVertical: 1,
    paddingLeft: 1,
  },
});

export default StoreAddress;
