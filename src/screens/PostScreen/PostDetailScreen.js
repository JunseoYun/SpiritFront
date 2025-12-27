import React, {useMemo, useRef} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import FeedItem from '../../components/Post/PostItem';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';

const PostDetailScreen = ({route}) => {
  const {item, comments: routeComments} = route.params ?? {};
  const scrollRef = useRef(null);
  const commentSectionOffset = useRef(0);

  const comments = useMemo(() => {
    if (Array.isArray(routeComments) && routeComments.length > 0) {
      return routeComments;
    }

    // Fallback mock comments for now
    return [
      {
        id: 'c1',
        author: item?.nickname ?? '게스트',
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
  }, [item?.nickname, routeComments]);

  const scrollToComments = () => {
    if (!commentSectionOffset.current) {
      return;
    }
    scrollRef.current?.scrollTo({
      y: commentSectionOffset.current,
      animated: true,
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.content}>
      <FeedItem item={item} onCommentPress={scrollToComments} />

      <View
        style={styles.commentsSection}
        onLayout={e => {
          commentSectionOffset.current = e.nativeEvent.layout.y;
        }}>
        <CustomText style={styles.commentsTitle}>
          댓글 {comments.length}
        </CustomText>
        {comments.map(comment => (
          <View key={comment.id} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <CustomText style={styles.commentAuthor}>
                {comment.author}
              </CustomText>
              <CustomText style={styles.commentDate}>
                {comment.createdAt}
              </CustomText>
            </View>
            <CustomText style={styles.commentText}>{comment.text}</CustomText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    paddingBottom: 40,
  },
  commentsSection: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 14,
  },
  commentsTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-Bold',
    color: '#222',
  },
  commentItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    lineHeight: 20,
  },
});

export default PostDetailScreen;
