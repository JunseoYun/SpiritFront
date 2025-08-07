import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  BackHandler,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getLocation} from '../../../storage/locationStorage';
import SearchBar from '../../../components/SearchScreen/SearchBar';
import FastSearch from '../../../components/SearchScreen/FastSearch/FastSearch';
import FastSearchFilter from '../../../components/SearchScreen/FastSearch/FastSearchFilter';
import SearchButton from '../../../components/SearchScreen/SearchButton';
import RecentStoreList from '../../../components/SearchScreen/RecentStore/RecentStoreList';
import {useToast} from '../../../context/ToastContext';
import Loading from '../../../hooks/Loading';
import MyBanner from '../../../components/Ads/MyBanner';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const SearchScreen = ({navigation}) => {
  const {showToast} = useToast();
  const [location, setLocation] = useState(null);
  const [searchStoreName, setSearchStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bottomModalVisible, setBottomModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    카테고리: '',
    인원: '',
    '방문 시간': '',
    주종: '',
  });

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

  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      try {
        const currentLocation = await getLocation(); // 캐시된 위치 가져오기
        setLocation(currentLocation);
      } catch (er) {
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      const currentLocation = await getLocation();
      if (currentLocation) {
        setLocation(currentLocation);
      }
      setSelectedFilters({
        카테고리: '',
        인원: '',
        '방문 시간': '',
        주종: '',
      });
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('초기 로드 오류:', error);
    } finally {
      setIsRefreshing(false); // 새로 고침 종료
    }
  };

  const onPressFastSearch = () => {
    const {카테고리, 인원, '방문 시간': 방문시간, 주종} = selectedFilters;

    // 아무것도 선택 안했으면 그냥 return
    if (!카테고리 && !인원 && !방문시간 && !주종) {
      showToast('하나 이상의 조건을 선택해주세요.', 'center');
      return;
    }

    // 검색 DTO 구성
    const conditionSearchDto = {};
    const fastviewDto = {
      selectedCategory: '',
      selectedPeople: '',
      timeselectedHour: '',
      timeselectedMinute: '',
      selectedAlcohol: '',
    };

    // 카테고리
    if (카테고리) {
      conditionSearchDto.category = 카테고리;
      fastviewDto.selectedCategory = 카테고리;
    }

    // 인원
    if (인원) {
      // "10인 이하" -> false, "10인 이상" -> true
      const isGroup = 인원 === '10인 이상';
      conditionSearchDto.isGroupAvailable = isGroup;
      fastviewDto.selectedPeople = 인원;
    }

    // 방문 시간
    if (방문시간) {
      // 방문시간은 "HH:mm" 형식이라고 가정
      const [hour, minute] = 방문시간.split(':').map(v => parseInt(v, 10));
      const now = new Date();
      now.setHours(hour, minute, 0, 0);
      // 타임존 보정 (서버 사양에 따라 필요 시)
      now.setHours(now.getHours() + 9);
      conditionSearchDto.conditionTime = now.toISOString().slice(0, -1);

      fastviewDto.timeselectedHour = hour.toString().padStart(2, '0');
      fastviewDto.timeselectedMinute = minute.toString().padStart(2, '0');
    }

    // 주종
    if (주종) {
      conditionSearchDto.alcoholType = 주종;
      fastviewDto.selectedAlcohol = 주종;
    }

    // ✅ 검색 화면으로 이동
    navigation.navigate('SearchStack', {
      screen: 'SearchFastScreen',
      params: {
        fastSearchStores: conditionSearchDto,
        fastviewDto: fastviewDto,
        location: location,
      },
    });

    // 선택 초기화 & 모달 닫기
    setSelectedFilters({
      카테고리: '',
      인원: '',
      '방문 시간': '',
      주종: '',
    });
    setBottomModalVisible(false);
  };

  const onPressSearch = () => {
    if (searchStoreName) {
      const trimmedSearchName = searchStoreName.trim();
      navigation.navigate('SearchResultScreen', {
        searchName: trimmedSearchName, // 검색어 전달
        location: location,
      });
    } else {
      showToast('검색어를 입력하세요.', 'center');
    }
  };

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // 초기값: 화면 아래

  useEffect(() => {
    if (bottomModalVisible) {
      // 열릴 때 슬라이드 업
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      // 닫힐 때 슬라이드 다운
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [bottomModalVisible]);

  const handleApply = () => {
    console.log('선택된 필터:', selectedFilters);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loading loading={isRefreshing || loading} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }>
          <SearchBar
            value={searchStoreName}
            onChangeText={setSearchStoreName}
            placeholder="술집 이름을 입력해주세요."
            onPress={onPressSearch}
          />
          {/* 스크롤 가능한 영역 */}
          <View style={styles.scrollViewContent}>
            <FastSearch
              title="내 주변 술집 빠른 검색"
              selectedFilters={selectedFilters}
              handleBottomOpen={() => setBottomModalVisible(true)}
            />
            <RecentStoreList
              refresh={isRefreshing}
              setRefresh={setIsRefreshing}
              loading={loading}
              setLoading={setLoading}
              navigation={navigation}
              location={location}
            />
            <MyBanner />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      {/* 하단에 고정된 검색 버튼 */}
      <SearchButton onPress={onPressSearch} title="검색" />

      <Modal
        animationType="fade"
        transparent={true}
        visible={bottomModalVisible}
        onRequestClose={() => setBottomModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setBottomModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        {/* Animated.View로 감싸기 */}
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>내 주변 술집 빠른 검색</Text>
            <TouchableOpacity onPress={() => setBottomModalVisible(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          <FastSearchFilter
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            onClose={() => setBottomModalVisible(false)}
            handleApply={onPressFastSearch}
          />
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1, // 화면 전체를 차지하도록 설정
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  openButton: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: '#45C9FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: SCREEN_HEIGHT * 0.85, // 화면 높이의 85%
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeText: {
    fontSize: 28,
    color: '#666',
  },
});

export default SearchScreen;
