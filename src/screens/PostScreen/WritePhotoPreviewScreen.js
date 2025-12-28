import React from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  TextInput,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import FastImage from 'react-native-fast-image';
import ColorUtil from '../../utils/ColorUtil';

const {width} = Dimensions.get('window');
const MAX_LANDSCAPE_RATIO = 16 / 9;
const WritePhotoPreviewScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const preview = route?.params?.preview ?? {};
  const photos = Array.isArray(preview.photos) ? preview.photos : [];
  const previewMode = preview.previewMode ?? 'crop';
  const baseFrame = preview.baseFrame ?? {};
  const baseIsPortraitPhoto = baseFrame.isPortraitPhoto ?? true;
  const baseLandscapeAspectRatio = baseFrame.landscapeAspectRatio ?? 1;
  const hasMultiplePhotos = photos.length > 1;
  const previewItemWidth = hasMultiplePhotos ? width * 0.86 : width;
  const previewSidePadding = hasMultiplePhotos ? 6 : 20;
  const previewItemSpacing = hasMultiplePhotos ? 2 : 0;
  const clampedLandscapeRatio = Math.min(
    baseLandscapeAspectRatio || 1,
    MAX_LANDSCAPE_RATIO,
  );
  const previewAspectRatio =
    previewMode === 'full'
      ? 1
      : baseIsPortraitPhoto
      ? 3 / 4
      : clampedLandscapeRatio;

  const renderPhoto = ({item, index}) => {
    const isLast = index === photos.length - 1;

    return (
      <View
        style={[
          styles.previewItem,
          {
            width: previewItemWidth,
            paddingHorizontal: previewSidePadding,
            marginRight: isLast ? 0 : previewItemSpacing,
          },
        ]}>
        <View style={[styles.previewStage, {aspectRatio: previewAspectRatio}]}>
          <FastImage
            source={{uri: item.uri}}
            style={styles.previewImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      </View>
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
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#111" />
        </Pressable>
        <CustomText style={styles.headerTitle}>매장 입력</CustomText>
        <Pressable
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => {}}>
          <CustomText style={styles.nextText}>다음</CustomText>
        </Pressable>
      </View>

      {photos.length ? (
        <FlatList
          data={photos}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderPhoto}
          contentContainerStyle={
            hasMultiplePhotos ? styles.previewList : undefined
          }
        />
      ) : (
        <View
          style={[
            styles.previewItem,
            {
              width: previewItemWidth,
              paddingHorizontal: previewSidePadding,
            },
          ]}>
          <View style={styles.previewStage}>
            <View style={styles.emptyState}>
              <CustomText style={styles.emptyText}>
                미리볼 사진이 없습니다.
              </CustomText>
            </View>
          </View>
        </View>
      )}

      <View
        style={[
          styles.bottomSheet,
          {paddingBottom: Math.max(insets.bottom, 12)},
        ]}>
        <View style={styles.sheetHandle} />
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color="#7A7A7A" />
          <TextInput
            style={styles.searchInput}
            placeholder="상품명, 브랜드를 검색하세요."
            placeholderTextColor="#9B9B9B"
          />
        </View>
        <View style={styles.chipRow}>
          <Pressable style={[styles.chip, styles.chipActive]}>
            <CustomText style={styles.chipActiveText}>최근 구매한</CustomText>
          </Pressable>
          <Pressable style={styles.chip}>
            <CustomText style={styles.chipText}>최근 태그한</CustomText>
          </Pressable>
          <Pressable style={styles.chip}>
            <CustomText style={styles.chipText}>최근 스크랩한</CustomText>
          </Pressable>
          <Pressable style={styles.chipGhost}>
            <CustomText style={styles.chipGhostText}>직접 입력</CustomText>
            <Ionicons name="create-outline" size={16} color="#4AA3FF" />
          </Pressable>
        </View>
      </View>
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
    color: '#111',
  },
  nextText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#4AA3FF',
  },
  previewItem: {
    paddingTop: 24,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  previewList: {
    paddingHorizontal: 12,
  },
  previewStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ColorUtil.border,
    borderRadius: 7,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DDE2E6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#666',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: -4},
    elevation: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E4E4E4',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#111',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#222',
    borderColor: '#222',
  },
  chipText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#333',
  },
  chipActiveText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#fff',
  },
  chipGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#EEF6FF',
  },
  chipGhostText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#4AA3FF',
  },
});

export default WritePhotoPreviewScreen;
