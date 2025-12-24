import React, {useState, useCallback, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  BackHandler,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import SearchBar from '../../components/SearchScreen/SearchBar';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';
import MyBanner from '../../components/Ads/MyBanner';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapFilterHeader from '../../components/MapScreen/MapStore/MapFilterHeader';
import FilterPotal from '../../components/MapScreen/MapStore/FilterPotal';
import {
  useMapSearch,
  buildInitialSelectedFilters,
  INITIAL_RADIUS_KM,
  formatRadiusLabel,
} from '../../context/MapSearchContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect, CommonActions} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import RecentSearchItem from '../../components/SearchScreen/RecentSearchItem';
import CustomText from '../../utils/CustomText';

const AVAILABLE_VALUE = '가능';
const GROUP_VALUE = '단체 방문';
const SCREEN_VALUE = '설치';

const SearchScreen = ({navigation, route}) => {
  const {showToast} = useToast();
  const {
    searchText,
    setSearchText,
    selectedFilters,
    setSelectedFilters,
    radiusKm,
    setRadiusKm,
    storedRadiusKm,
  } = useMapSearch();
  const selectedFiltersRef = useRef(selectedFilters);
  const radiusKmRef = useRef(radiusKm);

  const [searchStoreName, setSearchStoreName] = useState('');
  const [pendingFilters, setPendingFilters] = useState(selectedFilters);
  const [pendingRadiusKm, setPendingRadiusKm] = useState(radiusKm);
  const [loading] = useState(false);
  const [isRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterInitialTab, setFilterInitialTab] = useState('거리');
  const [recentSearches, setRecentSearches] = useState([]);
  const preserveFiltersRef = useRef(route?.params?.preserveFilters === true);
  const originTabRef = useRef(
    route?.params?.prevTab || route?.params?.lastFocusedTab || null,
  );

  useEffect(() => {
    selectedFiltersRef.current = selectedFilters;
  }, [selectedFilters]);

  useEffect(() => {
    radiusKmRef.current = radiusKm;
  }, [radiusKm]);

  useEffect(() => {
    preserveFiltersRef.current = route?.params?.preserveFilters === true;
  }, [route?.params?.preserveFilters]);

  useEffect(() => {
    if (route?.params?.prevTab || route?.params?.lastFocusedTab) {
      originTabRef.current =
        route?.params?.prevTab || route?.params?.lastFocusedTab;
    }
  }, [route?.params?.lastFocusedTab, route?.params?.prevTab]);

  const RECENT_KEY = 'RECENT_SEARCHES';

  const resetFiltersToInitial = useCallback(() => {
    const baseRadius =
      typeof radiusKmRef.current === 'number'
        ? radiusKmRef.current
        : INITIAL_RADIUS_KM;
    const initialFilters = buildInitialSelectedFilters(baseRadius);
    setPendingFilters(initialFilters);
    setPendingRadiusKm(baseRadius);
  }, []);

  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_KEY);
      const list = stored ? JSON.parse(stored) : [];
      if (Array.isArray(list)) setRecentSearches(list);
    } catch (e) {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentSearches();
      const shouldPreserve = preserveFiltersRef.current;
      const initialKeyword =
        typeof route?.params?.initialSearchKeyword === 'string'
          ? route.params.initialSearchKeyword.trim()
          : '';
      if (shouldPreserve) {
        setPendingFilters(selectedFiltersRef.current);
        setPendingRadiusKm(radiusKmRef.current);
        setSearchStoreName(
          initialKeyword || (searchText?.trim() ? searchText : ''),
        );
        navigation.setParams({preserveFilters: false});
        if (initialKeyword) {
          navigation.setParams({initialSearchKeyword: undefined});
        }
      } else {
        if (initialKeyword) {
          setPendingFilters(selectedFiltersRef.current);
          setPendingRadiusKm(radiusKmRef.current);
          setSearchStoreName(initialKeyword);
          navigation.setParams({initialSearchKeyword: undefined});
        } else {
          resetFiltersToInitial();
          setSearchStoreName('');
        }
      }
    }, [loadRecentSearches, navigation, resetFiltersToInitial, searchText]),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const persistRecent = useCallback(
    async term => {
      try {
        const trimmed = (term || '').trim();
        if (!trimmed) return;
        const current = Array.isArray(recentSearches) ? recentSearches : [];
        const next = [trimmed, ...current.filter(t => t !== trimmed)].slice(
          0,
          10,
        );
        setRecentSearches(next);
        await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore
      }
    },
    [recentSearches],
  );

  const commitSearchAndFilters = useCallback(
    async keyword => {
      const trimmed = (keyword || '').trim();
      if (!trimmed.length) {
        showToast('검색어를 입력해주세요', 'center');
        return;
      }
      setSearchText(trimmed);
      setSelectedFilters(pendingFilters);
      setRadiusKm(
        typeof pendingRadiusKm === 'number' ? pendingRadiusKm : radiusKm,
      );
      await persistRecent(trimmed);
      const lastTab = originTabRef.current || 'MainScreen';
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'MainBtmbar',
              params: {
                screen: 'MapScreen',
                params: {skipAutoSnap: true, prevTab: lastTab},
                initialTab: 'MapScreen',
                lastFocusedTab: lastTab,
                lastNonMapTab: lastTab,
              },
            },
          ],
        }),
      );
    },
    [
      navigation,
      pendingFilters,
      pendingRadiusKm,
      persistRecent,
      radiusKm,
      setRadiusKm,
      setSearchText,
      setSelectedFilters,
      showToast,
    ],
  );

  const onPressSearch = async () => {
    await commitSearchAndFilters(searchStoreName);
  };

  const resolveFilterKey = useCallback(
    (hint, source = pendingFilters) => {
      const keys = Object.keys(source || {});
      const normalizedHint = (hint || '').replace(/\s/g, '');
      return (
        keys.find(k => (k || '').replace(/\s/g, '').includes(normalizedHint)) ||
        hint
      );
    },
    [pendingFilters],
  );

  const getFilterValue = (hint, fallback = '') => {
    const key = resolveFilterKey(hint);
    const val = pendingFilters?.[key];
    const isEmptyArray = Array.isArray(val) && val.length === 0;
    const isEmptyString = typeof val === 'string' && val.trim().length === 0;

    return val == null || isEmptyArray || isEmptyString ? fallback : val;
  };
  const toArrayVal = value => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.trim().length > 0) {
      return [value.trim()];
    }
    return [];
  };
  const formatArrayLabel = (arr, emptyLabel) => {
    if (!arr || arr.length === 0) return emptyLabel;
    if (arr.length === 1) return arr[0];
    return `${arr[0]} 외 ${arr.length - 1}`;
  };

  const handleAmenityToggle = useCallback(
    type => {
      setPendingFilters(prev => {
        const base = prev || {};
        const next = {...base};
        const resolveKey = hint => resolveFilterKey(hint, base);
        const toggleValue = (hint, activeValue) => {
          const key = resolveKey(hint);
          const currentVal = next?.[key];
          next[key] = currentVal === activeValue ? '' : activeValue;
        };

        switch (type) {
          case 'screen':
            toggleValue('스크린', SCREEN_VALUE);
            break;
          case 'room':
            toggleValue('룸', AVAILABLE_VALUE);
            break;
          case 'outdoor':
            toggleValue('야장', AVAILABLE_VALUE);
            break;
          case 'people':
            toggleValue('인원', GROUP_VALUE);
            break;
          case 'parking':
            toggleValue('주차', AVAILABLE_VALUE);
            break;
          case 'corkage':
            toggleValue('콜키지', AVAILABLE_VALUE);
            break;
          default:
            return base;
        }

        return next;
      });
    },
    [resolveFilterKey],
  );

  const storedRadiusLabel = formatRadiusLabel(
    typeof storedRadiusKm === 'number' ? storedRadiusKm : INITIAL_RADIUS_KM,
  );
  const distanceLabel = getFilterValue(
    '거리',
    storedRadiusLabel,
  );
  const categoryValue = getFilterValue('카테고리', []);
  const categoryArray = toArrayVal(categoryValue);
  const categoryLabel = formatArrayLabel(categoryArray, '카테고리');
  const peopleLabel = getFilterValue('인원', '인원');
  const alcoholLabel = getFilterValue('주종', '주종');
  const storeatmValue = getFilterValue('분위기', '');
  const storeatmLabel = storeatmValue || '분위기';
  const timeActive = getFilterValue('방문시간', '방문시간');
  const parkingLabel = getFilterValue('주차', '주차');
  const corkageLabel = getFilterValue('콜키지', '콜키지');
  const screenLabel = getFilterValue('스크린', '스크린');
  const roomLabel = getFilterValue('룸', '룸');
  const outdoorLabel = getFilterValue('야장', '야장');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <SearchBar
          value={searchStoreName}
          onChangeText={setSearchStoreName}
          placeholder="술집이나 메뉴를 검색하세요"
          onPress={onPressSearch}
          onBackPress={() => navigation.goBack()}
          onHomePress={() => navigation.navigate('ChatbotScreen')}
        />

        <MapFilterHeader
          setFilterInitialTab={setFilterInitialTab}
          setFilterModalVisible={setFilterModalVisible}
          distanceLabel={distanceLabel}
          distanceBaseLabel={storedRadiusLabel}
          categoryLabel={categoryLabel}
          categoryCount={categoryArray.length}
          peopleLabel={peopleLabel}
          alcoholLabel={alcoholLabel}
          timeActive={timeActive}
          parkingLabel={parkingLabel}
          corkageLabel={corkageLabel}
          screenLabel={screenLabel}
          roomLabel={roomLabel}
          outdoorLabel={outdoorLabel}
          storeatmLabel={storeatmLabel}
          storeatmCount={
            Array.isArray(storeatmValue)
              ? storeatmValue.length
              : storeatmValue
              ? 1
              : 0
          }
          onAmenityToggle={handleAmenityToggle}
        />

        {/* <MyBanner index={'search'} /> */}

        {recentSearches.length > 0 && (
          <View style={styles.recentWrap}>
            <ScrollView
              contentContainerStyle={{paddingBottom: 40}}
              showsVerticalScrollIndicator={false}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled">
              {recentSearches.map(item => (
                <RecentSearchItem
                  key={item}
                  item={item}
                  onPress={async term => {
                    setSearchStoreName(term);
                    await commitSearchAndFilters(term);
                  }}
                  onDelete={async term => {
                    const next = recentSearches.filter(t => t !== term);
                    setRecentSearches(next);
                    await AsyncStorage.setItem(
                      RECENT_KEY,
                      JSON.stringify(next),
                    );
                  }}
                />
              ))}

              {/* 전체 최근 검색어 삭제 */}
              <Pressable
                style={styles.clearButton}
                onPress={async () => {
                  await AsyncStorage.removeItem(RECENT_KEY);
                  setRecentSearches([]);
                }}>
                <CustomText style={styles.clearText}>검색 기록 삭제</CustomText>
              </Pressable>
            </ScrollView>
          </View>
        )}

        <FilterPotal
          filterModalVisible={filterModalVisible}
          setFilterModalVisible={setFilterModalVisible}
          selectedFilters={pendingFilters}
          setSelectedFilters={setPendingFilters}
          initialTab={filterInitialTab}
          setRadiusint={setPendingRadiusKm}
          onApply={filters => setPendingFilters(filters)}
        />
        <Loading loading={isRefreshing || loading} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  recentWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flex: 1,
  },
  recentTitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
    fontFamily: 'Pretendard-Medium',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    fontSize: 14,
  },
  recentText: {
    color: '#111',
    fontSize: 17,
    fontFamily: 'Pretendard-Regular',
    marginLeft: 5,
    maxWidth: '90%',
  },

  clearButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  clearText: {
    marginTop: 40,
    color: '#999',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
  },
});

export default SearchScreen;
