//사장님 매장 단일 인증 스크린
import React, {
  useState,
  useLayoutEffect,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRoute} from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import StoreAddname from '../../components/StoreAddScreen/StoreAddname';
import StorAddeNumber from '../../components/StoreAddScreen/StoreAddNumber';
import StoreAddress from '../../components/StoreAddScreen/StoreAddress';
import BusinessCertificate from '../../components/StoreAuthority/BusinessCertificate';
import BottomActionButton from '../../utils/BottomActionButton';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import ColorUtil from '../../utils/ColorUtil';
import useCustomAlert from '../../hooks/useCustomAlert';
import useDoubleBackExit from '../../hooks/useDoubleBackExit';
import {Create_ownership_photoOnly} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
const STEP_FLOW = [
  'storeName',
  'storeNumber',
  'storeAddress',
  'certificate',
  'consent',
];

const STEP_GUIDES = {
  storeName: {
    type: '매장 이름',
    title: '매장 이름을 확인해주세요',
    description: '사업자등록증과 동일한 상호명을 입력하면 심사가 빨라져요.',
    tipTitle: '이름 가이드',
    tip: '사업자등록증 상의 상호명과 동일하게 작성해야 심사가 빠르게 진행됩니다.',
  },
  storeNumber: {
    type: '매장 연락처',
    title: '매장 연락처를 입력해주세요',
    description: '고객 문의와 인증 안내를 받을 수 있는 번호인지 확인해 주세요.',
    tipTitle: '연락처 안내',
    tip: '항상 연결 가능한 번호를 입력하면 인증 결과 안내를 놓치지 않아요.',
  },
  storeAddress: {
    type: '사업장 소재지',
    title: '사업장 소재지를 입력해주세요',
    description:
      '사업자등록증에 기재된 주소와 동일하게 입력하면 검증이 쉬워집니다.',
    tipTitle: '사업장 소재지(매장 주소)',
    tip: '사업장 소재지는 실제 매장이 운영되는 주소를 의미해요.',
  },
  certificate: {
    type: '사업자등록증',
    title: '사업자등록증 사본을 첨부해주세요',
    description: '선명한 사업자등록증을 첨부하면 등록 검토가 더 빨라집니다.',
    tipTitle: '첨부 가이드',
    tip: '사업자등록증의 모든 정보가 보이도록 밝은 곳에서 촬영해 주세요.',
  },
  consent: {
    type: '개인정보 수집 동의',
    title: '동의가 필요해요',
    description:
      '매장 등록 및 사업자 인증을 위해 정보 수집·이용에 동의해주세요.',
    tipTitle: '왜 필요한가요?',
    tip: '한잔할까는 사업자 등록증과 신청자 정보를 대조해 간편하게 인증하기 때문에, 본인 확인을 위한 최소한의 정보가 필요해요.',
  },
};

