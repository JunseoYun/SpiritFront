import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CancelText from '../../../../components/CancelText/CancelText';
import CustomTextInput from '../../../../utils/CustomTextInput';

// Utils
const onlyDigits = v => (v || '').replace(/\D+/g, '');
const formatCardNumber = v => {
  const d = onlyDigits(v).slice(0, 16);
  const g = d.match(/.{1,4}/g) || [];
  return g.join('-');
};
const formatExpiry = v => {
  const d = onlyDigits(v).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};
const isValidMMYY = v => {
  const d = onlyDigits(v);
  if (d.length !== 4) return false;
  const mm = Number(d.slice(0, 2));
  return mm >= 1 && mm <= 12;
};
const isExpiryNotPast = v => {
  const d = onlyDigits(v);
  if (d.length !== 4) return false;
  const mm = Number(d.slice(0, 2));
  const yy = Number(d.slice(2));
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;
  if (yy > curYY) return true;
  if (yy < curYY) return false;
  return mm >= curMM;
};
const isValidLuhn = v => {
  const s = onlyDigits(v);
  if (s.length !== 16) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let n = Number(s[15 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
};
const isValidYYMMDD = v => {
  const s = onlyDigits(v);
  if (s.length !== 6) return false;
  const yy = Number(s.slice(0, 2));
  const mm = Number(s.slice(2, 4));
  const dd = Number(s.slice(4, 6));
  if (mm < 1 || mm > 12) return false;
  const year = 2000 + yy;
  const lastDay = new Date(year, mm, 0).getDate();
  return dd >= 1 && dd <= lastDay;
};
// Biz registration number utils (10 digits -> 3-2-5)
const formatBizNo = v => {
  const d = onlyDigits(v).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};
const isValidBizNo = v => {
  const d = onlyDigits(v);
  if (d.length !== 10) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * w[i];
  sum += Math.floor((Number(d[8]) * 5) / 10);
  return (10 - (sum % 10)) % 10 === Number(d[9]);
};

export default function CardRegisterScreen({mode, navigation}) {
  const [cardNumber, setCardNumber] = useState('');
  const [isCorp, setIsCorp] = useState(false);
  const [expiry, setExpiry] = useState('');
  const [pw2, setPw2] = useState('');
  const [birth, setBirth] = useState('');
  const [nickname, setNickname] = useState('');
  const [bizNo, setBizNo] = useState('');

  const [isCardFocused, setIsCardFocused] = useState(false);
  const [isExpiryFocused, setIsExpiryFocused] = useState(false);
  const [isPw2Focused, setIsPw2Focused] = useState(false);
  const [isBirthFocused, setIsBirthFocused] = useState(false);
  const [isNickFocused, setIsNickFocused] = useState(false);
  const [isBizFocused, setIsBizFocused] = useState(false);

  const cardRef = useRef(null);
  const expiryRef = useRef(null);
  const pw2Ref = useRef(null);
  const birthRef = useRef(null);
  const nicknameRef = useRef(null);

  const cardDigits = onlyDigits(cardNumber);
  const expiryDigits = onlyDigits(expiry);
  const birthDigits = onlyDigits(birth);
  const bizDigits = onlyDigits(bizNo);

  const [step1Donelock, setStep1Donelock] = useState(false);
  const [step2Donelock, setStep2Donelock] = useState(false);
  const [step3Donelock, setStep3Donelock] = useState(false);

  const step1Done = cardDigits.length === 16 && isValidLuhn(cardDigits);
  const step2Done =
    step1Done &&
    isValidMMYY(expiryDigits) &&
    isExpiryNotPast(expiryDigits) &&
    onlyDigits(pw2).length === 2;
  const step3Done = step2Done && isValidYYMMDD(birthDigits);

  const valid = step3Done && (!isCorp || isValidBizNo(bizDigits));

  useEffect(() => {
    setTimeout(() => {
      cardRef.current.focus();
    }, 500);
  }, []);

  useEffect(() => {
    if (step3Done) {
      if (!step3Donelock) setStep3Donelock(true);
    }
  }, [step3Done]);
  useEffect(() => {
    if (step1Done) {
      if (!step1Donelock) setStep1Donelock(true);
      setTimeout(() => expiryRef.current?.focus(), 120);
    }
  }, [step1Done]);
  useEffect(() => {
    if (
      isValidMMYY(expiryDigits) &&
      isExpiryNotPast(expiryDigits) &&
      onlyDigits(pw2).length < 2
    )
      setTimeout(() => pw2Ref.current?.focus(), 120);
  }, [expiryDigits]);
  useEffect(() => {
    if (onlyDigits(pw2).length === 2 && birthDigits.length < 6) {
      if (!step2Donelock) setStep2Donelock(true);
      setTimeout(() => birthRef.current?.focus(), 120);
    }
  }, [pw2, step2Done]);

  const submit = () => {
    if (!valid) return;
    const payload = {
      cardNumber: cardDigits,
      isCorporate: isCorp,
      expiryMMYY: expiryDigits,
      password2: onlyDigits(pw2),
      birthYYMMDD: birthDigits,
      nickname: nickname.trim(),
    };
    console.log('카드 등록:', payload);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled">
          {/* Show newest steps at the top */}
          {step3Donelock && (
            <>
              <CustomText style={styles.label}>카드 별칭 (선택)</CustomText>
              <View style={styles.inputWrap}>
                <CustomTextInput
                  style={[styles.input, isNickFocused && styles.inputFocused]}
                  placeholder="주체할 카드"
                  value={nickname}
                  onChangeText={setNickname}
                  maxLength={20}
                  ref={nicknameRef}
                  onFocus={() => setIsNickFocused(true)}
                  onBlur={() => setIsNickFocused(false)}
                />
                {isNickFocused && nickname.length > 0 && (
                  <CancelText
                    rightnum={10}
                    topnum={12}
                    paddingnum={4}
                    handlecancel={() => setNickname('')}
                    size={20}
                  />
                )}
              </View>
            </>
          )}

          {/* Business registration number when corporate card */}
          {step3Donelock && isCorp && (
            <>
              <CustomText style={styles.label}>사업자등록번호</CustomText>
              <View style={styles.inputWrap}>
                <CustomTextInput
                  style={[styles.input, isBizFocused && styles.inputFocused]}
                  placeholder="000-00-00000"
                  value={formatBizNo(bizNo)}
                  onChangeText={v => setBizNo(onlyDigits(v).slice(0, 10))}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  maxLength={12}
                  onFocus={() => setIsBizFocused(true)}
                  onBlur={() => setIsBizFocused(false)}
                />
                {isBizFocused && bizDigits.length > 0 && (
                  <CancelText
                    rightnum={10}
                    topnum={12}
                    paddingnum={4}
                    handlecancel={() => setBizNo('')}
                    size={20}
                  />
                )}
              </View>
              {bizDigits.length > 0 && !isValidBizNo(bizDigits) && (
                <CustomText style={styles.error}>
                  올바른 사업자등록번호를 입력해주세요.
                </CustomText>
              )}
            </>
          )}

          {step2Donelock && (
            <>
              <CustomText style={styles.label}>생년월일 (YYMMDD)</CustomText>
              <View style={styles.inputWrap}>
                <CustomTextInput
                  style={[styles.input, isBirthFocused && styles.inputFocused]}
                  placeholder="YYMMDD"
                  value={birth}
                  onChangeText={v => setBirth(onlyDigits(v).slice(0, 6))}
                  inputMode="numeric"
                  keyboardType="number-pad"
                  maxLength={6}
                  ref={birthRef}
                  onFocus={() => setIsBirthFocused(true)}
                  onBlur={() => setIsBirthFocused(false)}
                />
                {isBirthFocused && birthDigits.length > 0 && (
                  <CancelText
                    rightnum={10}
                    topnum={12}
                    paddingnum={4}
                    handlecancel={() => setBirth('')}
                    size={20}
                  />
                )}
              </View>
              {birthDigits.length > 0 && !isValidYYMMDD(birthDigits) && (
                <CustomText style={styles.error}>
                  올바른 생년월일(YYMMDD)을 입력해주세요.
                </CustomText>
              )}
            </>
          )}

          {step1Donelock && (
            <View style={styles.row}>
              <View style={[styles.col, {marginRight: 8}]}>
                <CustomText style={styles.label}>유효기간</CustomText>
                <View style={styles.inputWrap}>
                  <CustomTextInput
                    style={[
                      styles.input,
                      isExpiryFocused && styles.inputFocused,
                    ]}
                    placeholder="MM/YY"
                    value={formatExpiry(expiry)}
                    onChangeText={v => setExpiry(onlyDigits(v).slice(0, 4))}
                    inputMode="numeric"
                    keyboardType="number-pad"
                    maxLength={5}
                    ref={expiryRef}
                    onFocus={() => setIsExpiryFocused(true)}
                    onBlur={() => setIsExpiryFocused(false)}
                    returnKeyType="next"
                  />
                  {isExpiryFocused && expiryDigits.length > 0 && (
                    <CancelText
                      rightnum={10}
                      topnum={12}
                      paddingnum={4}
                      handlecancel={() => setExpiry('')}
                      size={20}
                    />
                  )}
                </View>
                {expiryDigits.length > 0 && !isValidMMYY(expiryDigits) && (
                  <CustomText style={styles.error}>
                    MM/YY 형식으로 입력해주세요.
                  </CustomText>
                )}
                {isValidMMYY(expiryDigits) &&
                  !isExpiryNotPast(expiryDigits) && (
                    <CustomText style={styles.error}>
                      이미 지난 유효기간입니다.
                    </CustomText>
                  )}
              </View>
              <View style={[styles.col, {marginLeft: 8}]}>
                <CustomText style={styles.label}>비밀번호 앞 2자리</CustomText>
                <View style={styles.inputWrap}>
                  <CustomTextInput
                    style={[styles.input, isPw2Focused && styles.inputFocused]}
                    placeholder="**"
                    value={pw2}
                    onChangeText={v => setPw2(onlyDigits(v).slice(0, 2))}
                    secureTextEntry
                    inputMode="numeric"
                    keyboardType="number-pad"
                    maxLength={2}
                    ref={pw2Ref}
                    onFocus={() => setIsPw2Focused(true)}
                    onBlur={() => setIsPw2Focused(false)}
                    returnKeyType="next"
                  />
                  {isPw2Focused && pw2.length > 0 && (
                    <CancelText
                      rightnum={10}
                      topnum={12}
                      paddingnum={4}
                      handlecancel={() => setPw2('')}
                      size={20}
                    />
                  )}
                </View>
                {pw2.length > 0 && pw2.length < 2 && (
                  <CustomText style={styles.error}>
                    앞 2자리를 입력해주세요.
                  </CustomText>
                )}
              </View>
            </View>
          )}

          {/* Card number at the bottom so new fields appear above */}
          <CustomText style={styles.label}>카드 번호</CustomText>
          <View style={styles.inputWrap}>
            <CustomTextInput
              style={[styles.input, isCardFocused && styles.inputFocused]}
              placeholder="0000-0000-0000-0000"
              value={formatCardNumber(cardNumber)}
              onChangeText={v => setCardNumber(onlyDigits(v).slice(0, 16))}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={19}
              ref={cardRef}
              onFocus={() => setIsCardFocused(true)}
              onBlur={() => setIsCardFocused(false)}
              returnKeyType="next"
            />
            {isCardFocused && cardDigits.length > 0 && (
              <CancelText
                rightnum={10}
                topnum={12}
                paddingnum={4}
                handlecancel={() => setCardNumber('')}
                size={20}
              />
            )}
          </View>
          {cardDigits.length > 0 && cardDigits.length !== 16 && (
            <CustomText style={styles.error}>
              카드 번호 16자리를 입력해주세요.
            </CustomText>
          )}
          {cardDigits.length === 16 && !isValidLuhn(cardDigits) && (
            <CustomText style={styles.error}>
              유효하지 않은 카드 번호입니다.
            </CustomText>
          )}

          {/* Corporate toggle under card number */}
          <View style={[styles.corpRow]}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsCorp(s => !s)}>
              <Ionicons
                name={isCorp ? 'checkbox-outline' : 'square-outline'}
                size={20}
                color={isCorp ? '#3CBBFF' : '#888'}
              />
              <CustomText style={styles.checkboxLabel}>법인카드</CustomText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {valid && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={submit}
            disabled={!valid}
            style={styles.primaryBtn}>
            <CustomText style={styles.primaryText}>등록하기</CustomText>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  form: {padding: 20},
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
  },
  inputFocused: {borderWidth: 2, borderColor: '#111'},
  inputWrap: {position: 'relative'},
  row: {flexDirection: 'row'},
  col: {flex: 1},
  error: {marginTop: 6, fontSize: 12, color: '#DC2626'},
  corpRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  checkbox: {
    flexDirection: 'row',
    paddingLeft: 1,
    alignItems: 'center',
    gap: 3,
  },
  checkboxLabel: {fontSize: 14, color: '#111'},
  bottomBar: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEE',
    backgroundColor: '#fff',
  },
  primaryBtn: {
    backgroundColor: '#3CBBFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {color: '#fff', fontSize: 17},
});
