import React, {useState, useEffect} from 'react';
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
import ColorUtil from '../../utils/ColorUtil';

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
  screen,
  type = 'default',
}) => {
  const isRegistration = type === 'registration';
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState(null);
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
    index === 1 && !isRegistration && {marginTop: 40},
    isRegistration && styles.registrationSpacing,
  ];

  return (
    <View>
      {/* ✅ 매장 주소 / 사업장 소재지 */}
      <View style={inputViewStyle}>
        {!isRegistration &&
          (index === 1 ? (
            <View style={styles.labelView}>
              <Text style={styles.label}>사업장 소재지</Text>
              <Text style={styles.subLabel}>(매장 주소)</Text>
            </View>
          ) : (
            <View style={styles.labelView}>
              <Text style={styles.label}>매장 주소</Text>
              {screen === 'StoreSuggestionScreen' && (
                <Text style={styles.subLabel}>
                  · 대략적인 위치만 알려주셔도 괜찮아요
                </Text>
              )}
            </View>
          ))}

        <View style={styles.inputContainer} ref={storeAddressRef}>
          <TouchableOpacity
            style={styles.inputTouchable}
            onPress={() =>
              navigation.navigate('StoreAddressSearch', {onAddressSelect})
            }>
            {address ? (
              <Text style={styles.inputText}>{address}</Text>
            ) : (
              <Text style={styles.placeholderText}>
                {index === 1
                  ? '사업장 소재지를 입력해주세요'
                  : '매장 주소를 입력해주세요'}
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
            <Ionicons name="map-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {error === 'StoreAddress' && address === '' && (
        <Text style={styles.errorMessage}>매장 주소를 입력해주세요.</Text>
      )}

      {/* ✅ 상세 주소 (매장 주소 구조 동일) */}
      {screen !== 'StoreSuggestionScreen' && (
        <View style={[styles.detailedAddressView]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.inputField, {paddingRight: 40}]}
              value={detailedAddress}
              placeholder="상세 주소, 건물 층수, 호수 등"
              placeholderTextColor={ColorUtil.placeholderText}
              onChangeText={text => {
                handleDetailedAddressChange(text);
                setOverText(text.length >= MAX_DETAIL);
              }}
              onFocus={() => setFocusedInput('detailedAddress')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="done"
              maxLength={MAX_DETAIL}
            />
          </View>

          {overText && (
            <Text style={styles.errorText}>
              상세 주소는 최대 100자까지 입력 가능합니다.
            </Text>
          )}
          {errors && <Text style={styles.errorText}>{errors}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 40,
    marginHorizontal: 18,
  },
  registrationSpacing: {
    marginTop: 0,
  },
  // label: {
  //   fontFamily: 'Pretendard-SemiBold',
  //   color: '#333',
  //   fontSize: 16,
  //   marginBottom: 12,
  // },

  labelView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
    marginRight: 6,
  },
  subLabel: {
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    fontSize: 14,
    marginRight: 4,
    paddingBottom: 1,
  },
  detailedAddressView: {
    marginHorizontal: 18,
    marginTop: 7,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: ColorUtil.placeholderBorder,
    borderWidth: 1,
    borderRadius: 9,
    height: 52,
    paddingHorizontal: 14,
  },
  inputTouchable: {
    flex: 1,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
  },
  placeholderText: {
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.placeholderText,
    fontSize: 16,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
  },
  mapIconButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 6,
    fontFamily: 'Pretendard-Medium',
  },
  errorMessage: {
    color: '#FF4816',
    marginTop: 5,
    marginHorizontal: 18,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
});

export default StoreAddress;
