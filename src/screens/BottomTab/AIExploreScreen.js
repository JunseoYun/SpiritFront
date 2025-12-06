// -------------------- AIExploreScreen (사진 동일하게 리디자인) -----------------------

import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
  BackHandler,
  Dimensions,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import {useFocusEffect} from '@react-navigation/native';
import {useHeaderHeight} from '@react-navigation/elements';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
import LinearGradient from 'react-native-linear-gradient';
import {useToast} from '../../context/ToastContext';
import ColorUtil from '../../utils/ColorUtil';
import AIMicIcon from '../../assets/svg/AIMicIcon';
import MenuIcon from '../../assets/svg/MenuIcon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {RotateCwIcon} from 'lucide-react-native';
import {AIFullIcon} from '../../assets/svg/AiTabIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Agent_chat_search} from '../../api/agentApi';
import {getAddress, getLocation} from '../../storage/locationStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AIResultCard from '../../components/AIExplore/AIResultCard';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request as requestPermission,
} from 'react-native-permissions';

const SAMPLE_RECENT_FIRST_PROMPTS = [
  '강남역에서 조용한 와인바 알려줘',
  '홍대에서 분위기 좋은 칵테일바 추천해줘',
  '야외 테라스 있는 술집 찾아줘',
  '을지로 감성 있는 포차 알려줘',
  '이태원에서 새벽까지 하는 바 추천해줘',
  '단체 회식하기 좋은 이자카야 알려줘',
  '가성비 좋은 맥주집 찾아줘',
  '분위기 깔끔한 수제맥주 펍 추천',
  '직장인 회식하기 좋은 곳 알려줘',
  '데이트하기 좋은 와인바 찾아줘',
  '칵테일 잘하는 바 추천해줘',
  '분위기 어두운 스피크이지 알려줘',
  '루프탑에서 한잔할 수 있는 곳',
  '혼술하기 편한 바 추천',
  '안주 맛있는 술집 알려줘',
  '라이브 음악 있는 바 추천해줘',
  '강남역 새벽까지 하는 바 찾아줘',
  '회식 10명 가능한 공간 있는 곳',
  '응원 보면서 술 마실 수 있는 곳',
  '예약 가능한 조용한 술집',
  '노포 감성 포장마차 추천',
  '뷰 좋은 한강 근처 술집 알려줘',
  '와인 콜키지 가능한 곳 찾아줘',
  '신논현역 바로 앞 술집 추천',
  '이태원 프리미엄 바 추천해줘',
  '소주 말고 칵테일 많은 곳',
  '브런치도 되는 바 알려줘',
  '디저트도 파는 와인바 찾아줘',
  '분위기 좋은 2차 장소 추천',
  '조용히 이야기하기 좋은 술집',
];
const USE_SAMPLE_RECENT_PROMPTS = false; // 샘플 목록을 보고 싶을 때 true 로 전환
const NO_RESULT_SYSTEM_TEXT =
  '방금 추천해 준 조건으로 찾아봤는데 검색된 매장이 없어. 위치를 제외한 모든 조건은 초기화하고 이어서 말하는 내용 반영해서 다시 찾아 줘.';

