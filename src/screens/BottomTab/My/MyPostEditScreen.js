import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CustomText from '../../../utils/CustomText';
import ColorUtil from '../../../utils/ColorUtil';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {
  PostDeleteImage,
  PostUpdate,
  PostUploadImage,
} from '../../../api/reviewApi';
import Loading from '../../../hooks/Loading';
import {useToast} from '../../../context/ToastContext';

const {width: screenWidth} = Dimensions.get('window');
const MAX_IMAGES = 10;
const MAX_LANDSCAPE_RATIO = 16 / 9;
const MAX_CONTENT_LENGTH = 300;

const mapToImageItem = (uri, index) => ({
  id: `${uri}-${Date.now()}-${index}`,
  uri,
});
const isRemoteUri = uri => typeof uri === 'string' && /^https?:\/\//i.test(uri);

const MyPostEditScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {review, returnTo} = route.params || {};
  const {showAlert, AlertComponent} = useCustomAlert();
  const lastBackPressed = useRef(0);
  const initialImages = useMemo(() => {
    const list = Array.isArray(review?.postImgUrlList)
      ? review.postImgUrlList
      : Array.isArray(review?.imgUrlList)
      ? review.imgUrlList
      : [];
    return list.filter(Boolean).map((uri, index) => ({
      id: `${uri}-${index}`,
      uri,
    }));
  }, [review?.imgUrlList, review?.postImgUrlList]);

  const [images, setImages] = useState(initialImages);
  const [title, setTitle] = useState(review?.title ?? '');
  const [content, setContent] = useState(review?.content ?? '');
  const [rating, setRating] = useState(review?.rate ?? review?.rating ?? 0);
  const [baseAspectRatio, setBaseAspectRatio] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {showToast} = useToast();

  useEffect(() => {
    const draft = route.params?.draft;
    const draftToken = route.params?.draftToken;
    if (draft && draftToken) {
      setImages(Array.isArray(draft.images) ? draft.images : []);
      setTitle(draft.title ?? '');
      setContent(draft.content ?? '');
      navigation.setParams({
        draft: undefined,
        draftToken: undefined,
      });
    }
  }, [navigation, route.params?.draft, route.params?.draftToken]);

  useEffect(() => {
    const addedImages = route.params?.addedImages;
    const token = route.params?.addedImagesToken;
    if (!token || !Array.isArray(addedImages) || addedImages.length === 0) {
      return;
    }
    setImages(prev => {
      const nextItems = addedImages
        .filter(Boolean)
        .map((uri, index) => mapToImageItem(uri, index));
      const merged = [...prev, ...nextItems];
      return merged.slice(0, MAX_IMAGES);
    });
    navigation.setParams({
      addedImages: undefined,
      addedImagesToken: undefined,
    });
  }, [navigation, route.params?.addedImages, route.params?.addedImagesToken]);

  useEffect(() => {
    let isActive = true;
    const firstImage = images[0];
    if (!firstImage?.uri) {
      setBaseAspectRatio(null);
      return () => {
        isActive = false;
      };
    }
    Image.getSize(
      firstImage.uri,
      (width, height) => {
        if (!isActive) return;
        if (!width || !height) {
          setBaseAspectRatio(1);
          return;
        }
        setBaseAspectRatio(width / height);
      },
      () => {
        if (isActive) {
          setBaseAspectRatio(1);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [images]);

  const photoData = useMemo(() => {
    const items = images.map((item, index) => ({...item, index}));
    if (items.length < MAX_IMAGES) {
      items.push({id: 'add-tile', isAdd: true});
    }
    return items;
  }, [images]);

  const imageCount = images.length;
  const hasMultiplePhotos = imageCount > 1;
  const indicatorIndices = useMemo(() => {
    if (imageCount <= 0) {
      return [];
    }

    const windowSize = Math.min(7, imageCount);
    let start = currentIndex - Math.floor(windowSize / 2);
    let end = start + windowSize - 1;

    if (start < 0) {
      start = 0;
      end = windowSize - 1;
    }

    if (end >= imageCount) {
      end = imageCount - 1;
      start = Math.max(0, end - windowSize + 1);
    }

    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }, [currentIndex, imageCount]);
  const previewAspectRatio = baseAspectRatio || 1;
  const storeName = review?.storeName || '';
  const storeAddress = review?.storeAddress || '';
  const hasStoreInfo = Boolean(storeName || storeAddress);
  const hasRating =
    hasStoreInfo && review?.rate !== undefined && review?.rate !== null;
  const onViewableItemsChanged = useRef(({viewableItems}) => {
    const first = viewableItems?.[0];
    if (first?.index !== undefined) {
      setCurrentIndex(first.index);
    }
  }).current;
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  const hasUnsavedChanges = useMemo(() => {
    const initialUris = initialImages.map(item => item.uri);
    const currentUris = images.map(item => item.uri);
    const imagesChanged =
      initialUris.length !== currentUris.length ||
      initialUris.some((uri, index) => uri !== currentUris[index]);
    const contentChanged = content !== (review?.content ?? '');
    const ratingChanged = rating !== (review?.rate ?? review?.rating ?? 0);
    return imagesChanged || contentChanged || ratingChanged;
  }, [
    content,
    images,
    initialImages,
    rating,
    review?.content,
    review?.rate,
    review?.rating,
  ]);

  const handleContentChange = useCallback(text => {
    setContent(text.slice(0, MAX_CONTENT_LENGTH));
  }, []);

  const goToMyProfile = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainBtmbar',
          state: {
            index: 0,
            routes: [
              {
                name: 'MyStack',
                state: {index: 0, routes: [{name: 'MyScreen'}]},
              },
            ],
          },
        },
      ],
    });
  }, [navigation]);

  const goBackToOrigin = useCallback(() => {
    if (returnTo === 'MainScreen') {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainBtmbar', {
          screen: 'MainScreen',
        });
      }
      return;
    }
    navigation.goBack();
  }, [navigation, returnTo]);

  const handleBackPress = useCallback(() => {
    if (!hasUnsavedChanges) {
      goBackToOrigin();
      return;
    }
    showAlert({
      title: '저장되지 않았습니다',
      message: '뒤로 가시겠습니까?',
      onConfirm: () => goBackToOrigin(),
      type: 'confirm',
    });
  }, [goBackToOrigin, hasUnsavedChanges, showAlert]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (!hasUnsavedChanges) {
          goBackToOrigin();
          return true;
        }

        if (now - lastBackPressed.current < 2000) {
          goBackToOrigin();
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
    }, [goBackToOrigin, hasUnsavedChanges]),
  );

  const handleDeleteImage = index => {
    const target = images[index];
    if (!target) {
      return;
    }
    setImages(prev => prev.filter((_, i) => i !== index));
    if (!isRemoteUri(target.uri) || !review?.id) {
      return;
    }
    PostDeleteImage(review.id, [target.uri]).catch(() => {
      setImages(prev => {
        const next = [...prev];
        const insertAt = Math.min(index, next.length);
        next.splice(insertAt, 0, target);
        return next;
      });
      Alert.alert('이미지 삭제 실패', '이미지 삭제에 실패했습니다.');
    });
  };

  const getFirstImageFrame = async () => {
    const firstImage = images[0];
    if (!firstImage?.uri) {
      return null;
    }
    if (typeof baseAspectRatio === 'number') {
      return {
        isPortraitPhoto: baseAspectRatio <= 1,
        landscapeAspectRatio: baseAspectRatio,
        aspectRatio: baseAspectRatio,
      };
    }
    const ratio = await new Promise(resolve => {
      Image.getSize(
        firstImage.uri,
        (width, height) => {
          if (!width || !height) {
            resolve(null);
            return;
          }
          resolve(width / height);
        },
        () => resolve(null),
      );
    });
    if (!ratio) {
      return null;
    }
    return {
      isPortraitPhoto: ratio <= 1,
      landscapeAspectRatio: ratio,
      aspectRatio: ratio,
    };
  };

  const handleAddImages = async () => {
    if (images.length >= MAX_IMAGES) {
      showToast(`최대 ${MAX_IMAGES}장까지 업로드할 수 있어요.`, 'center');
      return;
    }
    const remainingSlots = Math.max(0, MAX_IMAGES - images.length);
    const baseFrame = await getFirstImageFrame();
    navigation.navigate('PostPhotoSelectScreen', {
      returnTo: 'MyPostEditScreen',
      review,
      draft: {title, content, images},
      draftToken: Date.now(),
      maxSelectable: remainingSlots,
      ...(baseFrame ? {baseFrame} : {}),
    });
  };

  const handleSubmit = () => {
    if (!review?.id) {
      Alert.alert('수정 실패', '게시글 정보를 찾을 수 없습니다.');
      return;
    }
    if (isSubmitting) {
      return;
    }
    const addedLocalImages = images
      .map(item => item?.uri)
      .filter(
        uri =>
          uri &&
          !isRemoteUri(uri) &&
          !initialImages.some(initial => initial.uri === uri),
      );
    setIsSubmitting(true);
    PostUpdate(review.id, {
      content: content ?? '',
      rate: Number.isFinite(rating) ? rating : 0,
    })
      .then(async () => {
        if (addedLocalImages.length > 0) {
          await PostUploadImage(review.id, {files: addedLocalImages});
        }
        showAlert({
          title: '수정 완료',
          message: '게시글이 수정되었습니다.',
          onConfirm: () => goToMyProfile(),
          type: 'confirm',
        });
      })
      .catch(() => {
        showAlert({
          title: '수정 실패',
          message: '게시글 수정에 실패했습니다.',
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0)},
      ]}>
      <View style={styles.header}>
        <Pressable
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={handleBackPress}>
          <Ionicons name="arrow-back-outline" size={24} color="#111" />
        </Pressable>
        <CustomText style={styles.headerTitle}>게시글 수정</CustomText>
        <Pressable
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={handleSubmit}
          disabled={!hasUnsavedChanges}>
          <CustomText
            style={[
              styles.submitText,
              !hasUnsavedChanges && styles.submitTextDisabled,
            ]}>
            완료
          </CustomText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {hasStoreInfo && (
            <View style={styles.selectedStoreRow}>
              <View style={styles.selectedStoreIcon}>
                <Ionicons name="storefront-outline" size={16} color="#333" />
              </View>
              <View style={styles.selectedStoreInfo}>
                <CustomText style={styles.selectedStoreText} numberOfLines={1}>
                  {storeName || '매장 이름'}
                </CustomText>
                <CustomText
                  style={
                    storeAddress
                      ? styles.selectedStoreAddress
                      : styles.selectedAddressPlaceholder
                  }
                  numberOfLines={1}>
                  {storeAddress || '매장 주소'}
                </CustomText>
              </View>
            </View>
          )}

          <View style={{width: screenWidth, position: 'relative'}}>
            <FlatList
              data={photoData}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              decelerationRate="fast"
              style={{width: screenWidth}}
              snapToInterval={screenWidth}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={({item}) => {
                const isAdd = item.isAdd;
                const aspectRatio = previewAspectRatio;

                if (isAdd) {
                  return (
                    <View
                      key={item.id}
                      style={[styles.imageWrapper, {width: screenWidth}]}>
                      <Pressable
                        style={[
                          styles.previewStage,
                          styles.photoAddCard,
                          {aspectRatio},
                        ]}
                        onPress={handleAddImages}>
                        <Ionicons name="add" size={28} color="#4B5563" />
                        <CustomText style={styles.photoAddText}>
                          사진 추가
                        </CustomText>
                      </Pressable>
                    </View>
                  );
                }

                const isDeleteDisabled = images.length <= 1;
                return (
                  <View
                    key={item.id}
                    style={[styles.imageWrapper, {width: screenWidth}]}>
                    <FastImage
                      source={{uri: item.uri}}
                      style={[
                        styles.postImage,
                        {width: screenWidth, aspectRatio},
                      ]}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                    {!isDeleteDisabled && (
                      <Pressable
                        style={styles.previewRemoveButton}
                        onPress={() => handleDeleteImage(item.index)}
                        hitSlop={8}>
                        <Ionicons name="close" size={18} color="#fff" />
                      </Pressable>
                    )}
                  </View>
                );
              }}
            />
            {hasMultiplePhotos && (
              <View style={styles.imageIndicatorContainer}>
                {indicatorIndices.map(index => {
                  const isActive = index === currentIndex;
                  const distance = Math.abs(currentIndex - index);
                  const clampedDistance = Math.min(distance, 3);
                  const baseSize = isActive ? 8 : 6;
                  const size = Math.max(
                    isActive ? baseSize : baseSize - clampedDistance * 1,
                    isActive ? 8 : 3,
                  );
                  const opacity = isActive
                    ? 1
                    : Math.max(0.35, 0.8 - clampedDistance * 0.2);
                  const color = isActive ? '#FFF' : '#CFD5DF';

                  return (
                    <View
                      key={`dot-${index}`}
                      style={styles.imageIndicatorDotWrapper}>
                      <View
                        style={[
                          styles.imageIndicatorDot,
                          {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            opacity,
                            backgroundColor: color,
                          },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {hasRating && (
          <View style={styles.ratingSection}>
            <View style={styles.ratingRow}>
              {Array.from({length: 5}, (_, index) => {
                const starIndex = index + 1;
                return (
                  <Pressable
                    key={`rating-star-${starIndex}`}
                    onPress={() => setRating(starIndex)}
                    hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                    <FontAwesomeIcon
                      name="star"
                      size={22}
                      color={starIndex <= rating ? '#FFD700' : '#E2E2E2'}
                      style={styles.ratingStar}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.contentSection}>
          <TextInput
            value={content}
            onChangeText={handleContentChange}
            placeholder="오늘의 기록을 남겨보세요"
            placeholderTextColor="#9CA3AF"
            style={styles.contentInput}
            multiline
            textAlignVertical="top"
            maxLength={MAX_CONTENT_LENGTH}
          />
        </View>
      </ScrollView>
      <Loading loading={isSubmitting} />
      <AlertComponent />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
  },
  headerTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#111',
  },
  submitText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#4AA3FF',
  },
  submitTextDisabled: {
    color: ColorUtil.mainDisable,
  },
  content: {
    paddingBottom: 30,
  },
  section: {},
  selectedStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderColor: '#E5E7EB',
    marginHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  selectedStoreIcon: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
  },
  selectedStoreText: {
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  selectedStoreInfo: {
    flex: 1,
  },
  selectedStoreAddress: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  selectedAddressPlaceholder: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  imageWrapper: {
    position: 'relative',
  },
  previewStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 0,
    borderRadius: 0,
  },
  postImage: {
    width: '100%',
    backgroundColor: '#f6f6f6',
    marginBottom: 10,
  },
  previewRemoveButton: {
    position: 'absolute',
    top: 10,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
  },
  photoAddCard: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoAddText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#6B7280',
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  imageIndicatorDotWrapper: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIndicatorDot: {
    backgroundColor: '#CFD5DF',
  },
  ratingSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    marginRight: 6,
  },
  contentSection: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  contentInput: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#111',
    minHeight: 160,
  },
});

export default MyPostEditScreen;
