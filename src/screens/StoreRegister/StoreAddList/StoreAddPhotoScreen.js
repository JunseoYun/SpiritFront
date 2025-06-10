import React, {useState, useLayoutEffect, useEffect, useRef} from 'react';
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
import {useRoute, useFocusEffect} from '@react-navigation/native';
import StoreAddProgressbar from '../../../components/StoreAddScreen/StoreAddProgressbar';
import StoreImage from '../../../components/StoreAddScreen/StoreImage';
import ReceiptImage from '../../../components/StoreAddScreen/ReceiptImage';
import StoreAddname from '../../../components/StoreAddScreen/StoreAddname';
import StoreAddress from '../../../components/StoreAddScreen/StoreAddress';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';

const StoreAddPhotoScreen = ({navigation}) => {
  const {token} = useAuth();
  const {showToast} = useToast();
  useFocusEffect(
    React.useCallback(() => {
      if (!token) {
        showToast('로그인 후 이용해주세요', 'center');
        navigation.goBack();
      }
    }, [token]),
  );

  const route = useRoute();
  const {index, location} = route.params;
  const [phototoggle, setPhototoggle] = useState(false);
  const [imageUris, setImageUris] = useState([]);
  const [receiptimageUris, setReceiptimageUris] = useState([]);
  const [storename, setStorename] = useState('');
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  const scrollViewRef = useRef(null); // 스크롤뷰 참조
  const storeInfoRef = useRef(null);
  const storeAddressRef = useRef(null);
  const storeImageRef = useRef(null);

  // useEffect(() => {
  //   if (index == 0) {
  //     setPhototoggle(false);
  //   } else if (index == 1) {
  //     setPhototoggle(true);
  //   }
  // }, [index]);

  const handleAddressSelect = ({address, coords}) => {
    setAddress(address);
    setCoords(coords);
  };

  const {showAlert, AlertComponent} = useCustomAlert();
  const [error, setError] = useState('');

  const scrollToError = ref => {
    if (ref?.current) {
      ref.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({y: y - 100, animated: true});
        },
        () => console.log('스크롤 이동 실패'),
      );
    }
  };

  const handleNext = () => {
    if (!storename.trim()) {
      setError('storename');
      scrollToError(storeInfoRef);
      return;
    }
    if (!address.trim()) {
      setError('StoreAddress');
      scrollToError(storeAddressRef);
      return;
    }
    if (!imageUris.length) {
      setError('StoreImage');
      scrollToError(storeImageRef);
      return;
    }
    navigation.navigate('StoreAddInfoScreen', {
      storename,
      address,
      detailedAddress,
      imageUris,
      receiptimageUris,
      coords,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            handleNext();
          }}>
          <Text style={styles.nextButton}>다음</Text>
        </Pressable>
      ),
    });
  }, [navigation, storename, address, imageUris]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // iOS의 경우 적절한 offset 설정
    >
      <SafeAreaView style={styles.storetopview}>
        {/* 진행 바: 50% 진행 */}
        <StoreAddProgressbar progress={0} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          ref={scrollViewRef}>
          <Text style={styles.title}>
            {phototoggle
              ? '사진을 등록 해주세요.'
              : '사진 및 매장 내용을 등록 해주세요.'}
          </Text>
          <View ref={storeImageRef}>
            <StoreImage
              imageUris={imageUris}
              setImageUris={setImageUris}
              error={error}
            />
          </View>
          {/* <ReceiptImage
              receiptimageUris={receiptimageUris}
              setReceiptimageUris={setReceiptimageUris}
              error={error}
            /> */}
          <>
            <View ref={storeInfoRef}>
              <StoreAddname
                storename={storename}
                setStorename={setStorename}
                error={error}
              />
            </View>
            <View ref={storeAddressRef}>
              <StoreAddress
                address={address}
                detailedAddress={detailedAddress}
                setDetailedAddress={setDetailedAddress}
                navigation={navigation}
                onAddressSelect={handleAddressSelect} // 콜백 전달
                location={location}
                error={error}
              />
            </View>
          </>
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
