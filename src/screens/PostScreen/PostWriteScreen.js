import React, {
  useEffect,
  useMemo,
  useLayoutEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
import ColorUtil from '../../utils/ColorUtil';
import {PostCreate} from '../../api/postApi';
import {StoreSuggestion} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
import useCustomAlert from '../../hooks/useCustomAlert';

const PostWriteScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const lastBackPressed = useRef(0);
  const scrollViewRef = useRef(null);
  const {showAlert, AlertComponent} = useCustomAlert();
  const preview = route?.params?.preview ?? {};
  const storeName = route?.params?.storeName ?? '';
  const storeAddress = route?.params?.storeAddress ?? '';
  const placeName = route?.params?.placeName ?? '';
  const storeId = route?.params?.storeId ?? null;
  const photos = Array.isArray(preview.photos) ? preview.photos : [];
  const previewKey = useMemo(
    () => `${photos.length}-${photos?.[0]?.uri ?? 'none'}`,
    [photos],
  );
  const [photoSizes, setPhotoSizes] = useState({});
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxPreviewSize = 200;

  const previewPhoto = photos[0];
  const hasMultiplePhotos = photos.length > 1;
  const displayName = placeName || storeName;
  const hasStoreName = storeName.trim().length > 0;
  const hasPlaceName = placeName.trim().length > 0;
  const showStoreInfo = hasStoreName || hasPlaceName;
  const showRating = hasStoreName && !hasPlaceName;

  useEffect(() => {
    console.log('PostWriteScreen params:', {
      storeId,
      storeName,
      storeAddress,
      placeName,
      preview,
    });
  }, [storeId, storeName, storeAddress, placeName, preview]);

  useEffect(() => {
    let isActive = true;

    const loadSizes = async () => {
      if (!photos.length) {
        if (isActive) {
          setPhotoSizes({});
        }
        return;
      }

      const nextSizes = {};
      await Promise.all(
        photos.map(
          photo =>
            new Promise(resolve => {
              if (!photo?.uri) {
                resolve();
                return;
              }
              Image.getSize(
                photo.uri,
                (width, height) => {
                  nextSizes[photo.uri] = {width, height};
                  resolve();
                },
                () => resolve(),
              );
            }),
        ),
      );

      if (isActive) {
        setPhotoSizes(nextSizes);
      }
    };

    loadSizes();
    return () => {
      isActive = false;
    };
  }, [photos]);

  const getPreviewSize = photo => {
    const size = photoSizes[photo?.uri];
    if (!size?.width || !size?.height) {
      return {width: maxPreviewSize, height: maxPreviewSize};
    }
    const isLandscape = size.width > size.height;
    const scale = isLandscape
      ? maxPreviewSize / size.height
      : Math.min(maxPreviewSize / size.width, maxPreviewSize / size.height, 1);
    return {
      width: Math.round(size.width * scale),
      height: Math.round(size.height * scale),
    };
  };

  const previewScrollHeight = useMemo(() => {
    if (!photos.length) {
      return maxPreviewSize;
    }
    return Math.max(
      maxPreviewSize,
      ...photos.map(photo => getPreviewSize(photo).height),
    );
  }, [photos, photoSizes, maxPreviewSize]);

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

  useLayoutEffect(() => {
    const isIOS = Platform.OS === 'ios';

    navigation.setOptions({
      gestureEnabled: !isIOS,
    });
  }, [navigation]);

  const handleEditorContentSizeChange = useCallback(() => {
    if (isEditorFocused && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [isEditorFocused]);

  const isSubmitEnabled = rating > 0 && content.trim().length > 0;
  const isSubmitReady = isSubmitEnabled && !isSubmitting;

  const handleSubmitPost = useCallback(async () => {
    if (!isSubmitReady) return;
    setIsSubmitting(true);
    try {
      let resolvedStoreId = storeId;
      if (!resolvedStoreId) {
        const trimmedStoreName = storeName.trim();
        const trimmedStoreAddress = storeAddress.trim();
        if (!trimmedStoreName || !trimmedStoreAddress) {
          console.warn('게시 실패: storeId가 없습니다.');
          return;
        }
        const suggestionData = {
          files: photos,
          createStoreDto: {
            name: trimmedStoreName,
            locationDto: {
              address: trimmedStoreAddress,
              addressDetail: '',
              latitude: 12.34,
              longitude: 12.34,
            },
            facilitiesInfoDto: {
              hasScreen: false,
              hasRoom: false,
              hasOutdoor: false,
              isGroupAvailable: false,
              isParkingAvailable: false,
              isCorkageAvailable: false,
            },
          },
        };
        const response = await StoreSuggestion(suggestionData);
        resolvedStoreId = response?.data?.data?.id ?? null;
        if (!resolvedStoreId) {
          console.warn('게시 실패: 매장 제보 후 storeId를 받지 못했습니다.');
          return;
        }
      }
      const data = {
        files: photos,
        createPostDto: {
          content: content.trim(),
          storeId: resolvedStoreId,
          rate: rating,
        },
      };
      await PostCreate(data);
      navigation.reset({
        index: 0,
        routes: [{name: 'MainBtmbar', state: {routes: [{name: 'MainScreen'}]}}],
      });
    } catch (error) {
      if (error?.response?.data?.code === 25006) {
        showAlert({
          title: '등록 제한',
          message: '매장 당 게시글은 하루에 한 번만 작성할 수 있습니다.',
        });
        return;
      }
      console.error('게시 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    content,
    isSubmitReady,
    navigation,
    photos,
    rating,
    storeAddress,
    storeId,
    storeName,
    showAlert,
  ]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0),
          // paddingBottom: Platform.OS === 'ios' ? insets.bottom + 10 : 0,
        },
      ]}>
      <View style={styles.header}>
        {isEditorFocused ? (
          <View style={styles.headerSpacer} />
        ) : (
          <Pressable
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={24} color="#333" />
          </Pressable>
        )}
        <CustomText style={styles.headerTitle}>
          {isEditorFocused ? '문구' : '글 작성'}
        </CustomText>
        {isEditorFocused ? (
          <Pressable
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            onPress={() => {
              Keyboard.dismiss();
              setIsEditorFocused(false);
            }}>
            <CustomText style={styles.headerAction}>확인</CustomText>
          </Pressable>
        ) : (
          <Pressable
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            onPress={handleSubmitPost}
            disabled={!isSubmitReady}>
            <CustomText
              style={[
                styles.headerAction,
                !isSubmitReady && styles.headerActionDisabled,
              ]}>
              게시
            </CustomText>
          </Pressable>
        )}
      </View>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            {paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0},
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {previewPhoto ? (
            hasMultiplePhotos ? (
              <ScrollView
                key={previewKey}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[styles.previewScroll, {height: previewScrollHeight}]}
                contentContainerStyle={styles.previewList}>
                {photos.map((photo, index) => {
                  const previewSize = getPreviewSize(photo);
                  return (
                    <View
                      key={photo.id ?? `${photo.uri}-${index}`}
                      style={[
                        styles.previewItem,
                        {
                          width: previewSize.width,
                          height: previewSize.height,
                          marginRight: index === photos.length - 1 ? 0 : 8,
                        },
                      ]}>
                      <FastImage
                        source={{uri: photo.uri}}
                        style={styles.previewImage}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.previewSingle}>
                <View
                  key={previewKey}
                  style={[styles.previewItem, getPreviewSize(previewPhoto)]}>
                  <FastImage
                    source={{uri: previewPhoto.uri}}
                    style={styles.previewImage}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
              </View>
            )
          ) : null}
          {showStoreInfo && (
            <View style={styles.storeInfo}>
              <View style={styles.storeInfoRow}>
                <View style={styles.storeInfoIcon}>
                  <Ionicons name="storefront" size={14} color="#333" />
                </View>
                <View style={styles.storeInfoText}>
                  <CustomText style={styles.storeName} numberOfLines={2}>
                    {displayName}
                  </CustomText>
                </View>
              </View>
            </View>
          )}
          {showRating && (
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
          <View style={styles.editor}>
            <CustomTextInput
              style={styles.editorInput}
              placeholder={
                '어떤 술자리를 보냈나요?\n분위기나 기억에 남는 순간을 공유해보세요.'
              }
              placeholderTextColor="#777"
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
              onContentSizeChange={handleEditorContentSizeChange}
              onFocus={() => {
                setIsEditorFocused(true);
                setTimeout(() => {
                  if (scrollViewRef.current) {
                    scrollViewRef.current.scrollToEnd({animated: true});
                  }
                }, 50);
              }}
              onBlur={() => setIsEditorFocused(false)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <AlertComponent />
      <Loading loading={isSubmitting} />
    </View>
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
    color: '#333',
  },
  headerSpacer: {
    width: 24,
  },
  headerAction: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#4AA3FF',
  },
  headerActionDisabled: {
    color: '#B9C2CC',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  storeInfo: {
    paddingHorizontal: 20,
    paddingTop: 7,
    paddingBottom: 10,
  },
  storeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  storeInfoIcon: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 5,
  },
  storeInfoText: {
    flex: 1,
  },
  storeName: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#333',
  },
  storeAddress: {
    marginTop: 4,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  ratingSection: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    marginRight: 6,
  },
  previewItem: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: ColorUtil.border,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  previewScroll: {
    marginTop: 20,
  },
  previewList: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  previewSingle: {
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
  },
  editor: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  editorInput: {
    minHeight: 200,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    // paddingVertical: 12,
  },
});

export default PostWriteScreen;
