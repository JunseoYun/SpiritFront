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
  StyleSheet,
  KeyboardAvoidingView,
  View,
  Keyboard,
  Animated,
  Easing,
  BackHandler,
  Dimensions,
  PanResponder,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import {useFocusEffect} from '@react-navigation/native';
import {useHeaderHeight} from '@react-navigation/elements';
import {useToast} from '../../context/ToastContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Agent_chat_search} from '../../api/agentApi';
import {getAddress, getLocation} from '../../storage/locationStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request as requestPermission,
} from 'react-native-permissions';
import AIExploreDrawer from '../../components/AIExplore/AIExploreDrawer';
import AIExploreHeader from '../../components/AIExplore/AIExploreHeader';
import AIExploreChatList from '../../components/AIExplore/AIExploreChatList';
import AIExploreSuggestions from '../../components/AIExplore/AIExploreSuggestions';
import AIExploreInput from '../../components/AIExplore/AIExploreInput';

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
  const [bottomInputHeight, setBottomInputHeight] = useState(0);

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
        return;
      }
      setSending(true);
      if (isFirstUserMessage) {
        try {
          const current =
            Array.isArray(recentFirstPrompts) && recentFirstPrompts.length
              ? recentFirstPrompts
              : [];
          const next = [trimmed, ...current].slice(0, 30);
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

        const data = await Agent_chat_search(payload);
        if (!data) {
          showToast(
            '답변을 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
            'center',
          );
          return;
        }

        const agentResult = data?.llmAgentResult || data || {};
        const responseId = agentResult?.responseId;
        const storeList = data?.stores?.content;
        const searchConditions = agentResult?.searchConditions;

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
    } catch (error) {
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

  const measuredInputHeight = bottomInputHeight || 94;
  const bottomPadding = Math.max(
    insets.bottom + (keyboardVisible ? 28 : 16),
    Math.round(measuredInputHeight * 0.6),
  );
  const bottomOverlayHeight = Math.max(bottomInputHeight + insets.bottom, 120);
  const chipBottomSpacing = Math.max(bottomOverlayHeight - 40, 80);
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
      } catch (error) {
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
      try {
        await Voice.stop();
      } catch (error) {
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

  const handleLocationPress = useCallback(() => {
    navigation.navigate('SetLocationScreen', {
      origin: 'AIExploreScreen',
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}>
      <View style={styles.flex}>
        <AIExploreDrawer
          showDrawer={showDrawer}
          overlayAnim={overlayAnim}
          drawerAnim={drawerAnim}
          drawerWidth={drawerWidth}
          overlayPanHandlers={overlayPanHandlers}
          insets={insets}
          address={address}
          sending={sending}
          onClose={closeDrawer}
          onResetChat={resetChat}
          onNavigateLocation={() => {
            closeDrawer();
            handleLocationPress();
          }}
          recentFirstPrompts={recentFirstPrompts}
          onClearRecentFirstPrompts={clearRecentFirstPrompts}
          onRemoveRecentFirstPrompt={removeRecentFirstPrompt}
          onSelectPrompt={item => {
            closeDrawer();
            handlePromptSelect(item);
          }}
        />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{translateX: contentShiftAnim}],
            },
          ]}
          {...overlayPanHandlers}>
          <AIExploreHeader
            insets={insets}
            sending={sending}
            onOpenDrawer={openDrawer}
            onNavigateLocation={handleLocationPress}
            onResetChat={resetChat}
          />

          <AIExploreChatList
            chatHistory={chatHistory}
            address={address}
            hasMessages={hasMessages}
            sending={sending}
            spinAnim={spinAnim}
            scrollViewRef={scrollViewRef}
            handleMessageLayout={handleMessageLayout}
            bottomPadding={bottomPadding}
            navigation={navigation}
            userLocation={userLocation}
            handleOpenMapWithAiResult={handleOpenMapWithAiResult}
            showTitle={showTitle}
            showRecordingUI={showRecordingUI}
            titleAnim={titleAnim}
          />

          <AIExploreSuggestions
            showChips={showChips}
            showRecordingUI={showRecordingUI}
            chipAnim={chipAnim}
            chipBottomSpacing={chipBottomSpacing}
            suggestions={suggestions}
            onSelectSuggestion={handlePromptSelect}
          />

          <AIExploreInput
            showRecordingUI={showRecordingUI}
            bottomOverlayHeight={bottomOverlayHeight}
            onInputLayout={height => setBottomInputHeight(height)}
            prompt={prompt}
            onChangePrompt={handleChangePrompt}
            onFocusInput={() => setIsInputFocused(true)}
            onBlurInput={() => setIsInputFocused(false)}
            showSendButton={showSendButton}
            showMicButton={showMicButton}
            onSendPress={handleSendPress}
            onMicPress={handleMicPress}
            onStopPress={handleStopPress}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            sending={sending}
            waveformWidth={waveformWidth}
            waveformTravel={waveformTravel}
            waveformBars={waveformBars}
            recordShiftAnim={recordShiftAnim}
            volumeLevel={volumeLevel}
            inputRef={inputRef}
          />
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
});

export default AIExploreScreen;
