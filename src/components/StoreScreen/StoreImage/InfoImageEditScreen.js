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
  const {storeId, imgList} = route.params;

  const {showAlert, AlertComponent} = useCustomAlert();
  const [localImages, setLocalImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]); // 최초 받아온 서버 이미지 (초기 상태)
  const [loading, setLoading] = useState(false);
  const [loadingimg, setLoadingimg] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const {showToast} = useToast();

  const lastBackPressed = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingimg(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Array.isArray(imgList)) {
      const enriched = imgList.map(img => ({
        ...img,
        localId: img.id || `${Date.now()}-${Math.random()}`, // 구분자
        isNew: false,
      }));
      setLocalImages(enriched);
      setOriginalImages(enriched);
    }
  }, [imgList]);

  const addImages = newImages => {
    const enriched = newImages.map(image => ({
      ...image,
      localId: `${Date.now()}-${Math.random()}`,
      isNew: true,
      boardType: 'MENU',
    }));
    setLocalImages(prev => [...prev, ...enriched]);
  };

  const removeLocalImage = image => {
    setLocalImages(prev => prev.filter(img => img.localId !== image.localId));

    if (!image.isNew) {
      setDeletedImages(prev => [...prev, image]);
    }
  };

  const handleCameraPick = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) return;

    try {
      const image = await ImagePicker.openCamera({
        cropping: true,
        mediaType: 'photo',
        quality: 1,
      });

      const picked = {
        path: image.path,
        mime: image.mime,
        filename: image.filename || image.path.split('/').pop(),
      };
      addImages([picked]);
      showToast('이미지를 추가했습니다');
    } catch (error) {
      console.log(error);
    }
  };

  const handleGalleryPick = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;

    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
        compressImageQuality: 1,
        maxFiles: 20,
      });
      // let mergedImages = [];
      const picked = images.map(image => ({
        path: image.path,
        mime: image.mime,
        filename: image.filename || image.path.split('/').pop(),
      }));
      addImages(picked);
      showToast('이미지를 추가했습니다');
    } catch (er) {}
  };

  const toggleBoardTypeImage = (targetItem, boardType) => {
    const idToFind = targetItem.isNew ? targetItem.localId : targetItem.id;

    setLocalImages(prev =>
      prev.map(item => {
        const currentId = item.isNew ? item.localId : item.id;
        if (currentId === idToFind) {
          return {...item, boardType};
        }
        return item;
      }),
    );
  };

  // stable sort by boardType
  const sortByBoardTypeStable = type => {
    if (!localImages.length) return;
    const indexedList = localImages.map((item, idx) => ({
      ...item,
      originalIndex: idx,
    }));

    const sorted = indexedList.sort((a, b) => {
      const aPriority = a.boardType === type ? 0 : 1;
      const bPriority = b.boardType === type ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.originalIndex - b.originalIndex;
    });

    setLocalImages(sorted);
  };

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

  const isOrderChanged = () => {
    // 기존 이미지 중 isNew false만 대상으로 함
    const localOrder = localImages.filter(img => !img.isNew).map(img => img.id);

    const originalOrder = originalImages.map(img => img.id);

    if (localOrder.length !== originalOrder.length) return true;

    for (let i = 0; i < localOrder.length; i++) {
      if (localOrder[i] !== originalOrder[i]) {
        return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    const newImages = localImages.filter(img => img.isNew);
    const hasNewImages = newImages.length > 0;
    const changedBoardTypes = localImages.filter(img => {
      if (img.isNew) return false;
      const original = originalImages.find(o => o.id === img.id);
      return original && original.boardType !== img.boardType;
    });

    try {
      setLoading(true);

      // 삭제된 이미지 처리
      if (deletedImages.length > 0) {
        await DeleteStoreboardImage(storeId, deletedImages);
      }

      let updatedLocalImages = [...localImages];

      // 새 이미지 업로드
      if (hasNewImages) {
        const groupedByBoardType = newImages.reduce((acc, img) => {
          const {boardType} = img;
          if (!acc[boardType]) acc[boardType] = [];
          acc[boardType].push(img);
          return acc;
        }, {});

        const uploadResponses = await Promise.all(
          Object.entries(groupedByBoardType).map(([boardType, images]) =>
            StoreBoardimage({files: images, boardType}, storeId),
          ),
        );

        const uploadedList = uploadResponses.flat();

        // 서버 응답 기반으로 localImages 업데이트
        updatedLocalImages = localImages.map(localImg => {
          if (!localImg.isNew) return localImg;

          const match = uploadedList.find(uploaded =>
            uploaded.url.includes(localImg.filename),
          );

          return match
            ? {
                ...localImg,
                id: match.id,
                url: match.url,
                isNew: false,
              }
            : localImg;
        });

        // 상태 반영 (시각적 UI용)
        setLocalImages(updatedLocalImages);
      }

      // boardType 변경된 이미지 처리
      if (changedBoardTypes.length > 0) {
        await Promise.all(
          changedBoardTypes.map(img =>
            StoreBoardimageUpdate(img.id, img.boardType),
          ),
        );
      }

      // 순서 변경 처리 (업로드 후 기준 정렬 필요)
      const orderedURLs = updatedLocalImages
        .filter(img => !img.isNew)
        .map(img => img.url);

      if (orderedURLs.length > 0) {
        await StoreBoardImageUpdateSort(storeId, orderedURLs);
      }

      navigation.goBack();
    } catch (error) {
      console.error('handleSave 에러:', error);
    } finally {
      setDeletedImages([]);
      setLoading(false);
    }
  };

  const hasChanges = () => {
    const newImages = localImages.filter(img => img.isNew);
    const changedBoardTypes = localImages.some(img => {
      if (img.isNew) return false;
      const original = originalImages.find(o => o.id === img.id);
      return original && original.boardType !== img.boardType;
    });
    const orderChanged = isOrderChanged();
    const deletedExists = deletedImages.length > 0;

    return (
      newImages.length > 0 || changedBoardTypes || orderChanged || deletedExists
    );
  };

  const handleCancel = () => {
    if (hasChanges()) {
      showAlert({
        title: '작성한 내용이 저장되지 않았습니다',
        message: '메뉴판 편집을 취소하시겠습니까?',
        onConfirm: () => {
          setDeletedImages([]);
          setLocalImages([]);
          navigation.goBack();
        },
        type: 'confirm',
      });
    } else {
      // 변경사항 없으면 바로 뒤로가기
      navigation.goBack();
    }
  };

  const previousOrderRef = useRef([]);

  const onDragEnd = ({data}) => {
    setLocalImages(data);

    const currentOrder = data.map(img => (img.isNew ? img.localId : img.id));
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
  };

  const renderItem = ({item, drag, isActive, index}) => {
    return (
      <DraggableImageItem
        item={item}
        index={index}
        isActive={isActive}
        drag={drag}
        toggleBoardTypeImage={toggleBoardTypeImage}
        // removeServerImage={removeServerImage}
        removeLocalImage={removeLocalImage}
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
          data={localImages}
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
                onPress={() => setBottomSheetVisible(true)}>
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
