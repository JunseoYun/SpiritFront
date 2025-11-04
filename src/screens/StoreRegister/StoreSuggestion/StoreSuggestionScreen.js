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
  Modal,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StoreImage from '../../../components/StoreAddScreen/StoreImage';
import StoreAddname from '../../../components/StoreAddScreen/StoreAddname';
import StoreAddress from '../../../components/StoreAddScreen/StoreAddress';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';
import Loading from '../../../hooks/Loading';
import BottomActionButton from '../../../utils/BottomActionButton';
import ColorUtil from '../../../utils/ColorUtil';

const StoreSuggestionScreen = ({navigation}) => {
  const {bottom} = useSafeAndroidInsets();

  const route = useRoute();
  const {index, location} = route.params;
  const [imageUris, setImageUris] = useState([]);
  const [storename, setStorename] = useState('');
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null); // 스크롤뷰 참조
  const storeInfoRef = useRef(null);
  const storeAddressRef = useRef(null);
  const storeImageRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);

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

  const handleSubmit = () => {
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
    //TODO
    //step 1. 제보 api 통신하기 성공하면 모달 띄우기

    setIsChoiceModalVisible(true);
  };

  const handleModalConfirm = () => {
    setIsChoiceModalVisible(false);
    //TODO
    //navigate 대신에 replace로 화면 아예 대체 해버리기
    navigation.navigate('StoreSuggestionDetailScreen', {
      storename,
      address,
      detailedAddress,
      imageUris,
      index,
      coords,
    });
  };

  const handleModalCancel = () => {
    setIsChoiceModalVisible(false);

    //TODO
    //스택 초기화 후 MainScreen으로 네비게이션 하기
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
        <Pressable disabled={isDisabled} onPress={handleSubmit}>
          <Text
            style={[
              styles.nextButton,
              isDisabled && {color: ColorUtil.mainDisable},
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
              detailedAddress={detailedAddress}
              setDetailedAddress={setDetailedAddress}
              navigation={navigation}
              onAddressSelect={handleAddressSelect} // 콜백 전달
              location={location}
              screen="StoreSuggestionScreen"
              error={error}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActionButton
        label={'제보하기'}
        disabled={isDisabled}
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
