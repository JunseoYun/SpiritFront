import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  BackHandler,
  Pressable,
  ScrollView,
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

const SearchScreen = ({navigation}) => {
  const {showToast} = useToast();
  const {
    searchText,
    setSearchText,
    selectedFilters,
    setSelectedFilters,
    setRadiusKm,
  } = useMapSearch();

  const [searchStoreName, setSearchStoreName] = useState(searchText || '');
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
    }, [loadRecentSearches]),
  );

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

  const onPressSearch = async () => {
    const trimmed = (searchStoreName || '').trim();
    if (trimmed.length > 0) {
      setSearchText(trimmed);
      await persistRecent(trimmed);
      navigation.navigate('MapScreen');
    } else {
      showToast('검색어를 입력해주세요', 'center');
    }
  };

  const distanceLabel = selectedFilters['거리'] || '1km';
  const categoryLabel = selectedFilters['카테고리'] || '카테고리';
  const peopleLabel = selectedFilters['인원'] || '인원';
  const alcoholLabel = selectedFilters['주종'] || '주종';
  const storeatmLabel = selectedFilters['매장분위기'] || '매장분위기';
  const timeActive = selectedFilters['방문시간'] || '방문시간';
  const parkingLabel = selectedFilters['주차'] || '주차';
  const corkageLabel = selectedFilters['콜키지'] || '콜키지';
  const screenLabel = selectedFilters['스크린'] || '스크린';
  const roomLabel = selectedFilters['룸'] || '룸';
  const outdoorLabel = selectedFilters['야장'] || '야장';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SearchBar
        value={searchStoreName}
        onChangeText={setSearchStoreName}
        placeholder="원하는 술집이나 메뉴를 검색하세요"
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
          Array.isArray(selectedFilters['매장분위기'])
            ? selectedFilters['매장분위기'].length
            : selectedFilters['매장분위기']
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
            showsVerticalScrollIndicator={false}>
            {recentSearches.map(item => (
              <Pressable
                key={item}
                style={styles.recentItem}
                onPress={async () => {
                  setSearchStoreName(item);
                  setSearchText(item);
                  await persistRecent(item);
                  navigation.navigate('MapScreen');
                }}>
                <View style={styles.recentLeft}>
                  <View
                    style={{
                      backgroundColor: '#96c3f3',
                      paddingHorizontal: 8,
                      paddingVertical: 7,
                      borderRadius: 50,
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      textAlign: 'center',
                    }}>
                    <FontAwesome name="search" color="#fff" size={14} />
                  </View>
                  <Text style={styles.recentText}>{item}</Text>
                </View>
              </Pressable>
            ))}

            {/* 🗑 최근 검색어 전체 삭제 */}
            <Pressable
              style={styles.clearButton}
              onPress={async () => {
                await AsyncStorage.removeItem(RECENT_KEY);
                setRecentSearches([]);
              }}>
              <Text style={styles.clearText} allowFontScaling={false}>
                최근 검색어 삭제
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      <FilterPotal
        filterModalVisible={filterModalVisible}
        setFilterModalVisible={setFilterModalVisible}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        initialTab={filterInitialTab}
        setRadiusint={setRadiusKm}
      />
      <Loading loading={isRefreshing || loading} />
    </SafeAreaView>
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
    fontSize: normalizeFont(13, 1.5),
    fontFamily: 'Pretendard-Medium',
  },
});

export default SearchScreen;
