import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  BackHandler,
  ToastAndroid,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {useToast} from '../../../context/ToastContext';
import {
  requestPhotoPermission,
  requestCameraPermission,
} from '../../../hooks/usePhotopermis';
import ImagePickermodal from '../../../hooks/ImagePickermodal';
import Loading from '../../../hooks/Loading';
import ActionButtons from '../../UpdateBottomSheet/ActionButtons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  StoreBoardimage,
  DeleteStoreboardImage,
  StoreBoardimageUpdate,
  StoreBoardImageUpdateSort,
} from '../../../api/storeApi';
import DraggableImageItem from './DraggableImageItem';

const {width} = Dimensions.get('window');
const IMAGE_WIDTH = width - 120;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 3) / 4;

const InfoImageEditScreen = ({navigation, route}) => {
  const {storeId, Source, imgList} = route.params;
  const {showAlert, AlertComponent} = useCustomAlert();
  const [serverImages, setServerImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingimg, setLoadingimg] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const {showToast} = useToast();
  const [isOrderChanged, setIsOrderChanged] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingimg(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Array.isArray(imgList)) {
      setServerImages(
        imgList.map(img => ({
          ...img,
          initialBoardType: img.boardType, // 초기 상태 저장
        })),
      );
    } else {
      setServerImages([]);
    }
  }, [imgList]);

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;

    setLoading(true);
    try {
      const image = await ImagePicker.openCamera({
        width: 1024,
        height: 768,
        cropping: true,
        mediaType: 'photo',
        quality: 1,
      });

      const data = {
        file: {
          path: image.path,
          mime: image.mime,
          filename: image.filename || image.path.split('/').pop(),
        },
        boardType: 'MENU',
      };

      console.log(data);

      const response = await StoreBoardimage(data, storeId);

      console.log(response);

      const enriched = response.map(img => ({
        ...img,
        initialBoardType: img.boardType,
      }));

      setServerImages(enriched);

      showToast('이미지 추가 완료');
    } catch (er) {
      showToast('추가 실패 다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryPick = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        compressImageQuality: 1,
        maxFiles: 20,
      });
      let mergedImages = [];

      for (const image of images) {
        const data = {
          file: {
            path: image.path,
            mime: image.mime,
            filename: image.filename || image.path.split('/').pop(),
          },
          boardType: 'MENU',
        };

        const response = await StoreBoardimage(data, storeId);
        mergedImages = response; // 서버에서 항상 전체 이미지 배열을 줌 (최신 상태)
      }

      const enriched = mergedImages.map(img => ({
        ...img,
        initialBoardType: img.boardType,
      }));

      setServerImages(enriched);
      showToast('모든 이미지 추가 및 업로드 완료');
    } catch (er) {
      showToast('추가 실패 다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  };

  const toggleBoardTypeServerImage = index => {
    setServerImages(prev =>
      prev.map((item, idx) =>
        idx === index
          ? {...item, boardType: item.boardType === 'MENU' ? 'DRINK' : 'MENU'}
          : item,
      ),
    );
  };

  // stable sort by boardType
  const sortByBoardTypeStable = type => {
    if (!serverImages.length) return;
    const indexedList = serverImages.map((item, idx) => ({
      ...item,
      originalIndex: idx,
    }));

    const sorted = indexedList.sort((a, b) => {
      const aPriority = a.boardType === type ? 0 : 1;
      const bPriority = b.boardType === type ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.originalIndex - b.originalIndex;
    });

    setServerImages(sorted);
    setIsOrderChanged(true);
  };

  // boardType 변경 여부 확인
  const isBoardTypeChanged = () =>
    serverImages.some(img => img.boardType !== img.initialBoardType);

  const saveChanges = async () => {
    setLoading(true);
    try {
      // boardType 변경된 항목만 골라서 업데이트
      const changedBoardTypes = serverImages.filter(
        img => img.boardType !== img.initialBoardType,
      );
      if (changedBoardTypes.length) {
        await Promise.all(
          changedBoardTypes.map(img =>
            StoreBoardimageUpdate(img.id, img.boardType),
          ),
        );
      }

      // 순서 변경 저장
      if (isOrderChanged) {
        await StoreBoardImageUpdateSort(
          storeId,
          serverImages.map(img => img.url),
        );
      }

      showToast('저장 완료');
      setIsOrderChanged(false);

      // 저장 완료 후 기준값 갱신
      setServerImages(prev =>
        prev.map(img => ({
          ...img,
          initialBoardType: img.boardType,
        })),
      );
    } catch (e) {
      showToast('저장 실패 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 이미지 추가 전 저장 확인
  const selectImage = () => {
    if (isOrderChanged || isBoardTypeChanged()) {
      showAlert({
        title: '변경사항이 저장되지 않았습니다',
        message: '저장 후 이미지를 추가하시겠습니까?',
        type: 'confirm',
        onConfirm: saveChanges,
      });
    } else {
      setBottomSheetVisible(true);
    }
  };

  const removeServerImage = index => {
    if (isOrderChanged || isBoardTypeChanged()) {
      showAlert({
        title: '변경사항이 저장되지 않았습니다',
        message: '저장 후 이미지를 삭제하시겠습니까?',
        type: 'confirm',
        onConfirm: saveChanges,
      });
    } else {
      showAlert({
        title: '이미지를 삭제하시겠습니까?',
        type: 'confirm',
        onConfirm: () => deleteimg(index),
      });
    }
  };

  // 이미지 삭제 처리
  const deleteimg = async index => {
    setLoading(true);
    try {
      const imageToRemove = serverImages[index];
      const response = await DeleteStoreboardImage(storeId, [imageToRemove]);
      const enriched = response.map(img => ({
        ...img,
        initialBoardType: img.boardType,
      }));

      setServerImages(enriched);
      showToast('이미지가 삭제 되었습니다.');
    } catch (error) {
      showToast('삭제 실패 다시 시도해주세요');
    } finally {
      setLoading(false);
    }
  };

  const lastBackPressed = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const handleSave = async () => {
    try {
      setLoading(true);
      if (isOrderChanged || isBoardTypeChanged()) {
        await saveChanges();
      }
      showToast('이미지 저장이 완료되었습니다.');
      navigation.goBack();
    } catch (error) {
      showToast('저장 실패 다시 시도해주세요');
    } finally {
      setDeletedImages([]);
      setServerImages([]);
      setLoading(false);
      setIsOrderChanged(false);
    }
  };
  const handleCancel = () => {
    showAlert({
      title: '작성한 내용이 저장되지 않았습니다',
      message: '메뉴판 편집을 취소하시겠습니까?',
      onConfirm: () => {
        setDeletedImages([]);
        setServerImages([]);
        navigation.goBack();
      },
      type: 'confirm',
    });
  };

  const previousOrderRef = useRef([]);

  useEffect(() => {
    if (serverImages.length) {
      previousOrderRef.current = serverImages.map(img => img.id);
    }
  }, [serverImages]);

  const onDragEnd = ({data}) => {
    setServerImages(data);

    const currentOrder = data.map(img => img.id);
    const prevOrder = previousOrderRef.current;

    if (currentOrder.length !== prevOrder.length) {
      return;
    }

    let isChanged = false;
    for (let i = 0; i < currentOrder.length; i++) {
      if (currentOrder[i] !== prevOrder[i]) {
        isChanged = true;
        break;
      }
    }

    setIsOrderChanged(isChanged);
  };

  const renderItem = ({item, drag, isActive}) => {
    const index = serverImages.findIndex(i => i.url === item.url);
    return (
      <DraggableImageItem
        item={item}
        index={index}
        isActive={isActive}
        drag={drag}
        toggleBoardTypeServerImage={toggleBoardTypeServerImage}
        removeServerImage={removeServerImage}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="reorder-three-outline" size={24} color="#999" />
        <Text style={styles.headerText}>
          아이콘을 꾹 눌러 원하는 순서로 바꿔보세요
        </Text>
      </View>

      <View style={styles.listWrapper}>
        <DraggableFlatList
          data={serverImages}
          onDragEnd={({data}) => onDragEnd({data})}
          keyExtractor={(item, index) =>
            item.id ? `${item.id}` : `${item.url}-${index}`
          }
          renderItem={renderItem}
          activationDistance={Platform.OS === 'ios' ? 10 : 20}
          scrollPercent={5}
          contentContainerStyle={{paddingBottom: 100}}
          ListHeaderComponent={
            <View style={styles.btnheader}>
              <TouchableOpacity
                style={styles.btnview}
                onPress={() => sortByBoardTypeStable('MENU')}>
                <Text style={styles.btnheaderText}>메뉴 우선 정렬</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnview}
                onPress={() => sortByBoardTypeStable('DRINK')}>
                <Text style={styles.btnheaderText}>주류 우선 정렬</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <>
              <TouchableOpacity
                style={styles.addImageBox}
                onPress={selectImage}>
                <MaterialCommunityIcons name="plus" size={30} color="#999" />
              </TouchableOpacity>
              <ImagePickermodal
                isBottomSheetVisible={isBottomSheetVisible}
                setBottomSheetVisible={setBottomSheetVisible}
                handleCameraPick={handleCameraPick}
                handleGalleryPick={handleGalleryPick}
              />
            </>
          }
        />
      </View>

      <View
        style={{
          paddingHorizontal: 18,
          paddingBottom: 18,
          backgroundColor: '#fff',
        }}>
        <ActionButtons onCancel={handleCancel} onSave={handleSave} />
      </View>

      <AlertComponent />
      {(loading || !loadingimg) && <Loading loading={true} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  headerText: {
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    fontSize: 15,
    marginLeft: 3,
  },
  btnheader: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 20,
  },
  btnview: {
    borderWidth: 1,
    borderColor: '#45C9FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 7,
    marginBottom: 5,
  },
  btnheaderText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
  },
  listWrapper: {
    flex: 1,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 10,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: IMAGE_WIDTH + 20,
    height: IMAGE_HEIGHT - 20,
    borderRadius: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 8, // RN 0.71 이상만 동
  },

  menuTypeButton: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  menuTypeText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: 'black',
  },

  selectedButton: {
    backgroundColor: '#45C9FF',
  },

  selectedText: {
    color: '#fff',
  },

  shadowEffect: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  addImageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#ededed',
    justifyContent: 'center',
    borderRadius: 10,
    height: IMAGE_HEIGHT,
    marginBottom: Platform.OS === 'ios' ? 70 : 40,
  },
  dragIcon: {},
  removeButton: {
    position: 'absolute',
    top: 7,
  },
});

export default InfoImageEditScreen;
