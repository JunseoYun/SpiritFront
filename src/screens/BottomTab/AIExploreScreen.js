// -------------------- AIExploreScreen (사진 동일하게 리디자인) -----------------------

import React, {useState, useLayoutEffect, useEffect, useRef} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useHeaderHeight} from '@react-navigation/elements';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
import LinearGradient from 'react-native-linear-gradient';
import {useToast} from '../../context/ToastContext';
import ColorUtil from '../../utils/ColorUtil';
import AIMicIcon from '../../assets/svg/AIMicIcon';
import MenuIcon from '../../assets/svg/MenuIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AIExploreScreen = ({navigation}) => {
  const {showToast} = useToast();
  const [prompt, setPrompt] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [messages, setMessages] = useState([]);
  const headerHeight = useHeaderHeight();
  const hasPrompt = prompt.trim().length > 0;
  const hasMessages = messages.length > 0;
  const scrollViewRef = useRef(null);
  const titleAnim = useRef(new Animated.Value(1)).current;
  const chipAnim = useRef(new Animated.Value(1)).current;
  const [showTitle, setShowTitle] = useState(true);
  const [showChips, setShowChips] = useState(true);

  const suggestions = [
    {keyword: '늦게까지 하는', subtext: '호프집 알려줘'},
    {keyword: '회식하기 좋은', subtext: '이자카야 추천해줘'},
    {keyword: '축구 보면서', subtext: '한잔하기 좋은 곳 알려줘'},
    {keyword: '가성비 좋은', subtext: '술집 추천해줘'},
    {keyword: '단체 가기 편한', subtext: '술집 어디 있어?'},
    {keyword: '분위기 깔끔한', subtext: '바 추천해줘'},
    {keyword: '안주 잘하는', subtext: '술집 찾아줘'},
  ];

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      showToast('한잔하고 싶은 술집을 입력해주세요', 'center');
      return;
    }
    setMessages(prev => [
      ...prev,
      {id: `${Date.now()}-${prev.length}`, text: trimmed},
    ]);
    setPrompt('');
    Keyboard.dismiss();
    showToast('AI 탐색 준비중...', 'center');
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => null,
      headerShadowVisible: false,
      headerLeft: () => (
        <Pressable
          style={{marginLeft: 18}}
          hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
          <MenuIcon size={10} />
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const animateVisibility = (anim, visible, setVisible) => {
      if (visible) setVisible(true);
      Animated.timing(anim, {
        toValue: visible ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (!visible) setVisible(false);
      });
    };

    animateVisibility(
      titleAnim,
      !isInputFocused && !hasPrompt && !hasMessages,
      setShowTitle,
    );
  }, [isInputFocused, hasPrompt, hasMessages, titleAnim]);

  useEffect(() => {
    const animateVisibility = (anim, visible, setVisible) => {
      if (visible) setVisible(true);
      Animated.timing(anim, {
        toValue: visible ? 1 : 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (!visible) setVisible(false);
      });
    };

    animateVisibility(chipAnim, !hasPrompt && !hasMessages, setShowChips);
  }, [hasPrompt, hasMessages, chipAnim]);

  useEffect(() => {
    if (hasMessages && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [hasMessages, messages]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={headerHeight}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container} edges={['top']}>
          {/** ─────────── MAIN CONTENT ─────────── */}
          <View
            style={[
              styles.center,
              hasMessages ? styles.chatContainer : styles.emptyCenter,
            ]}>
            {hasMessages ? (
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.chatContent}>
                {messages.map(message => (
                  <View key={message.id} style={styles.bubbleRow}>
                    <View style={styles.messageBubble}>
                      <CustomText style={styles.messageText}>
                        {message.text}
                      </CustomText>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              showTitle && (
                <Animated.View
                  style={[
                    styles.titleWrap,
                    {
                      opacity: titleAnim,
                    },
                  ]}>
                  <CustomText style={styles.title}>
                    오늘은 어디서 한잔할까요?
                  </CustomText>
                </Animated.View>
              )
            )}
          </View>

          {showChips && (
            <Animated.View
              style={[
                styles.suggestionWrap,
                {
                  opacity: chipAnim,
                },
              ]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}>
                {suggestions.map(({keyword, subtext}) => {
                  const fullText = `${keyword} ${subtext}`;
                  return (
                    <LinearGradient
                      key={keyword}
                      colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.chipBorder}>
                      <Pressable
                        style={styles.chip}
                        onPress={() => setPrompt(fullText)}>
                        <CustomText style={styles.chipKeyword}>
                          {keyword}
                        </CustomText>
                        <CustomText style={styles.chipSubtext}>
                          {subtext}
                        </CustomText>
                      </Pressable>
                    </LinearGradient>
                  );
                })}
              </ScrollView>
            </Animated.View>
          )}

          {/** ─────────── INPUT FIELD ─────────── */}
          <View style={[styles.bottomInput]}>
            <View style={styles.inputBox}>
              <CustomTextInput
                placeholder="한잔하고 싶은 술집을 입력하세요"
                value={prompt}
                onChangeText={setPrompt}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onSubmitEditing={submit}
                placeholderTextColor={ColorUtil.placeholderText}
                style={styles.input}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              <View
                style={[
                  styles.trailingAction,
                  hasPrompt ? styles.sendAlign : styles.micAlign,
                ]}>
                {hasPrompt ? (
                  <Pressable style={styles.sendButton} onPress={submit}>
                    <Ionicons name="arrow-up" size={20} color="#333" />
                  </Pressable>
                ) : (
                  <AIMicIcon size={22} />
                )}
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    backgroundColor: '#FFF',
    flex: 1,
  },

  // CENTER SECTION
  center: {
    flex: 1,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  chatContent: {
    paddingBottom: 12,
  },
  bubbleRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  messageBubble: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderBottomRightRadius: 0,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    lineHeight: 16 * 1.4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 70,
  },

  chipRow: {
    paddingHorizontal: 12,
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
  },
  chipBorder: {
    marginHorizontal: 6,
    borderRadius: 16,
  },
  chip: {
    borderRadius: 14.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 1.5,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipKeyword: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
    lineHeight: 15 * 1.3,
    letterSpacing: 0,
  },
  chipSubtext: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    marginTop: 2,
  },

  // INPUT SECTION
  bottomInput: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    alignItems: 'center',
    paddingTop: 12,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  inputBox: {
    flex: 1,
    minHeight: 28,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
    }),

    marginLeft: 6,
    maxHeight: 80,
  },
  trailingAction: {
    marginLeft: 10,
    marginRight: 4,
  },
  sendAlign: {
    alignSelf: 'flex-end',
    paddingBottom: 6,
    marginRight: -4,
  },
  micAlign: {
    alignSelf: 'center',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AIExploreScreen;
