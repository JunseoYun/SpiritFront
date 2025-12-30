import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  SectionList,
  StyleSheet,
  useWindowDimensions,
  View,
  Pressable,
  Platform,
  RefreshControl,
  Image,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {ReviewRecentGet} from '../../api/reviewApi';
import Loading from '../../hooks/Loading';
import CustomText from '../../utils/CustomText';

const GRID_COLUMNS = 3;
const GRID_GAP = 1;

const MyReview = ({
  navigation,
  headerComponent,
  tabComponent,
  onCountChange,
  userProfile,
}) => {
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
      const data = await ReviewRecentGet(currentPage);
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
      console.error('리뷰 로딩 실패:', err.message);
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

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < myReview.length; i += GRID_COLUMNS) {
      result.push(myReview.slice(i, i + GRID_COLUMNS));
    }
    return result;
  }, [myReview]);

  const handleOpenDetail = review => {
    const imageUrl = review?.imgUrlList?.[0];
    const rootNavigation =
      navigation.getParent?.()?.getParent?.() ??
      navigation.getParent?.() ??
      navigation;
    if (!imageUrl) {
      rootNavigation?.navigate('MyPostDetailScreen', {
        review,
        userProfile,
      });
      return;
    }

    Image.getSize(
      imageUrl,
      (width, height) => {
        const ratio = width && height ? width / height : 1;
        rootNavigation?.navigate('MyPostDetailScreen', {
          review,
          userProfile,
          initialImageRatio: ratio,
        });
      },
      () => {
        rootNavigation?.navigate('MyPostDetailScreen', {
          review,
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

  const renderRow = ({item: row, index}) => {
    return (
      <View style={[styles.row, {marginBottom: GRID_GAP}]}>
        {row.map((review, idx) => {
          const isLast = idx === row.length - 1;
          const imageUrl = review?.imgUrlList?.[0];
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
      <SectionList
        sections={[{title: 'tabs', data: rows}]}
        keyExtractor={(item, index) => `row-${index}`}
        renderItem={renderRow}
        renderSectionHeader={() =>
          tabComponent ? (
            <View style={styles.tabHeader}>{tabComponent}</View>
          ) : null
        }
        ListHeaderComponent={headerComponent || null}
        stickySectionHeadersEnabled
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          if (!loading && !isEnd && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1;
              myReviewsget(nextPage, false);
              return nextPage;
            });
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && myReview.length === 0 ? (
            <View style={styles.footer}>
              <CustomText style={styles.emptyText}>
                등록한 게시글이 없어요
              </CustomText>
            </View>
          ) : null
        }
        contentContainerStyle={styles.content}
      />
      <Loading loading={loading} />
    </>
  );
};

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
  tabHeader: {
    backgroundColor: '#fff',
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
