// -------------------- AIExploreScreen (사진 동일하게 리디자인) -----------------------

import React, {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
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
} from 'react-native';
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
import FastImage from 'react-native-fast-image';
import {RotateCwIcon} from 'lucide-react-native';
import {AILogoIcon} from '../../assets/svg/AILogoIcon';
import {AIFullIcon} from '../../assets/svg/AiTabIcon';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Agent_chat_search} from '../../api/agentApi';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import {getAddress, getLocation} from '../../storage/locationStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resolveStoreId = store =>
  store?.id ??
  store?.storeId ??
  store?.store_id ??
  store?.storeID ??
  store?.storeid ??
  null;

const resolveStoreName = store =>
  store?.name ??
  store?.storeName ??
  store?.storeNm ??
  store?.title ??
  store?.store_name ??
  '가게 이름';

const resolveLocationDto = store => {
  if (!store) {
    return null;
  }
  const loc =
    store.locationDto ||
    store.location ||
    store.location_info ||
    store.locationInfo;
  if (
    loc &&
    typeof loc.latitude === 'number' &&
    typeof loc.longitude === 'number'
  ) {
    return {
      latitude: loc.latitude,
      longitude: loc.longitude,
      address:
        loc.address ||
        loc.roadAddress ||
        loc.roadAddr ||
        loc.addr ||
        store.address ||
        null,
    };
  }

  const lat =
    store.latitude ??
    store.lat ??
    store?.location?.lat ??
    store?.location?.latitude ??
    null;
  const lng =
    store.longitude ??
    store.lng ??
    store?.location?.lng ??
    store?.location?.longitude ??
    null;

  if (typeof lat === 'number' && typeof lng === 'number') {
    return {
      latitude: lat,
      longitude: lng,
      address:
        store.address ??
        store.roadAddress ??
        store.addr ??
        store.roadAddr ??
        null,
    };
  }
  return null;
};

const resolveCategories = store => {
  const candidates = [
    store?.categories,
    store?.categoryList,
    store?.categoryNames,
    store?.category,
    store?.tags,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string') {
      const parts = candidate.split(/[,/|]/).map(part => part.trim());
      const filtered = parts.filter(Boolean);
      if (filtered.length) return filtered;
    }
  }
  return [];
};

const resolveMainImage = store =>
  store?.mainImgUrl ||
  store?.imageUrl ||
  store?.thumbnailUrl ||
  store?.imgUrl ||
  store?.mainImageUrl ||
  null;

