import React, {useEffect, useRef, useState} from 'react';
import {Text, StyleSheet, SafeAreaView, View, ScrollView} from 'react-native';
import {Userdataget} from '../../../api/userApi';
import {Userimgpost} from '../../../api/userApi';
import {Userimgdelete} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';

import CFImage from '../../../components/ConfigScreen/CFImage';
import CFModal from '../../../components/ConfigScreen/CFModal';
import CFActionbtn from '../../../components/ConfigScreen/CFActionbtn';
import CFUserinfo from '../../../components/ConfigScreen/CFUserinfo';
import Loading from '../../../hooks/Loading';
import AppInfo from '../../../components/MainScreen/AppInfo';

const ConfigScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const onPressModalOpen = () => {
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const data = await Userdataget();
        setUserdata(data);
      } catch (error) {
        console.error('Error initializing token or fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const UserImagepost = async image => {
    onPressModalClose();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image.path,
        type: image.mime,
        name: image.filename,
      });

      await Userimgpost(formData); // API 호출
      setIsModalVisible(false);
      showAlert({
        title: '프로필 변경 성공',
        message: '프로필이 성공적으로 변경되었습니다!',
        onConfirm: () => {
          navigation.reset({
            index: 0, // 초기 화면 인덱스
            routes: [{name: 'MyScreen'}], // 이동할 화면
          });
        },
      });
    } catch (error) {
      handleError(error, showAlert);
    } finally {
      setLoading(false);
    }
  };

  const UserImagedelete = async () => {
    onPressModalClose();
    setLoading(true);

    try {
      await Userimgdelete();

      showAlert({
        title: '프로필 삭제',
        message: '프로필이 성공적으로 삭제되었습니다!',
        onConfirm: () => {
          navigation.reset({
            index: 0, // 초기 화면 인덱스
            routes: [{name: 'MyScreen'}], // 이동할 화면
          });
        },
      });
    } catch (error) {
      handleError(error, showAlert);
    } finally {
      setLoading(false);
    }
  };

  // 이미지 오류 핸들러
  const handleError = (error, showAlert) => {
    if (error.response) {
      const statusCode = error.response.status;
      switch (statusCode) {
        case 400:
          showAlert({
            title: '이미지 파일 오류',
            message: '이미지 파일이 없습니다.',
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
            message: '다시 시도해주세요.',
          });
          break;
      }
    } else {
      console.error('Unexpected Error:', error);
      showAlert({
        title: '네트워크 오류',
        message: '인터넷 연결을 확인하고 다시 시도해주세요.',
      });
    }
  };

  if (!userdata) {
    return <Loading loading={true} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollRef}>
        <CFImage
          imageUrl={userdata.imgUrl}
          onPress={() => setIsModalVisible(true)}
        />
        <CFUserinfo userdata={userdata} navigation={navigation} />
        <CFActionbtn navigation={navigation} />
        <AppInfo scrollRef={scrollRef} navigation={navigation} />
        <CFModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onUpdate={UserImagepost}
          onDelete={UserImagedelete}
        />
      </ScrollView>

      <Loading loading={loading} />

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default ConfigScreen;
