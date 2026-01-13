import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  ActivityIndicator,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import CustomTextInput from '../../utils/CustomTextInput';
import FastImage from 'react-native-fast-image';
import PostReportBottomSheet from './PostReportBottomSheet';
import {COMMENT_REPORT_REASONS, REPORT_REASON_MAP} from './PostReportSheet';
import {report_create} from '../../api/reportApi';
import {useToast} from '../../context/ToastContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const CommentFooter = ({
  inputRef,
  onChangeCommentInput,
  onPressSend,
  onFocusInput,
  onRequestFocusAfterSnap,
  canFocusInput = true,
  defaultProfile,
  currentUserProfileImage,
  bottomInset,
  replyTargetStore,
  onClearReplyTarget,
  onLayout,
}) => {
  const [localInput, setLocalInput] = useState('');
  const [replyTarget, setReplyTarget] = useState(
    replyTargetStore?.current?.value ?? null,
  );
  const animatedPaddingBottom = useRef(
    new Animated.Value(
      Platform.OS === 'android' ? bottomInset + 10 : bottomInset + 10,
    ),
  ).current;

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
      const targetPadding = Platform.OS === 'ios' ? 5 : 0;
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

  useEffect(() => {
    const store = replyTargetStore?.current;
    if (!store) return;
    setReplyTarget(store.value ?? null);
    const listener = nextValue => {
      setReplyTarget(nextValue ?? null);
    };
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [replyTargetStore]);

  const handleSend = useCallback(() => {
    const content = localInput.trim();
    if (!content) {
      return;
    }
    onPressSend?.({
      content,
      rootCommentId: replyTarget?.rootCommentId ?? null,
    });
    requestAnimationFrame(() => {
      setLocalInput('');
      onChangeCommentInput?.('');
      onClearReplyTarget?.();
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, [
    localInput,
    onPressSend,
    onChangeCommentInput,
    replyTarget,
    onClearReplyTarget,
  ]);
  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.commentInputBar,
        {
          paddingBottom:
            Platform.OS === 'android'
              ? bottomInset + 10
              : animatedPaddingBottom,
        },
      ]}>
      <FastImage
        source={
          currentUserProfileImage
            ? {uri: currentUserProfileImage}
            : defaultProfile
        }
        style={styles.commentInputAvatar}
      />
      <View style={{flex: 1}}>
        {replyTarget ? (
          <View style={styles.replyField}>
            <CustomText
              style={styles.replyTarget}
              numberOfLines={1}
              ellipsizeMode="tail">
              {replyTarget?.name} 님에게 답글 남기기
            </CustomText>
            <Pressable hitSlop={6} onPress={onClearReplyTarget}>
              <Ionicons name="close" size={16} color={ColorUtil.subText} />
            </Pressable>
          </View>
        ) : null}
        <View
          style={[
            styles.commentInputField,
            replyTarget ? styles.commentInputFieldReply : null,
          ]}>
          <View style={{flex: 1, position: 'relative'}}>
            <CustomTextInput
              ref={inputRef}
              value={localInput}
              onChangeText={text => {
                setLocalInput(text);
                onChangeCommentInput?.(text);
              }}
              editable
              showSoftInputOnFocus={
                Platform.OS === 'ios' ? true : canFocusInput
              }
              onPressIn={() => {
                if (Platform.OS === 'android' && !canFocusInput) {
                  onRequestFocusAfterSnap?.();
                }
              }}
              onFocus={onFocusInput}
              placeholder="댓글을 남겨보세요."
              placeholderTextColor="#9AA1AE"
              style={styles.commentInput}
              multiline
              underlineColorAndroid="transparent"
              InputComponent={BottomSheetTextInput}
            />
          </View>
          {localInput.trim() ? (
            <Pressable
              hitSlop={8}
              onPress={handleSend}
              style={[styles.commentSendButton]}>
              <Ionicons name="arrow-up" size={20} color="#FFF" />
            </Pressable>
          ) : null}
        </View>
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
      commentSortKey = 'latest',
      onChangeCommentSort,
      defaultProfile,
      commentLikeState,
      onToggleLike,
      formatLikeCount,
      onChangeCommentInput,
      currentUserProfileImage,
      onPressSend,
      onDeleteComment,
      onRequestReplies,
      onRequestMoreComments,
      commentTotalCount = null,
      commentPage = 0,
      commentPageSize = 20,
      isPostWriter = false,
      isLoadingComments = false,
      pendingScrollToId = null,
      pendingHighlightIds = [],
      initialIndex = 0,
      autoExpandRootId = null,
    },
    ref,
  ) => {
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [hiddenPreviewReplies, setHiddenPreviewReplies] = useState({});
    const [replyTarget, setReplyTarget] = useState(null);
    const replyTargetStoreRef = useRef({value: null, listeners: new Set()});
    const expandedRepliesRef = useRef({});
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [selectedMenuTarget, setSelectedMenuTarget] = useState(null);
    const [reportTargetItem, setReportTargetItem] = useState(null);
    const [menuPosition, setMenuPosition] = useState({top: 60});
    const [footerHeight, setFooterHeight] = useState(0);
    const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
    const pendingFocusAfterSnapRef = useRef(false);
    const pendingSnapOnlyRef = useRef(false);
    const {showToast} = useToast();
    const [selectedReportReason, setSelectedReportReason] = useState(null);
    const [loadingReplies, setLoadingReplies] = useState({});
    const reportSheetRef = useRef(null);
    const scrollOffsetRef = useRef(0);
    const scrollStartOffsetRef = useRef(0);
    const isLoadingMoreCommentsRef = useRef(false);
    const lastRequestedCommentPageRef = useRef(0);
    const SHEET_HEADER_HEIGHT = 52;
    const highlightMapRef = useRef({});
    const pendingHighlightSetRef = useRef(new Set());
    const replyRequestTokenRef = useRef({});
    const pendingAutoScrollIdRef = useRef(null);

    const layoutMapRef = useRef({});
    const replyListLayoutRef = useRef({});
    const setItemLayoutWithSize = useCallback(
      (id, y, height) => {
        if (!id) return;
        layoutMapRef.current[id] = {y, height};
        if (pendingAutoScrollIdRef.current === id) {
          pendingAutoScrollIdRef.current = null;
          scrollToItem(id, false);
          requestAnimationFrame(() => {
            triggerHighlight(id);
          });
        }
        if (pendingHighlightSetRef.current.has(String(id))) {
          pendingHighlightSetRef.current.delete(String(id));
          requestAnimationFrame(() => {
            triggerHighlight(id);
          });
        }
      },
      [scrollToItem, triggerHighlight],
    );
    const setReplyListLayout = useCallback((id, y) => {
      if (!id) return;
      replyListLayoutRef.current[id] = y;
    }, []);
    const finalSnapIndex = useMemo(
      () => Math.max(0, (snapPoints?.length ?? 1) - 1),
      [snapPoints],
    );
    const canFocusInput =
      Platform.OS === 'ios' || currentSheetIndex === finalSnapIndex;

    const pendingScrollIdRef = useRef(null);
    const isKeyboardVisibleRef = useRef(false);
    const getHighlightValue = useCallback(id => {
      if (!id) return null;
      if (!highlightMapRef.current[id]) {
        highlightMapRef.current[id] = new Animated.Value(0);
      }
      return highlightMapRef.current[id];
    }, []);

    const triggerHighlight = useCallback(
      id => {
        const value = getHighlightValue(id);
        if (!value) return;
        value.stopAnimation();
        value.setValue(1);
        Animated.timing(value, {
          toValue: 0,
          duration: 320,
          delay: 1800,
          useNativeDriver: false,
        }).start();
      },
      [getHighlightValue],
    );
    const scrollToItem = useCallback((id, shouldFocus = true) => {
      const layout = layoutMapRef.current[id];
      if (!layout || typeof layout.y !== 'number') {
        return;
      }
      const {y} = layout;
      const offset = Math.max(0, y - 12);
      pendingHighlightSetRef.current.add(String(id));
      scrollRef.current?.scrollTo?.({y: offset, animated: true});
      if (shouldFocus) {
        requestAnimationFrame(() => {
          inputRef.current?.focus?.();
        });
      }
    }, []);

    useEffect(() => {
      if (!pendingScrollToId) return;
      pendingAutoScrollIdRef.current = pendingScrollToId;
      pendingHighlightSetRef.current.add(String(pendingScrollToId));
      const layout = layoutMapRef.current[pendingScrollToId];
      if (layout && typeof layout.y === 'number') {
        pendingAutoScrollIdRef.current = null;
        scrollToItem(pendingScrollToId, false);
        pendingHighlightSetRef.current.delete(String(pendingScrollToId));
        requestAnimationFrame(() => {
          triggerHighlight(pendingScrollToId);
        });
      }
    }, [pendingScrollToId, scrollToItem, triggerHighlight]);

    useEffect(() => {
      const ids = Array.isArray(pendingHighlightIds)
        ? pendingHighlightIds
        : [pendingHighlightIds];
      ids.filter(Boolean).forEach(id => {
        const key = String(id);
        pendingHighlightSetRef.current.add(key);
        const layout = layoutMapRef.current[key];
        if (layout && typeof layout.y === 'number') {
          pendingHighlightSetRef.current.delete(key);
          triggerHighlight(key);
        }
      });
    }, [pendingHighlightIds, triggerHighlight]);

    useEffect(() => {
      const showSub = Keyboard.addListener('keyboardDidShow', () => {
        isKeyboardVisibleRef.current = true;
        if (pendingScrollIdRef.current) {
          const id = pendingScrollIdRef.current;
          pendingScrollIdRef.current = null;
          scrollToItem(id);
        }
      });
      const hideSub = Keyboard.addListener('keyboardDidHide', () => {
        isKeyboardVisibleRef.current = false;
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, [scrollToItem]);

    const handleReplyPress = useCallback(
      (author, id, rootCommentId) => {
        setReplyTarget({
          name: author,
          rootCommentId: rootCommentId ?? id,
        });
        triggerHighlight(id);
        handleInputFocus();
        if (isKeyboardVisibleRef.current) {
          scrollToItem(id);
        } else {
          pendingScrollIdRef.current = id;
        }
      },
      [handleInputFocus, scrollToItem, triggerHighlight],
    );

    const handleReportPress = useCallback(
      _targetItem => {
        closeMoreMenu();
        setReportTargetItem(_targetItem ?? null);
        reportSheetRef.current?.present();
      },
      [closeMoreMenu],
    );
    const handleSelectReportReason = useCallback(reason => {
      setSelectedReportReason(prev => (prev === reason ? null : reason));
    }, []);

    const handleReportSubmit = useCallback(async () => {
      reportSheetRef.current?.dismiss();
      if (!selectedReportReason) {
        return;
      }
      if (!reportTargetItem?.id) {
        showToast('신고할 댓글을 찾지 못했습니다.');
        return;
      }
      const reportReason = REPORT_REASON_MAP[selectedReportReason];
      try {
        await report_create({
          reportTarget: 'COMMENT',
          targetId: reportTargetItem.id,
          reportReason,
          description: selectedReportReason,
        });
        showToast('신고가 접수되었습니다.');
        setReportTargetItem(null);
      } catch (error) {
        const code = error?.response?.data?.code;
        if (code === 27004) {
          showToast('이미 신고한 댓글입니다.');
          return;
        }
        if (code === 27003) {
          showToast('신고 사유를 입력해주세요.');
          return;
        }
        showToast('신고 접수에 실패했습니다.');
      }
    }, [reportTargetItem?.id, selectedReportReason]);

    const handleDeletePress = useCallback(
      targetItem => {
        const resolvedTarget = targetItem ?? selectedMenuTarget;
        const targetId = resolvedTarget?.id;
        if (!targetId) {
          Alert.alert('삭제하기', '삭제할 댓글을 찾지 못했습니다.');
          return;
        }
        if (!onDeleteComment) {
          Alert.alert('삭제하기', '삭제 동작을 연결해주세요.');
          return;
        }
        closeMoreMenu();
        onDeleteComment(resolvedTarget);
      },
      [closeMoreMenu, onDeleteComment, selectedMenuTarget],
    );

    const resetSheetState = useCallback(() => {
      setExpandedReplies({});
      setHiddenPreviewReplies({});
      setReplyTarget(null);
    }, []);

    const closeMoreMenu = useCallback(() => {
      setShowMoreMenu(false);
      setSelectedMenuTarget(null);
    }, []);

    const handleCommentLongPress = useCallback(
      targetItem => {
        const canDelete = isPostWriter || targetItem?.isMine;
        const canReport = !targetItem?.isMine;
        if (Platform.OS === 'ios') {
          setSelectedMenuTarget(targetItem);
          const options = [];
          if (canReport) {
            options.push('신고하기');
          }
          if (canDelete) {
            options.push('삭제하기');
          }
          options.push('취소');
          const cancelButtonIndex = options.length - 1;
          const destructiveButtonIndex = canDelete
            ? options.indexOf('삭제하기')
            : undefined;
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options,
              cancelButtonIndex,
              destructiveButtonIndex,
              userInterfaceStyle: 'light',
            },
            buttonIndex => {
              const selection = options[buttonIndex];
              if (selection === '신고하기') {
                handleReportPress(targetItem);
              }
              if (selection === '삭제하기') {
                handleDeletePress(targetItem);
              }
              setSelectedMenuTarget(null);
            },
          );
          return;
        }

        setSelectedMenuTarget(targetItem);
        const layout = layoutMapRef.current[targetItem?.id];
        if (layout && typeof layout.y === 'number') {
          const rawTop =
            SHEET_HEADER_HEIGHT + layout.y - scrollOffsetRef.current;
          setMenuPosition({top: Math.max(60, rawTop)});
        } else {
          setMenuPosition({top: 60});
        }
        setShowMoreMenu(true);
      },
      [handleDeletePress, handleReportPress, isPostWriter],
    );

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
      if (Platform.OS === 'ios') {
        return;
      }
      if (pendingFocusAfterSnapRef.current) {
        return;
      }
      if (ref && typeof ref !== 'function') {
        if (currentSheetIndex < finalSnapIndex) {
          pendingFocusAfterSnapRef.current = true;
          inputRef.current?.blur?.();
          Keyboard.dismiss();
          ref.current?.snapToIndex?.(finalSnapIndex);
          return;
        }
      }
    }, [currentSheetIndex, finalSnapIndex, ref]);

    const handleRequestFocusAfterSnap = useCallback(() => {
      if (Platform.OS === 'ios') {
        return;
      }
      if (pendingFocusAfterSnapRef.current) {
        return;
      }
      if (
        currentSheetIndex < finalSnapIndex &&
        ref &&
        typeof ref !== 'function'
      ) {
        pendingFocusAfterSnapRef.current = true;
        pendingSnapOnlyRef.current = true;
        ref.current?.snapToIndex?.(finalSnapIndex);
        return;
      }
      inputRef.current?.focus?.();
    }, [currentSheetIndex, finalSnapIndex, ref]);

    const handleScrollBegin = useCallback(event => {
      scrollStartOffsetRef.current =
        event?.nativeEvent?.contentOffset?.y ?? 0;
    }, []);

    const handleScrollEnd = useCallback(() => {
      const startY = scrollStartOffsetRef.current ?? 0;
      const endY = scrollOffsetRef.current ?? 0;
      if (startY === 0 && endY === 0 && ref && typeof ref !== 'function') {
        if (currentSheetIndex > 0) {
          ref.current?.snapToIndex?.(currentSheetIndex - 1);
        } else {
          ref.current?.snapToIndex?.(-1) ?? ref.current?.dismiss?.();
        }
      }
    }, [currentSheetIndex, ref]);

    const handleClearReplyTarget = useCallback(() => {
      setReplyTarget(null);
      // requestAnimationFrame(() => {
      //   inputRef.current?.focus?.();
      // });
    }, []);

    const handleSheetChange = useCallback(
      index => {
        setCurrentSheetIndex(index);
        if (index === finalSnapIndex && pendingFocusAfterSnapRef.current) {
          setTimeout(
            () => {
              pendingFocusAfterSnapRef.current = false;
              inputRef.current?.focus?.();
            },
            pendingSnapOnlyRef.current ? 0 : 50,
          );
          pendingSnapOnlyRef.current = false;
        }
        if (index === -1) {
          inputRef.current?.blur?.();
          onChangeCommentInput?.('');
          closeMoreMenu();
          resetSheetState();
          pendingFocusAfterSnapRef.current = false;
          pendingSnapOnlyRef.current = false;
        }
        if (onChange) {
          onChange(index);
        }
      },
      [
        closeMoreMenu,
        finalSnapIndex,
        onChange,
        onChangeCommentInput,
        resetSheetState,
      ],
    );

    const handleSheetAnimate = useCallback(
      (fromIndex, toIndex) => {
        if (toIndex === -1) {
          inputRef.current?.blur?.();
          onChangeCommentInput?.('');
          closeMoreMenu();
          resetSheetState();
          pendingFocusAfterSnapRef.current = false;
          pendingSnapOnlyRef.current = false;
        }
      },
      [closeMoreMenu, onChangeCommentInput, resetSheetState],
    );

    const previewCountRef = useRef({});
    useEffect(() => {
      setHiddenPreviewReplies(prev => {
        const nextHidden = {...prev};
        const nextCounts = {};
        let changed = false;

        commentList.forEach(comment => {
          const previewCount = Array.isArray(comment.previewReplies)
            ? comment.previewReplies.length
            : 0;
          nextCounts[comment.id] = previewCount;
          const prevCount = previewCountRef.current[comment.id] ?? 0;
          if (previewCount > 0 && previewCount !== prevCount) {
            if (nextHidden[comment.id]) {
              nextHidden[comment.id] = false;
              changed = true;
            }
          }
        });

        previewCountRef.current = nextCounts;
        return changed ? nextHidden : prev;
      });
    }, [commentList]);

    useEffect(() => {
      if (commentPage === 0) {
        isLoadingMoreCommentsRef.current = false;
      }
      lastRequestedCommentPageRef.current = commentPage;
    }, [commentPage]);

    useEffect(() => {
      const store = replyTargetStoreRef.current;
      store.value = replyTarget;
      store.listeners.forEach(listener => listener(replyTarget));
    }, [replyTarget]);

    useEffect(() => {
      expandedRepliesRef.current = expandedReplies;
    }, [expandedReplies]);

    useEffect(() => {
      if (!autoExpandRootId) return;
      const key = String(autoExpandRootId);
      setExpandedReplies(prev => ({...prev, [key]: true}));
      setHiddenPreviewReplies(prev => ({...prev, [key]: false}));
    }, [autoExpandRootId]);

    const onPressSendRef = useRef(onPressSend);
    const onChangeCommentInputRef = useRef(onChangeCommentInput);

    useEffect(() => {
      onPressSendRef.current = onPressSend;
    }, [onPressSend]);

    useEffect(() => {
      onChangeCommentInputRef.current = onChangeCommentInput;
    }, [onChangeCommentInput]);

    const handlePressSend = useCallback(
      payload => {
        const rootCommentId = payload?.rootCommentId ?? null;
        const isExpandedTarget =
          rootCommentId && expandedReplies[rootCommentId] ? true : false;
        onPressSendRef.current?.({
          ...payload,
          isExpandedTarget,
        });
      },
      [expandedReplies],
    );

    const handleChangeCommentInput = useCallback(text => {
      onChangeCommentInputRef.current?.(text);
    }, []);

    const requestReplies = useCallback(
      (commentId, page, sortKey) => {
        if (!onRequestReplies) return;
        const nextToken = (replyRequestTokenRef.current[commentId] ?? 0) + 1;
        replyRequestTokenRef.current[commentId] = nextToken;
        setLoadingReplies(prev => {
          if (prev[commentId]) return prev;
          return {...prev, [commentId]: true};
        });
        const maybePromise = onRequestReplies(commentId, page, sortKey);
        if (maybePromise && typeof maybePromise.finally === 'function') {
          maybePromise.finally(() => {
            if (replyRequestTokenRef.current[commentId] === nextToken) {
              setLoadingReplies(prev => ({
                ...prev,
                [commentId]: false,
              }));
            }
          });
          return;
        }
        setTimeout(() => {
          if (replyRequestTokenRef.current[commentId] === nextToken) {
            setLoadingReplies(prev => ({
              ...prev,
              [commentId]: false,
            }));
          }
        }, 250);
      },
      [onRequestReplies],
    );

    useEffect(() => {
      const expandedIds = Object.keys(expandedRepliesRef.current).filter(
        id => expandedRepliesRef.current[id],
      );
      if (!expandedIds.length) {
        return;
      }
      expandedIds.forEach(commentId => {
        requestReplies(commentId, 0, commentSortKey);
      });
    }, [commentSortKey, requestReplies]);

    const getHighlightOpacityStyle = useCallback(
      id => {
        const value = getHighlightValue(id);
        if (!value) return null;
        return {
          opacity: value,
        };
      },
      [getHighlightValue],
    );

    const renderCommentFooter = useCallback(
      props => (
        <BottomSheetFooter {...props}>
          <CommentFooter
            inputRef={inputRef}
            onChangeCommentInput={handleChangeCommentInput}
            onPressSend={handlePressSend}
            onFocusInput={handleInputFocus}
            onRequestFocusAfterSnap={handleRequestFocusAfterSnap}
            canFocusInput={canFocusInput}
            defaultProfile={defaultProfile}
            currentUserProfileImage={currentUserProfileImage}
            bottomInset={insets.bottom}
            replyTargetStore={replyTargetStoreRef}
            onClearReplyTarget={handleClearReplyTarget}
            onLayout={event => {
              const nextHeight = event?.nativeEvent?.layout?.height ?? 0;
              if (!footerHeight && nextHeight) {
                setFooterHeight(nextHeight);
              }
            }}
          />
        </BottomSheetFooter>
      ),
      [
        defaultProfile,
        currentUserProfileImage,
        handleChangeCommentInput,
        handleInputFocus,
        handleRequestFocusAfterSnap,
        canFocusInput,
        handlePressSend,
        handleClearReplyTarget,
        insets.bottom,
        footerHeight,
      ],
    );

    const hasMoreComments =
      (commentTotalCount !== null && commentList.length < commentTotalCount) ||
      (commentTotalCount === null &&
        commentList.length >= commentPageSize &&
        commentList.length % commentPageSize === 0);

    const handleLoadMoreComments = useCallback(
      nextPage => {
        if (!onRequestMoreComments) return;
        if (!hasMoreComments) return;
        if (isLoadingMoreCommentsRef.current) return;
        if (nextPage <= lastRequestedCommentPageRef.current) return;
        isLoadingMoreCommentsRef.current = true;
        lastRequestedCommentPageRef.current = nextPage;
        const maybePromise = onRequestMoreComments(nextPage);
        if (maybePromise && typeof maybePromise.finally === 'function') {
          maybePromise.finally(() => {
            isLoadingMoreCommentsRef.current = false;
          });
          return;
        }
        setTimeout(() => {
          isLoadingMoreCommentsRef.current = false;
        }, 250);
      },
      [hasMoreComments, onRequestMoreComments],
    );

    const handleCommentScroll = useCallback(
      event => {
        const offsetY = event.nativeEvent.contentOffset?.y ?? 0;
        scrollOffsetRef.current = offsetY;

        if (!hasMoreComments) return;
        const layoutHeight = event.nativeEvent.layoutMeasurement?.height ?? 0;
        const contentHeight = event.nativeEvent.contentSize?.height ?? 0;
        const distanceFromBottom = contentHeight - (offsetY + layoutHeight);
        if (distanceFromBottom <= 120) {
          handleLoadMoreComments(Math.max(0, commentPage) + 1);
        }
      },
      [
        commentPage,
        currentSheetIndex,
        handleLoadMoreComments,
        hasMoreComments,
      ],
    );

    const footerSpacing = (footerHeight || 72) + insets.bottom;

    return (
      <>
        <BottomSheetModal
          ref={ref}
          index={initialIndex}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBehavior="extend"
          keyboardBlurBehavior="none"
          android_keyboardInputMode="adjustResize"
          // bottomInset={sheetBottomInset}
          onChange={handleSheetChange}
          onAnimate={handleSheetAnimate}
          onDismiss={() => {
            closeMoreMenu();
            resetSheetState();
            onDismiss?.();
          }}
          backdropComponent={renderCommentBackdrop}
          backgroundStyle={styles.commentSheetBackground}
          handleIndicatorStyle={styles.commentSheetHandleIndicator}
          footerComponent={renderCommentFooter}>
          <BottomSheetView style={styles.commentSheetBody}>
            <BottomSheetView style={styles.commentSheetHeader}>
              <CustomText style={styles.commentSheetTitle}>댓글</CustomText>
              <View style={styles.commentSortRow}>
                <Pressable
                  onPress={() => onChangeCommentSort?.('latest')}
                  hitSlop={6}>
                  <CustomText
                    style={[
                      styles.commentSortText,
                      commentSortKey === 'latest' &&
                        styles.commentSortTextActive,
                    ]}>
                    최신순
                  </CustomText>
                </Pressable>
                <Pressable
                  onPress={() => onChangeCommentSort?.('popular')}
                  hitSlop={6}>
                  <CustomText
                    style={[
                      styles.commentSortText,
                      commentSortKey === 'popular' &&
                        styles.commentSortTextActive,
                    ]}>
                    인기순
                  </CustomText>
                </Pressable>
              </View>
            </BottomSheetView>
            {showMoreMenu ? (
              <>
                <Pressable
                  style={styles.moreMenuOverlay}
                  onPress={closeMoreMenu}
                />
                <View style={[styles.moreMenu, {top: menuPosition.top}]}>
                  {!selectedMenuTarget?.isMine ? (
                    <Pressable
                      style={styles.moreMenuItem}
                      onPress={() => {
                        closeMoreMenu();
                        handleReportPress(selectedMenuTarget);
                      }}>
                      <CustomText style={styles.moreMenuItemTextPrimary}>
                        신고하기
                      </CustomText>
                    </Pressable>
                  ) : null}
                  {isPostWriter || selectedMenuTarget?.isMine ? (
                    <Pressable
                      style={styles.moreMenuItem}
                      onPress={() => {
                        closeMoreMenu();
                        handleDeletePress(selectedMenuTarget);
                      }}>
                      <CustomText style={styles.moreMenuItemTextDestructive}>
                        삭제하기
                      </CustomText>
                    </Pressable>
                  ) : null}
                </View>
              </>
            ) : null}
            <ScrollView
              ref={scrollRef}
              style={styles.commentSheetScroll}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              bounces={false}
              alwaysBounceVertical={false}
              nestedScrollEnabled
              scrollEnabled={!showMoreMenu}
              scrollEventThrottle={16}
              onScroll={handleCommentScroll}
              onScrollBeginDrag={handleScrollBegin}
              onScrollEndDrag={handleScrollEnd}
              contentInset={{bottom: footerSpacing}}
              scrollIndicatorInsets={{bottom: footerSpacing}}
              contentContainerStyle={[
                styles.commentSheetContent,
                {paddingBottom: Platform.OS === 'android' ? 150 : 30},
              ]}>
              {commentList.length === 0 && isLoadingComments ? (
                <View style={styles.commentLoadingContainer}>
                  <ActivityIndicator size="small" color="#9AA1AE" />
                </View>
              ) : commentList.length === 0 ? (
                <CustomText style={styles.commentEmptyText}>
                  첫 댓글을 작성해보세요.
                </CustomText>
              ) : (
                commentList.map(comment => {
                  const replies = Array.isArray(comment.replies)
                    ? comment.replies
                    : [];
                  const replyCount = Number.isFinite(comment.replyCount)
                    ? comment.replyCount
                    : replies.length;
                  const previewReplies = Array.isArray(comment.previewReplies)
                    ? comment.previewReplies
                    : [];
                  const mergeUnique = list => {
                    const seen = new Set();
                    return list.filter(reply => {
                      const key = String(reply.id);
                      if (seen.has(key)) return false;
                      seen.add(key);
                      return true;
                    });
                  };
                  const isMenuTarget = selectedMenuTarget?.id === comment.id;
                  const isExpanded = Boolean(expandedReplies[comment.id]);
                  const isPreviewHidden = Boolean(
                    hiddenPreviewReplies[comment.id],
                  );
                  const expandedReplyItems = mergeUnique(
                    isExpanded
                      ? replies
                      : replies.length
                      ? replies
                      : previewReplies,
                  );
                  const previewVisibleCount =
                    !isExpanded && !isPreviewHidden ? previewReplies.length : 0;
                  const remainingReplyCount = Math.max(
                    0,
                    replyCount - previewVisibleCount,
                  );
                  const remainingExpandedCount = Math.max(
                    0,
                    replyCount - expandedReplyItems.length,
                  );
                  const loadedReplyCount = Array.isArray(comment.replies)
                    ? comment.replies.length
                    : 0;
                  const expectedReplyCount = Number.isFinite(comment.replyCount)
                    ? comment.replyCount
                    : loadedReplyCount;
                  const hasLoadedAllReplies =
                    expectedReplyCount > 0 &&
                    loadedReplyCount >= expectedReplyCount;
                  const isLoadingReplies = !!loadingReplies[comment.id];

                  return (
                    <View
                      key={comment.id}
                      style={styles.commentGroup}
                      onLayout={event => {
                        const {y, height} = event.nativeEvent.layout;
                        setItemLayoutWithSize(comment.id, y, height);
                      }}>
                      <AnimatedPressable
                        style={[
                          styles.commentItem,
                          isMenuTarget ? styles.commentItemSelected : null,
                        ]}
                        delayLongPress={250}
                        onLongPress={() => handleCommentLongPress(comment)}>
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.commentHighlight,
                            getHighlightOpacityStyle(comment.id),
                          ]}
                        />
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
                          <Pressable
                            style={styles.commentReplyPressable}
                            onPress={() =>
                              handleReplyPress(
                                comment.author,
                                comment.id,
                                comment.id,
                              )
                            }>
                            <CustomText style={styles.commentReplyText}>
                              답글 달기
                            </CustomText>
                          </Pressable>
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
                                commentLikeState[comment.id]
                                  ? '#FF5E5E'
                                  : '#A0A5AE'
                              }
                            />
                          </Pressable>
                          <CustomText style={styles.commentLikeCount}>
                            {formatLikeCount(
                              (comment.likes ?? 0) +
                                (commentLikeState[comment.id] ? 1 : 0) -
                                (comment.isLiked ? 1 : 0),
                            )}
                          </CustomText>
                        </View>
                        {isMenuTarget ? (
                          <View
                            pointerEvents="none"
                            style={styles.commentItemDimmer}
                          />
                        ) : null}
                      </AnimatedPressable>
                      {isExpanded && replyCount > 0 ? (
                        <View
                          style={styles.commentReplyList}
                          onLayout={event => {
                            setReplyListLayout(
                              comment.id,
                              event.nativeEvent.layout.y,
                            );
                          }}>
                          {expandedReplyItems.map(reply => {
                            const isReplyMenuTarget =
                              selectedMenuTarget?.id === reply.id;
                            return (
                              <AnimatedPressable
                                key={reply.id}
                                style={[
                                  styles.commentReplyItem,
                                  isReplyMenuTarget
                                    ? styles.commentItemSelected
                                    : null,
                                ]}
                                delayLongPress={250}
                                onLongPress={() =>
                                  handleCommentLongPress(reply)
                                }
                                onLayout={event => {
                                  const {y, height} = event.nativeEvent.layout;
                                  const parentLayout =
                                    layoutMapRef.current[comment.id];
                                  const replyListY =
                                    replyListLayoutRef.current[comment.id];
                                  const absoluteY =
                                    (parentLayout?.y ?? 0) +
                                    (replyListY ?? 0) +
                                    y;
                                  setItemLayoutWithSize(
                                    reply.id,
                                    absoluteY,
                                    height,
                                  );
                                }}>
                                <Animated.View
                                  pointerEvents="none"
                                  style={[
                                    styles.commentHighlight,
                                    getHighlightOpacityStyle(reply.id),
                                  ]}
                                />
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
                                  <Pressable
                                    style={styles.commentReplyPressable}
                                    onPress={() =>
                                      handleReplyPress(
                                        reply.author,
                                        reply.id,
                                        reply.rootCommentId ?? comment.id,
                                      )
                                    }>
                                    <CustomText style={styles.commentReplyText}>
                                      답글 달기
                                    </CustomText>
                                  </Pressable>
                                </View>
                                <View style={styles.commentReplyLikeColumn}>
                                  <Pressable
                                    hitSlop={8}
                                    onPress={() => onToggleLike(reply.id)}>
                                    <Ionicons
                                      name={
                                        commentLikeState[reply.id]
                                          ? 'heart'
                                          : 'heart-outline'
                                      }
                                      size={18}
                                      color={
                                        commentLikeState[reply.id]
                                          ? '#FF5E5E'
                                          : '#A0A5AE'
                                      }
                                    />
                                  </Pressable>
                                  <CustomText style={styles.commentLikeCount}>
                                    {formatLikeCount(
                                      (reply.likes ?? 0) +
                                        (commentLikeState[reply.id] ? 1 : 0) -
                                        (reply.isLiked ? 1 : 0),
                                    )}
                                  </CustomText>
                                </View>
                                {isReplyMenuTarget ? (
                                  <View
                                    pointerEvents="none"
                                    style={styles.commentItemDimmer}
                                  />
                                ) : null}
                              </AnimatedPressable>
                            );
                          })}
                          {remainingExpandedCount > 0 ? (
                            <Pressable
                              style={[
                                styles.commentReplyToggle,
                                {
                                  paddingLeft: 48,
                                },
                              ]}
                              disabled={isLoadingReplies}
                              onPress={() => {
                                if (hasLoadedAllReplies) {
                                  return;
                                }
                                const nextPage = Number.isFinite(
                                  comment.replyPage,
                                )
                                  ? comment.replyPage + 1
                                  : 0;
                                requestReplies(
                                  comment.id,
                                  nextPage,
                                  commentSortKey,
                                );
                              }}>
                              <View style={styles.commentReplyToggleLine} />
                              <CustomText
                                style={[styles.commentReplyToggleText]}>
                                {isLoadingReplies
                                  ? ''
                                  : `답글 ${remainingExpandedCount}개 더보기`}
                              </CustomText>
                              {isLoadingReplies ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#9AA1AE"
                                />
                              ) : null}
                            </Pressable>
                          ) : (
                            <Pressable
                              style={[
                                styles.commentReplyToggle,
                                {
                                  paddingLeft: 48,
                                },
                              ]}
                              onPress={() =>
                                setExpandedReplies(prev => ({
                                  ...prev,
                                  [comment.id]: false,
                                }))
                              }>
                              <View style={styles.commentReplyToggleLine} />
                              <CustomText
                                style={[styles.commentReplyToggleText]}>
                                답글 접기
                              </CustomText>
                            </Pressable>
                          )}
                        </View>
                      ) : null}
                      {!isExpanded &&
                      !isPreviewHidden &&
                      previewReplies.length ? (
                        <View style={styles.commentReplyList}>
                          {previewReplies.map(reply => (
                            <View
                              key={reply.id}
                              style={styles.commentReplyItem}>
                              <Animated.View
                                pointerEvents="none"
                                style={[
                                  styles.commentHighlight,
                                  getHighlightOpacityStyle(reply.id),
                                ]}
                              />
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
                              </View>
                              <View style={styles.commentReplyLikeColumn}>
                                <Pressable
                                  hitSlop={8}
                                  onPress={() => onToggleLike(reply.id)}>
                                  <Ionicons
                                    name={
                                      commentLikeState[reply.id]
                                        ? 'heart'
                                        : 'heart-outline'
                                    }
                                    size={18}
                                    color={
                                      commentLikeState[reply.id]
                                        ? '#FF5E5E'
                                        : '#A0A5AE'
                                    }
                                  />
                                </Pressable>
                                <CustomText style={styles.commentLikeCount}>
                                  {formatLikeCount(
                                    (reply.likes ?? 0) +
                                      (commentLikeState[reply.id] ? 1 : 0) -
                                      (reply.isLiked ? 1 : 0),
                                  )}
                                </CustomText>
                              </View>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {!isExpanded && previewVisibleCount > 0 ? (
                        remainingReplyCount > 0 ? (
                          <Pressable
                            style={[
                              styles.commentReplyToggle,
                              {paddingLeft: 48},
                            ]}
                            disabled={isLoadingReplies}
                            onPress={() => {
                              setHiddenPreviewReplies(prev => ({
                                ...prev,
                                [comment.id]: false,
                              }));
                              setExpandedReplies(prev => ({
                                ...prev,
                                [comment.id]: true,
                              }));
                              if (
                                !hasLoadedAllReplies &&
                                !Number.isFinite(comment.replyPage)
                              ) {
                                requestReplies(comment.id, 0, commentSortKey);
                              }
                            }}>
                            <View style={styles.commentReplyToggleLine} />
                            <CustomText style={styles.commentReplyToggleText}>
                              {isLoadingReplies
                                ? '불러오는 중...'
                                : `답글 ${remainingReplyCount}개 더보기`}
                            </CustomText>
                            {isLoadingReplies ? (
                              <ActivityIndicator size="small" color="#9AA1AE" />
                            ) : null}
                          </Pressable>
                        ) : (
                          <Pressable
                            style={[
                              styles.commentReplyToggle,
                              {paddingLeft: 48},
                            ]}
                            onPress={() =>
                              setHiddenPreviewReplies(prev => ({
                                ...prev,
                                [comment.id]: true,
                              }))
                            }>
                            <View style={styles.commentReplyToggleLine} />
                            <CustomText style={styles.commentReplyToggleText}>
                              답글 접기
                            </CustomText>
                          </Pressable>
                        )
                      ) : null}
                      {!isExpanded &&
                      previewVisibleCount === 0 &&
                      replyCount > 0 ? (
                        <Pressable
                          style={[styles.commentReplyToggle, {paddingLeft: 48}]}
                          disabled={isLoadingReplies}
                          onPress={() => {
                            setHiddenPreviewReplies(prev => ({
                              ...prev,
                              [comment.id]: false,
                            }));
                            setExpandedReplies(prev => ({
                              ...prev,
                              [comment.id]: true,
                            }));
                            if (
                              !hasLoadedAllReplies &&
                              !Number.isFinite(comment.replyPage)
                            ) {
                              requestReplies(comment.id, 0, commentSortKey);
                            }
                          }}>
                          <View style={styles.commentReplyToggleLine} />
                          <CustomText style={styles.commentReplyToggleText}>
                            {isLoadingReplies
                              ? '불러오는 중...'
                              : `답글 ${replyCount}개 더보기`}
                          </CustomText>
                          {isLoadingReplies ? (
                            <ActivityIndicator size="small" color="#9AA1AE" />
                          ) : null}
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })
              )}
              {currentSheetIndex === 0 ? (
                <View
                  style={{height: footerSpacing, backgroundColor: '#FFF'}}
                />
              ) : null}
            </ScrollView>
          </BottomSheetView>
        </BottomSheetModal>
        <PostReportBottomSheet
          sheetRef={reportSheetRef}
          reasons={COMMENT_REPORT_REASONS}
          selectedReason={selectedReportReason}
          onSelectReason={handleSelectReportReason}
          onSubmit={handleReportSubmit}
          title="댓글 신고하기"
        />
      </>
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
  commentSheetBody: {
    flex: 1,
  },
  commentSheetScroll: {
    flex: 1,
  },
  commentSheetHeader: {
    paddingBottom: 15,
    flexDirection: 'column',
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
    paddingTop: 12,
    paddingBottom: 100,
    gap: 18,
  },
  commentSortRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 10,
  },
  commentSortText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#9AA1AE',
  },
  commentSortTextActive: {
    color: '#333',
  },
  commentSortDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E4EA',
  },
  moreMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  moreMenu: {
    position: 'absolute',
    right: 16,
    top: 60,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    minWidth: 140,
    zIndex: 21,
  },
  moreMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  moreMenuItemTextDestructive: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#E03131',
    textAlign: 'center',
  },
  moreMenuItemTextPrimary: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#007AFF',
    textAlign: 'center',
  },
  commentEmptyText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    textAlign: 'center',
    paddingVertical: 24,
  },
  commentLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  commentLoadingText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
    paddingHorizontal: 18,
    position: 'relative',
  },
  commentItemDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 8,
    zIndex: 2,
  },
  commentItemSelected: {
    transform: [{scale: 0.9}],
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
  commentReplyPressable: {
    alignSelf: 'flex-start',
  },
  commentReplyList: {
    // gap: 14,
  },
  commentReplyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingLeft: 48,
    paddingRight: 18,
    paddingVertical: 7,
    position: 'relative',
  },
  commentHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ColorUtil.mainChip,
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
    width: 42,
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  commentReplyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  replyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#E7ECEF',
    borderBottomWidth: 0,
    backgroundColor: '#F8F9F9',
    paddingHorizontal: 15,
  },
  replyTarget: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    paddingVertical: 10,
    flex: 1,
    marginRight: 8,
  },
  commentInputField: {
    flex: 1,
    minHeight: 32,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E7ECEF',
    borderRadius: 20,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInputFieldReply: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderRadius: 0,
    borderTopWidth: 0,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    marginLeft: 8,
    maxHeight: 80,
    padding: 0,
    margin: 0,
    paddingVertical: 12,
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
