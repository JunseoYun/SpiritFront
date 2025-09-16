import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import {
  StyleSheet,
  Text,
  SafeAreaView,
  BackHandler,
  Pressable,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import MyPageheader from '../../../components/MyScreen/MyPageheader'; // 위에서 만든 컴포넌트
import {Userdataget} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import MyTabs from '../../../components/MyScreen/MyTabs';
import MyReview from '../../../components/MyScreen/MyReview';
import MyLocation from '../../../components/MyScreen/MyLocation';
import MyManager from '../../../components/MyScreen/MyManager/MyManager';
import Loading from '../../../hooks/Loading';
import {useRoute} from '@react-navigation/native';
import {Bell} from 'lucide-react-native';
import {has_unread_notification} from '../../../api/notificationApi';

const MyScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [selectedTab, setSelectedTab] = useState(0);
  const route = useRoute();
  const invitationManager = route.params?.invitationManager;
  const [unreadNotification, setUnreadNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('MyReview');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          hitSlop={15}
          style={{marginRight: 24}}
          onPress={() => navigation.navigate('NotificationScreen')}>
          <Bell size={22} color="#121212" />
          {unreadNotification && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 5,
                height: 5,
                borderRadius: 5,
                backgroundColor: '#45C9FF',
                zIndex: 20,
              }}
            />
          )}
        </Pressable>
      ),
    });
  }, [unreadNotification]);

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
  useFocusEffect(
    useCallback(() => {
      const fetchUnread = async () => {
        try {
          const unread = await has_unread_notification();
          setUnreadNotification(unread.hasUnread);
        } catch (err) {
          console.error('데이터 불러오기 실패', err);
        }
      };

      fetchUnread();
    }, []),
  );

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (invitationManager) {
      setCurrentPage('MyManager');
      setSelectedTab(userdata?.isManager ? 2 : 0); // MyManager가 3번째 탭이므로 index = 2
    }
  }, [invitationManager, userdata?.isManager]);

  if (!userdata) {
    return <Loading loading={true} />;
  }

  const handleImagePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'ImageViewerScreen',
      params: {
        images: userdata.imgUrl,
      },
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <MyPageheader
        nickname={userdata.nickname}
        imageuri={userdata.imgUrl}
        handleImagePress={handleImagePress}
        onProfilePress={() =>
          navigation.navigate('MyStack', {
            screen: 'ConfigScreen',
          })
        }
      />
      <MyTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        changePage={setCurrentPage}
        isManager={userdata?.isManager}
      />
      <>
        {/* Myreview 값 가져오기 */}
        {currentPage === 'MyReview' && <MyReview navigation={navigation} />}
        {currentPage === 'MyLocation' && <MyLocation navigation={navigation} />}
        {currentPage === 'MyManager' && userdata?.isManager === true && (
          <MyManager navigation={navigation} />
        )}
      </>

      <AlertComponent />
      <Loading loading={loading} />
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
