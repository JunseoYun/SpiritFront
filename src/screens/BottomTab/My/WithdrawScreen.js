import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../../../context/AuthContext';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {user_withdraw} from '../../../api/userApi';
import {removeNotification} from '../../../storage/notificationStorage';
import Loading from '../../../hooks/Loading';
import CustomText from '../../../components/common/CustomText';
const WithdrawScreen = () => {
  const navigation = useNavigation();
  const {logout} = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();

  useEffect(() => {
    // 바텀탭 숨기기
    navigation.getParent()?.setOptions({tabBarStyle: {display: 'none'}});
    return () => {
      navigation.getParent()?.setOptions({tabBarStyle: {display: 'flex'}});
    };
  }, [navigation]);

  // 회원탈퇴 확인 경고창
  const handleWithdraw = () => {
    showAlert({
      title: '회원탈퇴',
      message: '정말로 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      onConfirm: () => withdraw(),
      type: 'withdraw',
    });
  };

  const withdraw = async () => {
    try {
      setLoading(true);
      await user_withdraw();
      navigation.reset({
        index: 0,
        routes: [
          {name: 'OAuthStack', state: {routes: [{name: 'OAuthLoginScreen'}]}},
        ],
      });
      await logout(1); // 로그아웃 완료될 때까지 대기
      await removeNotification();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{paddingBottom: 20}}
        showsVerticalScrollIndicator={false}>
        <CustomText style={styles.title}>회원탈퇴 안내</CustomText>
        <CustomText style={styles.description}>
          • 회원탈퇴 시 작성한 게시물은 한잔할까 서비스에 귀속됩니다. {'\n\n'}•
          회원정보는 탈퇴 즉시 파기되며, 부정 이용 방지를 위해 회원 식별 정보는
          탈퇴 후 일정기간 보관됩니다. {'\n\n'}• 자세한 내용은 한잔할까
          이용약관과 개인정보 처리방침 약관을 확인해주세요.
        </CustomText>

        <View style={styles.line} />
        <TouchableOpacity
          onPress={() => setIsChecked(!isChecked)}
          style={styles.checkboxContainer}>
          <Ionicons
            name={isChecked ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={isChecked ? '#3CBBFF' : '#888'}
          />

          <CustomText style={styles.checkboxText}>
            회원탈퇴 안내를 모두 확인하였습니다.
          </CustomText>
        </TouchableOpacity>
        {/* 회원탈퇴 버튼 */}
        <TouchableOpacity
          style={[styles.withdrawButton, !isChecked && styles.disabledButton]}
          onPress={handleWithdraw}
          disabled={!isChecked}>
          <CustomText
            style={[styles.withdrawText, !isChecked && styles.disabledText]}>
            회원탈퇴
          </CustomText>
        </TouchableOpacity>
      </ScrollView>
      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

export default WithdrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
    marginHorizontal: 18,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 18,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  line: {
    height: 10,
    backgroundColor: '#F5F5F5', // 완전 연한 회색
    width: '100%', // 좌우 꽉 차게 설정
    marginVertical: 10,
    alignSelf: 'center', // 중앙 정렬
  },

  withdrawButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 7,
    marginTop: 20,
    marginHorizontal: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3CBBFF',
  },
  withdrawText: {
    fontSize: 18,
    color: '#3CBBFF',
    fontWeight: '6',
  },
  disabledButton: {
    borderColor: '#DDD',
  },
  disabledText: {
    color: '#DDD',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignSelf: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#888',
  },
});
