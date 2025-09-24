import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useRoute} from '@react-navigation/native';

import ResultModalItem from '../../../components/SearchScreen/FastSearch/Modal/ResultModalItem';
import FastSearch from '../../../components/SearchScreen/FastSearch/FastSearch';
import FastSearchFilter from '../../../components/SearchScreen/FastSearch/FastSearchFilter';
import {Store_getby_condition_search} from '../../../api/storeApi';
import Loading from '../../../hooks/Loading';
import ResultModalItemSkeleton from '../../../components/SearchScreen/FastSearch/Modal/ResultModalItemSkeleton';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';

import Ionicons from 'react-native-vector-icons/Ionicons';
import ScrollToTopButton from '../../../components/common/ScrollToTopButton';
import useScrollToTopVisibility from '../../../hooks/useScrollToTopVisibility';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const SearchFastScreen = ({navigation}) => {
  const route = useRoute();
  const {top, bottom} = useSafeAndroidInsets();
  const {fastSearchStores, fastviewDto, location} = route.params;

  // ✅ 필터 상태
  const [selectedFilters, setSelectedFilters] = useState({
    카테고리: fastviewDto.selectedCategory || '',
    인원: fastviewDto.selectedPeople || '',
    '방문 시간': fastviewDto.timeselectedHour
      ? `${fastviewDto.timeselectedHour}:${fastviewDto.timeselectedMinute}`
      : '',
    주종: fastviewDto.selectedAlcohol || '',
  });

  // ✅ 검색 결과 상태
  const [faststores, setFaststores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);
  const [firstloading, setFirstloading] = useState(true);

  // ✅ 바텀시트 상태
  const [bottomModalVisible, setBottomModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scrollRef = useRef(null);
  const {visible: showScrollToTop, handleScroll, updateVisibility, scrollToTop} =
    useScrollToTopVisibility({externalRef: scrollRef});
  // ✅ 검색 조건 DTO
  const [searchDto, setSearchDto] = useState(fastSearchStores);

  // ✅ 초기 첫 호출
  useEffect(() => {
    if (location && searchDto) {
      fetchStores(0, true, searchDto);
    }
  }, [location]);

  // ✅ 검색 버튼 눌렀을 때 API 호출
  const handleApply = () => {
    const {카테고리, 인원, '방문 시간': visitTime, 주종} = selectedFilters;
    const updated = {};

    if (카테고리) updated.category = 카테고리;
    if (인원) updated.isGroupAvailable = 인원 === '단체 방문';
    if (visitTime) {
      const [hh, mm] = visitTime.split(':');
      const now = new Date();
      now.setHours(parseInt(hh), parseInt(mm), 0, 0);
      now.setHours(now.getHours() + 9);
      updated.conditionTime = now.toISOString().slice(0, -1);
    }
    if (주종) updated.alcoholType = 주종;

    // 상태 갱신 후 호출
    setSearchDto(updated);
    setPage(0);
    setFaststores([]);
    fetchStores(0, true, updated);
    setBottomModalVisible(false);
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({offset: 0, animated: false});
    }
    updateVisibility(0);
  };

  // ✅ 가게 리스트 요청
  const fetchStores = async (currentPage, refresh = false, dto) => {
    if (!location) return;
    if (loading || (!hasMore && !refresh)) return;

    setLoading(true);
    try {
      const requestData = {
        page: currentPage,
        latitude: location.latitude,
        longitude: location.longitude,
        conditionSearchDto: dto,
      };

      const storesData = await Store_getby_condition_search(requestData);

      setTotalpage(storesData.totalPages);

      if (storesData.content && storesData.content.length > 0) {
        setFaststores(prevStores => {
          const newStores = refresh
            ? storesData.content
            : [...prevStores, ...storesData.content];
          const uniqueStores = Array.from(
            new Map(newStores.map(store => [store.id, store])).values(),
          );
          return uniqueStores;
        });
        setHasMore(true);
      } else {
        if (refresh) setFaststores([]);
        setHasMore(false);
      }
    } catch (err) {
      console.error('데이터 로드 오류:', err);
    } finally {
      setLoading(false);
      if (firstloading == true) {
        setFirstloading(false);
      }
    }
  };

  // ✅ 바텀시트 애니메이션
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: bottomModalVisible ? 0 : SCREEN_HEIGHT,
      duration: 300,
      easing: bottomModalVisible
        ? Easing.out(Easing.ease)
        : Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [bottomModalVisible]);

  // ✅ 리스트 렌더
  const renderStoreItem = ({item}) => (
    <ResultModalItem store={item} navigation={navigation} location={location} />
  );

  const renderEmptyComponent = () => {
    if (!loading) {
      return (
        <Text style={styles.emptyText}>내 주변 조건에 맞는 가게가 없어요</Text>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, {paddingTop: top}]}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={22} color={'black'} />
        </Pressable>
        <Text style={styles.headerTitle}>내 주변 빠른 검색</Text>
      </View>

      {/* 필터 Chips */}
      <FastSearch
        title=""
        selectedFilters={selectedFilters}
        handleBottomOpen={() => setBottomModalVisible(true)}
        isHeader={false}
      />

      {/* 검색 결과 리스트 */}
     {firstloading ? (
        <FlatList
          data={[1, 2, 3, 5, 6, 7, 8, 9]} // 임의의 더미 데이터
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => <ResultModalItemSkeleton />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          windowSize={5}
        />
      ) : (
        <FlatList
          ref={scrollRef}
          data={faststores}
          renderItem={renderStoreItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={() => {
            if (hasMore && !loading && page < totalpage - 1) {
              setPage(prev => {
                const nextPage = prev + 1;
                fetchStores(nextPage, false, searchDto);
                return nextPage;
              });
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyComponent}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}

      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={(bottom || 16) + 24}
        onPress={scrollToTop}
      />

      {/* 바텀시트 */}
      <Modal
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        visible={bottomModalVisible}
        onRequestClose={() => setBottomModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setBottomModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.modalContent, {transform: [{translateY: slideAnim}]}]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>내 주변 술집 빠른 검색</Text>
            <Pressable onPress={() => setBottomModalVisible(false)}>
              <Ionicons name="close" size={22} color="#666" />
            </Pressable>
          </View>
          <FastSearchFilter
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            handleApply={handleApply}
            onClose={() => setBottomModalVisible(false)}
            modalVisible={bottomModalVisible}
          />
        </Animated.View>
      </Modal>

      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fdfdfd'},
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backButton: {position: 'absolute', left: 25},
  headerTitle: {
    textAlign: 'center',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 19,
    color: '#333',
  },
  listContainer: {marginTop: 1},
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 7,
    marginHorizontal: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#121212',
  },
});

export default SearchFastScreen;
