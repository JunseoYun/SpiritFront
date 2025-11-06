import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ToastAndroid,
  Modal,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StoreImage from '../../../components/StoreAddScreen/StoreImage';
import StoreAddname from '../../../components/StoreAddScreen/StoreAddname';
import StoreAddress from '../../../components/StoreAddScreen/StoreAddress';
import StoreMood from '../../../components/StoreAddScreen/StoreMood';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';
import Loading from '../../../hooks/Loading';
import BottomActionButton from '../../../utils/BottomActionButton';
import ColorUtil from '../../../utils/ColorUtil';
import {StoreSuggestion} from '../../../api/storeApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import useDoubleBackExit from '../../../hooks/useDoubleBackExit';
const StoreSuggestionScreen = ({navigation}) => {
  useDoubleBackExit(navigation);

  const {bottom} = useSafeAndroidInsets();

  const {showAlert, AlertComponent} = useCustomAlert();
  const route = useRoute();
  const {index, location} = route.params;
  const [imageUris, setImageUris] = useState([]);
  const [storename, setStorename] = useState('');
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [moodInfo, setMoodInfo] = useState({
    QUIET: false, // 대화하기 좋은
    LIVELY: false, // 활기찬
    SOLO_FRIENDLY: false, // 혼술
    DATE: false, // 데이트
    PARTY_EVENT: false, // 파티·이벤트
    TRADITIONAL: false, // 전통적인
    EXOTIC: false, // 이국적인
    MODERN: false, // 모던·깔끔한
    OLD_SCHOOL: false, // 노포 감성
    VIEW_SPOT: false, // 뷰 맛집
    LOCAL_FAVORITE: false, // 로컬 맛집
    SECOND_ROUND: false, // 2차 맛집
  });

  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null); // 스크롤뷰 참조
  const storeInfoRef = useRef(null);
  const storeAddressRef = useRef(null);
  const storeImageRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);
  const [preStoreId, setPreStoreId] = useState('');
  const handleAddressSelect = ({address, coords}) => {
    setAddress(address);
    setCoords(coords);
  };

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

  const handleSubmit = async () => {
    if (!imageUris.length) {
      setError('StoreImage');
      scrollToError(storeImageRef);
      return;
    }
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
    const data = {
      files: imageUris,
      createStoreDto: {
        locationDto: {
          address,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        name: storename,
        moods: Object.entries(moodInfo)
          .filter(([_, value]) => value)
          .map(([key]) => key),
        facilitiesInfoDto: {
          hasScreen: false,
          hasRoom: false,
          hasOutdoor: false,
          isGroupAvailable: false,
          isParkingAvailable: false,
          isCorkageAvailable: false,
        },
      },
    };

    try {
      setLoading(true);
      const response = await StoreSuggestion(data);
      if (response.status === 200) {
        setPreStoreId(response.data.data.id);
        setIsChoiceModalVisible(true);
      }
    } catch {
      showAlert({
        title: '등록 실패',
        message:
          '잠시 후 다시 시도해 주세요.\n계속 실패할 경우, 메일로 문의해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setIsChoiceModalVisible(false);
    navigation.replace('StoreSuggestionDetailScreen', {
      storename,
      preStoreId,
    });
  };

  const handleModalCancel = () => {
    setIsChoiceModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainBtmbar',
          state: {routes: [{name: 'MainScreen'}]},
        },
      ],
    });
  };

  useEffect(() => {
    if (imageUris.length > 0 && storename.trim() && address.trim()) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [imageUris, storename, address]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable disabled={isDisabled || loading} onPress={handleSubmit}>
          <Text
            style={[
              styles.nextButton,
              (isDisabled || loading) && {
                color: ColorUtil.mainDisable,
              },
            ]}>
            제보
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, storename, address, imageUris, isDisabled]);

  return (
    <SafeAreaView style={[styles.storetopview, {paddingBottom: bottom}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          ref={scrollViewRef}>
          {/* <Pressable onPress={handleModalConfirm}>
            <Text>ㅇㅇㅇ</Text>
          </Pressable> */}

          <View ref={storeImageRef}>
            <StoreImage
              imageUris={imageUris}
              setImageUris={setImageUris}
              error={error}
              setLoading={setLoading}
            />
          </View>
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
              navigation={navigation}
              onAddressSelect={handleAddressSelect} // 콜백 전달
              location={location}
              screen="StoreSuggestionScreen"
              error={error}
            />
          </View>
          <StoreMood moodInfo={moodInfo} setMoodInfo={setMoodInfo} />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActionButton
        label={'제보하기'}
        disabled={isDisabled || loading}
        cancel={true}
        onPress={() => handleSubmit()}
        onCancel={() => navigation.goBack()}
      />
      <Loading loading={loading} />
      <Modal
        transparent
        animationType="fade"
        visible={isChoiceModalVisible}
        onRequestClose={handleModalCancel}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name="checkmark" size={26} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>매장 제보가 완료되었어요 🎉</Text>
            <Text style={styles.modalDescription}>
              제보해주셔서 감사합니다!{'\n'}
              조금만 더 알려주시면 검토가 더 빨라져요.
            </Text>
            <View style={styles.modalButtonGroup}>
              <Pressable
                style={styles.modalPrimaryButton}
                onPress={handleModalConfirm}>
                <Text style={styles.modalPrimaryLabel}>추가 입력하기</Text>
              </Pressable>
              <Pressable
                style={styles.modalSecondaryButton}
                onPress={handleModalCancel}>
                <Text style={styles.modalSecondaryLabel}>나중에</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // 하단 버튼 영역 확보
  },
  nextButton: {
    marginRight: 18,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: ColorUtil.main,
  },

  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' && 10,
    justifyContent: 'space-between',
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorUtil.main,
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storeAddText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%',
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ColorUtil.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#111',
    textAlign: 'center',
  },
  modalDescription: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButtonGroup: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  modalPrimaryButton: {
    backgroundColor: ColorUtil.main,
    borderRadius: 7,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalPrimaryLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  modalSecondaryButton: {
    marginLeft: 12,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalSecondaryLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
});

export default StoreSuggestionScreen;
