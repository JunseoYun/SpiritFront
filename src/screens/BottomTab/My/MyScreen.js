import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import MyPageheader from '../../../components/MyScreen/MyPageheader'; // 위에서 만든 컴포넌트
import {Userdataget} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import MyTabs from '../../../components/MyScreen/MyTabs';
import MyReview from '../../../components/MyScreen/MyReview';
import MyLocation from '../../../components/MyScreen/MyLocation';
import {Reviewget_by_recent} from '../../../api/reviewApi';

const MyScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);
  const {showAlert, AlertComponent} = useCustomAlert();

  const [currentPage, setCurrentPage] = useState('MyReview');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await Userdataget();
        setUserdata(data);
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
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FAFAFA'}}>
      <MyPageheader
        nickname={userdata.nickname}
        imageuri={userdata.imgUrl}
        onProfilePress={() =>
          navigation.navigate('MyStack', {
            screen: 'ConfigScreen',
          })
        }
      />
      <MyTabs changePage={setCurrentPage} />
      <>
        {/* Myreview 값 가져오기 */}
        {currentPage === 'MyReview' && <MyReview navigation={navigation} />}
        {currentPage === 'MyLocation' && <MyLocation navigation={navigation} />}
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
});

export default MyScreen;
