import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react';

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
  Animated,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
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
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../../constants/imagePickerLabels';

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
  const [checkDelete, setCheckDelete] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState([]);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Numeric reorder inline mode
  const [inlineOrderMode, setInlineOrderMode] = useState(false);
  const [rankInputs, setRankInputs] = useState({}); // { uid: number }
  const [previewOrder, setPreviewOrder] = useState([]); // preview list inside inline mode
  const orderListRef = useRef(null);
  const lastFocusedUidRef = useRef(null);
  const baseRanksRef = useRef({}); // initial 1-based ranks at mode entry
  const editedSetRef = useRef(new Set()); // uids whose rank is changed from base
  const editSeqRef = useRef(0); // incremental sequence for edits
  const editedAtRef = useRef({}); // { uid: seq } last edit order
  const insets = useSafeAreaInsets();
  const {bottom} = useSafeAndroidInsets();
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
      setOriginalImages(JSON.parse(JSON.stringify(enriched)));
    }
  }, [imgList]);

  // Initialize or clear preview order when entering/leaving inline order mode
  useEffect(() => {
    if (inlineOrderMode) {
      // Preview shows current list
      setPreviewOrder(localImages);
      // Prefill rank inputs with current 1-based order
      const initialRanks = {};
      localImages.forEach((img, idx) => {
        const uid = String(img.isNew ? img.localId : img.id);
        initialRanks[uid] = idx + 1;
      });
      setRankInputs(initialRanks);
      baseRanksRef.current = initialRanks;
      editedSetRef.current = new Set();
      editSeqRef.current = 0;
      editedAtRef.current = {};
    } else {
      setPreviewOrder([]);
      // Clear rank inputs when leaving inline mode
      setRankInputs({});
      editedSetRef.current = new Set();
      editSeqRef.current = 0;
      editedAtRef.current = {};
    }
  }, [inlineOrderMode, localImages]);

  // Update preview (not apply) when the keyboard hides, then scroll to the item's new spot
  useEffect(() => {
    const eventName =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const sub = Keyboard.addListener(eventName, () => {
      if (!inlineOrderMode) return;
      const {order, resolvedRanks} = resolveNumericOrder(
        localImages,
        rankInputs,
        editedSetRef.current,
        editedAtRef.current,
      );
      setPreviewOrder(order);
      setRankInputs(resolvedRanks);
      const uid = lastFocusedUidRef.current;
      if (uid) {
        const idx = order.findIndex(it => String(getUid(it)) === String(uid));
        if (idx >= 0) {
          setTimeout(() => {
            try {
              orderListRef.current?.scrollToIndex({
                index: idx,
                animated: true,
                viewPosition: 0.3,
              });
            } catch (e) {}
          }, 0);
        }
      }
    });
    return () => sub.remove();
  }, [inlineOrderMode, localImages, rankInputs]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (inlineOrderMode) {
              Keyboard.dismiss();
              applyNumericOrder();
              setInlineOrderMode(false);
            } else {
              toggleDropdown();
            }
          }}
          hitSlop={10}
          style={{paddingHorizontal: 16, justifyContent: 'center'}}>
          <Text
            style={{
              color: '#121212',
              fontFamily: 'Pretendard-Medium',
              fontSize: 17,
            }}>
            {inlineOrderMode ? '적용' : '도구'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [
    navigation,
    toggleDropdown,
    dropdownVisible,
    inlineOrderMode,
    rankInputs,
  ]);

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
        // 자유 크롭: width/height 미지정
        freeStyleCropEnabled: true,
        avoidEmptySpaceAroundImage: true,
        compressImageQuality: 0.95,
        // 해상도 상한(필요 시 조정)
        compressImageMaxWidth: 2160,
        compressImageMaxHeight: 2160,
        includeExif: false,
        ...IMAGE_PICKER_TEXTS,
        ...IMAGE_CROPPER_TEXTS,
        ...(Platform.OS === 'ios' && {
          width: 1600, // 원하는 와이드 사이즈
          height: 1600, // 원하는 와이드 사이즈
        }),
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
      const pickedImages = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: true, // 2개 이상일 때만 multiple
        maxFiles: 10,
        cropping: false, // 우선 crop 안함
        includeExif: false,
        ...IMAGE_PICKER_TEXTS,
      });

      const selectedImages = Array.isArray(pickedImages)
        ? pickedImages
        : [pickedImages];

      const croppedImages = [];

      // 각 이미지 자유 비율 크롭
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const cropped = await ImagePicker.openCropper({
          path: image.path,
          cropping: true,
          freeStyleCropEnabled: true,
          avoidEmptySpaceAroundImage: true,
          compressImageQuality: 0.95,
          compressImageMaxWidth: 2160,
          compressImageMaxHeight: 2160,
          ...IMAGE_CROPPER_TEXTS,
          cropperActiveWidgetColor: '#3CBBFF',
          cropperStatusBarLight: true,
          cropperToolbarColor: '#ffffff',
          cropperToolbarWidgetColor: '#333333',
          includeExif: false,
          ...(Platform.OS === 'ios' && {
            width: 1600, // 원하는 와이드 사이즈
            height: 1600, // 원하는 와이드 사이즈
          }),
          // forceJpg: true, // 필요 시만 활성화
        });
        croppedImages.push(cropped);
      }

      const picked = croppedImages.map(image => ({
        path: image.path,
        mime: image.mime,
        filename: image.filename || image.path.split('/').pop(),
      }));

      const existingUrls = localImages
        .filter(img => img.url)
        .map(img => img.url.toLowerCase());

      const existingFilenames = localImages
        .map(img => img.filename?.toLowerCase?.())
        .filter(Boolean);

      const {unique, duplicated} = picked.reduce(
        (acc, pick) => {
          const filename = pick.filename?.toLowerCase();
          if (!filename) {
            acc.unique.push(pick);
            return acc;
          }

          const isDuplicated =
            existingUrls.some(url => url.includes(filename)) ||
            existingFilenames.includes(filename);

          if (isDuplicated) {
            acc.duplicated.push(pick);
          } else {
            acc.unique.push(pick);
          }

          return acc;
        },
        {unique: [], duplicated: []},
      );

      if (unique.length > 0) {
        addImages(unique);
        showToast(`${unique.length}개의 이미지가 추가되었습니다`);
      }

      if (duplicated.length > 0) {
        showToast(`${duplicated.length}개의 이미지는 이미 추가된 상태입니다`);
      }
    } catch (er) {
      console.warn(er);
    }
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

        // boardType별 업로드 응답을 순서대로 저장하여 1:1 매핑
        const responsesByType = {};

        for (const [boardType, images] of Object.entries(groupedByBoardType)) {
          try {
            // 같은 boardType 이미지들은 한 번에 업로드
            const response = await StoreBoardimage(
              {files: images, boardType},
              storeId,
            );
            // uploadResponses.push(...response);
            const list = Array.isArray(response) ? response : [response];
            responsesByType[boardType] = list.slice(); // copy
          } catch (error) {
            console.error(
              `Error uploading images for boardType ${boardType}:`,
              error,
            );
            responsesByType[boardType] = [];
          }
        }

        // const uploadedList = uploadResponses.flat();

        // 서버 응답 기반으로 localImages 업데이트
        updatedLocalImages = localImages.map(localImg => {
          if (!localImg.isNew) return localImg;
          const queue = responsesByType[localImg.boardType] || [];
          const assigned = queue.shift();
          // 큐 소진 결과를 반영
          responsesByType[localImg.boardType] = queue;
          return assigned
            ? {
                ...localImg,
                id: assigned.id,
                url: assigned.url,
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

    for (let i = 0; i < currentOrder.length; i++) {
      if (currentOrder[i] !== prevOrder[i]) {
        isChanged = true;
        break;
      }
    }
  };

  const reset = () => {
    showAlert({
      title: '변경 전 초기화',
      message: '변경 전으로 초기화 하시겠습니까?',
      onConfirm: () => {
        setLocalImages(JSON.parse(JSON.stringify(originalImages)));
        setDeletedImages([]);
        toggleDropdown();
      },
      type: 'confirm',
    });
  };

  const handleDeleteSelected = () => {
    if (selectedForDelete.length === 0) {
      showToast('삭제할 이미지를 선택해주세요.');
      return;
    }

    showAlert({
      title: '선택한 이미지를 삭제할까요?',
      message: `${selectedForDelete.length}개의 이미지가 삭제됩니다.`,
      type: 'delete',
      onConfirm: () => {
        setLocalImages(prev =>
          prev.filter(img => {
            const id = img.isNew ? img.localId : img.id;
            const shouldDelete = selectedForDelete.includes(id);
            if (!img.isNew && shouldDelete) {
              setDeletedImages(deleted => [...deleted, img]);
            }
            return !shouldDelete;
          }),
        );

        // 초기화
        setSelectedForDelete([]);
        setCheckDelete(false);
        if (dropdownVisible) {
          toggleDropdown();
        }
        showToast('선택한 이미지가 삭제되었습니다.');
      },
    });
  };

  const cancelSelectDelete = () => {
    setSelectedForDelete([]);
    setCheckDelete(false);
    if (dropdownVisible) {
      toggleDropdown();
    }
  };

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 0],
  });

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
        checkDelete={checkDelete}
        selectedForDelete={selectedForDelete}
        setSelectedForDelete={setSelectedForDelete}
      />
    );
  };

  const getUid = img => (img.isNew ? img.localId : img.id);

  // Resolve duplicate numeric ranks by bumping later conflicts forward
  // Returns both final order and resolved rank mapping
  const resolveNumericOrder = (images, ranks, editedSet, editedAtMap) => {
    const withIndex = images.map((img, idx) => ({img, idx}));
    const assigned = [];
    const unassigned = [];
    for (const it of withIndex) {
      const uid = String(getUid(it.img));
      const val = ranks[uid];
      if (Number.isInteger(val) && val > 0)
        assigned.push({
          ...it,
          desired: val,
          edited: !!editedSet?.has(uid),
          editedAt: editedAtMap?.[uid] || 0,
        });
      else unassigned.push(it);
    }

    // Sort by desired asc, edited first (so changed ranks win),
    // then among edited, most recently edited first, else original index
    assigned.sort((a, b) => {
      if (a.desired !== b.desired) return a.desired - b.desired;
      if (a.edited !== b.edited) return a.edited ? -1 : 1; // edited wins
      if (a.edited && b.edited) return b.editedAt - a.editedAt; // latest first
      return a.idx - b.idx;
    });

    const used = new Set();
    const assignedWithFinal = [];
    const resolvedRanks = {};

    for (const it of assigned) {
      let target = it.desired;
      while (used.has(target)) target += 1;
      used.add(target);
      assignedWithFinal.push({...it, final: target});
      const uid = String(getUid(it.img));
      resolvedRanks[uid] = target;
    }

    // Build final order: assigned by final rank, then unassigned by original order
    assignedWithFinal.sort((a, b) => a.final - b.final);
    const order = assignedWithFinal.map(it => it.img);
    unassigned.sort((a, b) => a.idx - b.idx);
    for (const it of unassigned) order.push(it.img);

    return {order, resolvedRanks};
  };

  const applyNumericOrder = () => {
    const {order} = resolveNumericOrder(
      localImages,
      rankInputs,
      editedSetRef.current,
      editedAtRef.current,
    );
    setLocalImages(order);
    setInlineOrderMode(false);
    setRankInputs({});
    editedSetRef.current = new Set();
    editSeqRef.current = 0;
    editedAtRef.current = {};
    showToast('숫자 입력 순서를 적용했어요');
  };

  return (
    <SafeAreaView style={styles.container}>
      {dropdownVisible && (
        <Animated.View
          style={[
            styles.dropdown,
            {transform: [{translateY: dropdownTranslateY}]},
          ]}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              sortByBoardTypeStable('MENU');
            }}>
            <Text style={styles.dropdownText}>메뉴 우선 정렬</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              sortByBoardTypeStable('DRINK');
            }}>
            <Text style={styles.dropdownText}>주류 우선 정렬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              toggleDropdown();
              setInlineOrderMode(true);
            }}>
            <Text style={styles.dropdownText}>메뉴판 순서 설정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              if (!checkDelete) {
                setCheckDelete(true);
                toggleDropdown();
              } else {
                cancelSelectDelete(); // 이미 checkDelete 상태일 경우 삭제 시도
              }
            }}>
            <Text style={styles.dropdownText}>
              {checkDelete ? '선택 삭제 취소' : '선택 삭제'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdownItem} onPress={reset}>
            <Text style={styles.dropdownText}>초기화</Text>
          </TouchableOpacity>
          {/* 필요한 기능 더 추가 가능 */}
        </Animated.View>
      )}
      {checkDelete ? (
        <View style={[styles.header]}>
          <Text
            style={[
              styles.headerText,
              {
                color: selectedForDelete.length === 0 ? '#999' : '#333',
              },
            ]}>
            {selectedForDelete.length === 0
              ? '삭제할 사진을 선택해주세요'
              : `${selectedForDelete.length}장의 사진이 선택되었어요`}
          </Text>
        </View>
      ) : (
        !inlineOrderMode && (
          <View style={styles.header}>
            <Ionicons name="reorder-three-outline" size={24} color="#999" />

            <Text style={styles.headerText}>
              사진을 꾹 눌러 원하는 순서로 바꿔보세요
            </Text>
          </View>
        )
      )}
      <View style={styles.btnheader}></View>
      <View style={styles.listWrapper}>
        {inlineOrderMode ? (
          <KeyboardAvoidingView
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 90}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}>
            <View style={styles.madalTitleView}>
              <Text style={styles.modalTitle}>메뉴판 순서 설정</Text>
              <Pressable
                onPress={() => (setRankInputs({}), setInlineOrderMode(false))}>
                <Ionicons name="close" size={23} color="#121212" />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              순서를 변경할 사진에 번호를 입력하세요.{`\n`}입력하지 않으면
              뒤쪽으로 자동 정렬됩니다.
            </Text>
            <FlatList
              ref={orderListRef}
              keyboardShouldPersistTaps="never"
              keyboardDismissMode="none"
              emoveClippedSubviews={Platform.OS === 'android'}
              data={previewOrder}
              keyExtractor={item => String(getUid(item))}
              numColumns={3}
              contentContainerStyle={{
                gap: 10,
                marginHorizontal: 18,
                paddingVertical: 10,
              }}
              columnWrapperStyle={{gap: 10}}
              renderItem={({item, index}) => {
                const uid = String(getUid(item));
                const uri = item.url || item.path;
                const value = rankInputs[uid] ?? '';
                return (
                  <View style={styles.orderCell}>
                    <FastImage source={{uri}} style={styles.orderThumb} />
                    <TextInput
                      keyboardType="number-pad"
                      placeholder="순서"
                      placeholderTextColor="#aaa"
                      value={String(value)}
                      onFocus={() => {
                        lastFocusedUidRef.current = uid;
                        if (Platform.OS === 'ios') {
                          try {
                            orderListRef.current?.scrollToIndex({
                              index,
                              animated: true,
                              viewPosition: 0.25,
                            });
                          } catch (e) {}
                        }
                      }}
                      onChangeText={txt => {
                        const onlyNum = txt.replace(/[^0-9]/g, '');
                        const parsed = onlyNum
                          ? parseInt(onlyNum, 10)
                          : undefined;
                        setRankInputs(prev => ({
                          ...prev,
                          [uid]: parsed && parsed > 0 ? parsed : undefined,
                        }));
                        // Consider any valid input as 'edited' (explicit intent)
                        const isEdited = Number.isInteger(parsed) && parsed > 0;
                        if (isEdited) editedSetRef.current.add(uid);
                        else editedSetRef.current.delete(uid);
                        // Track last edit order for tie-breaking among edited items
                        if (Number.isInteger(parsed) && parsed > 0) {
                          editSeqRef.current += 1;
                          editedAtRef.current = {
                            ...editedAtRef.current,
                            [uid]: editSeqRef.current,
                          };
                        } else {
                          // If cleared/invalid, remove timestamp to avoid unintended priority
                          const map = {...editedAtRef.current};
                          delete map[uid];
                          editedAtRef.current = map;
                        }
                        if (onlyNum === '0') {
                          showToast('0은 사용할 수 없어요');
                        }
                      }}
                      style={styles.orderInput}
                      maxLength={3}
                    />
                  </View>
                );
              }}
            />
          </KeyboardAvoidingView>
        ) : (
          <DraggableFlatList
            data={localImages}
            onDragEnd={({data}) => onDragEnd({data})}
            keyExtractor={item => String(item.localId)}
            autoscrollThreshold={60}
            autoscrollSpeed={60}
            onScrollBeginDrag={() => {
              if (dropdownVisible) {
                toggleDropdown();
              }
            }}
            renderItem={renderItem}
            activationDistance={Platform.OS === 'ios' ? 12 : 28}
            scrollPercent={5}
            contentContainerStyle={{paddingBottom: 0}}
            ListFooterComponent={
              <>
                {!checkDelete && (
                  <TouchableOpacity
                    style={styles.addImageBox}
                    onPress={() => {
                      setBottomSheetVisible(true);
                      if (dropdownVisible) {
                        toggleDropdown();
                      }
                    }}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={30}
                      color="#999"
                    />
                  </TouchableOpacity>
                )}

                <ImagePickermodal
                  isBottomSheetVisible={isBottomSheetVisible}
                  setBottomSheetVisible={setBottomSheetVisible}
                  handleCameraPick={handleCameraPick}
                  handleGalleryPick={handleGalleryPick}
                />
              </>
            }
          />
        )}
      </View>

      <View
        style={{
          paddingHorizontal: 18,
          paddingBottom: Platform.OS === 'ios' ? 7 : 18,
          backgroundColor: '#fff',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {width: 0, height: -8}, // 위쪽 그림자
              shadowOpacity: 0.03,
              shadowRadius: 4,
            },
            android: {
              elevation: 8, // 안드로이드는 이거 하나면 됨
            },
          }),
        }}>
        {inlineOrderMode ? (
          <View style={[styles.footer, {paddingBottom: bottom}]}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                // Restore ranks to the values at mode entry
                const baseRanks = baseRanksRef.current || {};
                setRankInputs(baseRanks);
                // Restore preview to the list as it was when mode opened
                setPreviewOrder(localImages);
                // Clear edit tracking
                editedSetRef.current = new Set();
                editedAtRef.current = {};
                editSeqRef.current = 0;
              }}>
              <Text style={styles.resetText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                applyNumericOrder();
                setInlineOrderMode(false);
              }}>
              <Text style={styles.applyText}>적용</Text>
            </TouchableOpacity>
          </View>
        ) : checkDelete ? (
          <ActionButtons
            onCancel={cancelSelectDelete}
            onSave={handleDeleteSelected}
            option="delete"
          />
        ) : (
          <ActionButtons onCancel={handleCancel} onSave={handleSave} />
        )}
      </View>

      <AlertComponent />
      {(loading || !loadingimg) && <Loading loading={true} />}

      {/* Inline numeric order mode replaces modal */}
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
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    fontSize: 15,
    marginLeft: 3,
  },
  btnheader: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    backgroundColor: '#3CBBFF',
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
  removeButton: {
    position: 'absolute',
    top: 7,
  },
  dropdown: {
    position: 'absolute',
    top: 3, // 부가기능 버튼 아래 위치 조절
    right: 6, // 버튼 padding 맞춰 위치 조절
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingVertical: 5,
    width: 150,
    zIndex: 999,
    // flexDirection: 'column', 기본값이라 생략 가능
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  madalTitleView: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    color: '#121212',
    flex: 1,
  },
  modalSubtitle: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 7,
    marginHorizontal: 18,
  },
  orderCell: {
    width: (width - 32 - 20) / 3, // padding 16*2, gaps
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    position: 'relative',
  },
  orderThumb: {
    width: '100%',
    height: '100%',
  },
  orderInput: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 56,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#111',
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    height: 44,
  },
  resetText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#3CBBFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  applyText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
  },
});

export default InfoImageEditScreen;
