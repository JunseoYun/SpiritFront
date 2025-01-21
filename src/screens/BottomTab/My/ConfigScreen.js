import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
  Modal,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Userdataget} from '../../../api/userApi';
import ImagePicker from 'react-native-image-crop-picker';
import {Userimgpost} from '../../../api/userApi';
import {Userimgdelete} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';

import CFImage from '../../../components/ConfigScreen/CFImage';
import CFModal from '../../../components/ConfigScreen/CFModal';
import CFActionbtn from '../../../components/ConfigScreen/CFActionbtn';
import CFUserinfo from '../../../components/ConfigScreen/CFUserinfo';

const ConfigScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);
  const [userimg, setUserimg] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const onPressModalOpen = () => {
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await Userdataget();
        setUserdata(data);
        console.log(data);
      } catch (error) {
        console.error('Error initializing token or fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const UserImagepost = async image => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image.path,
        type: image.mime,
        name: image.filename,
      });

      await Userimgpost(formData); // API 호출
      setUserimg(image); // 이미지 상태 업데이트
      setIsModalVisible(false);
      showAlert({
        title: '프로필 변경 성공',
        message: '프로필이 성공적으로 변경되었습니다!',
        onConfirm: () => {
          navigation.navigate('MainBtmbar', {
            screen: 'MyScreen',
          });
        },
      });
    } catch (error) {
      onPressModalClose();
      handleError(error, navigation, showAlert);
    }
  };

  const UserImagedelete = async () => {
    try {
      await Userimgdelete();
      onPressModalClose();
      showAlert({
        title: '프로필 삭제',
        message: '프로필이 성공적으로 삭제되었습니다!',
        onConfirm: () => {
          navigation.navigate('MainBtmbar', {
            screen: 'MyScreen',
          });
        },
      });
    } catch (error) {
      onPressModalClose();
      handleError(error, navigation, showAlert);
    }
  };

  // 이미지 오류 핸들러
  const handleError = (error, navigation, showAlert) => {
    if (error.response) {
      const statusCode = error.response.status;
      switch (statusCode) {
        case 400:
          showAlert({
            title: '이미지 파일 오류',
            message: '이미지 파일이 없습니다.',
          });
          break;

        case 401:
          showAlert({
            title: '인증 실패',
            message: '다시 로그인 부탁드립니다.',
            onConfirm: () => navigation.navigate('LoginScreen'),
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
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CFImage
        imageUrl={userdata.imgUrl}
        onPress={() => setIsModalVisible(true)}
      />
      <CFUserinfo userdata={userdata} navigation={navigation} />
      <CFActionbtn navigation={navigation} />
      <CFModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onUpdate={UserImagepost}
        onDelete={UserImagedelete}
      />
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
});

export default ConfigScreen;
