import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import PostItem from '../../components/Post/PostItem';
import PostCommentSheet from '../../components/Post/PostCommentSheet';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import {PostGetById} from '../../api/postApi';
import Loading from '../../hooks/Loading';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HomeEmptyIcon, HomeHeaderIcon} from '../../assets/svg/HomeTabIcon';

const defaultProfile = require('../../assets/default_profile.png');

const PostDetailScreen = ({navigation, route}) => {
  const {postId, item: routeItem, comments: routeComments} = route.params ?? {};
  const [postItem, setPostItem] = useState(routeItem ?? null);
  const [loading, setLoading] = useState(Boolean(postId));
  const insets = useSafeAreaInsets();
  const {height: windowHeight} = useWindowDimensions();
  const commentSheetRef = useRef(null);
  const commentSheetSnapPoints = useMemo(
    () => ['70%', Math.max(0, windowHeight - insets.top)],
    [insets.top, windowHeight],
  );
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!postId) {
      return () => {
        isMounted = false;
      };
    }

    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await PostGetById(postId);
        if (!isMounted || !data) return;
        const mapped = {
          ...data,
          id: String(data.id ?? postId),
          profileImage:
            data.writerImgUrl ??
            data.profileImgUrl ??
            data.profileImage ??
            null,
          nickname: data.writerNickname ?? data.nickname ?? '게스트',
          name: data.storeName ?? data.name ?? null,
          storeAddress: data.storeAddress ?? data.address ?? null,
          postImages: Array.isArray(data.postImgUrlList)
            ? data.postImgUrlList
            : data.postImages ?? [],
          content: data.content ?? '',
          rate:
            data.rate ??
            data.rating ??
            data.storeRate ??
            data.storeRating ??
            null,
          storeId:
            data.storeId ?? data.store?.id ?? data.store?.storeId ?? null,
          shares: data.shares ?? 0,
          likes: data.likes ?? 0,
          comments: data.comments ?? 0,
        };
        setPostItem(prev => ({...prev, ...mapped}));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const comments = useMemo(() => {
    if (Array.isArray(routeComments) && routeComments.length > 0) {
      return routeComments;
    }

    // Fallback mock comments for now
    return [
      {
        id: 'c1',
        author: postItem?.nickname ?? '게스트',
        text: '방금 본 메뉴 정말 맛있어 보여요!',
        createdAt: '방금 전',
      },
      {
        id: 'c2',
        author: '푸드파이터',
        text: '위치 저장했습니다. 주말에 가볼게요 😋',
        createdAt: '1시간 전',
      },
      {
        id: 'c3',
        author: '카페투어러',
        text: '분위기 궁금했는데 사진으로 감 잡았어요. 공유 감사합니다!',
        createdAt: '어제',
      },
    ];
  }, [postItem?.nickname, routeComments]);

  useEffect(() => {
    const nextState = {};
    comments.forEach(comment => {
      nextState[comment.id] = false;
    });
    setCommentLikeState(nextState);
  }, [comments]);

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

  const handleOpenCommentSheet = useCallback(() => {
    commentSheetRef.current?.present();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === 'android' ? 17 : 7),
          paddingBottom: insets.bottom,
        },
      ]}>
      <View style={styles.header}>
        <Pressable
          style={styles.headerSide}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#333" />
        </Pressable>
        <CustomText style={styles.headerTitle}>게시글</CustomText>
        <View style={styles.headerSide} />
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        {postItem && (
          <PostItem
            item={postItem}
            onCommentPress={handleOpenCommentSheet}
            showRatingInTitleCycle
            hideStoreBadge
          />
        )}

        <Loading loading={loading} />
      </ScrollView>
      <PostCommentSheet
        ref={commentSheetRef}
        snapPoints={commentSheetSnapPoints}
        onChange={() => {}}
        onDismiss={() => {}}
        insets={insets}
        commentList={comments}
        defaultProfile={defaultProfile}
        commentLikeState={commentLikeState}
        onToggleLike={handleCommentLikeToggle}
        formatLikeCount={formatLikeCount}
        commentInput={commentInput}
        onChangeCommentInput={setCommentInput}
        onPressSend={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerSide: {
    width: 24,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Pretendard-Bold',
    fontSize: 17,
    color: '#333',
    textAlign: 'center',
  },
});

export default PostDetailScreen;
