import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import ProgressBar from '../../components/StoreAuthority/ProgressBar';
import StoreInfoCard from '../../components/StoreAuthority/StoreInfoCard';
import ImagePicker from 'react-native-image-crop-picker';

const StoreAuthorityScreen = ({navigation}) => {
  const route = useRoute();
  const {storeData, storeAddressData} = route.params;
  const [userData, setUserData] = useState({
    userName: '',
    userContact: '',
    business_registration_number: '',
  });
  const [
    business_registration_certificate,
    setBusiness_registration_certificate,
  ] = useState(null);

  const handleNext = () => {
    // 다음 단계 로직
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.headerButton}>신청</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar progress={1} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* 진행 바: 100% 진행 */}

        {/* 분리한 매장 정보 카드 컴포넌트 사용 */}
        <StoreInfoCard
          storeData={storeData}
          storeAddressData={storeAddressData}
        />
        <Text>사업자등록증 첨부*</Text>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {},
  headerButton: {
    marginRight: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#16BBFF',
  },
  instructionsContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 18,
  },
  instructions: {
    fontSize: 15,
    color: '#999',
    lineHeight: 24,
  },
});

export default StoreAuthorityScreen;