const AIExploreScreen = ({navigation}) => {
  const {showToast} = useToast();
  const insets = useSafeAreaInsets();
  const RECENT_FIRST_PROMPT_KEY = 'RECENT_AI_FIRST_PROMPTS';
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = Math.min(screenWidth * 0.78, 320);
  const drawerShift = drawerWidth;
  const [prompt, setPrompt] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [address, setAddress] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [lastResponseId, setLastResponseId] = useState(null);
  const [sending, setSending] = useState(false);
  const headerHeight = useHeaderHeight();
  const keyboardVerticalOffset = headerHeight - 10;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const hasPrompt = prompt.trim().length > 0;
  const hasMessages = chatHistory.length > 0;
  const scrollViewRef = useRef(null);
  const pendingScrollMessageIdRef = useRef(null);
  const titleAnim = useRef(new Animated.Value(1)).current;
  const chipAnim = useRef(new Animated.Value(1)).current;
  const [showTitle, setShowTitle] = useState(true);
  const [showChips, setShowChips] = useState(true);
  const [recentFirstPrompts, setRecentFirstPrompts] = useState(
    USE_SAMPLE_RECENT_PROMPTS ? SAMPLE_RECENT_FIRST_PROMPTS : [],
  );
  const [showDrawer, setShowDrawer] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const contentShiftAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);
  const pendingVoiceSendRef = useRef(false);
  const keepRecordingRef = useRef(false);
  const autoSentVoiceRef = useRef(false);
  const restartTimerRef = useRef(null);
  const voiceAccumRef = useRef('');
  const transcribeTimeoutRef = useRef(null);
  const silenceDurationMs = 120000;
  const recordShiftAnim = useRef(new Animated.Value(0)).current;
  const volumeLevel = useRef(new Animated.Value(0)).current;
  const waveformUnitWidth = 3 + 0.8 * 2;
  const waveformBarCount = useMemo(() => {
    const minBars = Math.ceil(screenWidth / waveformUnitWidth);
    return Math.min(minBars * 6, 600); // plenty of bars to scroll without recycling
  }, [screenWidth, waveformUnitWidth]);
  const waveformSeeds = useMemo(
    () =>
      Array.from({length: waveformBarCount}, () => 0.4 + Math.random() * 0.8),
    [waveformBarCount],
  );
  const isVoiceSupported = Platform.OS !== 'android';

  const voiceStartOptions = useMemo(
    () =>
      Platform.select({
        android: {
          EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: silenceDurationMs,
          EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS:
            silenceDurationMs,
          EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 5000,
          EXTRA_PARTIAL_RESULTS: true,
        },
        ios: {
          AVAudioSessionMode: 'measurement',
          AVAudioSessionCategory: 'playAndRecord',
          shouldPlayAudioDucking: true,
        },
        default: {},
      }),
    [silenceDurationMs],
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceInputPending, setVoiceInputPending] = useState(false);

  const closeDrawer = useCallback(() => {
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: -drawerWidth,
        duration: 320,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentShiftAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        setShowDrawer(false);
      }
    });
  }, [contentShiftAnim, drawerAnim, drawerWidth, overlayAnim]);

  const updateDrawerByGesture = useCallback(
    value => {
      const clamped = Math.min(0, Math.max(-drawerWidth, value));
      drawerAnim.setValue(clamped);
      const progress = 1 + clamped / drawerWidth; // 0 to 1
      contentShiftAnim.setValue(progress * drawerShift);
      overlayAnim.setValue(progress);
    },
    [contentShiftAnim, drawerAnim, drawerShift, drawerWidth, overlayAnim],
  );

  const overlayPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const {dx} = gestureState;
        return Math.abs(dx) > 8;
      },
      onPanResponderMove: (_, gestureState) => {
        updateDrawerByGesture(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldClose = gestureState.dx < -drawerWidth * 0.25;
        if (shouldClose) {
          closeDrawer();
        } else {
          Animated.parallel([
            Animated.timing(drawerAnim, {
              toValue: 0,
              duration: 320,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(contentShiftAnim, {
              toValue: drawerShift,
              duration: 320,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(overlayAnim, {
              toValue: 1,
              duration: 320,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  const overlayPanHandlers = showDrawer ? overlayPanResponder.panHandlers : {};

  const resetChat = useCallback(() => {
    Voice.cancel().catch(() => {});
    setChatHistory([]);
    setLastResponseId(null);
    setPrompt('');
    setShowTitle(true);
    setShowChips(true);
    setIsRecording(false);
    setIsTranscribing(false);
    setVoiceInputPending(false);
    voiceAccumRef.current = '';
    keepRecordingRef.current = false;
    restartTimerRef.current && clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
    clearTranscribeTimer();
    scrollViewRef.current?.scrollTo({y: 0, animated: false});
  }, [clearTranscribeTimer]);

  const loadRecentFirstPrompt = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_FIRST_PROMPT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const next = USE_SAMPLE_RECENT_PROMPTS
            ? [...parsed, ...SAMPLE_RECENT_FIRST_PROMPTS]
            : parsed;
          setRecentFirstPrompts(next);
          return;
        }
      }
      const fallback = USE_SAMPLE_RECENT_PROMPTS
        ? SAMPLE_RECENT_FIRST_PROMPTS
        : [];
      setRecentFirstPrompts(fallback);
    } catch (e) {
      const fallback = USE_SAMPLE_RECENT_PROMPTS
        ? SAMPLE_RECENT_FIRST_PROMPTS
        : [];
      setRecentFirstPrompts(fallback);
    }
  }, [RECENT_FIRST_PROMPT_KEY]);

  const handlePromptSelect = text => {
    const cleaned = text?.trim();
    if (!cleaned) {
      return;
    }
    setPrompt(cleaned);
    submit(cleaned);
  };

  const removeRecentFirstPrompt = useCallback(
    index => {
      setRecentFirstPrompts(prev => {
        const next = prev.filter((_, i) => i !== index);
        AsyncStorage.setItem(
          RECENT_FIRST_PROMPT_KEY,
          JSON.stringify(next),
        ).catch(() => {});
        return next;
      });
    },
    [RECENT_FIRST_PROMPT_KEY],
  );

  const clearRecentFirstPrompts = useCallback(() => {
    if (!recentFirstPrompts.length) {
      showToast('최근 질문이 없습니다', 'center');
      return;
    }
    setRecentFirstPrompts([]);
    AsyncStorage.removeItem(RECENT_FIRST_PROMPT_KEY).catch(() => {});
  }, [RECENT_FIRST_PROMPT_KEY, recentFirstPrompts.length, showToast]);

  const handleOpenMapWithAiResult = useCallback(
    (stores, searchConditions, promptText) => {
      navigation.navigate('MapScreen', {
        aiStores: Array.isArray(stores) ? stores : [],
        aiSearchConditions: searchConditions || null,
        searchConditions: searchConditions || null,
        aiSearchPrompt: typeof promptText === 'string' ? promptText : null,
        prevTab: 'AIExploreScreen',
      });
    },
    [navigation],
  );

  const suggestions = [
    {keyword: '지금 바로 갈 수 있는', subtext: '호프집 알려줘'},
    {keyword: '2시간 뒤에도 영업하는', subtext: '펍·바 찾아줘'},
    {keyword: '회식하기 좋은', subtext: '고깃집 추천해줘'},
    {keyword: '축구 보면서', subtext: '술 마실 곳 알려줘'},
    {keyword: '가성비 좋은', subtext: '술집 추천해줘'},
    {keyword: '개별 룸 있는', subtext: '이자카야 알려줘'},
    {keyword: '단체로 가기 좋은', subtext: '술집 추천해줘'},
    {keyword: '인테리어 깔끔한', subtext: '와인바 추천해줘'},
    {keyword: '방어 파는 곳', subtext: '알려줘'},
  ];
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainScreen'); // MainScreen 탭으로 전환
        return true; // 기본 뒤로가기 방지
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const submit = useCallback(
    async (textOverride, options = {}) => {
      const {skipApi = false} = options;
      const sourceText =
        typeof textOverride === 'string' ? textOverride : prompt;
      const trimmed = sourceText.trim();
      if (!trimmed) {
        showToast('한잔하고 싶은 술집을 입력해주세요', 'center');
        return;
      }
      if (trimmed.length > 200) {
        showToast('메시지는 200자 이하로 입력해주세요', 'center');
        return;
      }
      const lastAssistantMessage = [...chatHistory]
        .reverse()
        .find(msg => msg.role === 'assistant');
      const shouldAppendSystemText =
        lastAssistantMessage?.agentMode === 'NO_RESULT';
      const payloadText = shouldAppendSystemText
        ? `${NO_RESULT_SYSTEM_TEXT} ${trimmed}`
        : trimmed;
      if (sending) {
        return;
      }
      const previousResponseId = lastResponseId;
      const isFirstUserMessage = previousResponseId == null;
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
      };
      setChatHistory(prev => [...prev, userMessage]);
      setPrompt('');
      Keyboard.dismiss();
      if (skipApi) {
        console.log('[AIExplore voice] message sent without API:', trimmed);
        return;
      }
      setSending(true);
      if (isFirstUserMessage) {
        try {
          const current =
            Array.isArray(recentFirstPrompts) && recentFirstPrompts.length
              ? recentFirstPrompts
              : [];
          const next = [trimmed, ...current].slice(0, 10);
          setRecentFirstPrompts(next);
          await AsyncStorage.setItem(
            RECENT_FIRST_PROMPT_KEY,
            JSON.stringify(next),
          );
        } catch (e) {
          // ignore storage errors
        }
      }
      try {
        const location = (await getLocation()) || userLocation;
        if (location) {
          setUserLocation(location);
        }
        const payload = {
          previousResponseId,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          userMessage: payloadText,
        };
        console.log(payload);
        const data = await Agent_chat_search(payload);
        if (!data) {
          showToast(
            '답변을 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
            'center',
          );
          return;
        }
        console.log(data);
        const agentResult = data?.llmAgentResult || data || {};
        const responseId = agentResult?.responseId;
        const storeList = data?.stores?.content;
        const searchConditions = agentResult?.searchConditions;
        console.log(searchConditions);

        if (responseId) {
          setLastResponseId(responseId);
        }
        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: agentResult?.agentMessage,
          agentMode:
            agentResult?.agentMode ??
            (Array.isArray(storeList) && storeList.length
              ? 'SHOW_RESULT'
              : null),
          changedAddress: data?.changedAddress?.address ?? null,
          stores: Array.isArray(storeList) ? storeList : [],
          searchConditions: searchConditions || null,
          userPrompt: trimmed,
        };

        pendingScrollMessageIdRef.current = aiMessage.id;
        setChatHistory(prev => [...prev, aiMessage]);
      } catch (error) {
        showToast('죄송해요. 잠시 후 다시 시도해주세요.', 'center');
      } finally {
        setSending(false);
      }
    },
    [
      Agent_chat_search,
      RECENT_FIRST_PROMPT_KEY,
      chatHistory,
      lastResponseId,
      prompt,
      recentFirstPrompts,
      sending,
      showToast,
      userLocation,
    ],
  );

  const openDrawer = useCallback(async () => {
    if (isRecording || keepRecordingRef.current || isTranscribing) {
      await stopRecordingAndTranscribe({shouldSend: false});
    }
    Keyboard.dismiss();
    inputRef.current?.blur();
    setIsInputFocused(false);
    await loadRecentFirstPrompt();
    setShowDrawer(true);
    drawerAnim.setValue(-drawerWidth);
    contentShiftAnim.setValue(0);
    overlayAnim.setValue(0);
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentShiftAnim, {
        toValue: drawerShift,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    loadRecentFirstPrompt,
    drawerAnim,
    drawerWidth,
    contentShiftAnim,
    drawerShift,
    overlayAnim,
    isRecording,
    isTranscribing,
    stopRecordingAndTranscribe,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      gestureEnabled: false,
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadAddress = async () => {
        try {
          const [stored, location] = await Promise.all([
            getAddress(),
            getLocation(),
          ]);
          if (isActive) {
            setAddress(stored || '설정된 주소가 없어요');
            if (location) {
              setUserLocation(location);
            }
          }
        } catch (error) {
          console.log('현재 주소 불러오기 실패:', error);
          if (isActive) {
            setAddress('주소 정보를 불러오지 못했어요');
          }
        }
      };
      loadAddress();
      return () => {
        isActive = false;
      };
    }, []),
  );

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
    if ((hasMessages || sending) && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [hasMessages, chatHistory, sending]);

  const handleMessageLayout = useCallback((messageId, y) => {
    if (
      pendingScrollMessageIdRef.current &&
      messageId === pendingScrollMessageIdRef.current
    ) {
      pendingScrollMessageIdRef.current = null;
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({y, animated: true});
      });
    }
  }, []);

  const clearTranscribeTimer = useCallback(() => {
    if (transcribeTimeoutRef.current) {
      clearTimeout(transcribeTimeoutRef.current);
      transcribeTimeoutRef.current = null;
    }
  }, []);

  const startTranscribeTimer = useCallback(() => {
    clearTranscribeTimer();
    transcribeTimeoutRef.current = setTimeout(() => {
      setIsTranscribing(false);
      transcribeTimeoutRef.current = null;
    }, 2500);
  }, [clearTranscribeTimer]);

  useFocusEffect(
    useCallback(() => {
      loadRecentFirstPrompt();
    }, [loadRecentFirstPrompt]),
  );

  useEffect(() => {
    let spinLoop;
    if (sending) {
      spinLoop = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoop.start();
    } else {
      spinAnim.stopAnimation(() => spinAnim.setValue(0));
    }
    return () => {
      spinLoop?.stop();
    };
  }, [sending, spinAnim]);

  useEffect(() => {
    Animated.timing(volumeLevel, {
      toValue: isRecording || isTranscribing ? 0.12 : 0,
      duration: isRecording || isTranscribing ? 220 : 180,
      useNativeDriver: true,
    }).start();
  }, [isRecording, isTranscribing, volumeLevel]);

  useEffect(() => {
    let shiftAnim;
    if (isRecording) {
      recordShiftAnim.stopAnimation();
      recordShiftAnim.setValue(0);
      shiftAnim = Animated.timing(recordShiftAnim, {
        toValue: 1,
        duration: waveformDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      shiftAnim.start();
    } else {
      recordShiftAnim.stopAnimation(() => recordShiftAnim.setValue(0));
    }
    return () => {
      shiftAnim?.stop();
    };
  }, [isRecording, recordShiftAnim, waveformDuration]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleShow = e => {
      setKeyboardVisible(true);
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      });
    };
    const handleHide = () => {
      setKeyboardVisible(false);
    };

    const showSub = Keyboard.addListener(showEvent, handleShow);
    const hideSub = Keyboard.addListener(hideEvent, handleHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const restartListening = useCallback(async () => {
    if (!isVoiceSupported) {
      return;
    }
    try {
      restartTimerRef.current && clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
      if (!keepRecordingRef.current) {
        return;
      }
      await Voice.start('ko-KR', voiceStartOptions);
      setIsRecording(true);
      setIsTranscribing(false);
      console.log('[AIExplore voice] restarted listening');
    } catch (error) {
      console.log('[AIExplore voice] restart error', error);
      restartTimerRef.current = setTimeout(restartListening, 400);
    }
  }, [isVoiceSupported, voiceStartOptions]);

  useEffect(() => {
    if (!isVoiceSupported) {
      return;
    }
    Voice.onSpeechStart = () => {
      if (keepRecordingRef.current) {
        setIsRecording(true);
        setIsTranscribing(false);
      }
    };
    Voice.onSpeechEnd = () => {
      if (keepRecordingRef.current) {
        setIsRecording(true);
        setIsTranscribing(false);
        restartTimerRef.current && clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(restartListening, 200);
      } else {
        setIsRecording(false);
        // stop 이후에는 받아쓰기 상태 유지
      }
    };
    Voice.onSpeechError = error => {
      console.log('[AIExplore voice] error', error);
      if (autoSentVoiceRef.current) {
        return;
      }
      if (keepRecordingRef.current) {
        setIsRecording(true);
        setIsTranscribing(false);
        restartTimerRef.current && clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(restartListening, 300);
      } else {
        setIsRecording(false);
        // stop 이후에는 받아쓰기 상태 유지
        const fallback =
          typeof voiceAccumRef.current === 'string'
            ? voiceAccumRef.current.trim()
            : '';
        const shouldSend = pendingVoiceSendRef.current && fallback;
        if (shouldSend) {
          submit(fallback);
          setPrompt('');
          setVoiceInputPending(false);
          voiceAccumRef.current = '';
          autoSentVoiceRef.current = true;
        } else if (fallback) {
          setPrompt(fallback);
          setVoiceInputPending(true);
          voiceAccumRef.current = fallback;
        } else {
          setVoiceInputPending(false);
          voiceAccumRef.current = '';
        }
        pendingVoiceSendRef.current = false;
      }
    };
    Voice.onSpeechResults = event => {
      if (autoSentVoiceRef.current) {
        return;
      }
      const text = Array.isArray(event?.value) ? event.value[0]?.trim() : '';
      const fallback =
        text ||
        (typeof voiceAccumRef.current === 'string'
          ? voiceAccumRef.current.trim()
          : '');
      clearTranscribeTimer();
      setIsTranscribing(false);
      setIsRecording(false);
      if (keepRecordingRef.current) {
        voiceAccumRef.current = fallback || voiceAccumRef.current;
        setIsRecording(true); // keep showing recording UI while looping
        return; // 녹음 중에는 최종 텍스트를 입력창에 표시하지 않음
      }
      if (pendingVoiceSendRef.current) {
        if (fallback) {
          submit(fallback);
          setPrompt('');
          setVoiceInputPending(false);
          voiceAccumRef.current = '';
          autoSentVoiceRef.current = true;
        } else {
          setVoiceInputPending(false);
          voiceAccumRef.current = '';
        }
        pendingVoiceSendRef.current = false;
        return;
      }
      if (!fallback) {
        setVoiceInputPending(false);
        voiceAccumRef.current = '';
        return;
      }
      voiceAccumRef.current = fallback;
      setPrompt(fallback);
      setVoiceInputPending(true);
    };

    Voice.onSpeechPartialResults = event => {
      if (autoSentVoiceRef.current) {
        return;
      }
      const partial = Array.isArray(event?.value) ? event.value[0]?.trim() : '';
      if (!keepRecordingRef.current) {
        return;
      }
      voiceAccumRef.current = partial || voiceAccumRef.current;
    };

    Voice.onSpeechVolumeChanged = event => {
      if (!keepRecordingRef.current) {
        return;
      }
      const raw =
        typeof event?.value === 'number'
          ? event.value
          : parseFloat(event?.value ?? '0');
      const base = isFinite(raw) ? raw : 0;
      const normalized = Math.max(0, Math.min(3, base > 1 ? base / 1.5 : base));
      const eased = Math.max(0, normalized - 0.05);
      Animated.timing(volumeLevel, {
        toValue: eased,
        duration: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    return () => {
      restartTimerRef.current && clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
      clearTranscribeTimer();
      Voice.destroy()
        .then(Voice.removeAllListeners)
        .catch(() => {});
    };
  }, [clearTranscribeTimer, isVoiceSupported, restartListening, submit]);

  const bottomPadding = keyboardVisible ? insets.bottom + 24 : insets.bottom;
  const showSendButton = hasPrompt;
  const showMicButton = !showSendButton && isVoiceSupported;
  const showRecordingUI = isVoiceSupported && (isRecording || isTranscribing);
  const waveformBars = useMemo(
    () => waveformSeeds.map((seed, idx) => ({seed, idx})),
    [waveformSeeds],
  );
  const waveformWidth = useMemo(
    () => waveformBars.length * waveformUnitWidth,
    [waveformBars.length, waveformUnitWidth],
  );
  const waveformTravel = Math.max(0, waveformWidth - screenWidth);
  const waveformPxPerSec = 36;
  const waveformDuration = Math.max(
    (waveformTravel / Math.max(waveformPxPerSec, 1)) * 1000,
    60000,
  ); // default slow glide, at least 60s so it never resets during typical recordings

  const requestMicPermission = useCallback(async () => {
    if (!isVoiceSupported) {
      return false;
    }
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;
    if (!permission) {
      return true;
    }
    try {
      const current = await check(permission);
      if (current === RESULTS.GRANTED || current === RESULTS.LIMITED) {
        return true;
      }
      if (current === RESULTS.BLOCKED) {
        showToast('마이크 권한을 설정에서 허용해주세요', 'center');
        return false;
      }
      const next = await requestPermission(permission);
      if (next === RESULTS.GRANTED || next === RESULTS.LIMITED) {
        return true;
      }
      showToast('마이크 권한이 필요해요', 'center');
      return false;
    } catch (error) {
      showToast('마이크 권한을 확인할 수 없어요', 'center');
      return false;
    }
  }, [isVoiceSupported, showToast]);

  const handleMicPress = useCallback(() => {
    if (!isVoiceSupported) {
      return;
    }
    const start = async () => {
      if (sending || isRecording || isTranscribing) {
        return;
      }
      const granted = await requestMicPermission();
      if (!granted) {
        return;
      }
      try {
        setVoiceInputPending(false);
        setIsTranscribing(false);
        pendingVoiceSendRef.current = false;
        voiceAccumRef.current = '';
        keepRecordingRef.current = false;
        autoSentVoiceRef.current = false;
        await Voice.stop().catch(() => {});
        await Voice.cancel().catch(() => {});
        await Voice.start('ko-KR', voiceStartOptions);
        keepRecordingRef.current = true;
        setIsRecording(true);
        console.log('[AIExplore voice] recording started');
      } catch (error) {
        console.log('[AIExplore voice] start error', error);
        showToast('녹음을 시작할 수 없어요', 'center');
      }
    };
    start();
  }, [
    isVoiceSupported,
    isRecording,
    isTranscribing,
    requestMicPermission,
    sending,
    showToast,
    voiceStartOptions,
  ]);

  const stopRecordingAndTranscribe = useCallback(
    async ({shouldSend = false} = {}) => {
      if (
        !isVoiceSupported ||
        (!isRecording && !isTranscribing && !keepRecordingRef.current)
      ) {
        return;
      }
      setIsRecording(false);
      setIsTranscribing(true);
      pendingVoiceSendRef.current = shouldSend;
      keepRecordingRef.current = false;
      restartTimerRef.current && clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
      Animated.timing(volumeLevel, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
      startTranscribeTimer();
      console.log('[AIExplore voice] recording stopped');
      try {
        await Voice.stop();
      } catch (error) {
        console.log('[AIExplore voice] stop error', error);
        setIsTranscribing(false);
        pendingVoiceSendRef.current = false;
      }
    },
    [isRecording, isTranscribing, isVoiceSupported, startTranscribeTimer],
  );

  const handleSendPress = useCallback(async () => {
    if (sending || isTranscribing) {
      return;
    }
    if (isRecording || keepRecordingRef.current) {
      await stopRecordingAndTranscribe({shouldSend: true});
      return;
    }
    if (!prompt.trim()) {
      return;
    }
    if (voiceInputPending) {
      await submit(prompt);
      setVoiceInputPending(false);
      voiceAccumRef.current = '';
      return;
    }
    submit();
  }, [
    isRecording,
    isTranscribing,
    prompt,
    sending,
    stopRecordingAndTranscribe,
    submit,
    voiceInputPending,
  ]);

  const handleStopPress = useCallback(() => {
    if (isRecording || keepRecordingRef.current || isTranscribing) {
      stopRecordingAndTranscribe({shouldSend: false});
    }
  }, [isRecording, isTranscribing, stopRecordingAndTranscribe]);

  const handleChangePrompt = useCallback(text => {
    setPrompt(text);
    setVoiceInputPending(false);
    voiceAccumRef.current = text;
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={styles.flex}>
        {showDrawer && (
          <View style={styles.drawerLayer} pointerEvents="box-none">
            <Animated.View
              style={[
                styles.drawerOverlay,
                {
                  opacity: overlayAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.35],
                  }),
                },
              ]}
              {...overlayPanHandlers}>
              <Pressable
                style={styles.overlayPressArea}
                onPress={closeDrawer}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.drawerContainer,
                {
                  width: drawerWidth,
                  paddingTop:
                    insets.top + (Platform.OS === 'android' ? 20 : 10),
                  transform: [{translateX: drawerAnim}],
                },
              ]}
              {...overlayPanHandlers}>
              <View style={styles.drawerHeader}>
                <CustomText style={styles.sheetTitle}>탐색</CustomText>
                <Pressable onPress={closeDrawer} hitSlop={10}>
                  <Ionicons name="close" size={22} color="#333" />
                </Pressable>
              </View>
              <ScrollView
                style={styles.drawerScroll}
                contentContainerStyle={[
                  styles.drawerScrollContent,
                  {paddingBottom: insets.bottom + 10},
                ]}>
                <View style={styles.drawerSection}>
                  <Pressable
                    style={styles.drawerCard}
                    onPress={() => {
                      closeDrawer();
                      navigation.navigate('SetLocationScreen', {
                        origin: 'AIExploreScreen',
                      });
                    }}>
                    <Feather name="crosshair" size={18} color="#333" />
                    <CustomText
                      style={styles.drawerAddressText}
                      numberOfLines={1}>
                      {address || '설정된 주소가 없어요'}
                    </CustomText>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                  </Pressable>
                </View>

                <View style={styles.drawerSection}>
                  <Pressable
                    style={[
                      styles.drawerButton,
                      sending && styles.drawerButtonDisabled,
                    ]}
                    disabled={sending}
                    onPress={() => {
                      if (sending) {
                        return;
                      }
                      resetChat();
                      closeDrawer();
                    }}>
                    <RotateCwIcon size={18} color={sending ? '#aaa' : '#333'} />
                    <CustomText
                      style={[
                        styles.drawerButtonText,
                        sending && styles.drawerButtonTextDisabled,
                      ]}>
                      새 대화 시작
                    </CustomText>
                  </Pressable>
                </View>

                <View style={styles.sheetSubtitleRow}>
                  <CustomText style={styles.sheetSubtitle}>
                    최근 질문
                  </CustomText>
                  <Pressable
                    onPress={clearRecentFirstPrompts}
                    hitSlop={10}
                    style={styles.sheetSubtitleAction}>
                    <CustomText style={styles.sheetSubtitleActionText}>
                      전체 삭제
                    </CustomText>
                  </Pressable>
                </View>
                <View style={styles.sheetContent}>
                  {recentFirstPrompts.length
                    ? recentFirstPrompts.map((item, idx) => (
                        <View
                          key={`${item}-${idx}`}
                          style={[
                            styles.sheetPromptRow,
                            idx > 0 && styles.sheetPromptSpacing,
                          ]}>
                          <Pressable
                            hitSlop={5}
                            style={styles.sheetPromptPress}
                            onPress={() => {
                              closeDrawer();
                              handlePromptSelect(item);
                            }}>
                            <CustomText
                              style={styles.sheetPromptText}
                              numberOfLines={1}>
                              {item}
                            </CustomText>
                          </Pressable>
                          <Pressable
                            onPress={() => removeRecentFirstPrompt(idx)}
                            hitSlop={10}>
                            <Ionicons name="close" size={16} color="#666" />
                          </Pressable>
                        </View>
                      ))
                    : null}
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        )}

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{translateX: contentShiftAnim}],
            },
          ]}
          {...overlayPanHandlers}>
          <View
            style={[
              styles.customHeader,
              {
                paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10),
              },
            ]}>
            <Pressable
              onPress={openDrawer}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <MenuIcon size={10} />
            </Pressable>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() =>
                  navigation.navigate('SetLocationScreen', {
                    origin: 'AIExploreScreen',
                  })
                }
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Feather name="crosshair" size={22} color="#333" />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (sending) {
                    return;
                  }
                  resetChat();
                }}
                disabled={sending}
                style={{marginLeft: 12, opacity: sending ? 0.35 : 1}}
                hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
                <RotateCwIcon size={22} color="#333" />
              </Pressable>
            </View>
          </View>
          {/** ─────────── MAIN CONTENT ─────────── */}
          <View
            style={[
              styles.center,
              hasMessages ? styles.chatContainer : styles.emptyCenter,
            ]}>
            {hasMessages ? (
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                automaticallyAdjustKeyboardInsets={false}
                overScrollMode="always"
                scrollEventThrottle={16}
                style={styles.chatScroll}
                contentContainerStyle={[
                  styles.chatContent,
                  {paddingBottom: bottomPadding},
                ]}>
                {chatHistory.map(message => {
                  if (message.role === 'user') {
                    return (
                      <View
                        key={message.id}
                        style={styles.bubbleRow}
                        onLayout={({nativeEvent}) =>
                          handleMessageLayout(
                            message.id,
                            nativeEvent?.layout?.y ?? 0,
                          )
                        }>
                        <View style={styles.messageBubble}>
                          <CustomText style={styles.messageText}>
                            {message.text}
                          </CustomText>
                        </View>
                      </View>
                    );
                  }

                  const changedAddressText =
                    typeof message.changedAddress === 'string' &&
                    message.changedAddress.trim()
                      ? message.changedAddress.trim()
                      : '';
                  const displayAddress = changedAddressText || address;

                  return (
                    <View
                      key={message.id}
                      style={styles.aiRow}
                      onLayout={({nativeEvent}) =>
                        handleMessageLayout(
                          message.id,
                          nativeEvent?.layout?.y ?? 0,
                        )
                      }>
                      <View style={styles.aiHeaderRow}>
                        <View style={styles.aiAvatarLarge}>
                          <AIFullIcon size={26} />
                        </View>
                        {!!displayAddress && (
                          <CustomText
                            style={styles.aiAddressText}
                            numberOfLines={1}>
                            {displayAddress}
                          </CustomText>
                        )}
                      </View>
                      {!!message.text && (
                        <CustomText style={styles.aiTextBare}>
                          {message.text}
                        </CustomText>
                      )}
                      {message.agentMode === 'SHOW_RESULT' &&
                        Array.isArray(message.stores) &&
                        message.stores.length > 0 && (
                          <>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.resultList}>
                              {message.stores.map((store, index) => (
                                <AIResultCard
                                  key={`${message.id}-${store?.id}`}
                                  store={store}
                                  navigation={navigation}
                                  userLocation={userLocation}
                                  searchConditions={message.searchConditions}
                                />
                              ))}
                            </ScrollView>
                            <LinearGradient
                              colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
                              start={{x: 0, y: 0}}
                              end={{x: 1, y: 0}}
                              style={[styles.chipBorder, styles.mapChipBorder]}>
                              <Pressable
                                style={[styles.chip, styles.mapChip]}
                                onPress={() =>
                                  handleOpenMapWithAiResult(
                                    message.stores,
                                    message.searchConditions,
                                    message.userPrompt,
                                  )
                                }>
                                <CustomText style={styles.chipKeyword}>
                                  지도에서 확인하기
                                </CustomText>
                              </Pressable>
                            </LinearGradient>
                          </>
                        )}
                    </View>
                  );
                })}
                {sending && (
                  <View style={styles.aiRow}>
                    <View style={styles.aiHeaderRow}>
                      <View style={styles.aiAvatarLarge}>
                        <Animated.View
                          style={[
                            styles.aiLoadingSpinner,
                            {
                              transform: [
                                {
                                  rotate: spinAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg'],
                                  }),
                                },
                              ],
                            },
                          ]}>
                          <AIFullIcon size={26} />
                        </Animated.View>
                      </View>
                      <CustomText style={styles.aiAddressText}>
                        탐색 중
                      </CustomText>
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}>
                <View style={styles.emptyTouchArea}>
                  {showTitle && !showRecordingUI && (
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
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>

          {showChips && !showRecordingUI && (
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
                        onPress={() => handlePromptSelect(fullText)}>
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
          <View style={styles.bottomInputContainer}>
            <View style={[styles.bottomInput]}>
              <View
                style={[
                  styles.inputBox,
                  showRecordingUI && styles.recordingContainer,
                ]}>
                {showRecordingUI ? (
                  <>
                    <Pressable
                      style={styles.stopButton}
                      onPress={handleStopPress}
                      hitSlop={10}>
                      <Ionicons name="stop" size={18} color="#f2f2f2" />
                    </Pressable>
                    <View style={styles.recordingBox}>
                      {isRecording ? (
                        <View style={styles.recordingWaveWindow}>
                          <Animated.View
                            style={[
                              styles.recordingWaveTrack,
                              {
                                width: waveformWidth,
                                transform: [
                                  {
                                    translateX: recordShiftAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0, -waveformTravel],
                                    }),
                                  },
                                ],
                              },
                            ]}>
                            {waveformBars.map(({idx, seed}) => {
                              const silentScale = 0.25;
                              const dynamicScale = 1 + seed * 1.2;
                              const maxScale = 1.6 + seed * 1.2;
                              const scale = volumeLevel.interpolate({
                                inputRange: [0, 0.2, 1, 3],
                                outputRange: [
                                  silentScale,
                                  silentScale,
                                  dynamicScale,
                                  maxScale,
                                ],
                                extrapolate: 'clamp',
                              });
                              const opacity = volumeLevel.interpolate({
                                inputRange: [0, 0.2, 1, 3],
                                outputRange: [0.2, 0.3, 0.9, 1],
                                extrapolate: 'clamp',
                              });
                              return (
                                <Animated.View
                                  key={`bar-${idx}`}
                                  style={[
                                    styles.recordingWaveBar,
                                    {transform: [{scaleY: scale}], opacity},
                                  ]}
                                />
                              );
                            })}
                          </Animated.View>
                        </View>
                      ) : (
                        <View style={styles.recordingLabelRow}>
                          <ActivityIndicator
                            style={styles.recordingSpinner}
                            size="small"
                            color="#9AA0A6"
                          />
                          <CustomText style={styles.recordingLabel}>
                            받아쓰는 중
                          </CustomText>
                        </View>
                      )}
                    </View>
                    <View style={[styles.trailingAction, styles.sendAlign]}>
                      <Pressable
                        style={[
                          styles.sendButton,
                          styles.sendButtonActive,
                          (sending || isTranscribing) &&
                            styles.sendButtonDisabled,
                        ]}
                        onPress={handleSendPress}
                        disabled={sending || isTranscribing}>
                        <Ionicons
                          name="arrow-up"
                          size={20}
                          color={sending || isTranscribing ? '#aaa' : '#111'}
                        />
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <CustomTextInput
                      ref={inputRef}
                      placeholder="가고 싶은 술집을 설명해주세요"
                      value={prompt}
                      onChangeText={handleChangePrompt}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      placeholderTextColor={ColorUtil.placeholderText}
                      style={styles.input}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                    />
                    <View
                      style={[
                        styles.trailingAction,
                        showSendButton ? styles.sendAlign : styles.micAlign,
                      ]}>
                      {showSendButton ? (
                        <Pressable
                          style={styles.sendButton}
                          onPress={handleSendPress}>
                          <Ionicons name="arrow-up" size={20} color="#333" />
                        </Pressable>
                      ) : showMicButton ? (
                        <Pressable
                          style={styles.micButton}
                          onPress={handleMicPress}
                          hitSlop={10}>
                          <AIMicIcon size={22} />
                        </Pressable>
                      ) : (
                        <View style={styles.sendButtonPlaceholder} />
                      )}
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
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
  headerAddressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 240,
  },
  headerAddressText: {
    marginLeft: 6,
    fontSize: 15,
    color: '#111',
    fontFamily: 'Pretendard-SemiBold',
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
  emptyTouchArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
    paddingTop: 16,
  },
  chatContent: {
    flexGrow: 1,
  },
  bubbleRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 18,
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
  addressSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'right',
  },
  aiRow: {
    marginTop: 20,
    marginBottom: 18,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiAvatarLarge: {
    paddingLeft: 18,
    marginRight: 8,
  },
  aiAddressText: {
    flexShrink: 1,
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Regular',
    maxWidth: '70%',
  },
  aiTextBare: {
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 6,
    marginRight: 40,

    paddingLeft: 18,
  },

  resultList: {
    paddingVertical: 12,
    paddingRight: 6,
    paddingHorizontal: 18,
    gap: 4,
  },
  mapChipBorder: {
    alignSelf: 'center',
    marginTop: 10,
    marginHorizontal: 18,
    borderRadius: 999,
    marginBottom: 20,
  },
  mapChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 50,
  },

  chipRow: {
    paddingHorizontal: 12,
    marginBottom: 2,
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
    fontFamily: 'Pretendard-Medium',
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
  bottomInputContainer: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  bottomInputFade: {
    position: 'absolute',
    top: -18,
    left: 0,
    right: 0,
    height: 30,
  },
  bottomInput: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    alignItems: 'center',
    paddingTop: 10,
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
  recordingContainer: {
    backgroundColor: '#fff',
    borderColor: '#e5e5e5',
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
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#f5f5f5',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    marginRight: 8,
    marginLeft: -4,
  },
  recordingBox: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingWaveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    overflow: 'hidden',
  },
  recordingWaveWindow: {
    height: 20,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingWaveTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingWaveBar: {
    width: 3,
    height: 8,
    marginHorizontal: 0.8,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  recordingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  recordingLabel: {
    marginLeft: 7,
    color: '#9AA0A6',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  recordingSpinner: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{scale: 0.8}],
  },
  micButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLoadingText: {
    fontSize: 15,
    lineHeight: 15 * 1.5,
    color: '#666',
    fontFamily: 'Pretendard-Regular',
    marginRight: 40,
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  aiLoadingSpinner: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 20,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawerContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    // paddingHorizontal: 18,
    // paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginHorizontal: 18,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  drawerSection: {
    marginTop: 12,
    justifyContent: 'center',
  },
  sheetSubtitleRow: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  sheetSubtitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  sheetSubtitleAction: {
    paddingHorizontal: 4,
  },
  sheetSubtitleActionText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#666',
  },
  drawerCard: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAddressText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    lineHeight: 15 * 1.35,
  },
  drawerButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerButtonDisabled: {
    opacity: 0.5,
  },
  drawerButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  drawerButtonTextDisabled: {
    color: '#999',
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 18,
  },
  drawerScrollContent: {
    paddingBottom: 10,
  },
  sheetPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetContent: {
    marginTop: 20,
    flex: 1,
    // backgroundColor: '#333',
  },
  sheetPromptText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    lineHeight: 15 * 1.45,
    flex: 1,
    minWidth: 0,
  },
  sheetPromptPress: {
    flex: 1,
  },
  sheetPromptSpacing: {
    marginTop: 20,
  },
  sheetPromptScroll: {
    // maxHeight: 200,
  },
  sheetPromptScrollContent: {
    paddingRight: 4,
  },
  sheetEmpty: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#888',
  },
  overlayPressArea: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AIExploreScreen;
