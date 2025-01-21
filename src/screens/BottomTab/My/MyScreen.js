import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import MyPageheader from '../../../components/MyScreen/MyPageheader'; // 위에서 만든 컴포넌트
import {Userdataget} from '../../../api/userApi';
import Myreview from '../../../components/MyScreen/Myreview';

const MyScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await Userdataget();
        setUserdata(data);
        console.log(data);
      } catch (error) {
        if (error.response) {
          const statusCode = error.response.status; // 에러 코드 가져오기

          // 에러 코드별 처리
          switch (statusCode) {
            case 400:
              showAlert({
                title: '요청 실패',
                message: '이미지를 찾을 없습니다.',
              });
              break;

            case 401:
              showAlert({
                title: '인증 실패',
                message: '다시 로그인 부탁드립니다.',
                onConfirm: () => navigation.navigate('LoginScreen'), // 로그인 화면으로 이동
              });
              break;

            case 404:
              showAlert({
                title: '업로드 실패',
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
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <MyPageheader
        nickname={userdata.nickname}
        imageuri={userdata.imgUrl}
        onProfilePress={() =>
          navigation.navigate('MyStack', {
            screen: 'ConfigScreen',
          })
        }
      />
      <View style={styles.innerviewtext}>
        <Text style={styles.reservationtext}>나의 리뷰</Text>
      </View>
      <View style={styles.line} />
      <ScrollView>
        {/* Myreview 값 가져오기 */}
        <Myreview navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  line: {
    marginTop: 15,
    width: '100%',
    height: 2,
    borderColor: 'lightgray',
    borderWidth: 1,
  },
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
