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

const MAX_CONTENT_LENGTH = 3000;

const PostWriteScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const lastBackPressed = useRef(0);
  const scrollViewRef = useRef(null);
  const editorRef = useRef(null);
  const selectionRef = useRef({start: 0, end: 0});
  const contentSizeHeightRef = useRef(0);
  const {showAlert, AlertComponent} = useCustomAlert();
  const preview = route?.params?.preview ?? {};
  const storeName = route?.params?.storeName ?? '';
  const storeAddress = route?.params?.storeAddress ?? '';
  const placeName = route?.params?.placeName ?? '';
  const storeId = route?.params?.storeId ?? null;
  const reviewFlow = route?.params?.reviewFlow ?? false;
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
  const [editorHeight, setEditorHeight] = useState(200);
  const maxPreviewSize = 200;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardPadding = useMemo(
    () => (Platform.OS === 'android' ? keyboardHeight : 0),
    [keyboardHeight],
  );
  const keyboardVerticalOffset = useMemo(
    () => (Platform.OS === 'ios' ? 0 : insets.top + 48),
    [insets.top],
  );

  const previewPhoto = photos[0];
  const hasMultiplePhotos = photos.length > 1;
  const displayName = placeName || storeName;
  const hasStoreName = storeName.trim().length > 0;
  const trimmedPlaceName = placeName.trim();
  const hasPlaceName = trimmedPlaceName.length > 0;
  const canUseStoreId = Boolean(storeId);
  const isContentOnly = !hasPlaceName && !hasStoreName && !canUseStoreId;
  const showStoreInfo = hasStoreName || hasPlaceName;
  const showRating = hasStoreName && !hasPlaceName;

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

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      const height = e?.endCoordinates?.height ?? 0;
      setKeyboardHeight(height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub?.remove();
      hideSub?.remove();
    };
  }, []);

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
        if (isSubmitting) {
          ToastAndroid.show('게시글을 업로드 중입니다.', ToastAndroid.SHORT);
          return true;
        }
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
    }, [isSubmitting, navigation]),
  );

  useLayoutEffect(() => {
    const isIOS = Platform.OS === 'ios';

    navigation.setOptions({
      gestureEnabled: isIOS,
    });
  }, [navigation]);

  const handleEditorContentSizeChange = useCallback(
    event => {
      const nextContentHeight = Math.ceil(
        event?.nativeEvent?.contentSize?.height ?? 0,
      );
      if (Platform.OS === 'android') {
        const nextHeight = Math.max(200, nextContentHeight);
        setEditorHeight(prev => (prev === nextHeight ? prev : nextHeight));
      }
      const shouldAutoScroll =
        isEditorFocused &&
        scrollViewRef.current &&
        selectionRef.current?.end >= Math.max(0, content.length - 1) &&
        nextContentHeight > contentSizeHeightRef.current;
      contentSizeHeightRef.current = nextContentHeight;
      if (shouldAutoScroll) {
        scrollViewRef.current.scrollToEnd({animated: true});
      }
    },
    [content, isEditorFocused],
  );

  const handleContentChange = useCallback(text => {
    setContent(text.slice(0, MAX_CONTENT_LENGTH));
  }, []);

  const isSubmitEnabled = hasPlaceName
    ? content.trim().length > 0
    : isContentOnly
    ? content.trim().length > 0
    : rating > 0 && content.trim().length > 0;
  const isSubmitReady = isSubmitEnabled && !isSubmitting;

  const handleSubmitPost = useCallback(async () => {
    if (!isSubmitReady) return;
    setIsSubmitting(true);
    try {
      let resolvedStoreId = storeId;
      if (!hasPlaceName && !isContentOnly) {
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
      }
      const data = {
        files: photos,
        createPostDto: hasPlaceName
          ? {
              content: content.trim(),
              place: trimmedPlaceName,
            }
          : isContentOnly
          ? {
              content: content.trim(),
            }
          : {
              content: content.trim(),
              storeId: resolvedStoreId,
              rate: rating,
            },
      };
      await PostCreate(data);
      if (!hasPlaceName && !isContentOnly && reviewFlow && resolvedStoreId) {
        navigation.pop(3);
        navigation.navigate('StoreStack', {
          screen: 'StoreReviewScreen',
          params: {
            storeId: resolvedStoreId,
            storename: storeName,
            storeAddress,
            shouldRefresh: true,
          },
        });
        return;
      }
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
    canUseStoreId,
    hasPlaceName,
    hasStoreName,
    isContentOnly,
    isSubmitReady,
    navigation,
    photos,
    rating,
    reviewFlow,
    storeAddress,
    storeId,
    storeName,
    trimmedPlaceName,
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
            onPress={() => {
              if (isSubmitting) {
                ToastAndroid.show('게시글을 업로드 중입니다.', ToastAndroid.SHORT);
                return;
              }
              navigation.goBack();
            }}>
            <Ionicons name="arrow-back-outline" size={24} color="#333" />
          </Pressable>
        )}
        <CustomText style={styles.headerTitle}>글 작성</CustomText>
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingBottom: insets.bottom + keyboardPadding,
            },
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
            <Pressable
              pointerEvents={isEditorFocused ? 'box-none' : 'auto'}
              onPress={() => {
                editorRef.current?.focus?.();
              }}>
              <CustomTextInput
                ref={editorRef}
                pointerEvents={isEditorFocused ? 'auto' : 'none'}
                style={[
                  styles.editorInput,
                  Platform.OS === 'android' && {height: editorHeight},
                ]}
                placeholder={
                  '어떤 술자리를 보냈나요?\n분위기나 기억에 남는 순간을 공유해보세요.'
                }
                scrollEnabled={false}
                placeholderTextColor="#777"
                multiline
                textAlignVertical="top"
                value={content}
                onChangeText={handleContentChange}
                maxLength={MAX_CONTENT_LENGTH}
                onContentSizeChange={handleEditorContentSizeChange}
                onSelectionChange={event => {
                  selectionRef.current = event?.nativeEvent?.selection ?? {
                    start: 0,
                    end: 0,
                  };
                }}
                onFocus={() => {
                  setIsEditorFocused(true);
                }}
                onBlur={() => setIsEditorFocused(false)}
              />
            </Pressable>
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
    paddingTop: 10,
  },
  editorInput: {
    minHeight: 200,
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
});

export default PostWriteScreen;
