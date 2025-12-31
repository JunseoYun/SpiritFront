import React, {forwardRef, useCallback} from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import CustomTextInput from '../../utils/CustomTextInput';

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
      commentInput,
      onChangeCommentInput,
      onPressSend,
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

    const renderCommentFooter = useCallback(
      props => (
        <BottomSheetFooter {...props}>
          <View
            style={[
              styles.commentInputBar,
              {paddingBottom: insets.bottom + 10},
            ]}>
            <Image source={defaultProfile} style={styles.commentInputAvatar} />
            <View style={styles.commentInputField}>
              <CustomTextInput
                value={commentInput}
                onChangeText={onChangeCommentInput}
                placeholder="회원님의 생각을 남겨보세요."
                placeholderTextColor="#9AA1AE"
                style={styles.commentInput}
                multiline
                underlineColorAndroid="transparent"
              />
              <Pressable
                hitSlop={8}
                onPress={onPressSend}
                style={[
                  styles.commentSendButton,
                  commentInput?.trim() ? styles.commentSendButtonActive : null,
                ]}>
                <Ionicons
                  name="paper-plane-outline"
                  size={18}
                  color={commentInput?.trim() ? '#3CBBFF' : '#A0A5AE'}
                />
              </Pressable>
            </View>
          </View>
        </BottomSheetFooter>
      ),
      [
        commentInput,
        defaultProfile,
        insets.bottom,
        onChangeCommentInput,
        onPressSend,
      ],
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
        handleIndicatorStyle={styles.commentSheetHandleIndicator}
        footerComponent={renderCommentFooter}>
        <BottomSheetView style={styles.commentSheetHeader}>
          <CustomText style={styles.commentSheetTitle}>댓글</CustomText>
        </BottomSheetView>
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.commentSheetContent,
            {paddingBottom: 100 + Math.max(insets.bottom, 12)},
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
                  <Pressable
                    hitSlop={8}
                    onPress={() => onToggleLike(comment.id)}>
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
    paddingBottom: 12,
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
  commentInputBar: {
    borderTopWidth: 0.5,
    borderTopColor: '#E8EBF1',
    paddingHorizontal: 14,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
  },
  commentInputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F2',
  },
  commentInputField: {
    flex: 1,
    minHeight: 32,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 24,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    marginLeft: 6,
    maxHeight: 80,
    padding: 0,
    margin: 0,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
    }),
  },
  commentSendButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    marginLeft: 8,
  },
  commentSendButtonActive: {
    backgroundColor: '#f5f5f5',
  },
});

export default PostCommentSheet;
