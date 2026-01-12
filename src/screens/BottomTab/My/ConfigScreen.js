import React, {useEffect, useRef, useState} from 'react';
import {
  DeviceEventEmitter,
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {Userdataget} from '../../../api/userApi';
import {Userimgpost} from '../../../api/userApi';
import {Userimgdelete} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';

import CFImage from '../../../components/ConfigScreen/CFImage';
import toFileField from '../../../utils/toFileField';
import CFActionbtn from '../../../components/ConfigScreen/CFActionbtn';
import CFUserinfo from '../../../components/ConfigScreen/CFUserinfo';
import Loading from '../../../hooks/Loading';
import AppInfo from '../../../components/ExploreScreen/AppInfo';
import ImagePickermodal from '../../../hooks/ImagePickermodal';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../../constants/imagePickerLabels';
import {
  requestCameraPermission,
  requestPhotoPermission,
} from '../../../hooks/usePhotopermis';

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
      const f = toFileField(image, 'profile');
      if (f) formData.append('file', f);

      await Userimgpost(formData); // API 호출
      try {
        const nextData = await Userdataget();
        const imageUrl =
          nextData?.imgUrl ??
          nextData?.profileImgUrl ??
          nextData?.profileImage ??
          null;
        DeviceEventEmitter.emit('user-profile-image-updated', {
          imageUrl,
          nickname: nextData?.nickname ?? null,
        });
      } catch (error) {}
      setIsModalVisible(false);

      navigation.reset({
        index: 0, // 초기 화면 인덱스
        routes: [{name: 'MyScreen'}], // 이동할 화면
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
      try {
        const nextData = await Userdataget();
        const imageUrl =
          nextData?.imgUrl ??
          nextData?.profileImgUrl ??
          nextData?.profileImage ??
          null;
        DeviceEventEmitter.emit('user-profile-image-updated', {
          imageUrl,
          nickname: nextData?.nickname ?? null,
        });
      } catch (error) {}

      navigation.reset({
        index: 0, // 초기 화면 인덱스
        routes: [{name: 'MyScreen'}], // 이동할 화면
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

  const resolvedProfileImage =
    userdata?.imgUrl ?? userdata?.profileImgUrl ?? userdata?.profileImage;
  const hasProfileImage =
    typeof resolvedProfileImage === 'string' &&
    resolvedProfileImage.trim().length > 0 &&
    !resolvedProfileImage.includes('default_profile');

  const ensurePermission = async type => {
    const hasPermission =
      type === 'camera'
        ? await requestCameraPermission()
        : await requestPhotoPermission();
    if (!hasPermission) {
      onPressModalClose();
    }
    return hasPermission;
  };

  const prepareAndroidStatusBar = () => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false);
    }
  };

  const handleCameraPick = async () => {
    const hasPermission = await ensurePermission('camera');
    if (!hasPermission) return;
    prepareAndroidStatusBar();
    try {
      const image = await ImagePicker.openCamera({
        compressImageQuality: 0.95,
        compressImageMaxWidth: 2160,
        compressImageMaxHeight: 2160,
        cropping: true,
        mediaType: 'photo',
        ...IMAGE_PICKER_TEXTS,
        ...IMAGE_CROPPER_TEXTS,
      });
      UserImagepost(image);
    } catch (error) {
      console.error('Camera picker error:', error);
    }
  };

  const handleGalleryPick = async () => {
    const hasPermission = await ensurePermission('gallery');
    if (!hasPermission) return;
    prepareAndroidStatusBar();
    try {
      const image = await ImagePicker.openPicker({
        compressImageQuality: 0.95,
        compressImageMaxWidth: 2160,
        compressImageMaxHeight: 2160,
        cropping: true,
        mediaType: 'photo',
        ...IMAGE_PICKER_TEXTS,
        ...IMAGE_CROPPER_TEXTS,
      });
      UserImagepost(image);
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView ref={scrollRef}>
        <CFImage
          imageUrl={userdata.imgUrl}
          onPress={() => setIsModalVisible(true)}
        />
        <CFUserinfo userdata={userdata} navigation={navigation} />

        <View style={styles.appInfoView}>
          <AppInfo scrollRef={scrollRef} navigation={navigation} />
        </View>
        <CFActionbtn navigation={navigation} />
        <ImagePickermodal
          isBottomSheetVisible={isModalVisible}
          setBottomSheetVisible={setIsModalVisible}
          handleCameraPick={handleCameraPick}
          handleGalleryPick={handleGalleryPick}
          handleDelete={hasProfileImage ? UserImagedelete : undefined}
        />
      </ScrollView>

      <Loading loading={loading} />

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
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
  appInfoView: {
    borderColor: '#EDEDED',
    borderWidth: 1,
    marginHorizontal: 18,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginTop: 50,
  },
});

export default ConfigScreen;
