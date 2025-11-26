import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  BackHandler,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import SearchBar from '../../../components/SearchScreen/SearchBar';
import {useToast} from '../../../context/ToastContext';
import Loading from '../../../hooks/Loading';
import MyBanner from '../../../components/Ads/MyBanner';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapFilterHeader from '../../../components/MapScreen/MapStore/MapFilterHeader';
import FilterPotal from '../../../components/MapScreen/MapStore/FilterPotal';
import {useMapSearch} from '../../../context/MapSearchContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {normalizeFont} from '../../../hooks/normalizeFont';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RecentSearchItem from '../../../components/SearchScreen/RecentSearchItem';
import CustomText from '../../../utils/CustomText';

const SearchScreen = ({navigation}) => {
  const {showToast} = useToast();
  const {
    searchText,
    setSearchText,
    selectedFilters,
    setSelectedFilters,
    setRadiusKm,
    radiusKm,
  } = useMapSearch();

  const [searchStoreName, setSearchStoreName] = useState(searchText || '');
  const [pendingFilters, setPendingFilters] = useState(selectedFilters);
  const [pendingRadiusKm, setPendingRadiusKm] = useState(radiusKm);
  const [loading] = useState(false);
  const [isRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterInitialTab, setFilterInitialTab] = useState('거리');
  const [recentSearches, setRecentSearches] = useState([]);

  const RECENT_KEY = 'RECENT_SEARCHES';

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
      setSearchStoreName(searchText || '');
      setPendingFilters(selectedFilters);
      setPendingRadiusKm(radiusKm);
    }, [loadRecentSearches, searchText, selectedFilters, radiusKm]),
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainScreen'); // MainScreen 화면으로 전환
        return true; // 기본 뒤로가기를 방지
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
        showToast('검색어를 입력해 주세요', 'center');
        return;
      }
      setSearchText(trimmed);
      setSelectedFilters(pendingFilters);
      setRadiusKm(
        typeof pendingRadiusKm === 'number' ? pendingRadiusKm : radiusKm,
      );
      await persistRecent(trimmed);
      navigation.navigate('MapScreen', {skipAutoSnap: true});
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

  const findFilterKey = hint => {
    const keys = Object.keys(pendingFilters || {});
    const normalizedHint = (hint || '').replace(/\s/g, '');
    return (
      keys.find(k => (k || '').replace(/\s/g, '').includes(normalizedHint)) ||
      hint
    );
  };

  const getFilterValue = (hint, fallback = '') => {
    const key = findFilterKey(hint);
    const val = pendingFilters?.[key];
    const isEmptyArray = Array.isArray(val) && val.length === 0;
    const isEmptyString = typeof val === 'string' && val.trim().length === 0;

    return val == null || isEmptyArray || isEmptyString ? fallback : val;
  };

  const distanceLabel = getFilterValue('거리', '1km');
  const categoryLabel = getFilterValue('카테고리', '카테고리');
  const peopleLabel = getFilterValue('인원', '인원');
  const alcoholLabel = getFilterValue('주종', '주종');
  const storeatmValue = getFilterValue('매장분위기', '');
  const storeatmLabel = storeatmValue || '매장분위기';
  const timeActive = getFilterValue('방문시간', '방문시간');
  const parkingLabel = getFilterValue('주차', '주차');
  const corkageLabel = getFilterValue('콜키지', '콜키지');
  const screenLabel = getFilterValue('스크린', '스크린');
  const roomLabel = getFilterValue('룸', '룸');
  const outdoorLabel = getFilterValue('야장', '야장');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <SearchBar
          value={searchStoreName}
          onChangeText={setSearchStoreName}
          placeholder="술집이나 메뉴를 검색해 보세요"
          onPress={onPressSearch}
        />

        <MapFilterHeader
          setFilterInitialTab={setFilterInitialTab}
          setFilterModalVisible={setFilterModalVisible}
          distanceLabel={distanceLabel}
          categoryLabel={categoryLabel}
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
        />

        <MyBanner index={'search'} />

        {recentSearches.length > 0 && (
          <View style={styles.recentWrap}>
            <ScrollView
              style={{}}
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
                <CustomText style={styles.clearText}>
                  최근 검색어 삭제
                </CustomText>
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
