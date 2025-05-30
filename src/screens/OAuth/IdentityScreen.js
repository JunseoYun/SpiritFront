import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  Modal,
  ScrollView,
  InteractionManager,
  BackHandler,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useCustomAlert from '../../hooks/useCustomAlert';
import forbiddenWords from '../../hooks/forbiddenWords';
import filterWords from '../../hooks/filterWords';
import {useToast} from '../../context/ToastContext';
import {useFocusEffect} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {get_mokToken, request_mok, confirm_request} from '../../api/mokApi';
import {user_merge, user_login} from '../../api/userApi';
const CARRIER_OPTIONS = [
  'SKT',
  'KT',
  'LG U+',
  'SKT 알뜰폰',
  'KT 알뜰폰',
  'LG U+ 알뜰폰',
];

const CARRIER_PROVIDER_MAP = {
  SKT: 'SKT',
  KT: 'KT',
  'LG U+': 'LGU',
  'SKT 알뜰폰': 'SKTMVNO',
  'KT 알뜰폰': 'KTMVNO',
  'LG U+ 알뜰폰': 'LGUMVNO',
};

const IdentityScreen = ({route, navigation}) => {
  const {socialType, socialId, socialToken, index, token} = route?.params ?? {};
  const {loginauth} = useAuth();
  const insets = useSafeAreaInsets();
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  const [sendToMsg, setSendToMsg] = useState(false);
  const [verificationcode, setVerificationcode] = useState('777777');

  const [name, setName] = useState('');
  const [nameerror, setNameerror] = useState({});
  const [nameStepDone, setNameStepDone] = useState(false);
  const [isnameFocused, setIsnameFocused] = useState(false);
  const shownameLabel = isnameFocused || name.length > 0;
  const nameplaceholder = isnameFocused ? '' : '이름';

  const [rrnFront, setRrnFront] = useState('');
  const [rrnBack, setRrnBack] = useState('');
  const [isrrnfFocused, setIsrrnfFocused] = useState(false);
  const [isrrnbFocused, setIsrrnbFocused] = useState(false);
  const showrrfLabel = isrrnfFocused || rrnFront.length > 0;
  const rrnfplaceholder = isrrnfFocused ? '6자리' : '주민등록번호';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isphoneFocused, setIsphoneFocused] = useState(false);
  const showphoneLabel = isphoneFocused || phoneNumber.length > 0;
  const phoneplaceholder = isphoneFocused
    ? ' - 없이 숫자만 입력'
    : '휴대폰 번호';

  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [isCarrierModalVisible, setIsCarrierModalVisible] = useState(false);
  const [isRRNStepDone, setIsRRNStepDone] = useState(false);

  const [isPhoneStepVisible, setIsPhoneStepVisible] = useState(false);
  const [isCarrierStepVisible, setIsCarrierStepVisible] = useState(false);

  const isRRNEntered = rrnFront.length === 6 && rrnBack.length === 1;
  const isPhoneEntered = phoneNumber.length === 11;

  const [otpcode, setOTPCode] = useState('');
  const [isotpcodeFocused, setIsOTPcodeFocused] = useState(false);
  const [otpFailCount, setOtpFailCount] = useState(0);
  const [resendCount, setResendCount] = useState(0); // 재전송 횟수 제한

  const scrollViewRef = useRef(null);
  const nameRef = useRef(null);
  const rrnFrontRef = useRef(null);
  const rrnBackRef = useRef(null);
  const phoneRef = useRef(null);
  const carrierRef = useRef(null);
  const otpcodeRef = useRef(null);

  const [localMokTokenId, setLocalMokTokenId] = useState('');

  const handlenamechange = value => {
    setName(value);
  };

  useEffect(() => {
    if (!isRRNStepDone && isRRNEntered) {
      setIsRRNStepDone(true);
    }
  }, [rrnFront, rrnBack]);

  useEffect(() => {
    if (phoneNumber.length === 11) {
      setIsPhoneStepVisible(true);
    }
  }, [phoneNumber]);

  const MOK_ERROR_MESSAGES = {
    22020: '본인인증을 실패했습니다. \n다시 확인 후 시도해주세요.',
    22021: '입력한 정보에 문제가 있어요. \n다시 확인해주세요.',
    22022: '인증 정보가 만료되었어요. \n처음부터 다시 해주세요.',
    22023: '인증번호를 입력해주세요.',
    22024: '인증번호가 맞지 않아요.\n 다시 입력해주세요.',
    22025: '오류가 발생했어요. \n처음부터 다시 시도해주세요.',
    22026: '인증 시간이 초과되었어요. \n다시 시도해주세요.',
    21019: '인증 시도를 너무 많이 했어요. \n나중에 다시 시도해주세요.',
    21012: '인증 정보를 찾을 수 없어요. \n다시 시도해주세요.',
    21014: '인증 준비 중 문제가 발생했어요. \n잠시 후 다시 시도해주세요.',
    21015: '보안 인증 중 오류가 발생했어요.',
    21016: '인증 토큰을 받지 못했어요. \n다시 시도해주세요.',
    21017: '인증 연결에 문제가 있어요.',
    21018: '서버 요청에 실패했어요. \n다시 시도해주세요.',
    21027: '보안 처리 중 오류가 발생했어요.',
    21028: '날짜 정보 처리에 실패했어요. \n다시 시도해주세요.',
  };

  useEffect(() => {
    if (selectedCarrier) {
      setIsCarrierStepVisible(true);
    }
  }, [selectedCarrier]);

  const [error, setError] = useState('');

  const scrollToError = ref => {
    if (!ref?.current || !scrollViewRef?.current?.scrollTo) return;

    ref.current.measureLayout(
      scrollViewRef.current,
      (x, y) => {
        scrollViewRef.current.scrollTo({y: y - 100, animated: true});
      },
      error => {
        console.warn('스크롤 이동 실패', error);
      },
    );
  };

  const handleNameStepComplete = () => {
    if (!nameStepDone && name.trim().length > 0) {
      setNameStepDone(true);
    }
    if (rrnFront == '') {
      setTimeout(() => rrnFrontRef.current?.focus(), 100);
    }
  };

  const handleAuth = async () => {
    if (
      !name.trim() ||
      name.trim().length < 2 ||
      filterWords.some(word => name.includes(word))
    ) {
      setError('name');
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
      scrollToError(nameRef);
      return;
    }
    if (forbiddenWords.some(word => name.includes(word))) {
      setNameerror(prev => ({
        ...prev,
        name: forbiddenWords.some(word => name.includes(word))
          ? '비속어 사용 금지'
          : null,
      }));
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
      scrollToError(nameRef);
      return;
    }
    if (!rrnFront.trim() || rrnFront.trim().length < 6) {
      console.log('?');
      setError('rrnFront');
      setTimeout(() => {
        rrnFrontRef.current?.focus();
      }, 100);
      scrollToError(rrnFrontRef);
      return;
    }
    if (!rrnBack.trim()) {
      setError('rrnBack');
      setTimeout(() => {
        rrnBackRef.current?.focus();
      }, 100);
      scrollToError(rrnBackRef);
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 11) {
      setError('phoneNumber');
      setTimeout(() => {
        phoneRef.current?.focus();
      }, 100);
      scrollToError(phoneRef);
      return;
    }
    if (!selectedCarrier.trim()) {
      setError('selectedCarrier');
      setTimeout(() => {
        setIsCarrierModalVisible(true);
      }, 100);
      scrollToError(carrierRef);
      return;
    }
    setError('');
    Keyboard.dismiss();
    try {
      let birthday;
      if (rrnBack == 1 || rrnBack == 2 || rrnBack == 5 || rrnBack == 6) {
        birthday = '19' + rrnFront;
      }
      if (rrnBack == 3 || rrnBack == 4 || rrnBack == 7 || rrnBack == 8) {
        birthday = '20' + rrnFront;
      }

      const mokDataId = await get_mokToken();
      setLocalMokTokenId(mokDataId);

      const mokData = {
        mokDataId: mokDataId,
        providerId: CARRIER_PROVIDER_MAP[selectedCarrier],
        userName: name,
        userPhone: phoneNumber,
        userBirthDay: birthday,
        userRegistSingleNumber: rrnBack,
      };
      await request_mok(mokData);

      setSendToMsg(true);
    } catch (error) {
      const code = error?.response?.data?.code;
      const message =
        MOK_ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.';
      showToast(message, 'center');
      console.error('MOK 에러 응답:', error?.response?.data);
    } finally {
    }
  };

  const [timeLeft, setTimeLeft] = useState(180); // 3분

  useEffect(() => {
    if (!sendToMsg || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sendToMsg, timeLeft]);

  const formatTimeLeft = seconds => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleResend = async () => {
    if (resendCount >= 3) {
      showToast(
        '인증번호 재전송 횟수를 초과했습니다. 다시 시도해주세요.',
        'center',
      );
      setSendToMsg(false);
      setOTPCode('');
      setOtpFailCount(0);
      setResendCount(0);
      setTimeLeft(180);
      return;
    }

    try {
      const responseMokDataId = await get_mokToken();
      setLocalMokTokenId(responseMokDataId);
      const mokData = {
        mokDataId: responseMokDataId,
        providerId: CARRIER_PROVIDER_MAP[selectedCarrier],
        userName: name,
        userPhone: phoneNumber,
        userBirthDay:
          rrnBack === '1' ||
          rrnBack === '2' ||
          rrnBack === '5' ||
          rrnBack === '6'
            ? '19' + rrnFront
            : '20' + rrnFront,
        userRegistSingleNumber: rrnBack,
      };
      console.log(mokData);
      await request_mok(mokData); // 재요청
      setResendCount(prev => prev + 1); // 횟수 증가
      setTimeLeft(180);
      showToast('인증번호를 다시 보냈습니다.');
    } catch (error) {
      const code = error?.response?.data?.code;
      const message =
        MOK_ERROR_MESSAGES[code] || '인증번호 재전송에 실패했어요.';
      showToast(message, 'center');
      console.error('재전송 실패:', error?.response?.data);
    }
  };

  useEffect(() => {
    if (sendToMsg && otpcode.length === 6) {
      verifyOtp();
    }
  }, [otpcode]);

  const verifyOtp = useCallback(async () => {
    const data = {
      mokDataId: localMokTokenId,
      authNumber: otpcode,
    };
    console.log(token);
    try {
      const response = await confirm_request(data);
      showToast('인증 되었습니다.');
      console.log(response);
      if (response.isRegistered) {
        console.log(response.isRegistered);
        console.log(token);
        try {
          const originalSocialInfoDto = {
            socialType: response.registeredSocialInfoDto.socialType,
            socialId: response.registeredSocialInfoDto.socialId,
          };
          const newSocialInfoDto = {
            socialType: socialType,
            socialId: socialId,
          };

          await user_merge(originalSocialInfoDto, newSocialInfoDto);
          const login_data = await user_login(
            socialType,
            socialId,
            socialToken,
          );
          loginauth(login_data.accessToken, login_data.refreshToken, null);
          // navigation.reset({
          //   index: 0,
          //   routes: [
          //     {
          //       name: 'MainBtmbar',
          //       state: {routes: [{name: 'MainScreen'}]},
          //     },
          //   ],
          // });
        } catch (error) {}
      } else {
        if (index === 0) {
          navigation.navigate('RegisterScreen', {
            socialType,
            socialId,
            socialToken,
            mokDataId: localMokTokenId,
          });
        } else if (index === 1) {
          loginauth(token.accessToken, token.refreshToken, null);
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'MainBtmbar',
                state: {routes: [{name: 'MainScreen'}]},
              },
            ],
          });
        }
      }
    } catch (err) {
      setOtpFailCount(prev => {
        const next = prev + 1;
        if (next >= 3) {
          showToast(
            '인증번호 입력 횟수를 초과했습니다.\n다시 시도해주세요.',
            'center',
          );
          setSendToMsg(false);
          setOTPCode('');
          setOtpFailCount(0);
          setTimeLeft(180);
        } else {
          setError('otpcode');
          scrollToError(otpcodeRef);
          setOTPCode('');
        }
        return next;
      });
    }
  }, [
    otpcode,
    localMokTokenId,
    index,
    socialType,
    socialId,
    socialToken,
    token,
  ]);

  useEffect(() => {
    if (sendToMsg) {
      setTimeout(() => {
        otpcodeRef.current?.focus();
      }, 100);
    }
  }, [sendToMsg]);

  const getTitleText = () => {
    if (!nameStepDone)
      return <Text>휴대폰 인증을 진행할게요{'\n'}이름을 입력해주세요</Text>;
    if (!isRRNStepDone)
      return <Text>생년월일 포함{'\n'}앞 7자리를 입력해주세요</Text>;
    if (!isPhoneEntered) return <Text>휴대폰 번호를 입력해주세요</Text>;
    if (!selectedCarrier) return <Text>통신사를 선택해주세요</Text>;
    if (sendToMsg) return <Text>문자로 받은{'\n'}인증번호를 입력해주세요</Text>;
    return <Text>정보가 맞다면{'\n'}본인 인증하기 버튼을 눌러주세요</Text>;
  };

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <View style={[styles.container]}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              paddingTop: '20%',
              paddingBottom: 120,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.titleText}>{getTitleText()}</Text>
            {!sendToMsg ? (
              <>
                {nameStepDone && isRRNStepDone && isPhoneStepVisible && (
                  <View
                    style={[styles.labeledInputContainer, {marginBottom: 20}]}>
                    <Text style={styles.inputLabel}>통신사</Text>
                    <TouchableOpacity
                      ref={carrierRef}
                      onPress={() => setIsCarrierModalVisible(true)}
                      style={[
                        styles.input,
                        error === 'selectedCarrier' && styles.errorFocused,
                      ]}>
                      <Text
                        style={{
                          color: selectedCarrier ? '#000' : '#aaa',
                          fontSize: 16,
                        }}>
                        {selectedCarrier || '통신사 선택'}
                      </Text>
                    </TouchableOpacity>
                    {error === 'selectedCarrier' && selectedCarrier === '' && (
                      <Text style={styles.errorMessage}>
                        통신사를 선택 해주세요.
                      </Text>
                    )}
                  </View>
                )}

                {nameStepDone && isRRNStepDone && (
                  <View
                    style={[styles.labeledInputContainer, {marginBottom: 20}]}>
                    {showphoneLabel && (
                      <Text
                        style={[
                          styles.inputLabel,
                          isphoneFocused && {
                            color: 'black',
                          },
                        ]}>
                        휴대폰 번호
                      </Text>
                    )}
                    <TextInput
                      ref={phoneRef}
                      style={[
                        styles.input,
                        isphoneFocused && styles.inputFocused,
                        error === 'phoneNumber' && styles.errorFocused,
                      ]}
                      placeholder={phoneplaceholder}
                      placeholderTextColor="#999"
                      keyboardType="number-pad"
                      value={phoneNumber}
                      onChangeText={text => {
                        setPhoneNumber(text);
                        if (text.length === 11 && selectedCarrier == '') {
                          Keyboard.dismiss();
                          setIsCarrierModalVisible(true);
                        }
                      }}
                      onFocus={() => setIsphoneFocused(true)}
                      onBlur={() => setIsphoneFocused(false)}
                      maxLength={11}
                    />
                    {error === 'phoneNumber' && (
                      <Text style={styles.errorMessage}>
                        정확한 번호를 작성해주세요.
                      </Text>
                    )}
                  </View>
                )}

                {nameStepDone && (
                  <View style={{marginBottom: 20}}>
                    <View style={styles.rrnContainer}>
                      <View style={[styles.labeledInputContainer, {flex: 6}]}>
                        {showrrfLabel && (
                          <Text
                            style={[
                              styles.inputLabel,
                              (isrrnfFocused || isrrnbFocused) && {
                                color: 'black',
                              },
                            ]}>
                            주민등록번호
                          </Text>
                        )}
                        <TextInput
                          ref={rrnFrontRef}
                          style={[
                            styles.input,
                            isrrnfFocused && styles.inputFocused,
                            error === 'rrnFront' && styles.errorFocused,
                          ]}
                          placeholder={rrnfplaceholder}
                          placeholderTextColor="#999"
                          keyboardType="number-pad"
                          value={rrnFront}
                          onChangeText={text => {
                            setRrnFront(text);
                            if (text.length === 6 && rrnBack == '') {
                              setTimeout(() => rrnBackRef.current?.focus(), 50);
                            }
                          }}
                          onFocus={() => setIsrrnfFocused(true)}
                          onBlur={() => setIsrrnfFocused(false)}
                          maxLength={6}
                        />
                      </View>
                      <Text
                        style={{
                          alignSelf: 'center',
                          flex: 1,
                          textAlign: 'center',
                        }}>
                        -
                      </Text>
                      <TextInput
                        ref={rrnBackRef}
                        style={[
                          styles.input,
                          isrrnbFocused && styles.inputFocused,
                          error === 'rrnBack' && styles.errorFocused,
                          {flex: 1},
                        ]}
                        placeholder=""
                        keyboardType="number-pad"
                        value={rrnBack}
                        onChangeText={text => {
                          setRrnBack(text);
                          if (text.length === 1 && phoneNumber == '') {
                            setTimeout(() => phoneRef.current?.focus(), 50);
                          }
                        }}
                        onFocus={() => setIsrrnbFocused(true)}
                        onBlur={() => setIsrrnbFocused(false)}
                        maxLength={1}
                      />
                      <Text
                        style={{
                          flex: 4,
                          textAlign: 'center',
                          paddingHorizontal: 5,
                          textAlignVertical: 'center',
                          fontSize: 12,
                        }}
                        allowFontScaling={false}
                        numberOfLines={1}
                        ellipsizeMode="clip">
                        ● ● ● ● ● ●
                      </Text>
                    </View>
                    {(error === 'rrnFront' || error === 'rrnBack') && (
                      <Text style={styles.errorMessage}>
                        올바른 주민번호를 입력해주세요.
                      </Text>
                    )}
                  </View>
                )}

                <View
                  style={[styles.labeledInputContainer, {marginBottom: 20}]}>
                  {shownameLabel && (
                    <Text
                      style={[
                        styles.inputLabel,
                        isnameFocused && {color: 'black'},
                      ]}>
                      이름
                    </Text>
                  )}

                  <TextInput
                    ref={nameRef}
                    style={[
                      styles.input,
                      isnameFocused && styles.inputFocused,
                      (error === 'name' || nameerror.name) &&
                        styles.errorFocused,
                    ]}
                    placeholder={nameplaceholder}
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={handlenamechange}
                    onSubmitEditing={handleNameStepComplete}
                    onFocus={() => setIsnameFocused(true)}
                    onBlur={() => {
                      handleNameStepComplete();
                      setIsnameFocused(false);
                    }}
                    returnKeyType="next"
                  />
                  {nameerror.name && (
                    <Text style={styles.errorMessage}>{nameerror.name}</Text>
                  )}
                  {error === 'name' && (
                    <Text style={styles.errorMessage}>
                      이름을 입력해주세요.
                    </Text>
                  )}
                </View>
                {nameStepDone &&
                  isRRNStepDone &&
                  isPhoneStepVisible &&
                  isCarrierStepVisible && (
                    <TouchableOpacity
                      style={styles.authButton}
                      onPress={handleAuth}>
                      <Text style={styles.authButtonText}>본인 인증하기</Text>
                    </TouchableOpacity>
                  )}
              </>
            ) : (
              <View style={[styles.labeledInputContainer, {marginBottom: 20}]}>
                <Text
                  style={[
                    styles.inputLabel,
                    isotpcodeFocused && {color: 'black'},
                  ]}>
                  인증번호
                </Text>

                <View style={styles.inputWithTimerWrapper}>
                  <TextInput
                    ref={otpcodeRef}
                    style={[
                      styles.input,
                      isotpcodeFocused && styles.inputFocused,
                      error === 'otpcode' && styles.errorFocused,
                    ]}
                    placeholder={'6자리 입력'}
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    value={otpcode}
                    onChangeText={text => {
                      setOTPCode(text);
                    }}
                    onFocus={() => setIsOTPcodeFocused(true)}
                    onBlur={() => setIsOTPcodeFocused(false)}
                    maxLength={6}
                  />
                  <View style={styles.timerInsideInput}>
                    <Text style={styles.timerText}>
                      {formatTimeLeft(timeLeft)}
                    </Text>
                    <TouchableOpacity
                      style={styles.resendbtn}
                      onPress={handleResend}>
                      <Text style={styles.resendText}>다시 받기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {error === 'otpcode' && (
                  <Text style={styles.errorMessage}>
                    인증번호가 올바르지 않습니다.
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          <Modal
            visible={isCarrierModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsCarrierModalVisible(false)}>
            <TouchableWithoutFeedback
              onPress={() => setIsCarrierModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginBottom: 10,
                      }}>
                      통신사를 선택해주세요
                    </Text>
                    <FlatList
                      data={CARRIER_OPTIONS}
                      keyExtractor={item => item}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={{paddingVertical: 15}}
                          onPress={() => {
                            setSelectedCarrier(item);
                            setIsCarrierModalVisible(false);
                          }}>
                          <Text style={{fontSize: 17}}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <AlertComponent />
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    zIndex: 5,
  },
  titleText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 30,
    lineHeight: 28,
    fontFamily: 'Pretendard-Bold',
  },
  labeledInputContainer: {
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    top: -7,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#999',
    zIndex: 1,
    fontFamily: 'Pretendard-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  rrfinput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  rrbinput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: 'black',
  },
  errorFocused: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  rrnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: '#80D2F4',
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 34, 34, 0.4)', // 전체 어두운 배경
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // 여기서만 모달 내용 슬라이드
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 40,
    padding: 20,
    maxHeight: '60%',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 5,
    fontFamily: 'Pretendard-Medium',
  },

  inputWithTimerWrapper: {
    position: 'relative',
  },

  timerInsideInput: {
    flexDirection: 'row',
    position: 'absolute',
    gap: 10,
    right: 20,
    height: '100%',
    alignItems: 'center',
  },

  timerText: {
    padding: 5,
    fontSize: 12,
    color: '#FF4816',
    fontFamily: 'Pretendard-Medium',
  },
  resendbtn: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 5,
  },
  resendText: {
    fontSize: 12,
    color: '#444',
    fontFamily: 'Pretendard-Medium',
  },
});

export default IdentityScreen;
