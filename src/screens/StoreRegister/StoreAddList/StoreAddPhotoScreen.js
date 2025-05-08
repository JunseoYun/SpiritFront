import React, {useState, useLayoutEffect, useEffect} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreAddProgressbar from '../../../components/StoreAddScreen/StoreAddProgressbar';
import StoreImage from '../../../components/StoreAddScreen/StoreImage';
import ReceiptImage from '../../../components/StoreAddScreen/ReceiptImage';
import StoreInfo from '../../../components/StoreAddScreen/StoreInfo';
import StoreAddress from '../../../components/StoreAddScreen/StoreAddress';
import useCustomAlert from '../../../hooks/useCustomAlert';
const StoreAddPhotoScreen = ({navigation}) => {
  const route = useRoute();
  const {index, location} = route.params;
  const [phototoggle, setPhototoggle] = useState(false);
  const [imageUris, setImageUris] = useState([]);
  const [receiptimageUris, setReceiptimageUris] = useState([]);
  const [storeData, setStoreData] = useState('');
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  useEffect(() => {
    if (index == 0) {
      setPhototoggle(false);
    } else if (index == 1) {
      setPhototoggle(true);
    }
  }, [index]);

  const handleAddressSelect = ({address, coords}) => {
    setAddress(address);
    setCoords(coords);
  };

  // const [storeData, setStoreData] = useState({
  //   storeId,
  //   storeName,
  //   storeNumber: storeContact,
  //   userName: '',
  //   userContact: '',
  // });

  const {showAlert, AlertComponent} = useCustomAlert();
  // const [errors, setErrors] = useState({});

  const handleNext = () => {
    navigation.navigate('StoreAddInfoScreen', {
      storeData,
      address,
      detailedAddress,
      imageUris,
      receiptimageUris,
    });
    // 필수 storeData 확인 (예: storeName, storeNumber) 및 주소가 입력되었는지 확인
    // if (
    //   !storeData.storeName ||
    //   !storeData.storeNumber ||
    //   !storeData.userName ||
    //   !storeData.userContact
    // ) {
    //   showAlert({
    //     title: '정보 미입력',
    //     message: '모든 정보를 입력해 주세요.',
    //   });
    //   return;
    // }
    // const newErrors = {};
    // if (!storeData.storeName) {
    //   newErrors.storeName = '매장 이름을 입력해주세요.';
    // }
    // if (!storeData.storeNumber) {
    //   newErrors.storeNumber = '매장 연락처를 입력해주세요.';
    // }
    // if (!storeData.userName) {
    //   newErrors.userName = '신청자 성명을 입력해주세요.';
    // }
    // if (!storeData.userContact) {
    //   newErrors.userContact = '신청자 연락처를 입력해주세요.';
    // }
    // if (Object.keys(newErrors).length > 0) {
    //   setErrors(newErrors); // 🚨 여기서 errors 상태를 업데이트
    //   return;
    // }
    // navigation.navigate('StoreAuthorityScreen', {
    //   storeData,
    //   storeAddress,
    //   storeAddressDetail,
    // });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.nextButton}>다음</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // iOS의 경우 적절한 offset 설정
    >
      <SafeAreaView style={styles.storetopview}>
        {/* 진행 바: 50% 진행 */}
        <StoreAddProgressbar progress={1} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>
            {phototoggle
              ? '사진을 등록 해주세요.'
              : '사진및 매장 내용을 등록 해주세요.'}
          </Text>

          <StoreImage
            imageUris={imageUris}
            setImageUris={setImageUris}
            // error={error}
          />
          {phototoggle && (
            <ReceiptImage
              receiptimageUris={receiptimageUris}
              setReceiptimageUris={setReceiptimageUris}
            />
          )}
          {!phototoggle && (
            <>
              {/* 추후에매장 명만 받게 하기 */}
              <StoreInfo storeData={storeData} setStoreData={setStoreData} />
              <StoreAddress
                address={address}
                detailedAddress={detailedAddress}
                setDetailedAddress={setDetailedAddress}
                navigation={navigation}
                onAddressSelect={handleAddressSelect} // 콜백 전달
                location={location}
              />
            </>
          )}
        </ScrollView>
        <View style={styles.storeAddTextview}>
          <Pressable
            style={styles.storeAddButtonsearch}
            onPress={() => {
              handleNext();
            }}>
            <Text style={styles.storeAddText}>다음</Text>
          </Pressable>
        </View>
        <AlertComponent />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // 하단 버튼 영역 확보
  },

  title: {
    marginTop: 30,
    marginHorizontal: 18,
    color: '#333',
    fontWeight: '600',
    fontSize: 20,
  },
  nextButton: {
    marginRight: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#16BBFF',
  },

  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storeAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StoreAddPhotoScreen;
