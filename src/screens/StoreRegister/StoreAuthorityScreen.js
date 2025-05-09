import React, {useState, useLayoutEffect, useCallback} from 'react';
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
import ImagePicker from 'react-native-image-crop-picker';
import StoreOwnerInput from '../../components/StoreAuthority/StoreOwnerInput';
import StoreBusinessData from '../../components/StoreAuthority/StoreBusinessData';
import StoreAddress from '../../components/StoreAddScreen/StoreAddress';
import useCustomAlert from '../../hooks/useCustomAlert';
import StoreAuthorityModal from '../../components/StoreAuthority/StoreAuthorityModal';

const StoreAuthorityScreen = ({navigation}) => {
  const route = useRoute();
  const {storeData, storeAddress, storeAddressDetail} = route.params;
  const [owners, setOwners] = useState([{name: ''}]);
  const [hasCoRepresentative, setHasCoRepresentative] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

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
    storeAddress,
    storeAddressDetail,
  });

  const {showAlert, AlertComponent} = useCustomAlert();

  const handleNext = useCallback(() => {
    // 1. 사업자등록증 첨부 여부 확인
    if (!business_registration_certificate) {
      showAlert({
        title: '정보 미입력',
        message: '사업자등록증을 첨부해주세요.',
      });
      return;
    }

    // 2. 대표자 정보 확인 (공동 대표 or 단일 대표)
    if (hasCoRepresentative) {
      if (owners.some(owner => !owner.name.trim())) {
        showAlert({
          title: '정보 미입력',
          message: '모든 대표자의 성명을 입력해주세요.',
        });
        return;
      }
    } else {
      if (!owners[0].name.trim()) {
        showAlert({
          title: '정보 미입력',
          message: '대표자 성명을 입력해주세요.',
        });
        return;
      }
    }

    // 3. 사업자 데이터 확인 (숫자 형식 검증 추가)
    if (
      !businessData.businessNumber.trim() ||
      !/^\d+$/.test(businessData.businessNumber)
    ) {
      showAlert({
        title: '정보 미입력',
        message: '사업자등록번호를 올바르게 입력해주세요.',
      });
      return;
    }
    if (
      !businessData.openDate.trim() ||
      !/^\d{8}$/.test(businessData.openDate)
    ) {
      showAlert({
        title: '정보 미입력',
        message: '개업연월일을 올바르게 입력해주세요. (YYYYMMDD 형식)',
      });
      return;
    }
    if (
      !businessData.drink_sales_number.trim() ||
      !/^\d+$/.test(businessData.drink_sales_number)
    ) {
      showAlert({
        title: '정보 미입력',
        message: '주류판매신고번호를 올바르게 입력해주세요.',
      });
      return;
    }

    // 4. 매장 주소 확인
    if (!storeAddressData.storeAddress.trim()) {
      showAlert({
        title: '정보 미입력',
        message: '매장 주소를 입력해주세요.',
      });
      return;
    }
    if (!storeAddressData.storeAddressDetail.trim()) {
      showAlert({
        title: '정보 미입력',
        message: '상세 주소를 입력해주세요.',
      });
      return;
    }

    // 5. 모든 필수 정보가 입력되었을 경우
    setModalVisible(true);

    // TODO: 다음 단계 처리 (ex. API 요청 또는 다음 화면 이동)
  }, [
    owners,
    hasCoRepresentative,
    businessData,
    business_registration_certificate,
    storeAddressData,
    showAlert,
  ]);

  const handleSubmit = () => {
    setModalVisible(false);
    showAlert({title: '신청 완료', message: '신청이 완료되었습니다!'});

    // TODO: API 요청 및 다음 단계 이동
  };
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
    }));
  };

  // 이미지 선택 함수: 갤러리에서 이미지 선택 후 state 업데이트
  const handlePickCertificate = () => {
    ImagePicker.openPicker({
      width: 768,
      height: 1024,
      mediaType: 'photo',
      cropping: true,
      freeStyleCropEnabled: true,
    })
      .then(image => {
        setBusiness_registration_certificate(image.path);
      })
      .catch(error => {});
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.headerButton}>신청</Text>
        </Pressable>
      ),
    });
  }, [navigation, handleNext]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // iOS의 경우 적절한 offset 설정
    >
      <SafeAreaView style={styles.container}>
        <ProgressBar progress={1} />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* 진행 바: 100% 진행 */}
          <StoreInfoCard storeData={storeData} />

          {/* 사업자등록증 첨부 */}
          <Text style={styles.sectionTitle}>사업자등록증 첨부*</Text>
          <View style={styles.certificateContainer}>
            <Pressable
              style={styles.certificateButton}
              onPress={handlePickCertificate}>
              <Text style={styles.certificateButtonText}>이미지 선택하기</Text>
            </Pressable>
            {business_registration_certificate && (
              <Image
                source={{uri: business_registration_certificate}}
                style={styles.certificateImage}
                resizeMode="contain"
              />
            )}
          </View>

          <StoreOwnerInput
            owners={owners}
            hasCoRepresentative={hasCoRepresentative}
            setHasCoRepresentative={setHasCoRepresentative}
            addOwner={addOwner}
            updateOwnerName={updateOwnerName}
            removeOwner={removeOwner}
          />

          <StoreBusinessData
            businessData={businessData}
            setBusinessData={setBusinessData}
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
          />
          {/* <Pressable style={styles.savebutton} onPress={handleNext}>
          <Text style={styles.savebuttontext}>신청</Text>
        </Pressable> */}
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

        <AlertComponent />
        <StoreAuthorityModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmit}
          data={{
            storeData,
            owners,
            hasCoRepresentative,
            businessData,
            business_certificate: business_registration_certificate,
            storeAddressData,
          }}
        />

        <View style={styles.storeAddTextview}>
          <Pressable style={styles.storeAddButtonsearch} onPress={handleNext}>
            <Text style={styles.storeAddText}>신청하기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  contentContainer: {paddingBottom: 120},
  headerButton: {
    marginRight: 18,
    fontSize: 18,
    fontWeight: '600',
    color: '#16BBFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  certificateButtonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  certificateImage: {width: '100%', height: 200, marginTop: 10},
  instructionsContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 18,
    marginTop: 30,
  },
  instructions: {fontSize: 15, color: '#999', lineHeight: 24},
  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
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
    fontWeight: '600',
    color: '#fff',
  },
});

export default StoreAuthorityScreen;
