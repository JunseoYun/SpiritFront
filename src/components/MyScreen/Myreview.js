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
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {PostMyGet} from '../../api/reviewApi';
import Loading from '../../hooks/Loading';
import CustomText from '../../utils/CustomText';

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
    const [refreshing, setRefreshing] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const [totalpage, setTotalpage] = useState(0);

    const cellSize = useMemo(
      () => (screenWidth - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS,
      [screenWidth],
    );

    const myReviewsget = async (currentPage, reset = false) => {
      if (!reset) {
        setLoading(true);
      }
      try {
        const data = await PostMyGet(currentPage);
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
      }
    };

    useFocusEffect(
      useCallback(() => {
        if (myReview.length === 0) {
          setPage(0);
          setIsEnd(false);
          myReviewsget(0, true);
        }
      }, [myReview.length]),
    );

    useEffect(() => {
      onCountChange?.(myReview.length);
    }, [myReview.length, onCountChange]);

    useEffect(() => {
      onRefreshingChange?.(refreshing);
    }, [refreshing, onRefreshingChange]);

    const rows = useMemo(() => {
      const result = [];
      for (let i = 0; i < myReview.length; i += GRID_COLUMNS) {
        result.push(myReview.slice(i, i + GRID_COLUMNS));
      }
      return result;
    }, [myReview]);

    const handleOpenDetail = review => {
      const imageUrl = review?.postImgUrlList?.[0] || review?.imgUrlList?.[0];
      const rootNavigation =
        navigation.getParent?.()?.getParent?.() ??
        navigation.getParent?.() ??
        navigation;
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
            const imageUrl =
              review?.postImgUrlList?.[0] || review?.imgUrlList?.[0];
            return (
              <Pressable
                key={review?.id ?? `empty-${index}-${idx}`}
                onPress={() => review && handleOpenDetail(review)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  marginRight: isLast ? 0 : GRID_GAP,
                  backgroundColor: '#f1f1f1',
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
          ) : !loading ? (
            <View style={styles.footer}>
              <CustomText style={styles.emptyText}>
                게시글이 없습니다.
              </CustomText>
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
  },
  row: {
    flexDirection: 'row',
    marginTop: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default MyReview;