const extractStoreList = data => {
  if (!data) return [];
  if (data?.stores?.content && Array.isArray(data.stores.content)) {
    return data.stores.content;
  }
  if (Array.isArray(data?.stores)) {
    return data.stores;
  }
  const candidates = [
    data.stores,
    data.storeList,
    data.storeDtos,
    data.storeResponses,
    data.storeResponseDtos,
    data.recommendStores,
    data.storePreviews,
    data.results,
    data.items,
    data.data,
    data?.storeList?.items,
    data?.storeList?.stores,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

const resolveAgentMessage = data =>
  data?.responseMessage ??
  data?.agentMessage ??
  data?.message ??
  data?.assistantMessage ??
  data?.llmAgentResult?.agentMessage ??
  '';

const AIResultCard = ({store, navigation, userLocation}) => {
  const calculateDistance = useDistance();
  const {translateCategory} = useCategoryTranslation();
  const {isOpen, isBreak, closed, nextclosed, starttime, endtime, breakend} =
    useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);
  const [distanceText, setDistanceText] = useState(null);

  useEffect(() => {
    if (!userLocation) {
      return;
    }
    const storeLocation = resolveLocationDto(store);
    if (!storeLocation) {
      return;
    }

    const km = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      storeLocation.latitude,
      storeLocation.longitude,
    );
    if (!Number.isFinite(km)) {
      return;
    }
    setDistanceText(
      km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`,
    );
  }, [userLocation, store, calculateDistance]);

  let timeLabel = '정보 없음';
  if (store?.isAlwaysOpen) {
    timeLabel = '24시간';
  } else if (isOpen && isBreak && breakend) {
    timeLabel = `브레이크 ~ ${breakend}`;
  } else if (!isOpen && nextclosed) {
    timeLabel = '영업 종료 · 익일 휴무';
  } else if (!isOpen && closed) {
    timeLabel = '금일 휴무';
  } else if (!isOpen && starttime) {
    timeLabel = `${starttime} 오픈`;
  } else if (endtime) {
    timeLabel = `${endtime} 종료`;
  }

  const categories = resolveCategories(store).map(category =>
    translateCategory(category),
  );
  const storeId = resolveStoreId(store);

  const handlePress = () => {
    if (!storeId) {
      return;
    }
    const storeLocation = resolveLocationDto(store);
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {
        storeId,
        innerlatitude: storeLocation?.latitude,
        innerlongitude: storeLocation?.longitude,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!storeId}
      style={styles.resultCard}
      android_ripple={{color: 'rgba(0,0,0,0.05)', borderless: false}}>
      <FastImage
        source={
          resolveMainImage(store)
            ? {uri: resolveMainImage(store)}
            : require('../../assets/default_store.png')
        }
        style={styles.resultImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <CustomText style={styles.resultName} numberOfLines={1}>
        {resolveStoreName(store)}
      </CustomText>
      {!!categories.length && (
        <CustomText style={styles.resultCategory} numberOfLines={1}>
          {categories.join(' · ')}
        </CustomText>
      )}
      <View style={styles.resultMetaRow}>
        <CustomText style={styles.resultMeta} numberOfLines={1}>
          {timeLabel}
        </CustomText>
        {distanceText && (
          <CustomText style={[styles.resultMeta, styles.resultMetaDim]}>
            {distanceText}
          </CustomText>
        )}
      </View>
    </Pressable>
  );
};

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
  const titleAnim = useRef(new Animated.Value(1)).current;
  const chipAnim = useRef(new Animated.Value(1)).current;
  const [showTitle, setShowTitle] = useState(true);
  const [showChips, setShowChips] = useState(true);
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
  const USE_SAMPLE_RECENT_PROMPTS = true; // 샘플 목록을 보고 싶을 때 true 로 전환
  const [recentFirstPrompts, setRecentFirstPrompts] = useState(
    USE_SAMPLE_RECENT_PROMPTS ? SAMPLE_RECENT_FIRST_PROMPTS : [],
  );
  const [showDrawer, setShowDrawer] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const contentShiftAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

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
    setChatHistory([]);
    setLastResponseId(null);
    setPrompt('');
    setShowTitle(true);
    setShowChips(true);
    scrollViewRef.current?.scrollTo({y: 0, animated: false});
  }, []);

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
  }, [
    RECENT_FIRST_PROMPT_KEY,
    SAMPLE_RECENT_FIRST_PROMPTS,
    USE_SAMPLE_RECENT_PROMPTS,
  ]);

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

  const suggestions = [
    {keyword: '늦게까지 하는', subtext: '호프집 알려줘'},
    {keyword: '회식하기 좋은', subtext: '이자카야 추천해줘'},
    {keyword: '축구 보면서', subtext: '한잔하기 좋은 곳 알려줘'},
    {keyword: '가성비 좋은', subtext: '술집 추천해줘'},
    {keyword: '단체 가기 편한', subtext: '술집 어디 있어?'},
    {keyword: '분위기 깔끔한', subtext: '바 추천해줘'},
    {keyword: '안주 잘하는', subtext: '술집 찾아줘'},
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
  const submit = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      showToast('한잔하고 싶은 술집을 입력해주세요', 'center');
      return;
    }
    if (trimmed.length > 200) {
      showToast('메시지는 200자 이하로 입력해주세요', 'center');
      return;
    }
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
        userMessage: trimmed,
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
      const responseId =
        agentResult?.responseId ??
        data?.responseId ??
        data?.id ??
        data?.response_id ??
        null;
      if (responseId) {
        setLastResponseId(responseId);
      }
      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text:
          resolveAgentMessage(agentResult) || resolveAgentMessage(data) || '',
        agentMode: agentResult?.agentMode || data?.agentMode,
        stores: extractStoreList(data) || extractStoreList(agentResult),
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      showToast('죄송해요. 잠시 후 다시 시도해주세요.', 'center');
    } finally {
      setSending(false);
    }
  };

  const openDrawer = useCallback(async () => {
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

  const bottomPadding = keyboardVisible
    ? insets.bottom + 24
    : insets.bottom + 100;
  const firstUserMessageId = chatHistory.find(msg => msg.role === 'user')?.id;
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
                    style={styles.drawerButton}
                    onPress={() => {
                      resetChat();
                      closeDrawer();
                    }}>
                    <RotateCwIcon size={18} color="#333" />
                    <CustomText style={styles.drawerButtonText}>
                      새 대화 시작
                    </CustomText>
                  </Pressable>
                </View>

                <CustomText style={styles.sheetSubtitle}>최근 질문</CustomText>
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
                              setPrompt(item);
                              closeDrawer();
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
                onPress={resetChat}
                style={{marginLeft: 12}}
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
                {chatHistory.map(message =>
                  message.role === 'user' ? (
                    <View key={message.id} style={styles.bubbleRow}>
                      <View style={styles.messageBubble}>
                        <CustomText style={styles.messageText}>
                          {message.text}
                        </CustomText>
                      </View>
                      {message.id === firstUserMessageId && !!address && (
                        <CustomText
                          style={styles.addressSubtext}
                          numberOfLines={2}>
                          {address}
                        </CustomText>
                      )}
                    </View>
                  ) : (
                    <View key={message.id} style={styles.aiRow}>
                      <View style={styles.aiAvatarLarge}>
                        <AIFullIcon size={26} />
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
                                  key={`${message.id}-${
                                    resolveStoreId(store) || index
                                  }`}
                                  store={store}
                                  navigation={navigation}
                                  userLocation={userLocation}
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
                                  navigation.navigate('MapScreen')
                                }>
                                <CustomText style={styles.chipKeyword}>
                                  지도에서 확인하기
                                </CustomText>
                              </Pressable>
                            </LinearGradient>
                          </>
                        )}
                    </View>
                  ),
                )}
                {sending && (
                  <View style={styles.aiRow}>
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
                    <CustomText style={styles.aiLoadingText}>
                      탐색 중
                    </CustomText>
                  </View>
                )}
              </ScrollView>
            ) : (
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}>
                <View style={styles.emptyTouchArea}>
                  {showTitle && (
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
  aiAvatarLarge: {
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  aiTextBare: {
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 6,
    marginRight: 40,

    paddingHorizontal: 18,
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
    borderRadius: 16,
    marginBottom: 20,
  },
  mapChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
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
    marginBottom: 12,
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
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eef1f5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  resultImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  resultName: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Pretendard-Bold',
  },
  resultCategory: {
    marginTop: 4,
    fontSize: 13,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
  },
  resultMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  resultMeta: {
    fontSize: 13,
    color: '#222',
    fontFamily: 'Pretendard-Regular',
  },
  resultMetaDim: {
    color: '#6b7684',
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
  },
  sheetSubtitle: {
    marginTop: 50,
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
  drawerButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
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
