import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CameraRollDefault, {
  CameraRoll as CameraRollNamed,
} from '@react-native-camera-roll/camera-roll';
import ImageEditor from '@react-native-community/image-editor';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import SkeletonBox from '../../hooks/SkeletonBox';
import MaximizeIcon from '../../assets/svg/MaximizeIcon';
import {requestPhotoPermission} from '../../hooks/usePhotopermis';

const {width} = Dimensions.get('window');
const CameraRollModule = CameraRollNamed || CameraRollDefault;
const PAGE_SIZE = 40;
const BATCH_SIZE = 80;
const MIN_PREVIEW_SCALE = 1;
const MAX_PREVIEW_SCALE = 3;
const MAX_LANDSCAPE_RATIO = 16 / 9;

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

const WritePhotoSelectScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
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
  const panValue = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const panStartRef = useRef({x: 0, y: 0});
  const scaleStartRef = useRef(1);
  const pinchStartDistanceRef = useRef(0);
  const isPinchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const albumRequestIdRef = useRef(0);
  const selectedAlbumIdRef = useRef(null);
  const loadingMoreAlbumIdRef = useRef(null);

  const selectedAlbum = useMemo(
    () => albums.find(album => album.id === selectedAlbumId),
    [albums, selectedAlbumId],
  );
  const skeletonItems = useMemo(
    () => Array.from({length: 12}, (_, index) => `skeleton-${index}`),
    [],
  );

  const selectedPhoto = useMemo(() => {
    const fallbackId =
      selectedPhotoIds.length > 0
        ? selectedPhotoIds[selectedPhotoIds.length - 1]
        : null;
    const targetId = currentPhotoId ?? fallbackId;
    return selectedAlbum?.photos.find(photo => photo.id === targetId);
  }, [selectedAlbum, selectedPhotoIds, currentPhotoId]);
  const isScaleModeEditable = useMemo(() => {
    const firstSelectedId = selectedPhotoIds[0] ?? null;
    if (!firstSelectedId) {
      return Boolean(currentPhotoId);
    }
    return currentPhotoId === firstSelectedId;
  }, [currentPhotoId, selectedPhotoIds]);
  const isInitialLoading =
    loading && (!selectedAlbum || !(selectedAlbum?.photos?.length > 0));

  const rawImageAspectRatio = useMemo(() => {
    if (!currentImageSize.width || !currentImageSize.height) {
      return 1;
    }
    return currentImageSize.width / currentImageSize.height;
  }, [currentImageSize]);

  const isUltraWideLandscape =
    !isPortraitPhoto && rawImageAspectRatio > MAX_LANDSCAPE_RATIO;

  const effectiveResizeMode = useMemo(() => {
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
  }, [isPortraitPhoto, isScaleModeEditable, isUltraWideLandscape, previewMode]);

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

  const clampedLandscapeRatio = useMemo(
    () => Math.min(landscapeAspectRatio || 1, MAX_LANDSCAPE_RATIO),
    [landscapeAspectRatio],
  );

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

  const getImageSize = uri =>
    new Promise(resolve => {
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

  const cropPhotoToPreview = async (photo, index) => {
    if (!photo?.uri || typeof photo.uri !== 'string') {
      return photo;
    }
    const imageSize = await getImageSize(photo.uri);
    if (!imageSize.width || !imageSize.height) {
      return photo;
    }
    const rawImageAspectRatio = imageSize.width / imageSize.height;
    const isUltraWideLandscape =
      !isPortraitPhoto && rawImageAspectRatio > MAX_LANDSCAPE_RATIO;
    const isScaleModeEditable = index === 0;
    const resizeMode =
      previewMode === 'full'
        ? 'cover'
        : isPortraitPhoto || isUltraWideLandscape
        ? 'cover'
        : isScaleModeEditable
        ? 'contain'
        : 'cover';

    const displaySizeForCrop = getDisplaySizeForCrop(imageSize, resizeMode);
    const baseScale =
      imageSize.width > 0 ? displaySizeForCrop.width / imageSize.width : 1;
    const photoScale = scaleByPhotoId[photo.id] ?? 1;
    const effectiveScale = baseScale * photoScale;
    if (!effectiveScale) {
      return photo;
    }
    const scaledWidth = imageSize.width * effectiveScale;
    const scaledHeight = imageSize.height * effectiveScale;
    const pan = panByPhotoId[photo.id] ?? {x: 0, y: 0};
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
    const cropData = {
      offset: {
        x: Math.round(safeOriginX),
        y: Math.round(safeOriginY),
      },
      size: {
        width: Math.round(safeWidth),
        height: Math.round(safeHeight),
      },
    };

    try {
      const cropResult = await ImageEditor.cropImage(photo.uri, cropData);
      const croppedUri =
        typeof cropResult === 'string' ? cropResult : cropResult?.uri;
      if (!croppedUri) {
        return photo;
      }
      return {
        ...photo,
        uri: normalizeImageUri(croppedUri),
      };
    } catch (error) {
      console.warn('사진 크롭 실패', error);
      return photo;
    }
  };

  useEffect(() => {
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
  }, [currentPhotoId, selectedAlbum, selectedPhotoIds]);

  useEffect(() => {
    if (!selectedPhoto?.uri) {
      return;
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
        onMoveShouldSetPanResponder: (_, gesture) =>
          canZoom &&
          (gesture.numberActiveTouches > 1 ||
            (canPan && (Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2))),
        onPanResponderGrant: (event, gesture) => {
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
        console.warn('사진 사전 로드 실패', error);
        break;
      }
    }
  };

  const hydrateAlbums = async () => {
    if (!CameraRollModule?.getAlbums) {
      console.warn('CameraRoll native 모듈을 찾을 수 없습니다.');
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
      console.warn('사진첩 불러오기 실패', error);
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
        console.warn('사진 로드 실패', error);
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
    const croppedPhotos = await Promise.all(
      previewPhotos.map((photo, index) => cropPhotoToPreview(photo, index)),
    );
    navigation.navigate('WritePhotoPreviewScreen', {
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
    });
  };

  const togglePhotoSelection = photoId => {
    setSelectedPhotoIds(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      }
      return [...prev, photoId];
    });
    setCurrentPhotoId(photoId);
  };

  const renderPhotoItem = ({item}) => {
    const selectedIndex = selectedPhotoIds.indexOf(item.id);
    const isSelected = selectedIndex >= 0;
    const isCurrent = item.id === currentPhotoId;
    return (
      <Pressable
        style={styles.thumbnailWrapper}
        onPress={() => setCurrentPhotoId(item.id)}>
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
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0)},
      ]}>
      <View style={styles.header}>
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
          onPress={handleNext}>
          <CustomText style={styles.nextText}>다음</CustomText>
        </Pressable>
      </View>

      {isInitialLoading ? (
        <>
          <View style={styles.previewContainer}>
            <SkeletonBox style={styles.previewSkeleton} />
          </View>
          <View style={styles.skeletonGrid}>
            {skeletonItems.map(key => (
              <View key={key} style={styles.thumbnailWrapper}>
                <SkeletonBox style={styles.skeletonThumbnail} />
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.previewContainer}>
            {selectedPhoto ? (
              <>
                <View
                  style={[
                    styles.previewCropFrame,
                    isPortraitPhoto
                      ? previewMode === 'full'
                        ? styles.previewCropFrameFull
                        : styles.previewPortraitCropFrame
                      : previewMode === 'full'
                      ? styles.previewCropFrameFull
                      : styles.previewLandscapeFrame,
                    !isPortraitPhoto &&
                      previewMode === 'crop' && {
                        aspectRatio: clampedLandscapeRatio,
                      },
                  ]}>
                  <View
                    style={styles.previewPanArea}
                    onLayout={event => {
                      const {width: nextWidth, height: nextHeight} =
                        event.nativeEvent.layout;
                      if (
                        nextWidth !== frameSize.width ||
                        nextHeight !== frameSize.height
                      ) {
                        setFrameSize({width: nextWidth, height: nextHeight});
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

          <FlatList
            data={selectedAlbum?.photos ?? []}
            keyExtractor={item => item.id}
            numColumns={4}
            renderItem={renderPhotoItem}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
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
        </>
      )}

      {isAlbumPickerOpen && (
        <View style={styles.albumSheetWrapper}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsAlbumPickerOpen(false)}
          />
          <View style={styles.albumSheet}>
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
          </View>
        </View>
      )}
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
  previewContainer: {
    width: '100%',
    height: width,
    backgroundColor: '#DDE2E6',
    alignItems: 'center',
    justifyContent: 'center',
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
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 1,
    paddingBottom: 18,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
  },
  albumSheet: {
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  albumOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
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

export default WritePhotoSelectScreen;
