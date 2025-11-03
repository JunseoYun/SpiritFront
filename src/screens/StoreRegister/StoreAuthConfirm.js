import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  Image,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import ProgressBar from '../../components/StoreAuthority/ProgressBar';
import useCustomAlert from '../../hooks/useCustomAlert';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {CreateOwnership, Create_store_with_ownership} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
import {normalizeFont} from '../../hooks/normalizeFont';

const getErrorMessage = code => {
  const messages = {
    22013: '매장 이름이 비어 있습니다.',
    22014: '매장 연락처가 비어 있습니다.',
    22015: '사용자 연락처가 비어 있습니다.',
    22016: '사업자등록번호가 비어 있습니다.',
    22017: '개업일이 비어 있습니다.',
    22018: '주류판매신고번호가 비어 있습니다.',
    22019: '대표자가 1명 이상 지정되어야 합니다.',
    22020: '사업자등록번호, 대표자 이름 또는 개업일이 일치하지 않습니다.',
    22021: '이미 인증 요청 중인 매장입니다.',
    22022: '인증 요청을 찾을 수 없습니다.',
    22023: '이미 인증된 매장입니다.',
    22024: '이미 인증이 승인된 매장입니다.',
    22025: '매장 인증은 대표자 또는 공동 대표만 신청할 수 있습니다.',
  };

  return (
    messages[code] ||
    '잠시 후 다시 시도해 주세요.\n계속 실패할 경우, 메일로 문의해 주세요.'
  );
};

const InfoRow = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const StoreAuthConfirm = ({navigation}) => {
  const {data} = useRoute().params;
  const {bottom} = useSafeAndroidInsets();
  const {
    storeData,
    owners,
    hasCoRepresentative,
    businessData,
    business_certificate,
    storeAddressData,
    storeSuggestionData,
  } = data;
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [confirm, setConfirm] = useState(false);

  const displayedOwners = hasCoRepresentative ? owners : [owners[0]];

  const handleSubmit = async () => {
    const baseOwnershipDto = {
      receivedStoreContact: storeData.storeNumber,
      liquorReportNumber: businessData.drink_sales_number,
      businessRegistrationNumber: businessData.businessNumber,
      openingDate: businessData.openDate,
      representativeInfoList: owners.map((owner, idx) => ({
        name: owner.name,
        isMainRep: hasCoRepresentative ? idx === 0 : true,
      })),
      receivedStoreName: storeData.storeName,
      receivedUserContact: storeData.userContact,
      businessLocation: {
        address: storeAddressData.storeAddress,
        addressDetail: storeAddressData.storeAddressDetail,
        latitude: storeAddressData.latitude,
        longitude: storeAddressData.longitude,
      },
    };

    let payload;

    if (storeSuggestionData) {
      payload = {
        businessRegistrationCertificateImage: business_certificate,
        storeImages: storeSuggestionData.files,
        createStoreRqDto: storeSuggestionData.createStoreDto,
        createOwnershipRqDto: baseOwnershipDto,
      };
    } else {
      payload = {
        file: business_certificate,
        createOwnershipRqDto: {
          ...baseOwnershipDto,
          storeId: storeData.storeId,
        },
      };
    }

    try {
      setLoading(true);
      setConfirm(true);
      if (storeSuggestionData) {
        const response = await Create_store_with_ownership(payload);
        if (response.status === 200) {
          showAlert({
            title: '매장 등록 및 인증 신청 완료',
            message:
              '신청 내용을 확인한 후, 빠른 시일 내에 \n알림으로 안내드릴 예정입니다.',
            onConfirm: () => {
              setConfirm(false);
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
      } else {
        await CreateOwnership(payload);
        showAlert({
          title: '매장 인증 신청 완료',
          onConfirm: () => {
            setConfirm(false);
            navigation.reset({
              index: 1,
              routes: [
                {name: 'MainBtmbar'},
                {
                  name: 'StoreStack',
                  state: {
                    routes: [
                      {
                        name: 'StoreMainScreen',
                        params: {storeId: storeData.storeId},
                      },
                    ],
                  },
                },
              ],
            });
          },
        });
      }
    } catch (error) {
      const errorCode = error?.response?.data?.code;
      console.log(error?.response);
      setConfirm(false);
      showAlert({
        title: '신청 실패',
        message: getErrorMessage(errorCode),
        onConfirm: () => navigation.goBack(),
      });
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={loading || confirm ? null : handleSubmit}
          disabled={loading || confirm}>
          <Text style={[styles.headerButton]} allowFontScaling={false}>
            제출
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, handleSubmit, loading, confirm]);

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      <ProgressBar progress={2} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>매장 정보</Text>
        <InfoRow label="매장명(상호명)" value={storeData.storeName} />
        <InfoRow label="매장 연락처" value={storeData.storeNumber} />
        <InfoRow label="신청자 연락처" value={storeData.userContact} />

        <Text style={styles.sectionTitle}>대표자 정보</Text>
        {displayedOwners.map((owner, index) => (
          <InfoRow
            key={index}
            label={index === 0 ? '주 대표자' : `대표자`}
            value={owner.name}
          />
        ))}

        <Text style={styles.sectionTitle}>사업자 정보</Text>
        <InfoRow label="사업자등록번호" value={businessData.businessNumber} />
        <InfoRow label="개업연월일" value={businessData.openDate} />
        <InfoRow
          label="주류판매신고번호"
          value={businessData.drink_sales_number}
        />

        <Text style={styles.sectionTitle}>사업장 소재지</Text>
        <InfoRow label="주소" value={storeAddressData.storeAddress} />
        <InfoRow label="상세주소" value={storeAddressData.storeAddressDetail} />

        {business_certificate && (
          <>
            <Text style={styles.sectionTitle}>사업자등록증</Text>
            <View style={styles.imageContainer}>
              <Image
                source={{uri: business_certificate.path}}
                style={styles.certificateImage}
                resizeMode="contain"
              />
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.storeAddTextview}>
        <Pressable style={styles.storeAddButtonsearch} onPress={handleSubmit}>
          <Text style={styles.storeAddText}>제출</Text>
        </Pressable>
      </View>

      <Loading loading={loading} />
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollContainer: {paddingHorizontal: 20, paddingBottom: 30},
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
    marginTop: 24,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#111',
    flex: 1,
    textAlign: 'right',
  },
  imageContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  certificateImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
    backgroundColor: '#3CBBFF',
    borderRadius: 10,
  },
  storeAddText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  headerButton: {
    marginRight: 16,
    fontSize: normalizeFont(18, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },
});

export default StoreAuthConfirm;
