import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import PostItem from '../../components/Post/PostItem';
import PostItemSkeleton from '../../components/Post/PostItemSkeleton';
import PostCommentSheet from '../../components/Post/PostCommentSheet';
import Loading from '../../hooks/Loading';

const defaultProfile = require('../../assets/default_profile.png');
const defaultStoreImage = require('../../assets/default_store6.png');

const LikeSavedPostDetailScreen = ({route}) => {
  const {
    posts: routePosts = [],
    initialIndex: routeInitialIndex = 0,
    userProfile,
  } = route.params || {};
  const listRef = useRef(null);
  const [showList, setShowList] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [listLaidOut, setListLaidOut] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(routeInitialIndex);
  const currentIndexRef = useRef(routeInitialIndex);
  const screenWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();
  const listReadyRef = useRef(false);
  const previewReadyRef = useRef(false);
  const scrollRequestedRef = useRef(false);
  const pendingLastScrollRef = useRef(false);
  const contentMeasuredRef = useRef(false);
  const initialScrollDoneRef = useRef(false);
  const [contentMeasured, setContentMeasured] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const commentSheetRef = useRef(null);
  const commentSheetSnapPoints = useMemo(
    () => ['70%', Math.max(0, Dimensions.get('window').height - insets.top)],
    [insets.top],
  );

  const posts = useMemo(() => {
    if (!Array.isArray(routePosts)) {
      return [];
    }
    return routePosts;
  }, [routePosts]);

  const initialIndex = useMemo(() => {
    if (!posts.length) return 0;
    const safeIndex = Number.isFinite(routeInitialIndex)
      ? routeInitialIndex
      : 0;
    return Math.min(Math.max(safeIndex, 0), posts.length - 1);
  }, [posts.length, routeInitialIndex]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    currentIndexRef.current = initialIndex;
    initialScrollDoneRef.current = false;
    setInitialScrollDone(false);
  }, [initialIndex]);

  const fallbackImageUri = useMemo(
    () => Image.resolveAssetSource(defaultStoreImage).uri,
    [],
  );

  const feedItems = useMemo(
    () =>
      posts.map((post, index) => {
        const postImages = Array.isArray(post?.postImgUrlList)
          ? post.postImgUrlList.filter(Boolean)
          : Array.isArray(post?.imgUrlList)
          ? post.imgUrlList.filter(Boolean)
          : [];
        const finalImages =
          postImages.length > 0 ? postImages : [fallbackImageUri];
        return {
          id: post?.id ?? `saved-${index}`,
          storeId: post?.storeId ?? post?.store?.id ?? null,
          shareLink: post?.shareLink,
          profileImage: userProfile?.imageuri,
          nickname: userProfile?.nickname || '',
          storeAddress:
            post?.storeAddress || post?.address || post?.storeName || '',
          name: post?.storeName || '',
          content: '너무 맛있습니다',
          postImages: finalImages,
          likes: post?.likes ?? 0,
          comments: post?.comments ?? 0,
          shares: post?.shares ?? 0,
          isWriter: true,
          __sourceReview: post,
        };
      }),
    [fallbackImageUri, posts, userProfile?.imageuri, userProfile?.nickname],
  );

  const skeletonItems = useMemo(
    () => Array.from({length: 2}, (_, index) => `skeleton-${index}`),
    [],
  );
  const showSkeleton = (!showList && feedItems.length > 0) || isTransitioning;
  const commentList = useMemo(() => {
    if (!selectedFeed) {
      return [];
    }

    return [
      {
        id: 'c1',
        author: selectedFeed?.nickname ?? '게스트',
        profileImage:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        text: '방금 본 메뉴 정말 맛있어보여요!',
        createdAt: '방금 전',
        likes: 2,
      },
      {
        id: 'c2',
        author: '렌디에',
        profileImage: null,
        text: '언제 가볼게요 주말에 갈게요!',
        createdAt: '1시간 전',
        likes: 8,
      },
      {
        id: 'c3',
        author: '카페어딜까',
        profileImage:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
        text: '분위기 궁금했는데 사진으로 잘 담았네요. 공유 감사!',
        createdAt: '어제',
        likes: 14,
      },
    ];
  }, [selectedFeed]);

  useEffect(() => {
    const nextState = {};
    commentList.forEach(comment => {
      nextState[comment.id] = false;
    });
    setCommentLikeState(nextState);
  }, [commentList]);

  const handleCommentLikeToggle = useCallback(commentId => {
    setCommentLikeState(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const formatLikeCount = useCallback(value => {
    if (!Number.isFinite(value)) {
      return '0';
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `${value}`;
  }, []);

  const handleOpenCommentSheet = useCallback(feed => {
    setSelectedFeed(feed);
    requestAnimationFrame(() => {
      commentSheetRef.current?.present();
    });
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    DeviceEventEmitter.emit('feed-more-menu-close');
  }, []);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    const first = viewableItems?.[0];
    if (first?.index !== undefined) {
      if (currentIndexRef.current !== first.index) {
        currentIndexRef.current = first.index;
        setCurrentIndex(first.index);
      }
    }
    if (!initialScrollDoneRef.current) {
      const targetIndex = initialIndex;
      const hasTarget = viewableItems?.some(
        viewable => viewable?.index === targetIndex,
      );
      if (hasTarget) {
        initialScrollDoneRef.current = true;
        setInitialScrollDone(true);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;
  const isLastIndex = currentIndex === feedItems.length - 1;

  const handleScrollToIndexFailed = useCallback(
    info => {
      const wait = new Promise(resolve => setTimeout(resolve, 120));
      wait.then(() => {
        if (!listRef.current) return;
        const viewPosition = info.index === feedItems.length - 1 ? 1 : 0;
        const fallback =
          typeof info.averageItemLength === 'number' &&
          info.averageItemLength > 0
            ? info.averageItemLength
            : screenWidth;
        listRef.current.scrollToOffset({
          offset: fallback * info.index,
          animated: false,
        });
        setTimeout(() => {
          if (!listRef.current) return;
          listRef.current.scrollToIndex({
            index: info.index,
            animated: false,
            viewPosition,
          });
        }, 80);
      });
    },
    [feedItems.length, screenWidth],
  );

  const requestShowList = useCallback(() => {
    if (showList) {
      return;
    }
    setShowList(true);
  }, [showList]);

  const scrollToInitial = useCallback(() => {
    if (scrollRequestedRef.current) {
      return;
    }
    scrollRequestedRef.current = true;
    if (!listRef.current) {
      requestShowList();
      return;
    }
    if (initialIndex > 0) {
      const viewPosition = initialIndex === feedItems.length - 1 ? 1 : 0;
      listRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition,
      });
    }
    requestShowList();
  }, [feedItems.length, initialIndex, requestShowList]);

  const tryStartList = useCallback(() => {
    if (showList) {
      return;
    }
    if (listReadyRef.current && previewReadyRef.current) {
      scrollToInitial();
    }
  }, [scrollToInitial, showList]);

  useEffect(() => {
    setShowList(false);
    setIsTransitioning(true);
    setListLaidOut(false);
    listReadyRef.current = false;
    previewReadyRef.current = false;
    scrollRequestedRef.current = false;
    contentMeasuredRef.current = false;
    setContentMeasured(false);
    initialScrollDoneRef.current = false;
    setInitialScrollDone(false);
  }, [feedItems.length, initialIndex]);

  useEffect(() => {
    if (!feedItems.length) {
      setShowList(true);
      setIsTransitioning(false);
    }
  }, [feedItems.length]);

  const handleSelectedLoaded = useCallback(() => {
    previewReadyRef.current = true;
    tryStartList();
  }, [tryStartList]);

  const handleSelectedLayout = useCallback(() => {
    previewReadyRef.current = true;
    tryStartList();
  }, [tryStartList]);

  const handleListLayout = useCallback(() => {
    listReadyRef.current = true;
    setListLaidOut(true);
    tryStartList();
  }, [tryStartList]);

  const ensureLastItemPinned = useCallback(() => {
    if (!listRef.current || !feedItems.length) {
      return;
    }
    if (currentIndex !== feedItems.length - 1) {
      return;
    }
    if (pendingLastScrollRef.current) {
      return;
    }
    pendingLastScrollRef.current = true;
    requestAnimationFrame(() => {
      if (!listRef.current) {
        pendingLastScrollRef.current = false;
        return;
      }
      listRef.current.scrollToIndex({
        index: currentIndex,
        animated: false,
        viewPosition: 1,
      });
      pendingLastScrollRef.current = false;
    });
  }, [currentIndex, feedItems.length]);

  useEffect(() => {
    if (!showList || !listLaidOut || !contentMeasured || !initialScrollDone) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setIsTransitioning(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [contentMeasured, initialScrollDone, listLaidOut, showList]);

  useEffect(() => {
    if (!showList || !listLaidOut) {
      return;
    }
    ensureLastItemPinned();
  }, [ensureLastItemPinned, listLaidOut, showList]);

  useEffect(() => {
    if (showList || !feedItems.length) return;
    const timer = setTimeout(() => {
      if (!previewReadyRef.current) {
        previewReadyRef.current = true;
        tryStartList();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [feedItems.length, showList, tryStartList]);

  const handleContentSizeChange = useCallback(() => {
    if (!showList || !listLaidOut) {
      return;
    }
    if (!contentMeasuredRef.current) {
      contentMeasuredRef.current = true;
      setContentMeasured(true);
    }
    ensureLastItemPinned();
  }, [ensureLastItemPinned, listLaidOut, showList]);

  return (
    <SafeAreaView style={styles.container}>
      {!showList && feedItems.length ? (
        <>
          <View onLayout={handleSelectedLayout}>
            <PostItem
              item={feedItems[initialIndex]}
              onCommentPress={handleOpenCommentSheet}
              isWriter
              isCentered
              onPrimaryImageLoad={handleSelectedLoaded}
            />
          </View>
        </>
      ) : null}
      <FlatList
        ref={listRef}
        data={feedItems}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : `post-${index}`
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={9}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        onLayout={handleListLayout}
        onContentSizeChange={handleContentSizeChange}
        renderItem={({item, index}) => (
          <PostItem
            item={item}
            onCommentPress={handleOpenCommentSheet}
            isWriter
            isCentered={index === currentIndex}
          />
        )}
        contentContainerStyle={[
          styles.feedContent,
          {paddingBottom: isLastIndex ? insets.bottom : Math.max(insets.bottom, 24)},
        ]}
        style={showList ? null : styles.listHidden}
        pointerEvents={showList ? 'auto' : 'none'}
      />

      <PostCommentSheet
        ref={commentSheetRef}
        snapPoints={commentSheetSnapPoints}
        onChange={() => {}}
        onDismiss={() => {
          setSelectedFeed(null);
        }}
        insets={insets}
        commentList={commentList}
        defaultProfile={defaultProfile}
        commentLikeState={commentLikeState}
        onToggleLike={handleCommentLikeToggle}
        formatLikeCount={formatLikeCount}
        commentInput={commentInput}
        onChangeCommentInput={setCommentInput}
        onPressSend={() => {}}
      />

      {showSkeleton ? (
        <View style={styles.skeletonOverlay} pointerEvents="auto">
          {skeletonItems.map(key => (
            <PostItemSkeleton key={key} />
          ))}
        </View>
      ) : null}
      <Loading loading={showSkeleton} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  feedContent: {
    paddingTop: 10,
  },
  listHidden: {
    opacity: 0,
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
});

export default LikeSavedPostDetailScreen;
