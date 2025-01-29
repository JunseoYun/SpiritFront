import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Pressable,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import {getStore} from '../../../api/storeApi';
import {getLocation} from '../../../storage/locationStorage';
import SearchBar from '../../../components/SearchScreen/SearchBar';
import FastSearch from '../../../components/SearchScreen/FastSearch/FastSearch';
import CategoryModal from '../../../components/SearchScreen/FastSearch/Modal/CategoryModal';
import PeopleModal from '../../../components/SearchScreen/FastSearch/Modal/PeopleModal';
import VisitTimeModal from '../../../components/SearchScreen/FastSearch/Modal/VisitTimeModal';
import NearStoreList from '../../../components/SearchScreen/NearStore/NearStoreList';
import ResultModal from '../../../components/SearchScreen/FastSearch/Modal/ResultModal';
import SearchButton from '../../../components/SearchScreen/SearchButton';

const SearchScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [peopleModalVisible, setPeopleModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [fastSearchModalVisible, setFastSearchModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPeople, setSelectedPeople] = useState('');
  const [isGroup, setGroup] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedEngCategory, setSelectedEngCategory] = useState('');
  const [searchStoreName, setSearchStoreName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stores, setStores] = useState([]);
  const [fastSearchStores, setfastSearchStores] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      const currentLocation = await getLocation(); // 캐시된 위치 가져오기
      setLocation(currentLocation);
    };
    console.log(location);
    fetchLocation();
  }, []);

  // useEffect(() => {
  //   if (location) {
  //     // 위치가 업데이트되면 매장 정보를 가져옵니다.
  //     getStoreData();
  //   } else {
  //     console.log('getStoreData fail');
  //   }
  // }, [location]);

  // //getByDistanceStore로 변경해야됨
  // const getStoreData = async () => {
  //   if (!location) return;
  //   try {
  //     const storesData = await getStore();
  //     setStores(storesData);
  //   } catch (error) {
  //     console.error('데이터를 가져오는 중 오류 발생:', error);
  //     setError(error);
  //   }
  // };

  useEffect(() => {
    if (selectedCategory && selectedPeople && selectedHour && selectedMinute) {
      onPressFastSearch();
    }
  }, [selectedCategory, selectedPeople, selectedHour, selectedMinute]);
  //빠른 검색 엔진

  const isVisitTimeInRange = (store, visitTime) => {
    // 오픈 시간과 클로즈 시간을 Date 객체로 변환
    const openTime = new Date(`2000-01-01T${store.openHour}`);
    const closeTime = new Date(`2000-01-01T${store.closeHour}`);
    let visitDateTime = new Date(`2000-01-01T${visitTime}`);

    // 클로즈 시간이 자정을 넘어서면 다음 날로 간주
    if (closeTime <= openTime) {
      closeTime.setDate(closeTime.getDate() + 1);
      if (visitDateTime < openTime) {
        visitDateTime.setDate(visitDateTime.getDate() + 1);
      }
    }

    return visitDateTime >= openTime && visitDateTime <= closeTime;
  };

  {
    /* 빠른 검색 검색 API 개선 필요, 현재 버전: 가까운 주점 전부 필터링 */
  }
  const onPressFastSearch = () => {
    var visitTime = `${selectedHour}:${selectedMinute}`;
    if (
      !selectedCategory ||
      !selectedPeople ||
      !selectedHour ||
      !selectedMinute
    ) {
      console.log('Data Not');
    } else {
      const filteredStores = stores.filter(store => {
        return (
          store.categories.includes(selectedEngCategory) &&
          (isGroup ? store.isGroupAvailable === true : true) &&
          isVisitTimeInRange(store, visitTime)
        );
      });
      setfastSearchStores(filteredStores);
      setFastSearchModalVisible(true);
    }
  };

  {
    /* 검색 API 개선 필요, 현재 버전: 가까운 주점 전부 필터링 */
  }
  const onPressSearch = () => {
    if (searchStoreName) {
      const trimmedSearchName = searchStoreName.trim();
      console.log(trimmedSearchName);
      console.log(location);
      navigation.navigate('SearchResultScreen', {
        searchName: trimmedSearchName, // 검색어 전달
        location: location,
      });
    } else {
      alert('검색어를 입력하세요.');
    }
  };

  const onPressModalOpen = () => {
    setModalVisible(true);
  };
  const onPressModalClose = () => {
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
    if (peopleOption === '8인 이하') {
      setGroup(false);
    } else {
      setGroup(true);
    }
    setPeopleModalVisible(false); // 모달 닫기
  };

  const onPressTimeModalOpen = () => {
    setTimeModalVisible(true);
  };
  const onPressTimeModalClose = () => {
    setTimeModalVisible(false);
  };
  const changeHour = text => {
    setSelectedHour(text);
    if (text && selectedMinute) {
      onPressTimeModalClose();
    }
  };
  const changeMinute = text => {
    setSelectedMinute(text);
    if (text && selectedHour) {
      onPressTimeModalClose();
    }
  };

  const onPressFastSearchModalClose = () => {
    setFastSearchModalVisible(false);
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

  // const storeNames = [
  //   '가게 이름1',
  //   '가게 이름2',
  //   '가게 이름3',
  //   '가게 이름4',
  //   '가게 이름5',
  //   '가게 이름6',
  //   '가게 이름7',
  //   '가게 이름8',
  //   '가게 이름9',
  //   '가게 이름10',
  // ];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <SearchBar
            value={searchStoreName}
            onChangeText={setSearchStoreName}
            placeholder="주점 이름을 입력해주세요."
          />
          {/* 스크롤 가능한 영역 */}
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <FastSearch
              title="내 주변 빠른 검색"
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
            />
            <NearStoreList stores={stores} navigation={navigation} />

            {/* <BestStoreList storeNames={storeNames} /> */}

            <ResultModal
              visible={fastSearchModalVisible}
              onClose={onPressFastSearchModalClose}
              selectedCategory={selectedCategory}
              selectedPeople={selectedPeople}
              selectedHour={selectedHour}
              selectedMinute={selectedMinute}
              fastSearchStores={fastSearchStores}
              navigation={navigation}
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* 하단에 고정된 검색 버튼 */}
      <SearchButton onPress={onPressSearch} title="검색" />
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
