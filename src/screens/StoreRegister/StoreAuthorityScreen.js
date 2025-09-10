import React, {useState, useLayoutEffect, useCallback, useRef} from 'react';
import {
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import ProgressBar from '../../components/StoreAuthority/ProgressBar';
import StoreInfoCard from '../../components/StoreAuthority/StoreInfoCard';
import StoreOwnerInput from '../../components/StoreAuthority/StoreOwnerInput';
import StoreBusinessData from '../../components/StoreAuthority/StoreBusinessData';
import StoreAddress from '../../components/StoreAddScreen/StoreAddress';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {normalizeFont} from '../../hooks/normalizeFont';
import BusinessCertificate from '../../components/StoreAuthority/BusinessCertificate';

const StoreAuthorityScreen = ({navigation}) => {
  const route = useRoute();
  const {bottom} = useSafeAndroidInsets();
  const {storeData, storeLocationDto, storeSuggestionData} = route.params;
  const [owners, setOwners] = useState([{name: ''}]);
  const [hasCoRepresentative, setHasCoRepresentative] = useState(false);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [businessData, setBusinessData] = useState({
    businessNumber: '',
    openDate: '',
    drink_sales_number: '',
  });
  const [
    business_registration_certificate,
    setBusiness_registration_certificate,
  ] = useState(null);
  const [storeAddressData, setStoreAddressData] = useState({
    storeAddress: storeLocationDto.address || '',
    storeAddressDetail: storeLocationDto.addressDetail || '',
    latitude: storeLocationDto.latitude,
    longitude: storeLocationDto.longitude,
  });

  const scrollViewRef = useRef(null);
  const certificateRef = useRef(null);
  const nameRef = useRef(null);
  const ownerRefs = useRef([]);
  const owneRef = useRef(null);
  const businessNumberRef = useRef(null);
  const openDateRef = useRef(null);
  const drink_sales_numberRef = useRef(null);
  const storeAddressRef = useRef(null);

  const scrollToError = ref => {
    if (ref?.current) {
      ref.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({y: y - 20, animated: true});
        },
        error => console.log(error),
      );
    }
  };

  const handleNext = useCallback(() => {
    // 1. 사업자등록증 첨부 여부 확인
    if (!business_registration_certificate) {
      setError('business_registration_certificate');
      setErrorMessage('사업자등록증을 첨부해주세요.');
      scrollToError(certificateRef);
      return;
    }

    // 2. 대표자 정보 확인 (공동 대표 or 단일 대표)
    if (hasCoRepresentative) {
      if (owners.some(owner => !owner.name.trim())) {
        setError('ownerGroup');
        setErrorMessage('모든 대표자의 성명을 입력해주세요.');
        scrollToError(owneRef);
        return;
      }
    } else {
      if (!owners[0].name.trim()) {
        setError('owner');
        setErrorMessage('대표자 성명을 입력해주세요.');
        scrollToError(owneRef);
        return;
      }
    }

    // 3. 사업자 데이터 확인 (숫자 형식 검증 추가)
    if (
      !businessData.businessNumber.trim() ||
      !/^\d+$/.test(businessData.businessNumber)
    ) {
      setError('businessData.businessNumber');
      setErrorMessage('사업자등록번호를 올바르게 입력해주세요.');
      scrollToError(businessNumberRef);
      return;
    }
    if (
      !businessData.openDate.trim() ||
      !/^\d{8}$/.test(businessData.openDate)
    ) {
      setError('businessData.openDate');
      setErrorMessage('개업연월일을 올바르게 입력해주세요. (19000101 형식)');
      scrollToError(openDateRef);
      return;
    }
    if (
      !businessData.drink_sales_number.trim() ||
      !/^\d+$/.test(businessData.drink_sales_number)
    ) {
      setError('businessData.drink_sales_number');
      setErrorMessage('주류판매신고번호를 올바르게 입력해주세요.');
      scrollToError(drink_sales_numberRef);
      return;
    }

    // 4. 매장 주소 확인
    if (!storeAddressData.storeAddress.trim()) {
      scrollToError(storeAddressRef);
      setError('StoreAddress');
      return;
    }

    setError('');
    setErrorMessage('');

    navigation.navigate('StoreAuthConfirm', {
      data: {
        storeData,
        owners,
        hasCoRepresentative,
        businessData,
        business_certificate: business_registration_certificate,
        storeAddressData,
        storeSuggestionData,
      },
    });
    // TODO: 다음 단계 처리 (ex. API 요청 또는 다음 화면 이동)
  }, [
    owners,
    hasCoRepresentative,
    businessData,
    business_registration_certificate,
    storeAddressData,
  ]);

  const addOwner = () => {
    setOwners(prev => [...prev, {name: ''}]);
  };

  // 특정 대표자의 이름 업데이트 함수
  const updateOwnerName = (index, name) => {
    const newOwners = [...owners];
    newOwners[index].name = name;
    setOwners(newOwners);
  };

  // 대표자 삭제 함수
  const removeOwner = index => {
    setOwners(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddressSelect = ({address, coords}) => {
    setStoreAddressData(prevData => ({
      ...prevData,
      storeAddress: address,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));
  };

  // 이미지 선택 함수: 갤러리에서 이미지 선택 후 state 업데이트

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.headerButton} allowFontScaling={false}>
            다음
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, handleNext]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
        <ProgressBar progress={1} />
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}>
          {/* 진행 바: 100% 진행 */}
          <StoreInfoCard storeData={storeData} />

          <View ref={certificateRef}>
            <BusinessCertificate
              business_registration_certificate={
                business_registration_certificate
              }
              setBusiness_registration_certificate={
                setBusiness_registration_certificate
              }
              error={error}
              errorMessage={errorMessage}
            />
          </View>

          <StoreOwnerInput
            owners={owners}
            hasCoRepresentative={hasCoRepresentative}
            setHasCoRepresentative={setHasCoRepresentative}
            addOwner={addOwner}
            updateOwnerName={updateOwnerName}
            removeOwner={removeOwner}
            nameRef={nameRef}
            ownerRefs={ownerRefs}
            owneRef={owneRef}
            businessNumberRef={businessNumberRef}
            businessData={businessData}
            error={error}
            errorMessage={errorMessage}
          />

          <StoreBusinessData
            businessData={businessData}
            setBusinessData={setBusinessData}
            businessNumberRef={businessNumberRef}
            openDateRef={openDateRef}
            drink_sales_numberRef={drink_sales_numberRef}
            error={error}
            errorMessage={errorMessage}
          />
          <StoreAddress
            address={storeAddressData.storeAddress}
            detailedAddress={storeAddressData.storeAddressDetail}
            setDetailedAddress={value =>
              setStoreAddressData(prevData => ({
                ...prevData,
                storeAddressDetail: value,
              }))
            }
            navigation={navigation}
            onAddressSelect={handleAddressSelect}
            index={1}
            location={{
              latitude: storeAddressData.latitude,
              longitude: storeAddressData.longitude,
            }}
            error={error}
            storeAddressRef={storeAddressRef}
          />

          {/* 안내 멘트 */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              정확한 신청자 정보를 입력해 주세요.{'\n'}
              입력된 정보는 매장 정보 확인에만 사용됩니다.{'\n'}
              무차별적인 신청은 엄격히 금지되며, 부정확한 정보나 타인의 정보를
              기재할 경우 서비스 이용에 제한을 받을 수 있습니다.{'\n'}
              모든 정보는 철저히 검토되며, 부정확한 정보가 확인될 경우 신청이
              반려될 수 있습니다.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.storeAddTextview}>
          <Pressable style={styles.storeAddButtonsearch} onPress={handleNext}>
            <Text style={styles.storeAddText}>다음</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  contentContainer: {paddingBottom: 30},
  headerButton: {
    marginRight: 18,
    fontSize: normalizeFont(18, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#16BBFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    marginHorizontal: 20,
    marginVertical: 10,
    color: '#333',
  },
  certificateContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  certificateButton: {
    backgroundColor: '#45C9FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 7,
  },
  certificateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
  certificateImage: {width: '100%', height: 200, marginTop: 10},
  instructionsContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 18,
    marginTop: 30,
  },
  instructions: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
    fontFamily: 'Pretendard-Regular',
  },
  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' && 10,
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
    borderRadius: 10,
  },
  storeAddText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginVertical: 7,
    fontFamily: 'Pretendard-Regular',
    marginHorizontal: 18,
  },
});

export default StoreAuthorityScreen;
