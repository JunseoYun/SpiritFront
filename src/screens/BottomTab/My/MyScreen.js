import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, Text, SafeAreaView, BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MyPageheader from '../../../components/MyScreen/MyPageheader'; // 위에서 만든 컴포넌트
import {Userdataget} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import MyTabs from '../../../components/MyScreen/MyTabs';
import MyReview from '../../../components/MyScreen/MyReview';
import MyLocation from '../../../components/MyScreen/MyLocation';
import MyManager from '../../../components/MyScreen/MyManager';
import Loading from '../../../hooks/Loading';

const MyScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);
  const {showAlert, AlertComponent} = useCustomAlert();

  const [currentPage, setCurrentPage] = useState('MyReview');
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainScreen'); // MainScreen 탭으로 전환
        return true; // 기본 뒤로가기 방지
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await Userdataget();
        setUserdata(data);
        console.log(data.isManager);
      } catch (error) {
        if (error.response) {
          const statusCode = error.response.status; // 에러 코드 가져오기

          // 에러 코드별 처리
          switch (statusCode) {
            case 404:
              showAlert({
                title: '유저 정보 오류',
                message: '유저정보를 찾을 수 없습니다. 다시 시도해주세요.',
              });
              break;

            default:
              showAlert({
                title: '에러 발생',
                message: `다시 시도해주세요.`,
              });
              break;
          }
        } else {
          // 네트워크 또는 다른 에러 처리
          console.error('Unexpected Error:', error);
          showAlert({
            title: '네트워크 오류',
            message: '인터넷 연결을 확인하고 다시 시도해주세요.',
          });
        }
      }
    };
    fetchUserData();
  }, []);

  if (!userdata) {
    return <Loading loading={true} />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <MyPageheader
        nickname={userdata.nickname}
        imageuri={userdata.imgUrl}
        onProfilePress={() =>
          navigation.navigate('MyStack', {
            screen: 'ConfigScreen',
          })
        }
      />
      <MyTabs changePage={setCurrentPage} isManager={userdata?.isManager} />
      <>
        {/* Myreview 값 가져오기 */}
        {currentPage === 'MyReview' && <MyReview navigation={navigation} />}
        {currentPage === 'MyLocation' && <MyLocation navigation={navigation} />}
        {currentPage === 'MyManager' && userdata?.isManager === true && (
          <MyManager navigation={navigation} />
        )}
      </>

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  innerviewtext: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationtext: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default MyScreen;
