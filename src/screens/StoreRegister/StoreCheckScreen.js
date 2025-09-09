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
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreAuthorityData from '../../components/StoreAuthority/StoreAuthorityData';
import ProgressBar from '../../components/StoreAuthority/ProgressBar';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {normalizeFont} from '../../hooks/normalizeFont';

const StoreCheckScreen = ({navigation}) => {
  const route = useRoute();
  const {bottom} = useSafeAndroidInsets();
  const {
    storeId,
    storeName,
    storeLocationDto,
    storeContact,
    storeSuggestionData,
  } = route.params;

  const [storeData, setStoreData] = useState({
    storeId,
    storeName,
    storeNumber: storeContact,
    userContact: '',
  });

  const [errors, setErrors] = useState({});

  const handleNext = () => {
    const newErrors = {};

    if (!storeData.storeName) {
      newErrors.storeName = '매장 이름을 입력해주세요.';
    }
    if (!storeData.storeNumber) {
      newErrors.storeNumber = '매장 연락처를 입력해주세요.';
    }

    if (!storeData.userContact) {
      newErrors.userContact = '신청자 연락처를 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // 🚨 여기서 errors 상태를 업데이트
      return;
    }

    navigation.navigate('StoreAuthorityScreen', {
      storeData,
      storeLocationDto,
      storeSuggestionData,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.nextButton} allowFontScaling={false}>
            다음
          </Text>
        </Pressable>
      ),
    });
  }, [navigation, storeData]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <SafeAreaView style={[styles.storetopview, {paddingBottom: bottom}]}>
        {/* 진행 바: 50% 진행 */}
        <ProgressBar progress={0} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>신청 정보를 확인해주세요.</Text>
          <StoreAuthorityData
            storeData={storeData}
            setStoreData={setStoreData}
            errors={errors}
            setErrors={setErrors}
          />
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
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
  },
  nextButton: {
    marginRight: 18,
    fontSize: normalizeFont(18, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#16BBFF',
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
});

export default StoreCheckScreen;
