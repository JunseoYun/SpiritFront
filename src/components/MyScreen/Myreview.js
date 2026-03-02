import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  StyleSheet,
  useWindowDimensions,
  View,
  Pressable,
  Image,
  DeviceEventEmitter,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {PostMyGet} from '../../api/reviewApi';
import Loading from '../../hooks/Loading';
import SkeletonBox from '../../hooks/SkeletonBox';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import Layer2Icon from '../../assets/svg/Layer2Icon';

const GRID_COLUMNS = 3;
const GRID_GAP = 1;

const MyReview = forwardRef(
  (
    {
      navigation,
      onCountChange,
      userProfile,
      onRefreshingChange,
      onContentLayout,
    },
    ref,
  ) => {
    const {width: screenWidth} = useWindowDimensions();
    const [myReview, setMyReview] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [totalpage, setTotalpage] = useState(0);

    const cellSize = useMemo(
      () => (screenWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
      [screenWidth],
    );

    const myReviewsget = async (currentPage, reset = false, isInitial = false) => {
      if (isInitial) {
        setInitialLoading(true);
      }
      if (!reset) {
        setLoading(true);
      }
      try {
        const data = await PostMyGet(currentPage);
        // console.log(data);
        setTotalpage(data.totalPages);
        if (data.content.length === 0) {
          setIsEnd(true);
        } else {
          setMyReview(prevReviews => {
            const merged = reset
              ? data.content
              : [...prevReviews, ...data.content];
            const unique = Array.from(
              new Map(merged.map(review => [review.id, review])).values(),
            );
            return unique;
          });
        }
      } catch (err) {
        console.error('Failed to load reviews:', err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
        if (isInitial) {
          setInitialLoading(false);
        }
      }
    };

    useFocusEffect(
      useCallback(() => {
        if (myReview.length === 0) {
          setPage(0);
          setIsEnd(false);
          myReviewsget(0, true, true);
        }
      }, [myReview.length]),
    );

    useEffect(() => {
      onCountChange?.(myReview.length);
    }, [myReview.length, onCountChange]);

    useEffect(() => {
      onRefreshingChange?.(refreshing);
    }, [refreshing, onRefreshingChange]);

    useEffect(() => {
      const likeSub = DeviceEventEmitter.addListener(
        'post-like-updated',
        payload => {
          const targetId = payload?.postId;
          if (!targetId) {
            return;
          }
          setMyReview(prev =>
            prev.map(item => {
              if (String(item?.id) !== String(targetId)) {
                return item;
              }
              const nextLikes =
                payload?.likeCount ?? item?.likeCount ?? item?.likes ?? 0;
              return {
                ...item,
                isLiked: payload?.liked ?? item?.isLiked ?? false,
                likeCount: nextLikes,
                likes: nextLikes,
              };
            }),
          );
        },
      );
      const savedSub = DeviceEventEmitter.addListener(
        'post-saved-updated',
        payload => {
          const targetId = payload?.postId;
          if (!targetId) {
            return;
          }
          setMyReview(prev =>
            prev.map(item =>
              String(item?.id) === String(targetId)
                ? {
                    ...item,
                    isSaved: payload?.saved ?? item?.isSaved ?? false,
                  }
                : item,
            ),
          );
        },
      );
      const editSub = DeviceEventEmitter.addListener(
        'post-updated',
        payload => {
          const updated = payload?.review;
          if (!updated?.id) {
            return;
          }
          setMyReview(prev =>
            prev.map(item =>
              String(item?.id) === String(updated.id)
                ? {
                    ...item,
                    ...updated,
                    content: updated.content ?? item?.content ?? '',
                    rate:
                      updated.rate ??
                      updated.rating ??
                      item?.rate ??
                      item?.rating ??
                      0,
                    postImgUrlList:
                      updated.postImgUrlList ??
                      updated.imgUrlList ??
                      item?.postImgUrlList ??
                      item?.imgUrlList ??
                      [],
                    imgUrlList:
                      updated.imgUrlList ??
                      updated.postImgUrlList ??
                      item?.imgUrlList ??
                      item?.postImgUrlList ??
                      [],
                  }
                : item,
            ),
          );
        },
      );
      return () => {
        likeSub.remove();
        savedSub.remove();
        editSub.remove();
      };
    }, []);

    const rows = useMemo(() => {
      const result = [];
      for (let i = 0; i < myReview.length; i += GRID_COLUMNS) {
        result.push(myReview.slice(i, i + GRID_COLUMNS));
      }
      return result;
    }, [myReview]);

    const skeletonRows = useMemo(() => {
      const items = Array.from({length: 9}, (_, index) => index);
      const result = [];
      for (let i = 0; i < items.length; i += GRID_COLUMNS) {
        result.push(items.slice(i, i + GRID_COLUMNS));
      }
      return result;
    }, []);

    const getRootNavigation = () =>
      navigation.getParent?.()?.getParent?.() ??
      navigation.getParent?.() ??
      navigation;

    const handleOpenDetail = review => {
      const imageUrl = review?.postImgUrlList?.[0] || review?.imgUrlList?.[0];
      const rootNavigation = getRootNavigation();
      const foundIndex = myReview.findIndex(item => item?.id === review?.id);
      const initialIndex = foundIndex >= 0 ? foundIndex : 0;
      if (!imageUrl) {
        rootNavigation?.navigate('MyPostDetailScreen', {
          posts: myReview,
          initialIndex,
          userProfile,
        });
        return;
      }

      Image.getSize(
        imageUrl,
        (width, height) => {
          const ratio = width && height ? width / height : 1;
          rootNavigation?.navigate('MyPostDetailScreen', {
            posts: myReview,
            initialIndex,
            userProfile,
            initialImageRatio: ratio,
          });
        },
        () => {
          rootNavigation?.navigate('MyPostDetailScreen', {
            posts: myReview,
            initialIndex,
            userProfile,
          });
        },
      );
    };

    const handleWritePost = () => {
      const rootNavigation = getRootNavigation();
      rootNavigation?.navigate('PostPhotoSelectScreen');
    };

    const handleRefresh = () => {
      if (refreshing) return;
      setRefreshing(true);
      setIsEnd(false);
      setPage(0);
      myReviewsget(0, true);
    };

    const loadMore = () => {
      if (loading || isEnd || page >= totalpage - 1) {
        return;
      }
      const nextPage = page + 1;
      setPage(nextPage);
      myReviewsget(nextPage, false);
    };

    useImperativeHandle(
      ref,
      () => ({
        refresh: handleRefresh,
        loadMore,
      }),
      [handleRefresh, loadMore],
    );

    const renderRow = ({item: row, index}) => {
      return (
        <View style={[styles.row, {marginBottom: GRID_GAP}]}>
          {row.map((review, idx) => {
            const isLast = idx === row.length - 1;
            const imageList =
              review?.postImgUrlList || review?.imgUrlList || [];
            const imageUrl = imageList[0];
            const hasMultipleImages = imageList.length > 1;
            return (
              <Pressable
                key={review?.id ?? `empty-${index}-${idx}`}
                onPress={() => review && handleOpenDetail(review)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  marginRight: isLast ? 0 : GRID_GAP,
                  backgroundColor: '#f1f1f1',
                  position: 'relative',
                }}>
                <FastImage
                  source={
                    imageUrl
                      ? {uri: imageUrl}
                      : require('../../assets/default_store6.png')
                  }
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.cover}
                />
                {hasMultipleImages ? (
                  <View style={styles.multiImageBadge}>
                    <Layer2Icon size={12} color="#fff" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      );
    };

    return (
      <>
        <View style={styles.content} onLayout={onContentLayout}>
          {rows.length > 0 ? (
            rows.map((row, index) => (
              <View key={`row-${index}`}>{renderRow({item: row, index})}</View>
            ))
          ) : initialLoading ? (
            <View style={styles.skeletonContainer}>
              {skeletonRows.map((row, rowIndex) => (
                <View
                  key={`skeleton-row-${rowIndex}`}
                  style={[styles.row, {marginBottom: GRID_GAP}]}>
                  {row.map((item, idx) => {
                    const isLast = idx === row.length - 1;
                    return (
                      <SkeletonBox
                        key={`skeleton-${rowIndex}-${item}`}
                        style={[
                          styles.skeletonItem,
                          {
                            width: cellSize,
                            height: cellSize,
                            marginRight: isLast ? 0 : GRID_GAP,
                          },
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          ) : !loading ? (
            <View style={styles.footer}>
              <CustomText style={styles.emptyTitle}>
                아직 게시글이 없어요.
              </CustomText>

              <Pressable style={styles.writeButton} onPress={handleWritePost}>
                <CustomText style={styles.writeButtonText}>
                  게시글 작성하기
                </CustomText>
              </Pressable>
            </View>
          ) : null}
        </View>
        <Loading loading={loading} />
      </>
    );
  },
);

const styles = StyleSheet.create({
  content: {
    paddingBottom: 30,
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  multiImageBadge: {
    position: 'absolute',
    top: 8,
    right: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    paddingTop: 1,
  },
  skeletonItem: {
    borderRadius: 0,
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    width: '100%',
    color: '#c0c0c0',
  },

  writeButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  writeButtonText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: ColorUtil.main,
  },
});

export default MyReview;
