import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreAddProgressbar from '../../../components/StoreAddScreen/StoreAddProgressbar';
import useCustomAlert from '../../../hooks/useCustomAlert';
const StoreAddCheckScreen = ({navigation}) => {
  const route = useRoute();
  const {location} = route.params;

  // const [storeData, setStoreData] = useState({
  //   storeId,
  //   storeName,
  //   storeNumber: storeContact,
  //   userName: '',
  //   userContact: '',
  // });

  const {showAlert, AlertComponent} = useCustomAlert();
  // const [errors, setErrors] = useState({});

  const handleNext = index => {
    navigation.navigate('StoreAddPhotoScreen', {
      index,
      location,
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
        <StoreAddProgressbar progress={0} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>영수증을 가지고 있습니까?</Text>
        </ScrollView>
        <View style={styles.storeAddTextview}>
          <TouchableOpacity
            style={[
              styles.storeAddButtonsearch,
              {
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#45C9FF',
              },
            ]}
            onPress={() => {
              handleNext(0);
            }}>
            <Text
              style={[
                styles.storeAddText,
                {
                  color: '#45C9FF',
                },
              ]}>
              아니요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.storeAddButtonsearch,
              {
                backgroundColor: '#45C9FF',
              },
            ]}
            onPress={() => {
              handleNext(1);
            }}>
            <Text style={styles.storeAddText}>예</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    gap: 10,
  },
  storeAddButtonsearch: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  storeAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StoreAddCheckScreen;