const StoreAuthorityScreen = ({navigation}) => {
  const route = useRoute();
  const {bottom} = useSafeAndroidInsets();

  const [loading, setLoading] = useState(false);

  useDoubleBackExit(navigation);
  const {
    storeId,
    storeName: initialStoreName = '',
    storeLocationDto = {},
    storeContact: initialStoreContact = '',
    businessCertificate: initialCertificate = null,
  } = route.params;

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEP_FLOW[stepIndex];
  const totalSteps = STEP_FLOW.length;
  const currentStepNumber = stepIndex + 1;
  const currentStepTitle = STEP_GUIDES[step]?.type ?? '';
  const [storeName, setStoreName] = useState(initialStoreName);
  const [storeContact, setStoreContact] = useState(initialStoreContact);
  const [address, setAddress] = useState(storeLocationDto.address || '');
  const [detailedAddress, setDetailedAddress] = useState(
    storeLocationDto.addressDetail || '',
  );
  const [coords, setCoords] = useState({
    latitude: storeLocationDto.latitude || 0,
    longitude: storeLocationDto.longitude || 0,
  });
  const [businessCertificate, setBusinessCertificate] =
    useState(initialCertificate);
  const [errorField, setErrorField] = useState('');
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const progressValue = useMemo(
    () => (currentStepNumber / totalSteps) * 100,
    [currentStepNumber, totalSteps],
  );
  const progressShared = useSharedValue(progressValue);
  const animatedProgressStyle = useAnimatedStyle(
    () => ({
      width: `${progressShared.value}%`,
    }),
    [progressShared],
  );

  const validateCurrentStep = useCallback(() => {
    switch (step) {
      case 'storeName':
        if (!storeName.trim()) {
          setErrorField('storename');
          return false;
        }
        break;
      case 'storeNumber':
        if (!storeContact.trim()) {
          setErrorField('storeNumber');
          return false;
        }
        break;
      case 'storeAddress':
        if (!address.trim()) {
          setErrorField('StoreAddress');
          return false;
        }
        break;
      case 'certificate':
        if (!businessCertificate) {
          setErrorField('business_registration_certificate');
          return false;
        }
        break;
      default:
        break;
    }
    setErrorField('');
    return true;
  }, [step, storeName, storeContact, address, businessCertificate]);

  const isSubmitDisabled = useMemo(
    () =>
      !storeName.trim() ||
      !storeContact.trim() ||
      !address.trim() ||
      !businessCertificate,
    [storeName, storeContact, address, businessCertificate],
  );

  const isCurrentStepReady = useMemo(() => {
    switch (step) {
      case 'storeName':
        return !!storeName.trim();
      case 'storeNumber':
        return !!storeContact.trim();
      case 'storeAddress':
        return !!address.trim();
      case 'certificate':
        return !!businessCertificate;
      default:
        return true;
    }
  }, [step, storeName, storeContact, address, businessCertificate]);

  const handleAddressSelect = ({address, coords}) => {
    setAddress(address);
    setCoords(coords);
  };

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return;
    if (stepIndex >= STEP_FLOW.length - 1) {
      return;
    }
    const nextIndex = stepIndex + 1;
    if (STEP_FLOW[nextIndex] === 'consent') {
      setIsConsentChecked(false);
    }
    setStepIndex(nextIndex);
  }, [validateCurrentStep, stepIndex]);

  const handleBackStep = useCallback(() => {
    if (stepIndex === 0) {
      navigation.goBack();
      return;
    }
    setStepIndex(prev => Math.max(prev - 1, 0));
  }, [navigation, stepIndex]);

  const handleConsentConfirm = useCallback(async () => {
    if (!isConsentChecked) {
      showAlert({
        title: '동의가 필요해요',
        message: '동의 후 신청을 진행할 수 있습니다.',
      });
      return;
    }
    if (!businessCertificate) {
      showAlert({
        title: '사업자등록증 필요',
        message: '사업자등록증 이미지를 업로드해주세요.',
      });
      return;
    }

    // 📌 서버 DTO 형태에 맞게 매핑
    const requestBody = {
      file: businessCertificate, // 이미지 바이너리 or uri
      createOwnershipPhotoOnlyDto: {
        storeId: storeId,
        receivedStoreName: storeName.trim(),
        receivedStoreContact: storeContact.trim(),
        businessLocation: {
          address: address,
          addressDetail: detailedAddress,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      },
    };

    try {
      setLoading(true);
      const response = await Create_ownership_photoOnly(requestBody);

      if (response.status === 200) {
        showAlert({
          title: '매장 인증 신청 완료',
          message:
            '신청 내용을 확인한 후, 빠른 시일 내에\n알림으로 안내드릴 예정입니다.',
          onConfirm: () => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'MainBtmbar',
                  state: {routes: [{name: 'MainScreen'}]},
                },
              ],
            });
          },
        });
      }
    } catch (error) {
      console.error(
        '[StoreCheckScreen] photo-only error:',
        error.response.data.code,
      );
      if (error.response.data.code === 22021) {
        showAlert({
          title: '이미 신청한 매장',
          message: '이미 이 매장에 대해 인증 신청을 하셨습니다.',
          onConfirm: () => {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'MainBtmbar',
                  state: {routes: [{name: 'MainScreen'}]},
                },
              ],
            });
          },
        });
      } else {
        showAlert({
          title: '신청 실패',
          message:
            '잠시 후 다시 시도해 주세요.\n계속 실패할 경우, 메일로 문의해 주세요.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [
    isConsentChecked,
    showAlert,
    storeId,
    storeName,
    storeContact,
    route.params?.storeData?.userContact,
    address,
    detailedAddress,
    coords.latitude,
    coords.longitude,
    businessCertificate,
  ]);

  useEffect(() => {
    progressShared.value = withTiming(progressValue, {duration: 220});
  }, [progressValue, progressShared]);

  const {showAlert, AlertComponent} = useCustomAlert();

  const handleCancelPress = useCallback(() => {
    showAlert({
      title: '매장 등록을 그만둘까요?',
      message: '작성 중인 내용은 저장되지 않아요.',
      type: 'confirm',
      confirmText: '그만두기',
      cancelText: '취소',
      onConfirm: () => navigation.goBack(),
    });
  }, [navigation, showAlert]);

  useLayoutEffect(() => {
    const isIOS = Platform.OS === 'ios';

    navigation.setOptions({
      headerTitle: () => (
        <Text
          style={{
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
          }}
          allowFontScaling={false}>
          {currentStepTitle || '매장 등록'}
        </Text>
      ),
      headerTitleAlign: 'center',
      gestureEnabled: !isIOS || stepIndex === 0,
      headerLeft: () => (
        <Pressable
          onPress={handleCancelPress}
          hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
          <Ionicons
            name="close"
            size={24}
            color="#333"
            style={{paddingLeft: 12}}
          />
        </Pressable>
      ),
    });
  }, [navigation, stepIndex, handleCancelPress, currentStepTitle]);

  const renderStepIntro = useCallback(stepKey => {
    const guide = STEP_GUIDES[stepKey];
    if (!guide) {
      return null;
    }
    return (
      <View style={styles.sectionIntro}>
        {guide.title && <Text style={styles.sectionTitle}>{guide.title}</Text>}
        {guide.description && (
          <Text style={styles.sectionDescription}>{guide.description}</Text>
        )}
      </View>
    );
  }, []);

  const renderStepTip = useCallback(stepKey => {
    const guide = STEP_GUIDES[stepKey];
    if (!guide?.tip) {
      return null;
    }
    return (
      <View style={styles.tipWrapper}>
        <Text style={styles.tipBadge}>TIP</Text>
        <View style={styles.tipContent}>
          {guide.tipTitle && (
            <Text style={styles.tipTitle}>{guide.tipTitle}</Text>
          )}
          <Text style={styles.tipBody}>{guide.tip}</Text>
        </View>
      </View>
    );
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'storeName':
        return (
          <>
            {renderStepIntro(step)}
            <StoreAddname
              storename={storeName}
              setStorename={setStoreName}
              error={errorField}
              type="registration"
            />
            {renderStepTip(step)}
          </>
        );
      case 'storeNumber':
        return (
          <>
            {renderStepIntro(step)}
            <StorAddeNumber
              storeNumber={storeContact}
              setStoreNumber={setStoreContact}
              error={errorField}
              type="registration"
            />
            {renderStepTip(step)}
          </>
        );
      case 'storeAddress':
        return (
          <>
            {renderStepIntro(step)}
            <StoreAddress
              address={address}
              detailedAddress={detailedAddress}
              setDetailedAddress={setDetailedAddress}
              navigation={navigation}
              onAddressSelect={handleAddressSelect}
              index={1}
              location={coords}
              error={errorField}
              type="registration"
            />
            {renderStepTip(step)}
          </>
        );
      case 'certificate':
        return (
          <>
            {renderStepIntro(step)}
            <BusinessCertificate
              business_registration_certificate={businessCertificate}
              setBusiness_registration_certificate={setBusinessCertificate}
              type="registration"
              error={errorField}
            />
            {renderStepTip(step)}
          </>
        );
      case 'consent':
        return (
          <>
            {renderStepIntro(step)}
            <View style={styles.consentCard}>
              <Text style={styles.consentBody}>
                한잔할까는 매장 등록 및 사업자 인증을 위해 신청자의 이름,
                연락처, 사업자등록증 사본을 수집·이용합니다. 해당 정보는 등록
                심사와 사업자 진위 확인 외의 용도로 사용되지 않으며, 심사 완료
                후 일정 기간이 지난 후 안전하게 파기됩니다.
              </Text>
              <Pressable
                style={styles.consentCheckboxRow}
                onPress={() => setIsConsentChecked(prev => !prev)}>
                <View
                  style={[
                    styles.inlineCheckbox,
                    isConsentChecked && styles.inlineCheckboxChecked,
                  ]}>
                  {isConsentChecked && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <Text style={styles.consentCheckboxLabel}>
                  위 내용에 동의합니다. (필수)
                </Text>
              </Pressable>
            </View>
            {renderStepTip(step)}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActionButton
        label={step === 'consent' ? '인증하기' : '다음'}
        cancel
        cancelLabel="이전"
        onCancel={handleBackStep}
        onPress={step === 'consent' ? handleConsentConfirm : handleNext}
        disabled={
          step === 'consent'
            ? !isConsentChecked || isSubmitDisabled
            : !isCurrentStepReady
        }
      />

      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E6EDF8',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 18,
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ColorUtil.main,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  headerTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    color: '#111',
  },
  sectionIntro: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Pretendard-Regular',
    lineHeight: 22,
  },
  tipWrapper: {
    marginHorizontal: 18,
    marginTop: 14,
    // flexDirection: 'row',
    // alignItems: 'flex-start',
  },
  tipBadge: {
    fontSize: 12,
    color: '#1789E0',
    fontFamily: 'Pretendard-Bold',
    marginRight: 10,
    paddingVertical: 4,
  },
  tipContent: {
    flex: 1,
    backgroundColor: '#F3F6FC',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#0D47A1',
    marginBottom: 6,
  },
  tipBody: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#24324A',
    lineHeight: 20,
  },
  consentCard: {
    marginHorizontal: 18,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#E1E8F5',
  },
  consentBody: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
    fontFamily: 'Pretendard-Regular',
  },
  consentCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  inlineCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  inlineCheckboxChecked: {
    backgroundColor: ColorUtil.main,
    borderColor: ColorUtil.main,
  },
  consentCheckboxLabel: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default StoreAuthorityScreen;
