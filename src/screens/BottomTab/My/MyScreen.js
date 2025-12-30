import React, {useState, useEffect, useCallback, useLayoutEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Pressable,
  View,
} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import MyPageheader from '../../../components/MyScreen/MyPageheader';
import {Userdataget} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import MyTabs from '../../../components/MyScreen/MyTabs';
import MyReview from '../../../components/MyScreen/MyReview';
import MyManager from '../../../components/MyScreen/MyManager/MyManager';
import Loading from '../../../hooks/Loading';
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
  const [reviewCount, setReviewCount] = useState(0);

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
                backgroundColor: '#3CBBFF',
                zIndex: 20,
              }}
            />
          )}
        </Pressable>
      ),
    });
  }, [unreadNotification, navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainScreen');
        return true;
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
          console.error('알림 조회 실패:', err);
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
          const statusCode = error.response.status;

          switch (statusCode) {
            case 404:
              showAlert({
                title: '유저 정보 없음',
                message: '유저 정보가 없습니다. 다시 로그인해주세요.',
              });
              break;
            default:
              showAlert({
                title: '네트워크 오류',
                message: '다시 시도해주세요.',
              });
              break;
          }
        } else {
          console.error('Unexpected Error:', error);
          showAlert({
            title: '알 수 없는 오류',
            message: '다시 시도해주세요.',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [showAlert]);

  useEffect(() => {
    if (invitationManager) {
      setCurrentPage('MyManager');
      setSelectedTab(userdata?.isManager ? 1 : 0);
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

  const profileHeader = (
    <MyPageheader
      nickname={userdata.nickname}
      postCount={reviewCount}
      imageuri={userdata.imgUrl}
      handleImagePress={handleImagePress}
      onProfilePress={() =>
        navigation.navigate('MyStack', {
          screen: 'ConfigScreen',
        })
      }
    />
  );

  const tabHeader =
    userdata?.isManager === true ? (
      <MyTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        changePage={setCurrentPage}
        isManager={userdata?.isManager}
      />
    ) : null;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      {currentPage === 'MyReview' && (
        <MyReview
          navigation={navigation}
          headerComponent={profileHeader}
          tabComponent={tabHeader}
          onCountChange={setReviewCount}
          userProfile={{
            nickname: userdata.nickname,
            imageuri: userdata.imgUrl,
          }}
        />
      )}
      {currentPage === 'MyManager' && userdata?.isManager === true && (
        <MyManager
          navigation={navigation}
          headerComponent={profileHeader}
          tabComponent={tabHeader}
        />
      )}

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
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 20,
    color: '#333',
  },
});

export default MyScreen;
