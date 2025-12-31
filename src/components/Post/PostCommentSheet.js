import React, {forwardRef, useCallback} from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';

const PostCommentSheet = forwardRef(
  (
    {
      snapPoints,
      onChange,
      onDismiss,
      insets,
      commentList,
      defaultProfile,
      commentLikeState,
      onToggleLike,
      formatLikeCount,
    },
    ref,
  ) => {
    const renderCommentBackdrop = useCallback(
      props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.45}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={onChange}
        onDismiss={onDismiss}
        backdropComponent={renderCommentBackdrop}
        backgroundStyle={styles.commentSheetBackground}
        handleIndicatorStyle={styles.commentSheetHandleIndicator}>
        <BottomSheetView style={styles.commentSheetHeader}>
          <CustomText style={styles.commentSheetTitle}>댓글</CustomText>
        </BottomSheetView>
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.commentSheetContent,
            {paddingBottom: 110 + Math.max(insets.bottom, 16)},
          ]}>
          {commentList.length === 0 ? (
            <CustomText style={styles.commentEmptyText}>
              아직 댓글이 없어요.
            </CustomText>
          ) : (
            commentList.map(comment => (
              <View key={comment.id} style={styles.commentItem}>
                <Image
                  source={
                    comment.profileImage
                      ? {uri: comment.profileImage}
                      : defaultProfile
                  }
                  style={styles.commentAvatar}
                />
                <View style={styles.commentBody}>
                  <View style={styles.commentHeader}>
                    <CustomText style={styles.commentAuthor}>
                      {comment.author}
                    </CustomText>
                    <CustomText style={styles.commentDate}>
                      {comment.createdAt}
                    </CustomText>
                  </View>
                  <CustomText style={styles.commentText}>
                    {comment.text}
                  </CustomText>
                  <CustomText style={styles.commentReplyText}>
                    답글 달기
                  </CustomText>
                </View>
                <View style={styles.commentLikeColumn}>
                  <Pressable hitSlop={8} onPress={() => onToggleLike(comment.id)}>
                    <Ionicons
                      name={
                        commentLikeState[comment.id] ? 'heart' : 'heart-outline'
                      }
                      size={20}
                      color={
                        commentLikeState[comment.id] ? '#FF5E5E' : '#A0A5AE'
                      }
                    />
                  </Pressable>
                  <CustomText style={styles.commentLikeCount}>
                    {formatLikeCount(
                      (comment.likes ?? 0) +
                        (commentLikeState[comment.id] ? 1 : 0),
                    )}
                  </CustomText>
                </View>
              </View>
            ))
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

const styles = StyleSheet.create({
  commentSheetBackground: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  commentSheetHandleIndicator: {
    backgroundColor: '#E4E4E4',
    width: 48,
    height: 3,
  },
  commentSheetHeader: {
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F4',
  },
  commentSheetTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#222',
  },
  commentSheetContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 18,
  },
  commentEmptyText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    textAlign: 'center',
    paddingVertical: 24,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
  commentBody: {
    flex: 1,
    gap: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  commentReplyText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: ColorUtil.subText,
  },
  commentLikeColumn: {
    width: 42,
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  commentLikeCount: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#8F96A3',
  },
});

export default PostCommentSheet;
