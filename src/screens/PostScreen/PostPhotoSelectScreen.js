import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  CommonActions,
  StackActions,
  useFocusEffect,
} from '@react-navigation/native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import CameraRollDefault, {
  CameraRoll as CameraRollNamed,
} from '@react-native-camera-roll/camera-roll';
import ImageEditor from '@react-native-community/image-editor';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import SkeletonBox from '../../hooks/SkeletonBox';
import MaximizeIcon from '../../assets/svg/MaximizeIcon';
import PostCropLoadingOverlay from '../../components/Post/PostCropLoadingOverlay';
import {
  requestCameraPermission,
  requestPhotoPermission,
} from '../../hooks/usePhotopermis';
import {IMAGE_PICKER_TEXTS} from '../../constants/imagePickerLabels';
import {useToast} from '../../context/ToastContext';

const {width, height} = Dimensions.get('window');
const CameraRollModule = CameraRollNamed || CameraRollDefault;
const PAGE_SIZE = 30;
const BATCH_SIZE = 50;
const MIN_PREVIEW_SCALE = 1;
const MAX_PREVIEW_SCALE = 3;
const MAX_LANDSCAPE_RATIO = 16 / 9;
const DEFAULT_MAX_SELECTED_PHOTOS = 10;
const OVERLAY_ANIM_DURATION = 260;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_OUTPUT_DIMENSION = 2560;

const clampValue = (value, min, max) => Math.max(min, Math.min(value, max));
const clampNumber = (value, min, max) => Math.max(min, Math.min(value, max));
const normalizeImageUri = uri => {
  if (!uri || typeof uri !== 'string') {
    return uri;
  }
  if (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  ) {
    return uri;
  }
  return `file://${uri}`;
};

const getTouchDistance = touches => {
  if (!touches || touches.length < 2) {
    return 0;
  }
  const [first, second] = touches;
  const dx = second.pageX - first.pageX;
  const dy = second.pageY - first.pageY;
  return Math.hypot(dx, dy);
};

const getPhotoSize = photo => {
  const width = photo?.width;
  const height = photo?.height;
  if (
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  ) {
    return {width, height};
  }
  return null;
};

const applyOrientationToCrop = (cropRect, displaySize, orientation) => {
  if (!cropRect || !displaySize) {
    return {crop: cropRect, rawSize: displaySize};
  }
  const rotation = (((orientation ?? 0) % 360) + 360) % 360;
  if (!rotation) {
    return {crop: cropRect, rawSize: displaySize};
  }
  const {width: displayWidth, height: displayHeight} = displaySize;
  const {x, y} = cropRect.offset;
  const {width: w, height: h} = cropRect.size;

  if (rotation === 90) {
    const rawWidth = displayHeight;
    const rawHeight = displayWidth;
    return {
      crop: {
        offset: {x: y, y: rawHeight - (x + w)},
        size: {width: h, height: w},
      },
      rawSize: {width: rawWidth, height: rawHeight},
    };
  }
  if (rotation === 180) {
    const rawWidth = displayWidth;
    const rawHeight = displayHeight;
    return {
      crop: {
        offset: {x: rawWidth - (x + w), y: rawHeight - (y + h)},
        size: {width: w, height: h},
      },
      rawSize: {width: rawWidth, height: rawHeight},
    };
  }
  if (rotation === 270) {
    const rawWidth = displayHeight;
    const rawHeight = displayWidth;
    return {
      crop: {
        offset: {x: rawWidth - (y + h), y: x},
        size: {width: h, height: w},
      },
      rawSize: {width: rawWidth, height: rawHeight},
    };
  }
  return {crop: cropRect, rawSize: displaySize};
};

const clampCropToBounds = (cropRect, rawSize) => {
  if (!cropRect || !rawSize?.width || !rawSize?.height) {
    return cropRect;
  }
  const maxOffsetX = Math.max(0, rawSize.width - 1);
  const maxOffsetY = Math.max(0, rawSize.height - 1);
  const safeOriginX = clampNumber(cropRect.offset.x, 0, maxOffsetX);
  const safeOriginY = clampNumber(cropRect.offset.y, 0, maxOffsetY);
  const maxWidth = Math.max(1, rawSize.width - safeOriginX);
  const maxHeight = Math.max(1, rawSize.height - safeOriginY);
  const safeWidth = clampNumber(cropRect.size.width, 1, maxWidth);
  const safeHeight = clampNumber(cropRect.size.height, 1, maxHeight);
  return {
    offset: {x: safeOriginX, y: safeOriginY},
    size: {width: safeWidth, height: safeHeight},
  };
};

const PostPhotoSelectScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const {showToast} = useToast();
  const routeMaxSelectable = route?.params?.maxSelectable;
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
  const [currentPhotoId, setCurrentPhotoId] = useState(null);
  const [isAlbumPickerOpen, setIsAlbumPickerOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('crop');
  const [isPortraitPhoto, setIsPortraitPhoto] = useState(true);
  const [landscapeAspectRatio, setLandscapeAspectRatio] = useState(1);
  const [frameSize, setFrameSize] = useState({width: 0, height: 0});
  const [currentImageSize, setCurrentImageSize] = useState({
    width: 0,
    height: 0,
  });
  const [panByPhotoId, setPanByPhotoId] = useState({});
  const [scaleByPhotoId, setScaleByPhotoId] = useState({});
  const [activeScale, setActiveScale] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cropLoading, setCropLoading] = useState(false);
  const [isPreviewScrollLocked, setIsPreviewScrollLocked] = useState(false);
  const gridListRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const listScrollOffsetRef = useRef(0);
  const overlayClosingRef = useRef(false);
  const panValue = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const overlayTranslateY = useRef(new Animated.Value(-width)).current;
  const cropProgressAnim = useRef(new Animated.Value(0)).current;
  const [cropProgressValue, setCropProgressValue] = useState(0);
  const [cropNoticeText, setCropNoticeText] = useState('잠시만 기다려 주세요!');
  const [showOverlayPreview, setShowOverlayPreview] = useState(false);
  const panStartRef = useRef({x: 0, y: 0});
  const scaleStartRef = useRef(1);
  const pinchStartDistanceRef = useRef(0);
  const isPinchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const albumRequestIdRef = useRef(0);
  const selectedAlbumIdRef = useRef(null);
  const loadingMoreAlbumIdRef = useRef(null);
  const lastBackPressed = useRef(0);
  const returnTo = route?.params?.returnTo;
  const returnReview = route?.params?.review;
  const returnDraft = route?.params?.draft;
  const returnDraftToken = route?.params?.draftToken;
  const baseFrame = route?.params?.baseFrame;
  const presetStore = route?.params?.presetStore;
  const reviewFlow = route?.params?.reviewFlow;
  const baseFrameAspectRatio =
    typeof baseFrame?.aspectRatio === 'number' ? baseFrame.aspectRatio : null;
  const shouldLockFrame = Boolean(
    returnTo === 'MyPostEditScreen' &&
      baseFrame &&
      (typeof baseFrame.isPortraitPhoto === 'boolean' ||
        typeof baseFrame.landscapeAspectRatio === 'number' ||
        typeof baseFrame.aspectRatio === 'number'),
  );

  const headerTopPadding = insets.top + (Platform.OS === 'android' ? 10 : 0);
  const fallbackHeaderHeight = headerTopPadding + 52;
  const effectiveHeaderHeight =
    headerHeight > 0 ? headerHeight : fallbackHeaderHeight;
  const overlayHiddenOffset = -(width + effectiveHeaderHeight);

  const selectedAlbum = useMemo(
    () => albums.find(album => album.id === selectedAlbumId),
    [albums, selectedAlbumId],
  );
  const skeletonItems = useMemo(
    () => Array.from({length: 16}, (_, index) => `skeleton-${index}`),
    [],
  );
  const setGridScrollEnabled = useCallback(enabled => {
    setIsPreviewScrollLocked(!enabled);
    if (gridListRef.current?.setNativeProps) {
      gridListRef.current.setNativeProps({scrollEnabled: enabled});
    }
  }, []);
  const handlePreviewTouchStart = useCallback(() => {
    setGridScrollEnabled(false);
  }, [setGridScrollEnabled]);
  const handlePreviewTouchEnd = useCallback(() => {
    setGridScrollEnabled(true);
  }, [setGridScrollEnabled]);

  useEffect(() => {
    if (!cropLoading) {
      cropProgressAnim.stopAnimation();
      cropProgressAnim.setValue(0);
      setCropProgressValue(0);
      setCropNoticeText('잠시만 기다려 주세요!');
      return;
    }
    const noticeStart = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - noticeStart;
      const isAlt = Math.floor(elapsed / 5000) % 2 === 1;
      setCropNoticeText(
        isAlt ? '사진을 최적화하는 중입니다.' : '잠시만 기다려 주세요!',
      );
    }, 1000);
    return () => clearInterval(intervalId);
  }, [cropLoading, cropProgressAnim]);

  const selectedPhoto = useMemo(() => {
    const fallbackId =
      selectedPhotoIds.length > 0
        ? selectedPhotoIds[selectedPhotoIds.length - 1]
        : null;
    const targetId = currentPhotoId ?? fallbackId;
    return selectedAlbum?.photos.find(photo => photo.id === targetId);
  }, [selectedAlbum, selectedPhotoIds, currentPhotoId]);
  const isNextEnabled = selectedPhotoIds.length > 0 && !cropLoading;
  const isScaleModeEditable = useMemo(() => {
    const firstSelectedId = selectedPhotoIds[0] ?? null;
    if (!firstSelectedId) {
      return Boolean(currentPhotoId);
    }
    return currentPhotoId === firstSelectedId;
  }, [currentPhotoId, selectedPhotoIds]);
  useEffect(() => {
    Animated.timing(overlayTranslateY, {
      toValue: showOverlayPreview ? 0 : overlayHiddenOffset,
      duration: OVERLAY_ANIM_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [overlayHiddenOffset, overlayTranslateY, showOverlayPreview]);

  useEffect(() => {
    if (showOverlayPreview) {
      overlayClosingRef.current = false;
    }
    if (!showOverlayPreview) {
      overlayTranslateY.setValue(overlayHiddenOffset);
    }
  }, [overlayHiddenOffset, overlayTranslateY, showOverlayPreview]);

  const handleGridScroll = useCallback(
    event => {
      listScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
      if (!showOverlayPreview) {
        return;
      }
      const offsetY = event.nativeEvent.contentOffset.y;
      if (offsetY > 0 && !overlayClosingRef.current) {
        overlayClosingRef.current = true;
        Animated.timing(overlayTranslateY, {
          toValue: overlayHiddenOffset,
          duration: OVERLAY_ANIM_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          overlayClosingRef.current = false;
          setShowOverlayPreview(false);
        });
      }
    },
    [overlayHiddenOffset, overlayTranslateY, showOverlayPreview],
  );
  const isInitialLoading =
    loading && (!selectedAlbum || !(selectedAlbum?.photos?.length > 0));
  const maxSelectablePhotos = useMemo(() => {
    const parsed = Number(routeMaxSelectable);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(parsed, DEFAULT_MAX_SELECTED_PHOTOS));
    }
    return DEFAULT_MAX_SELECTED_PHOTOS;
  }, [routeMaxSelectable]);
  const gridPhotos = useMemo(() => {
    const albumPhotos = selectedAlbum?.photos ?? [];
    return [{id: 'camera-tile', isCamera: true}, ...albumPhotos];
  }, [selectedAlbum]);

  const rawImageAspectRatio = useMemo(() => {
    if (!currentImageSize.width || !currentImageSize.height) {
      return 1;
    }
    return currentImageSize.width / currentImageSize.height;
  }, [currentImageSize]);

  const isUltraWideLandscape =
    !shouldLockFrame &&
    !isPortraitPhoto &&
    rawImageAspectRatio > MAX_LANDSCAPE_RATIO;

  const effectiveResizeMode = useMemo(() => {
    if (shouldLockFrame) {
      return 'cover';
    }
    if (previewMode === 'full') {
      return 'cover';
    }
    if (isPortraitPhoto) {
      return 'cover';
    }
    if (isUltraWideLandscape) {
      return 'cover';
    }
    return isScaleModeEditable ? 'contain' : 'cover';
  }, [
    isPortraitPhoto,
    isScaleModeEditable,
    isUltraWideLandscape,
    previewMode,
    shouldLockFrame,
  ]);

  const displaySize = useMemo(() => {
    if (
      !frameSize.width ||
      !frameSize.height ||
      !currentImageSize.width ||
      !currentImageSize.height
    ) {
      return {width: frameSize.width, height: frameSize.height};
    }
    const scale =
      effectiveResizeMode === 'contain'
        ? Math.min(
            frameSize.width / currentImageSize.width,
            frameSize.height / currentImageSize.height,
          )
        : Math.max(
            frameSize.width / currentImageSize.width,
            frameSize.height / currentImageSize.height,
          );
    return {
      width: currentImageSize.width * scale,
      height: currentImageSize.height * scale,
    };
  }, [currentImageSize, effectiveResizeMode, frameSize]);

  const scaledDisplaySize = useMemo(
    () => ({
      width: displaySize.width * activeScale,
      height: displaySize.height * activeScale,
    }),
    [activeScale, displaySize],
  );

  const clampedLandscapeRatio = useMemo(() => {
    if (shouldLockFrame && baseFrameAspectRatio) {
      return baseFrameAspectRatio;
    }
    return Math.min(landscapeAspectRatio || 1, MAX_LANDSCAPE_RATIO);
  }, [baseFrameAspectRatio, landscapeAspectRatio, shouldLockFrame]);

  const lockedFrameStyle = useMemo(() => {
    if (!shouldLockFrame || !baseFrameAspectRatio) {
      return null;
    }
    if (baseFrameAspectRatio <= 1) {
      return {height: '100%', aspectRatio: baseFrameAspectRatio};
    }
    return {width: '100%', aspectRatio: baseFrameAspectRatio};
  }, [baseFrameAspectRatio, shouldLockFrame]);

  const panBounds = useMemo(() => {
    const overflowX = Math.max(
      0,
      (scaledDisplaySize.width - frameSize.width) / 2,
    );
    const overflowY = Math.max(
      0,
      (scaledDisplaySize.height - frameSize.height) / 2,
    );
    return {
      minX: -overflowX,
      maxX: overflowX,
      minY: -overflowY,
      maxY: overflowY,
    };
  }, [frameSize, scaledDisplaySize]);

  const canZoom =
    frameSize.width > 0 &&
    frameSize.height > 0 &&
    currentImageSize.width > 0 &&
    currentImageSize.height > 0;

  const canPan =
    canZoom && (effectiveResizeMode === 'cover' || activeScale > 1);

  const getImageSize = photo =>
    new Promise(resolve => {
      const knownSize = getPhotoSize(photo);
      if (knownSize) {
        resolve(knownSize);
        return;
      }
      const uri = photo?.uri;
      if (!uri) {
        resolve({width: 0, height: 0});
        return;
      }
      Image.getSize(
        uri,
        (imgWidth, imgHeight) => {
          resolve({width: imgWidth, height: imgHeight});
        },
        () => resolve({width: 0, height: 0}),
      );
    });

  const getDisplaySizeForCrop = (imageSize, resizeMode) => {
    if (
      !frameSize.width ||
      !frameSize.height ||
      !imageSize.width ||
      !imageSize.height
    ) {
      return {width: frameSize.width, height: frameSize.height};
    }
    const scaleFactor =
      resizeMode === 'contain'
        ? Math.min(
            frameSize.width / imageSize.width,
            frameSize.height / imageSize.height,
          )
        : Math.max(
            frameSize.width / imageSize.width,
            frameSize.height / imageSize.height,
          );
    return {
      width: imageSize.width * scaleFactor,
      height: imageSize.height * scaleFactor,
    };
  };

  const getImageSizeFromUri = uri =>
    new Promise(resolve => {
      if (!uri) {
        resolve({width: 0, height: 0});
        return;
      }
      Image.getSize(
        uri,
        (imgWidth, imgHeight) => resolve({width: imgWidth, height: imgHeight}),
        () => resolve({width: 0, height: 0}),
      );
    });

  const getFileSizeBytes = async uri => {
    if (!uri || !uri.startsWith('file://')) {
      return null;
    }
    try {
      const path = uri.replace('file://', '');
      const stat = await RNFS.stat(path);
      return typeof stat.size === 'number' ? stat.size : null;
    } catch (error) {
      return null;
    }
  };

  const logFileSize = async (label, uri, fallbackSize) => {
    return;
  };

  const ensureMaxFileSize = async (uri, maxBytes) => {
    let currentUri = uri;
    let currentSize = await getFileSizeBytes(currentUri);
    if (!currentSize || currentSize <= maxBytes) {
      return currentUri;
    }
    // log original size in crop flow only
    const imageSize = await getImageSizeFromUri(currentUri);
    if (!imageSize.width || !imageSize.height) {
      return currentUri;
    }

    // One-pass resize: scale based on byte ratio with a safety margin.
    const ratio = Math.sqrt(maxBytes / currentSize);
    const scale = Math.min(0.95, ratio * 0.9);
    if (!Number.isFinite(scale) || scale >= 0.99) {
      return currentUri;
    }

    const targetWidth = Math.max(1, Math.round(imageSize.width * scale));
    const targetHeight = Math.max(1, Math.round(imageSize.height * scale));

    try {
      const resizedResult = await ImageEditor.cropImage(currentUri, {
        offset: {x: 0, y: 0},
        size: {
          width: Math.round(imageSize.width),
          height: Math.round(imageSize.height),
        },
        displaySize: {
          width: targetWidth,
          height: targetHeight,
        },
      });
      const resizedUri =
        typeof resizedResult === 'string' ? resizedResult : resizedResult?.uri;
      if (!resizedUri) {
        return currentUri;
      }
      const normalized = normalizeImageUri(resizedUri);
      const resizedSize = await getFileSizeBytes(normalized);
      return normalized;
    } catch (error) {
      return currentUri;
    }
  };

  const cropPhotoToPreview = async (photo, index) => {
    if (!photo?.uri || typeof photo.uri !== 'string') {
      return photo;
    }
    void logFileSize('original', photo.uri, photo?.fileSize);
    const imageSize = await getImageSize(photo);
    if (!imageSize.width || !imageSize.height) {
      return photo;
    }
    if (!frameSize.width || !frameSize.height) {
      return photo;
    }
    const rawImageAspectRatio = imageSize.width / imageSize.height;
    const isUltraWideLandscape =
      !shouldLockFrame &&
      !isPortraitPhoto &&
      rawImageAspectRatio > MAX_LANDSCAPE_RATIO;
    const resizeMode = shouldLockFrame
      ? 'cover'
      : previewMode === 'full'
      ? 'cover'
      : isPortraitPhoto || isUltraWideLandscape
      ? 'cover'
      : 'contain';

    const displaySizeForCrop = getDisplaySizeForCrop(imageSize, resizeMode);
    let baseScale =
      imageSize.width > 0 ? displaySizeForCrop.width / imageSize.width : 1;
    const photoScale = scaleByPhotoId[photo.id] ?? 1;
    let effectiveScale = baseScale * photoScale;
    if (!effectiveScale) {
      return photo;
    }
    let scaledWidth = imageSize.width * effectiveScale;
    let scaledHeight = imageSize.height * effectiveScale;
    let pan = panByPhotoId[photo.id] ?? {x: 0, y: 0};
    const shouldForceCover =
      scaledWidth < frameSize.width || scaledHeight < frameSize.height;
    if (shouldForceCover) {
      const coverSize = getDisplaySizeForCrop(imageSize, 'cover');
      baseScale = imageSize.width > 0 ? coverSize.width / imageSize.width : 1;
      effectiveScale = baseScale;
      scaledWidth = imageSize.width * effectiveScale;
      scaledHeight = imageSize.height * effectiveScale;
      pan = {x: 0, y: 0};
    }
    const offsetX = (scaledWidth - frameSize.width) / 2 - pan.x;
    const offsetY = (scaledHeight - frameSize.height) / 2 - pan.y;
    const clampedOffsetX = clampNumber(offsetX, 0, scaledWidth);
    const clampedOffsetY = clampNumber(offsetY, 0, scaledHeight);
    const cropWidth = clampNumber(
      frameSize.width,
      0,
      scaledWidth - clampedOffsetX,
    );
    const cropHeight = clampNumber(
      frameSize.height,
      0,
      scaledHeight - clampedOffsetY,
    );
    const originX = clampedOffsetX / effectiveScale;
    const originY = clampedOffsetY / effectiveScale;
    const sizeWidth = cropWidth / effectiveScale;
    const sizeHeight = cropHeight / effectiveScale;
    const maxOffsetX = Math.max(0, imageSize.width - 1);
    const maxOffsetY = Math.max(0, imageSize.height - 1);
    const safeOriginX = clampNumber(originX, 0, maxOffsetX);
    const safeOriginY = clampNumber(originY, 0, maxOffsetY);
    const maxWidth = Math.max(1, imageSize.width - safeOriginX);
    const maxHeight = Math.max(1, imageSize.height - safeOriginY);
    const safeWidth = clampNumber(sizeWidth, 1, maxWidth);
    const safeHeight = clampNumber(sizeHeight, 1, maxHeight);
    const baseCropRect = {
      offset: {x: safeOriginX, y: safeOriginY},
      size: {width: safeWidth, height: safeHeight},
    };
    const {crop: orientedCrop, rawSize} = applyOrientationToCrop(
      baseCropRect,
      imageSize,
      photo?.orientation,
    );
    const clampedCrop = clampCropToBounds(orientedCrop, rawSize);
    const cropData = {
      offset: {
        x: Math.round(clampedCrop.offset.x),
        y: Math.round(clampedCrop.offset.y),
      },
      size: {
        width: Math.round(clampedCrop.size.width),
        height: Math.round(clampedCrop.size.height),
      },
    };
    const maxCropSide = Math.max(cropData.size.width, cropData.size.height);
    let sizeScale = 1;
    if (
      Number.isFinite(photo?.fileSize) &&
      imageSize.width > 0 &&
      imageSize.height > 0
    ) {
      const bytesPerPixel =
        photo.fileSize / (imageSize.width * imageSize.height);
      const cropArea = cropData.size.width * cropData.size.height;
      const estimatedCropSize = bytesPerPixel * cropArea;
      if (estimatedCropSize > MAX_IMAGE_BYTES) {
        sizeScale = Math.min(
          1,
          Math.sqrt(MAX_IMAGE_BYTES / estimatedCropSize) * 0.92,
        );
      }
    }
    const outputScale =
      maxCropSide > 0
        ? Math.min(1, MAX_OUTPUT_DIMENSION / maxCropSide, sizeScale)
        : 1;
    const displaySize =
      outputScale < 1
        ? {
            width: Math.max(1, Math.round(cropData.size.width * outputScale)),
            height: Math.max(1, Math.round(cropData.size.height * outputScale)),
          }
        : undefined;

    try {
      const cropResult = await ImageEditor.cropImage(photo.uri, {
        ...cropData,
        ...(displaySize ? {displaySize} : {}),
      });
      const croppedUri =
        typeof cropResult === 'string' ? cropResult : cropResult?.uri;
      if (!croppedUri) {
        return photo;
      }
      const normalizedCropped = normalizeImageUri(croppedUri);
      const croppedSize = await getFileSizeBytes(normalizedCropped);
      const resizedUri =
        croppedSize && croppedSize > MAX_IMAGE_BYTES
          ? await ensureMaxFileSize(normalizedCropped, MAX_IMAGE_BYTES)
          : normalizedCropped;
      // resized size is logged inside ensureMaxFileSize
      return {
        ...photo,
        uri: resizedUri,
      };
    } catch (error) {
      return photo;
    }
  };

  useEffect(() => {
    if (!shouldLockFrame) {
      return;
    }
    const ratio =
      typeof baseFrameAspectRatio === 'number'
        ? baseFrameAspectRatio
        : baseFrame?.landscapeAspectRatio ?? 1;
    setIsPortraitPhoto(
      typeof baseFrameAspectRatio === 'number'
        ? baseFrameAspectRatio <= 1
        : baseFrame?.isPortraitPhoto ?? true,
    );
    setLandscapeAspectRatio(ratio);
  }, [
    baseFrame?.isPortraitPhoto,
    baseFrame?.landscapeAspectRatio,
    baseFrameAspectRatio,
    shouldLockFrame,
  ]);

  useEffect(() => {
    if (shouldLockFrame) {
      return;
    }
    const firstSelectedId = selectedPhotoIds[0] ?? null;
    const targetId = firstSelectedId ?? currentPhotoId;
    const targetPhoto = selectedAlbum?.photos.find(
      photo => photo.id === targetId,
    );
    if (!targetPhoto?.uri) {
      return;
    }
    let isActive = true;
    Image.getSize(
      targetPhoto.uri,
      (imgWidth, imgHeight) => {
        if (!isActive) {
          return;
        }
        if (imgWidth > 0 && imgHeight > 0) {
          const nextIsPortrait = imgHeight >= imgWidth;
          setIsPortraitPhoto(nextIsPortrait);
          setLandscapeAspectRatio(
            Math.min(imgWidth / imgHeight, MAX_LANDSCAPE_RATIO),
          );
        }
      },
      () => {
        if (isActive) {
          setIsPortraitPhoto(true);
          setLandscapeAspectRatio(1);
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [currentPhotoId, selectedAlbum, selectedPhotoIds, shouldLockFrame]);

  useEffect(() => {
    if (!selectedPhoto?.uri) {
      return;
    }
    const knownSize = getPhotoSize(selectedPhoto);
    if (knownSize) {
      setCurrentImageSize(knownSize);
      return undefined;
    }
    let isActive = true;
    Image.getSize(
      selectedPhoto.uri,
      (imgWidth, imgHeight) => {
        if (!isActive) {
          return;
        }
        if (imgWidth > 0 && imgHeight > 0) {
          setCurrentImageSize({width: imgWidth, height: imgHeight});
        }
      },
      () => {
        if (isActive) {
          setCurrentImageSize({width: 0, height: 0});
        }
      },
    );
    return () => {
      isActive = false;
    };
  }, [selectedPhoto]);

  useEffect(() => {
    if (!selectedPhotoIds.length) {
      setPreviewMode('crop');
    }
  }, [currentPhotoId, selectedPhotoIds]);

  useEffect(() => {
    if (!currentPhotoId) {
      panValue.setValue({x: 0, y: 0});
      return;
    }
    const saved = panByPhotoId[currentPhotoId];
    if (saved) {
      panValue.setValue(saved);
    } else {
      panValue.setValue({x: 0, y: 0});
    }
  }, [currentPhotoId, panByPhotoId, panValue]);

  useEffect(() => {
    if (!currentPhotoId) {
      scaleValue.setValue(1);
      setActiveScale(1);
      return;
    }
    const savedScale = scaleByPhotoId[currentPhotoId] ?? 1;
    scaleValue.setValue(savedScale);
    setActiveScale(savedScale);
  }, [currentPhotoId, scaleByPhotoId, scaleValue]);

  useEffect(() => {
    if (!canPan) {
      panValue.setValue({x: 0, y: 0});
      return;
    }
    const current = panValue.__getValue();
    const nextX = Math.max(panBounds.minX, Math.min(current.x, panBounds.maxX));
    const nextY = Math.max(panBounds.minY, Math.min(current.y, panBounds.maxY));
    if (nextX !== current.x || nextY !== current.y) {
      panValue.setValue({x: nextX, y: nextY});
    }
  }, [canPan, panBounds, panValue]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gesture) =>
          canZoom && gesture.numberActiveTouches <= 2,
        onStartShouldSetPanResponderCapture: (_, gesture) =>
          canZoom && gesture.numberActiveTouches <= 2,
        onMoveShouldSetPanResponder: (_, gesture) =>
          canZoom &&
          (gesture.numberActiveTouches > 1 ||
            (canPan && (Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2))),
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          canZoom &&
          (gesture.numberActiveTouches > 1 ||
            (canPan && (Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2))),
        onPanResponderGrant: (event, gesture) => {
          setIsPreviewScrollLocked(true);
          if (gesture.numberActiveTouches > 1) {
            const distance = getTouchDistance(event.nativeEvent.touches);
            isPinchingRef.current = true;
            pinchStartDistanceRef.current = distance;
            scaleStartRef.current = activeScale;
            return;
          }
          const current = panValue.__getValue();
          panStartRef.current = {x: current.x, y: current.y};
        },
        onPanResponderMove: (event, gesture) => {
          if (gesture.numberActiveTouches > 1) {
            const distance = getTouchDistance(event.nativeEvent.touches);
            if (!isPinchingRef.current) {
              isPinchingRef.current = true;
              pinchStartDistanceRef.current = distance;
              scaleStartRef.current = activeScale;
            }
            if (pinchStartDistanceRef.current > 0) {
              const nextScale = clampValue(
                (distance / pinchStartDistanceRef.current) *
                  scaleStartRef.current,
                MIN_PREVIEW_SCALE,
                MAX_PREVIEW_SCALE,
              );
              scaleValue.setValue(nextScale);
              setActiveScale(nextScale);
            }
            return;
          }
          if (isPinchingRef.current) {
            return;
          }
          if (!canPan) {
            return;
          }
          const nextX = Math.max(
            panBounds.minX,
            Math.min(panStartRef.current.x + gesture.dx, panBounds.maxX),
          );
          const nextY = Math.max(
            panBounds.minY,
            Math.min(panStartRef.current.y + gesture.dy, panBounds.maxY),
          );
          panValue.setValue({x: nextX, y: nextY});
        },
        onPanResponderRelease: () => {
          isPinchingRef.current = false;
          setIsPreviewScrollLocked(false);
          if (!currentPhotoId) {
            return;
          }
          const current = panValue.__getValue();
          setPanByPhotoId(prev => ({
            ...prev,
            [currentPhotoId]: {x: current.x, y: current.y},
          }));
          setScaleByPhotoId(prev => ({
            ...prev,
            [currentPhotoId]: activeScale,
          }));
        },
        onPanResponderTerminate: () => {
          isPinchingRef.current = false;
          setIsPreviewScrollLocked(false);
          if (!currentPhotoId) {
            return;
          }
          const current = panValue.__getValue();
          setPanByPhotoId(prev => ({
            ...prev,
            [currentPhotoId]: {x: current.x, y: current.y},
          }));
          setScaleByPhotoId(prev => ({
            ...prev,
            [currentPhotoId]: activeScale,
          }));
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [
      activeScale,
      canPan,
      canZoom,
      currentPhotoId,
      panBounds,
      panValue,
      scaleValue,
    ],
  );

  const mapPhotoResponse = (response, existingCount = 0) => {
    const pageInfo = response?.page_info || response?.pageInfo || {};
    return {
      photos:
        response?.edges
          ?.map((edge, index) => {
            const uri = edge?.node?.image?.uri;
            if (!uri) {
              return null;
            }
            return {
              id: `${uri}-${existingCount + index}`,
              uri,
              width: edge?.node?.image?.width ?? null,
              height: edge?.node?.image?.height ?? null,
              orientation: edge?.node?.image?.orientation ?? null,
              fileSize: edge?.node?.image?.fileSize ?? null,
            };
          })
          .filter(Boolean) || [],
      hasNextPage:
        pageInfo.has_next_page ??
        pageInfo.hasNextPage ??
        pageInfo.hasNext ??
        false,
      endCursor: pageInfo.end_cursor ?? pageInfo.endCursor ?? null,
    };
  };

  const loadAlbumPhotos = async (
    albumId,
    after = null,
    existingCount = 0,
    groupNameOverride = null,
  ) => {
    const album = albums.find(item => item.id === albumId);
    const afterCursor = after ?? album?.endCursor ?? null;
    const groupName =
      albumId === 'recent' ? null : groupNameOverride || album?.name || albumId;

    const res = await CameraRollModule.getPhotos({
      first: after ? BATCH_SIZE : PAGE_SIZE,
      assetType: 'Photos',
      after: afterCursor,
      include: ['imageSize', 'orientation', 'fileSize'],
      ...(groupName
        ? {
            groupName,
            ...(Platform.OS === 'ios' ? {groupTypes: 'Album'} : {}),
          }
        : {}),
    });

    const mapped = mapPhotoResponse(
      res,
      existingCount || album?.photos?.length || 0,
    );
    return mapped;
  };

  const prefetchAlbumAll = async (
    albumId,
    maxCount = Number.POSITIVE_INFINITY,
  ) => {
    let target = albums.find(item => item.id === albumId);
    if (!target || !target.hasNextPage) {
      return;
    }
    let cursor = target.endCursor;
    let photos = target.photos;
    let hasNext = target.hasNextPage;

    while (hasNext && photos.length < maxCount) {
      try {
        const mapped = await loadAlbumPhotos(albumId, cursor, photos.length);
        if (!mapped.photos.length) {
          break;
        }
        photos = [
          ...photos,
          ...mapped.photos.filter(
            photo => !photos.some(existing => existing.uri === photo.uri),
          ),
        ];
        cursor = mapped.endCursor;
        hasNext = mapped.hasNextPage;

        if (isMountedRef.current) {
          setAlbums(prev =>
            prev.map(item =>
              item.id === albumId
                ? {
                    ...item,
                    photos,
                    hasNextPage: hasNext,
                    endCursor: cursor,
                  }
                : item,
            ),
          );
        }
      } catch (error) {
        break;
      }
    }
  };

  const hydrateAlbums = async () => {
    if (!CameraRollModule?.getAlbums) {
      return;
    }
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) {
      return;
    }

    try {
      if (isMountedRef.current) {
        setLoading(true);
      }

      const [albumList, recentPhotos] = await Promise.all([
        CameraRollModule.getAlbums({assetType: 'Photos'}),
        loadAlbumPhotos('recent'),
      ]);

      const recent = {
        id: 'recent',
        name: '최근 항목',
        photos: recentPhotos.photos,
        hasNextPage: recentPhotos.hasNextPage,
        endCursor: recentPhotos.endCursor,
      };

      const albumsWithPhotos = await Promise.all(
        albumList.map(async album => {
          const mapped = await loadAlbumPhotos(
            album.title,
            null,
            0,
            album.title,
          );
          return {
            id: album.title,
            name: album.title,
            photos: mapped.photos,
            hasNextPage: mapped.hasNextPage,
            endCursor: mapped.endCursor,
          };
        }),
      );

      const nextAlbums = [recent, ...albumsWithPhotos];

      if (isMountedRef.current) {
        setAlbums(nextAlbums);
        if (nextAlbums.length) {
          const firstAlbum = nextAlbums[0];
          setSelectedAlbumId(firstAlbum.id);
          setSelectedPhotoIds([]);
          setCurrentPhotoId(firstAlbum.photos[0]?.id ?? null);
          // 초기 앨범은 소량(약 3배치) 먼저 예열 후 필요시 추가 로드
          setTimeout(() => {
            if (isMountedRef.current) {
              prefetchAlbumAll(firstAlbum.id, PAGE_SIZE * 3);
            }
          }, 120);
        }
      }
    } catch (error) {
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleLoadMore = async () => {
    const album = albums.find(item => item.id === selectedAlbumId);
    if (
      !album ||
      !album.hasNextPage ||
      loadingMoreAlbumIdRef.current === selectedAlbumId
    ) {
      return;
    }
    loadingMoreAlbumIdRef.current = selectedAlbumId;
    setLoadingMore(true);
    try {
      await prefetchAlbumAll(selectedAlbumId);
    } finally {
      if (isMountedRef.current) {
        setLoadingMore(false);
      }
      if (loadingMoreAlbumIdRef.current === selectedAlbumId) {
        loadingMoreAlbumIdRef.current = null;
      }
    }
  };

  const handleSelectAlbum = albumId => {
    const requestId = albumRequestIdRef.current + 1;
    albumRequestIdRef.current = requestId;
    const nextAlbum = albums.find(album => album.id === albumId);
    setSelectedAlbumId(albumId);
    if (nextAlbum?.photos?.length) {
      setSelectedPhotoIds([]);
      setCurrentPhotoId(nextAlbum.photos[0].id);
      setIsAlbumPickerOpen(false);
      return;
    }
    loadAlbumPhotos(albumId, null, 0, nextAlbum?.name || albumId)
      .then(mapped => {
        if (!isMountedRef.current) {
          return;
        }
        setAlbums(prev =>
          prev.map(item =>
            item.id === albumId
              ? {
                  ...item,
                  photos: mapped.photos,
                  hasNextPage: mapped.hasNextPage,
                  endCursor: mapped.endCursor,
                }
              : item,
          ),
        );
        if (
          albumRequestIdRef.current === requestId &&
          selectedAlbumIdRef.current === albumId
        ) {
          if (mapped.photos.length) {
            setSelectedPhotoIds([]);
            setCurrentPhotoId(mapped.photos[0]?.id ?? null);
            // 앨범 선택 시 2~3배치 선 예열 후 필요하면 onEndReached에서 계속
            setTimeout(() => {
              if (isMountedRef.current) {
                prefetchAlbumAll(albumId, PAGE_SIZE * 3);
              }
            }, 100);
          } else {
            setSelectedPhotoIds([]);
            setCurrentPhotoId(null);
          }
        }
      })
      .catch(error => {
      })
      .finally(() => setIsAlbumPickerOpen(false));
  };

  useEffect(() => {
    isMountedRef.current = true;
    hydrateAlbums();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    selectedAlbumIdRef.current = selectedAlbumId;
  }, [selectedAlbumId]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleCameraPress = async () => {
    const hasCamera = await requestCameraPermission();
    if (!hasCamera) {
      return;
    }

    try {
      const captured = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: false,
        includeExif: false,
        compressImageQuality: 0.97,
        // compressImageQuality: 0.95,
        compressImageMaxWidth: 2160,
        compressImageMaxHeight: 2160,
        ...IMAGE_PICKER_TEXTS,
      });

      if (!captured?.path) {
        return;
      }

      const savePermission = await requestPhotoPermission();
      const originalUri = normalizeImageUri(captured.path);
      const resizedUri = await ensureMaxFileSize(originalUri, MAX_IMAGE_BYTES);

      let savedUri = resizedUri;
      if (savePermission) {
        try {
          savedUri = await CameraRollModule.save(resizedUri, {type: 'photo'});
        } catch (error) {
          savedUri = resizedUri;
        }
      }

      const newPhoto = {
        id: `${savedUri}-${Date.now()}`,
        uri: savedUri,
        width: typeof captured.width === 'number' ? captured.width : undefined,
        height:
          typeof captured.height === 'number' ? captured.height : undefined,
      };

      setAlbums(prev => {
        const hasRecent = prev.some(album => album.id === 'recent');
        if (!hasRecent) {
          return [
            {
              id: 'recent',
              name: '최근 항목',
              photos: [newPhoto],
              hasNextPage: true,
              endCursor: null,
            },
            ...prev,
          ];
        }
        return prev.map(album => {
          if (album.id !== 'recent') {
            return album;
          }
          const exists = album.photos?.some(
            photo => photo.uri === newPhoto.uri,
          );
          return {
            ...album,
            photos: exists ? album.photos : [newPhoto, ...(album.photos ?? [])],
          };
        });
      });

      setSelectedAlbumId('recent');
      setSelectedPhotoIds([newPhoto.id]);
      setCurrentPhotoId(newPhoto.id);
    } catch (error) {
    }
  };

  const handleNext = async () => {
    const fallbackPhoto = selectedPhoto;
    const previewPhotoIds = selectedPhotoIds.length
      ? selectedPhotoIds
      : fallbackPhoto
      ? [fallbackPhoto.id]
      : [];
    const previewPhotos = previewPhotoIds
      .map(photoId => selectedAlbum?.photos.find(photo => photo.id === photoId))
      .filter(Boolean);
    if (!previewPhotos.length) {
      return;
    }
    if (!frameSize.width || !frameSize.height) {
      return;
    }
    setCropLoading(true);
    try {
      const croppedPhotos = [];
      const total = previewPhotos.length;
      const updateProgress = value => {
        const clamped = Math.max(0, Math.min(1, value));
        setCropProgressValue(clamped);
        cropProgressAnim.stopAnimation();
        Animated.timing(cropProgressAnim, {
          toValue: clamped,
          duration: 280,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      };
      updateProgress(0);
      for (let index = 0; index < previewPhotos.length; index += 1) {
        const photo = previewPhotos[index];
        const cropped = await cropPhotoToPreview(photo, index);
        croppedPhotos.push(cropped);
        if (total > 0) {
          updateProgress((index + 1) / total);
        }
      }
      if (returnTo === 'MyPostEditScreen') {
        const croppedUris = croppedPhotos
          .map(photo => photo?.uri)
          .filter(Boolean);
        navigation.dispatch(
          StackActions.popTo(
            returnTo,
            {
              review: returnReview,
              draft: returnDraft,
              draftToken: returnDraftToken,
              addedImages: croppedUris,
              addedImagesToken: Date.now(),
            },
            {merge: true},
          ),
        );
        return;
      }

      navigation.navigate('PostStoreInputScreen', {
        preview: {
          photos: croppedPhotos,
          previewMode,
          baseFrame: {
            isPortraitPhoto,
            landscapeAspectRatio,
          },
          panByPhotoId,
          scaleByPhotoId,
        },
        presetStore,
        reviewFlow,
      });
    } finally {
      if (isMountedRef.current) {
        setCropLoading(false);
      }
    }
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

  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);

  const togglePhotoSelection = photoId => {
    setSelectedPhotoIds(prev => {
      const isSelected = prev.includes(photoId);
      if (isSelected) {
        const nextSelected = prev.filter(id => id !== photoId);
        if (currentPhotoId === photoId) {
          const nextCurrent = nextSelected[nextSelected.length - 1] ?? null;
          setCurrentPhotoId(nextCurrent);
        }
        return nextSelected;
      }
      if (prev.length >= maxSelectablePhotos) {
        const message = `사진은 최대 10장까지 선택할 수 있어요.`;
        showToast(message, 'center');
        return prev;
      }
      if (listScrollOffsetRef.current >= width) {
        setShowOverlayPreview(true);
      }
      setCurrentPhotoId(photoId);
      return [...prev, photoId];
    });
  };

  const renderPhotoItem = ({item}) => {
    if (item.isCamera) {
      return (
        <Pressable
          style={[styles.thumbnailWrapper, styles.cameraTile]}
          onPress={handleCameraPress}>
          <FontAwesomeIcon
            name="camera"
            size={20}
            color="#333"
            style={styles.cameraicon}
          />
          <CustomText style={styles.cameraText}>카메라</CustomText>
        </Pressable>
      );
    }
    const selectedIndex = selectedPhotoIds.indexOf(item.id);
    const isSelected = selectedIndex >= 0;
    const isCurrent = item.id === currentPhotoId;
    return (
      <Pressable
        style={styles.thumbnailWrapper}
        onPress={() => {
          if (listScrollOffsetRef.current >= width) {
            setShowOverlayPreview(true);
          }
          setCurrentPhotoId(item.id);
        }}>
        <Image
          source={{uri: item.uri}}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {isCurrent && <View style={styles.selectedOverlay} />}
        <Pressable
          hitSlop={8}
          style={[
            styles.selectionCircle,
            isSelected && styles.selectionCircleActive,
          ]}
          onPress={() => togglePhotoSelection(item.id)}>
          {isSelected && (
            <CustomText style={styles.selectionOrder}>
              {selectedIndex + 1}
            </CustomText>
          )}
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.header, {paddingTop: headerTopPadding}]}
        onLayout={event => {
          const nextHeight = event.nativeEvent.layout.height;
          if (nextHeight && nextHeight !== headerHeight) {
            setHeaderHeight(nextHeight);
          }
        }}>
        <Pressable
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={handleClose}>
          <Ionicons name="close" size={24} color="#111" />
        </Pressable>

        <Pressable
          style={styles.albumSelector}
          onPress={() => setIsAlbumPickerOpen(prev => !prev)}>
          <CustomText style={styles.albumName}>
            {selectedAlbum?.name ?? '앨범'}
          </CustomText>
          <Ionicons
            name={isAlbumPickerOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#111"
          />
        </Pressable>

        <Pressable
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={handleNext}
          disabled={!isNextEnabled}
          style={!isNextEnabled && styles.nextButtonDisabled}>
          <CustomText
            style={[
              styles.nextText,
              !isNextEnabled && styles.nextTextDisabled,
            ]}>
            다음
          </CustomText>
        </Pressable>
      </View>

      {isInitialLoading ? (
        <>
          <FlatList
            ref={gridListRef}
            data={skeletonItems}
            keyExtractor={item => item}
            numColumns={4}
            renderItem={({item}) => (
              <View key={item} style={styles.thumbnailWrapper}>
                <SkeletonBox style={styles.skeletonThumbnail} />
              </View>
            )}
            columnWrapperStyle={styles.columnWrapper}
            style={styles.gridList}
            scrollEnabled={!isPreviewScrollLocked}
            ListHeaderComponent={
              <View style={styles.previewContainer}>
                <SkeletonBox style={styles.previewSkeleton} />
              </View>
            }
            contentContainerStyle={[
              styles.grid,
              {paddingTop: effectiveHeaderHeight},
            ]}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <>
          <FlatList
            ref={gridListRef}
            data={gridPhotos}
            keyExtractor={item => item.id}
            numColumns={4}
            renderItem={renderPhotoItem}
            columnWrapperStyle={styles.columnWrapper}
            style={styles.gridList}
            scrollEnabled={!isPreviewScrollLocked}
            ListHeaderComponent={
              <View style={styles.previewContainer}>
                {selectedPhoto ? (
                  <>
                    <View
                      style={[
                        styles.previewCropFrame,
                        shouldLockFrame
                          ? lockedFrameStyle
                          : isPortraitPhoto
                          ? previewMode === 'full'
                            ? styles.previewCropFrameFull
                            : styles.previewPortraitCropFrame
                          : previewMode === 'full'
                          ? styles.previewCropFrameFull
                          : styles.previewLandscapeFrame,
                        !shouldLockFrame &&
                          !isPortraitPhoto &&
                          previewMode === 'crop' && {
                            aspectRatio: clampedLandscapeRatio,
                          },
                      ]}>
                      <View
                        style={styles.previewPanArea}
                        onTouchStart={() => {
                          handlePreviewTouchStart();
                          if (listScrollOffsetRef.current >= width) {
                            setShowOverlayPreview(true);
                          }
                        }}
                        onTouchEnd={handlePreviewTouchEnd}
                        onTouchCancel={handlePreviewTouchEnd}
                        onLayout={event => {
                          const {width: nextWidth, height: nextHeight} =
                            event.nativeEvent.layout;
                          if (
                            nextWidth !== frameSize.width ||
                            nextHeight !== frameSize.height
                          ) {
                            setFrameSize({
                              width: nextWidth,
                              height: nextHeight,
                            });
                          }
                        }}
                        {...panResponder.panHandlers}>
                        <Animated.View
                          style={[
                            {
                              width: displaySize.width,
                              height: displaySize.height,
                              transform: [
                                {translateX: panValue.x},
                                {translateY: panValue.y},
                              ],
                            },
                          ]}>
                          <Animated.Image
                            source={{uri: selectedPhoto.uri}}
                            style={[
                              styles.previewImage,
                              {
                                width: displaySize.width,
                                height: displaySize.height,
                                transform: [{scale: scaleValue}],
                              },
                            ]}
                            resizeMode={effectiveResizeMode}
                          />
                        </Animated.View>
                      </View>
                    </View>
                    {isScaleModeEditable ? (
                      <Pressable
                        style={styles.scaleButtonSingle}
                        onPress={() =>
                          setPreviewMode(prev =>
                            prev === 'crop' ? 'full' : 'crop',
                          )
                        }>
                        <MaximizeIcon size={22} color="#fff" />
                      </Pressable>
                    ) : null}
                  </>
                ) : null}
              </View>
            }
            contentContainerStyle={[
              styles.grid,
              {
                paddingTop: effectiveHeaderHeight,
                paddingBottom: insets.bottom,
              },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={handleGridScroll}
            scrollEventThrottle={16}
            ListEmptyComponent={
              loading ? null : (
                <View style={styles.emptyGrid}>
                  <CustomText style={styles.emptyGridText}>
                    사진이 없습니다.
                  </CustomText>
                </View>
              )
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={1}
          />
          <Animated.View
            pointerEvents={showOverlayPreview ? 'auto' : 'none'}
            style={[
              styles.previewOverlayContainer,
              {
                top: 0,
                transform: [{translateY: overlayTranslateY}],
              },
            ]}>
            <View
              style={[
                styles.previewOverlayTouchArea,
                {paddingTop: effectiveHeaderHeight},
              ]}>
              <View style={styles.previewContainer}>
                {selectedPhoto ? (
                  <>
                    <View
                      style={[
                        styles.previewCropFrame,
                        shouldLockFrame
                          ? lockedFrameStyle
                          : isPortraitPhoto
                          ? previewMode === 'full'
                            ? styles.previewCropFrameFull
                            : styles.previewPortraitCropFrame
                          : previewMode === 'full'
                          ? styles.previewCropFrameFull
                          : styles.previewLandscapeFrame,
                        !shouldLockFrame &&
                          !isPortraitPhoto &&
                          previewMode === 'crop' && {
                            aspectRatio: clampedLandscapeRatio,
                          },
                      ]}>
                      <View
                        style={styles.previewPanArea}
                        onTouchStart={handlePreviewTouchStart}
                        onTouchEnd={handlePreviewTouchEnd}
                        onTouchCancel={handlePreviewTouchEnd}
                        onLayout={event => {
                          const {width: nextWidth, height: nextHeight} =
                            event.nativeEvent.layout;
                          if (
                            nextWidth !== frameSize.width ||
                            nextHeight !== frameSize.height
                          ) {
                            setFrameSize({
                              width: nextWidth,
                              height: nextHeight,
                            });
                          }
                        }}
                        {...panResponder.panHandlers}>
                        <Animated.View
                          style={[
                            {
                              width: displaySize.width,
                              height: displaySize.height,
                              transform: [
                                {translateX: panValue.x},
                                {translateY: panValue.y},
                              ],
                            },
                          ]}>
                          <Animated.Image
                            source={{uri: selectedPhoto.uri}}
                            style={[
                              styles.previewImage,
                              {
                                width: displaySize.width,
                                height: displaySize.height,
                                transform: [{scale: scaleValue}],
                              },
                            ]}
                            resizeMode={effectiveResizeMode}
                          />
                        </Animated.View>
                      </View>
                    </View>
                    {isScaleModeEditable ? (
                      <Pressable
                        style={styles.scaleButtonSingle}
                        onPress={() =>
                          setPreviewMode(prev =>
                            prev === 'crop' ? 'full' : 'crop',
                          )
                        }>
                        <MaximizeIcon size={22} color="#fff" />
                      </Pressable>
                    ) : null}
                  </>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </>
      )}

      {isAlbumPickerOpen && (
        <View style={styles.albumSheetWrapper}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsAlbumPickerOpen(false)}
          />
          <View style={styles.albumSheet}>
            <View style={styles.albumSheetHeader}>
              <CustomText style={styles.albumSheetTitle}>앨범 선택</CustomText>
              <Pressable
                style={styles.albumSheetClose}
                onPress={() => setIsAlbumPickerOpen(false)}>
                <Ionicons name="close" size={20} color="#1F1F1F" />
              </Pressable>
            </View>
            <View style={styles.albumSheetDivider} />
            <ScrollView
              style={styles.albumScroll}
              contentContainerStyle={styles.albumScrollContent}
              showsVerticalScrollIndicator={false}>
              {albums.map(album => (
                <Pressable
                  key={album.id}
                  style={[
                    styles.albumOption,
                    album.id === selectedAlbumId && styles.albumOptionActive,
                  ]}
                  onPress={() => handleSelectAlbum(album.id)}>
                  <CustomText style={styles.albumOptionText}>
                    {album.name}
                  </CustomText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      <PostCropLoadingOverlay
        visible={cropLoading}
        progressAnim={cropProgressAnim}
        noticeText={cropNoticeText}
      />
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
    backgroundColor: '#fff',
    zIndex: 999,
    elevation: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  albumSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  albumName: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#111',
  },
  nextText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#3CBBFF',
  },
  nextTextDisabled: {
    color: ColorUtil.mainDisable,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  previewContainer: {
    width: '100%',
    height: width,
    backgroundColor: '#DDE2E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
  },
  previewOverlayContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
  },
  previewOverlayTouchArea: {
    width: '100%',
  },
  initialContent: {
    flex: 1,
  },
  previewCropFrame: {
    overflow: 'hidden',
  },
  previewPortraitCropFrame: {
    height: '100%',
    aspectRatio: 3 / 4,
  },
  previewCropFrameFull: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
  previewLandscapeFrame: {
    width: '100%',
  },
  previewImage: {
    backgroundColor: '#DDE2E6',
  },
  previewPanArea: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSkeleton: {
    width: '100%',
    height: '100%',
  },
  scaleButtonSingle: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ColorUtil.rgba('#111111', 0.55),
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingTop: 1,
    paddingBottom: 18,
  },
  gridList: {
    flex: 1,
    minHeight: 0,
  },
  skeletonGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 1,
    paddingBottom: 1,
  },
  columnWrapper: {
    // justifyContent: 'space-between',
    justifyContent: 'flex-start',
  },
  emptyGrid: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGridText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#666',
  },
  thumbnailWrapper: {
    width: (width - 3) / 4,
    height: (width - 3) / 4,
    marginBottom: 1,
    marginRight: 1,
  },
  cameraTile: {
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    marginTop: 6,
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#666',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f3f3',
  },
  skeletonThumbnail: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  selectionCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCircleActive: {
    backgroundColor: '#3CBBFF',
  },
  selectionOrder: {
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  albumSheetWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    paddingTop: 70,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1000,
    // elevation: 12,
  },
  albumSheet: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEF1F4',
    overflow: 'hidden',
  },
  albumSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FBFCFD',
  },
  albumSheetTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    color: '#1F1F1F',
  },
  albumSheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  albumSheetDivider: {
    height: 1,
    backgroundColor: '#EFF2F5',
  },
  albumScroll: {
    maxHeight: Math.min(420, height * 0.55),
  },
  albumScrollContent: {
    paddingVertical: 4,
  },
  albumOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: '#F2F4F6',
  },
  albumOptionActive: {
    backgroundColor: '#F5FBFF',
  },
  albumOptionText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    color: '#111',
  },
});

export default PostPhotoSelectScreen;
