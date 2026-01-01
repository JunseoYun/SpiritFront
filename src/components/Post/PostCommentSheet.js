import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import CustomTextInput from '../../utils/CustomTextInput';
import FastImage from 'react-native-fast-image';

//TODO 답글 달기
const CommentFooter = ({
  inputRef,
  commentInput,
  onChangeCommentInput,
  onPressSend,
  onFocusInput,
  defaultProfile,
  bottomInset,
}) => {
  const [localInput, setLocalInput] = useState(commentInput ?? '');
  const animatedPaddingBottom = useRef(
    new Animated.Value(
      Platform.OS === 'android' ? bottomInset + 10 : bottomInset + 10,
    ),
  ).current;

  useEffect(() => {
    setLocalInput(commentInput ?? '');
  }, [commentInput]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const animatePadding = (toValue, duration = 200) => {
      Animated.timing(animatedPaddingBottom, {
        toValue,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, event => {
      const targetPadding = Platform.OS === 'android' ? bottomInset + 10 : 10;
      animatePadding(targetPadding, event?.duration);
    });
    const hideSub = Keyboard.addListener(hideEvent, event => {
      const targetPadding = bottomInset + 10;
      animatePadding(targetPadding, event?.duration);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [animatedPaddingBottom, bottomInset]);

  return (
    <Animated.View
      style={[
        styles.commentInputBar,
        {
          paddingBottom: animatedPaddingBottom,
        },
      ]}>
      <FastImage source={defaultProfile} style={styles.commentInputAvatar} />
      <View style={styles.commentInputField}>
        <CustomTextInput
          ref={inputRef}
          value={localInput}
          onChangeText={text => {
            setLocalInput(text);
            onChangeCommentInput?.(text);
          }}
          onFocus={onFocusInput}
          placeholder="댓글을 남겨보세요."
          placeholderTextColor="#9AA1AE"
          style={styles.commentInput}
          multiline
          underlineColorAndroid="transparent"
          InputComponent={BottomSheetTextInput}
        />
        {localInput.trim() ? (
          <Pressable
            hitSlop={8}
            onPress={onPressSend}
            style={[styles.commentSendButton]}>
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
};
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
    const inputRef = useRef(null);
    const [expandedReplies, setExpandedReplies] = useState({});

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

    const handleInputFocus = useCallback(() => {
      if (ref && typeof ref !== 'function') {
        const targetIndex = Math.max(0, (snapPoints?.length ?? 1) - 1);
        ref.current?.snapToIndex?.(targetIndex);
      }
    }, [ref, snapPoints]);

    const handleSheetChange = useCallback(
      index => {
        if (index === -1) {
          inputRef.current?.blur?.();
          onChangeCommentInput?.('');
        }
        if (onChange) {
          onChange(index);
        }
      },
      [onChange],
    );

    const handleSheetAnimate = useCallback((fromIndex, toIndex) => {
      if (toIndex === -1) {
        inputRef.current?.blur?.();
        onChangeCommentInput?.('');
      }
    }, []);

    const footerStateRef = useRef(null);
    footerStateRef.current = {
      inputRef,
      commentInput,
      onChangeCommentInput,
      onPressSend,
      onFocusInput: handleInputFocus,
      defaultProfile,
      bottomInset: insets.bottom,
    };

    const renderCommentFooter = useCallback(props => {
      const footerState = footerStateRef.current;
      if (!footerState) {
        return null;
      }
      return (
        <BottomSheetFooter {...props}>
          <CommentFooter {...footerState} />
        </BottomSheetFooter>
      );
    }, []);

    const sheetBottomInset = Math.max(insets?.bottom ?? 0, 12);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        // bottomInset={sheetBottomInset}
        onChange={handleSheetChange}
        onAnimate={handleSheetAnimate}
        onDismiss={onDismiss}
        backdropComponent={renderCommentBackdrop}
        backgroundStyle={styles.commentSheetBackground}
        handleIndicatorStyle={styles.commentSheetHandleIndicator}
        footerComponent={renderCommentFooter}>
        <BottomSheetView style={styles.commentSheetHeader}>
          <CustomText style={styles.commentSheetTitle}>댓글</CustomText>
        </BottomSheetView>
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          enableFooterMarginAdjustment
          contentContainerStyle={[styles.commentSheetContent]}>
          {commentList.length === 0 ? (
            <CustomText style={styles.commentEmptyText}>
              아직 댓글이 없어요.
            </CustomText>
          ) : (
            commentList.map((comment, index) => {
              const demoReplies =
                index === 0
                  ? [
                      {
                        id: `${comment.id}-reply-1`,
                        author: 'asdasd218',
                        createdAt: '2시간',
                        text: `정말로 맛있어 보여요`,
                        likes: 1,
                      },
                      {
                        id: `${comment.id}-reply-2`,
                        author: 'hanjanman',
                        createdAt: '2시간',
                        text: `언제쯤 저도 가볼 수 있을까요 ㅠㅠ`,
                        likes: 2,
                      },
                    ]
                  : [];
              const replies = comment.replies ?? demoReplies;
              const isExpanded = Boolean(expandedReplies[comment.id]);

              return (
                <View key={comment.id} style={styles.commentGroup}>
                  <View style={styles.commentItem}>
                    <FastImage
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
                      {!isExpanded && replies.length ? (
                        <Pressable
                          style={styles.commentReplyToggle}
                          disabled={!replies.length}
                          onPress={() =>
                            setExpandedReplies(prev => ({
                              ...prev,
                              [comment.id]: true,
                            }))
                          }>
                          <View style={styles.commentReplyToggleLine} />
                          <CustomText style={styles.commentReplyToggleText}>
                            답글 {replies.length}개 보기
                          </CustomText>
                        </Pressable>
                      ) : null}
                    </View>
                    <View style={styles.commentLikeColumn}>
                      <Pressable
                        hitSlop={8}
                        onPress={() => onToggleLike(comment.id)}>
                        <Ionicons
                          name={
                            commentLikeState[comment.id]
                              ? 'heart'
                              : 'heart-outline'
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
                  {replies.length && isExpanded ? (
                    <View style={styles.commentReplyList}>
                      {replies.map(reply => (
                        <View key={reply.id} style={styles.commentReplyItem}>
                          <Image
                            source={
                              reply.profileImage
                                ? {uri: reply.profileImage}
                                : defaultProfile
                            }
                            style={styles.commentReplyAvatar}
                          />
                          <View style={styles.commentReplyBody}>
                            <View style={styles.commentReplyHeader}>
                              <CustomText style={styles.commentAuthor}>
                                {reply.author}
                              </CustomText>
                              <CustomText style={styles.commentDate}>
                                {reply.createdAt}
                              </CustomText>
                            </View>
                            <CustomText style={styles.commentText}>
                              {reply.text}
                            </CustomText>
                            <CustomText style={styles.commentReplyText}>
                              답글 달기
                            </CustomText>
                          </View>
                          <View style={styles.commentReplyLikeColumn}>
                            <Pressable hitSlop={8}>
                              <Ionicons
                                name="heart-outline"
                                size={18}
                                color="#A0A5AE"
                              />
                            </Pressable>
                            <CustomText style={styles.commentLikeCount}>
                              {formatLikeCount(reply.likes ?? 0)}
                            </CustomText>
                          </View>
                        </View>
                      ))}
                      <Pressable
                        style={styles.commentReplyToggle}
                        onPress={() =>
                          setExpandedReplies(prev => ({
                            ...prev,
                            [comment.id]: false,
                          }))
                        }>
                        <View style={styles.commentReplyToggleLine} />
                        <CustomText style={styles.commentReplyToggleText}>
                          답글 숨기기
                        </CustomText>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              );
            })
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
  commentGroup: {
    gap: 6,
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
  commentReplyList: {
    paddingLeft: 48,
    gap: 14,
  },
  commentReplyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentReplyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F2',
  },
  commentReplyBody: {
    flex: 1,
    gap: 6,
  },
  commentReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentReplyLikeColumn: {
    width: 36,
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  commentReplyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 0,
    marginTop: 10,
  },
  commentReplyToggleLine: {
    width: 18,
    height: 1,
    backgroundColor: '#D6D9DF',
  },
  commentReplyToggleText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#9AA1AE',
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
    borderRadius: 20,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    marginLeft: 8,
    maxHeight: 80,
    padding: 0,
    margin: 0,
    paddingVertical: 10,
  },
  commentSendButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CBBFF',
  },
});

export default PostCommentSheet;
