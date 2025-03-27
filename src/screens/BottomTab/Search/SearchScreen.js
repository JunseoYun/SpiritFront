import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';

import {getLocation} from '../../../storage/locationStorage';
import SearchBar from '../../../components/SearchScreen/SearchBar';
import FastSearch from '../../../components/SearchScreen/FastSearch/FastSearch';
import CategoryModal from '../../../components/SearchScreen/FastSearch/Modal/CategoryModal';
import PeopleModal from '../../../components/SearchScreen/FastSearch/Modal/PeopleModal';
import VisitTimeModal from '../../../components/SearchScreen/FastSearch/Modal/VisitTimeModal';
import NearStoreList from '../../../components/SearchScreen/NearStore/NearStoreList';
import SearchButton from '../../../components/SearchScreen/SearchButton';
import useCustomAlert from '../../../hooks/useCustomAlert';
const SearchScreen = ({navigation}) => {
  const {showAlert, AlertComponent} = useCustomAlert();

  const [location, setLocation] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [peopleModalVisible, setPeopleModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPeople, setSelectedPeople] = useState('');
  const [isGroup, setGroup] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedEngCategory, setSelectedEngCategory] = useState('');
  const [searchStoreName, setSearchStoreName] = useState('');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      const currentLocation = await getLocation(); // 캐시된 위치 가져오기
      setLocation(currentLocation);
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    if (selectedCategory && selectedPeople && selectedHour && selectedMinute) {
      onPressFastSearch();
    }
  }, [selectedCategory, selectedPeople, selectedHour, selectedMinute]);

  const onRefresh = async () => {
    setIsRefreshing(true); // 새로 고침 시작
    setRefresh(true);
    try {
      const currentLocation = await getLocation();
      if (currentLocation) {
        setLocation(currentLocation);
      }
      setSelectedMinute('');
      setSelectedHour('');
      setSelectedCategory('');
      setSelectedEngCategory('');
      setSelectedPeople('');
    } catch (error) {
      console.error('초기 로드 오류:', error);
    } finally {
      setIsRefreshing(false); // 새로 고침 종료
    }
  };

  const onPressFastSearch = async () => {
    var visitTime = `${selectedHour}:${selectedMinute}`;
    if (
      !selectedCategory ||
      !selectedPeople ||
      !selectedHour ||
      !selectedMinute
    ) {
      console.log('Data Not');
    } else {
      const conditionTime = new Date(
        `2025-02-01T${selectedHour}:${selectedMinute}:00`,
      );
      const conditionTimeString = conditionTime.toISOString().slice(0, -1);
      const conditionSearchDto = {
        category: selectedEngCategory,
        isGroupAvailable: isGroup,
        conditionTime: conditionTimeString,
      };

      const fastviewDto = {
        selectedCategory: selectedCategory,
        selectedPeople: selectedPeople,
        timeselectedHour: selectedHour,
        timeselectedMinute: selectedMinute,
      };

      navigation.navigate('SearchStack', {
        screen: 'SearchFastScreen',
        params: {
          fastSearchStores: conditionSearchDto,
          fastviewDto: fastviewDto,
          location: location,
        },
      });
      setSelectedMinute('');
      setSelectedHour('');
      setSelectedCategory('');
      setSelectedEngCategory('');
      setSelectedPeople('');
    }
  };

  const onPressSearch = () => {
    if (searchStoreName) {
      const trimmedSearchName = searchStoreName.trim();
      navigation.navigate('SearchResultScreen', {
        searchName: trimmedSearchName, // 검색어 전달
        location: location,
      });
    } else {
      showAlert({
        title: '검색어를 입력하세요.',
      });
    }
  };

  const onPressModalOpen = () => {
    setModalVisible(true);
  };
  const onPressModalClose = () => {
    setSelectedCategory('');
    setSelectedEngCategory('');
    setModalVisible(false);
  };
  const onPressCategory = (text, category) => {
    setSelectedCategory(text);
    setSelectedEngCategory(category);
    setModalVisible(false); // 모달 닫기
  };

  const onPressPeopleModalOpen = () => {
    setPeopleModalVisible(true);
  };
  const onPressPeopleModalClose = () => {
    setPeopleModalVisible(false);
  };
  const onSelectPeople = peopleOption => {
    setSelectedPeople(peopleOption); // 선택된 인원 값을 상태 변수에 저장
    if (peopleOption === '10인 이하') {
      setGroup(false);
    } else {
      setGroup(true);
    }
    setPeopleModalVisible(false); // 모달 닫기
  };

  const postbutton = () => {
    setTimeModalVisible(false);
  };

  const onPressTimeModalOpen = () => {
    setTimeModalVisible(true);
  };
  const onPressTimeModalClose = () => {
    setTimeModalVisible(false);
  };
  const changeHour = text => {
    setSelectedHour(text);
  };
  const changeMinute = text => {
    setSelectedMinute(text);
  };
  const searchOptions = [
    {
      label: selectedCategory || '카테고리',
      isSelected: !!selectedCategory,
      onPress: onPressModalOpen,
    },
    {
      label: selectedPeople || '인원',
      isSelected: !!selectedPeople,
      onPress: onPressPeopleModalOpen,
    },
    {
      label:
        selectedHour || selectedMinute
          ? `${selectedHour}:${selectedMinute}`
          : '방문 예정 시간',
      isSelected: !!(selectedHour || selectedMinute),
      onPress: onPressTimeModalOpen,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
              searchOptions={searchOptions}
            />
            <CategoryModal
              isModalVisible={isModalVisible}
              onPressCategory={(text, category) =>
                onPressCategory(text, category)
              }
              onPressModalClose={() => onPressModalClose()}
            />
            <PeopleModal
              visible={peopleModalVisible}
              selectedPeople={selectedPeople}
              onSelectPeople={onSelectPeople}
              onPressClose={onPressPeopleModalClose}
            />
            <VisitTimeModal
              visible={timeModalVisible}
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              onHourChange={changeHour}
              onMinuteChange={changeMinute}
              onPressClose={onPressTimeModalClose}
              postbutton={postbutton}
            />
            <NearStoreList
              navigation={navigation}
              location={location}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* 하단에 고정된 검색 버튼 */}
      <SearchButton onPress={onPressSearch} title="검색" />

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1, // 화면 전체를 차지하도록 설정
  },
  scrollViewContent: {
    paddingBottom: 100, // 버튼 영역이 가려지지 않도록 여유 공간 추가
  },
});

export default SearchScreen;
