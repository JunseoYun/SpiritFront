import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ResultModalItem from '../../../components/SearchScreen/FastSearch/Modal/ResultModalItem';
import {Store_getby_condition_search} from '../../../api/storeApi';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import {useRoute} from '@react-navigation/native';
import FastSearch from '../../../components/SearchScreen/FastSearch/FastSearch';
import CategoryModal from '../../../components/SearchScreen/FastSearch/Modal/CategoryModal';
import PeopleModal from '../../../components/SearchScreen/FastSearch/Modal/PeopleModal';
import VisitTimeModal from '../../../components/SearchScreen/FastSearch/Modal/VisitTimeModal';

const SearchFastScreen = ({navigation}) => {
  const route = useRoute();
  const {fastSearchStores, fastviewDto, location} = route.params;

  const [firstSearch, setFirstSearch] = useState(fastSearchStores);
  const [firstSearchDto, setFirstSearchDto] = useState(fastviewDto);

  const [faststores, setFasttores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);

  const [isModalVisible, setModalVisible] = useState(false);
  const [peopleModalVisible, setPeopleModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPeople, setSelectedPeople] = useState('');
  const [isGroup, setGroup] = useState(false);
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedEngCategory, setSelectedEngCategory] = useState('');

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
  const onSelectPeople = (peopleOption, value) => {
    setSelectedPeople(peopleOption); // 선택된 인원 값을 상태 변수에 저장
    setGroup(value);
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

  const searchOptions = [
    {
      label: selectedCategory || firstSearchDto.selectedCategory,
      isSelected: true,
      onPress: onPressModalOpen,
    },
    {
      label: selectedPeople || firstSearchDto.selectedPeople,
      isSelected: true,
      onPress: onPressPeopleModalOpen,
    },
    {
      label: `${firstSearchDto.timeselectedHour}:${firstSearchDto.timeselectedMinute}`,
      isSelected: true,
      onPress: onPressTimeModalOpen,
    },
  ];
  console.log(firstSearch.conditionTime, 111);
  useEffect(() => {
    if (location) {
      fastgetStores(0, true, firstSearch); // 서버 통신
    }
  }, [location]);

  useEffect(() => {
    // selectedCategory, selectedPeople, selectedHour, selectedMinute가 변경될 때마다 상태 업데이트 후 서버 통신
    if (
      selectedCategory ||
      selectedPeople ||
      (selectedHour && selectedMinute)
    ) {
      let updatedSearch = {...firstSearch}; // 현재 상태를 복사
      let updatedSearchinfo = {...firstSearchDto};

      // Category 선택 시
      if (selectedCategory) {
        updatedSearch.category = selectedEngCategory;
        updatedSearchinfo.selectedPeople = selectedCategory;
      }

      // People 선택 시
      if (selectedPeople) {
        updatedSearch.isGroupAvailable = isGroup;
        updatedSearchinfo.selectedPeople = selectedPeople;
      }

      // 시간 변경 시
      if (selectedHour && selectedMinute) {
        const conditionTime = new Date(
          `2025-02-01T${selectedHour}:${selectedMinute}:00`,
        );
        updatedSearch.conditionTime = conditionTime.toISOString().slice(0, -1);
        updatedSearchinfo.timeselectedHour = selectedHour;
        updatedSearchinfo.timeselectedMinute = selectedMinute;
      }

      fastgetStores(0, true, updatedSearch); // API 호출

      // 상태 업데이트

      setFirstSearch(updatedSearch);
      setFirstSearchDto(updatedSearchinfo);
    }
  }, [selectedCategory, selectedPeople, selectedHour, selectedMinute]);

  const fastgetStores = async (currentPage, refresh = false, updatedSearch) => {
    if (location) {
      if (loading || (!hasMore && !refresh)) return;
      setLoading(true);

      try {
        const requestData = {
          page: currentPage,
          latitude: location.latitude,
          longitude: location.longitude,
          conditionSearchDto: updatedSearch,
        };

        console.log(updatedSearch, '초기값22');

        const storesData = await Store_getby_condition_search(requestData);

        setTotalpage(storesData.totalPages);

        if (storesData.content && storesData.content.length > 0) {
          setFasttores(prevStores => {
            const newStores = refresh
              ? storesData.content // 새로고침 시 초기화
              : [...prevStores, ...storesData.content]; // 추가 로드

            const uniqueStores = Array.from(
              new Map(newStores.map(store => [store.id, store])).values(),
            );
            return uniqueStores;
          });
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (!loading) {
      return <Text style={styles.emptyText}>가게가 없습니다.</Text>;
    }
    return null;
  };

  const renderStoreItem = ({item}) => {
    return (
      <ResultModalItem
        store={item}
        navigation={navigation}
        location={location}
      />
    );
  };

  return (
    <SafeAreaView style={styles.fastSearchModalContainer}>
      <View style={styles.searchModaltopview}>
        <Pressable
          style={styles.fastSearchModalcloseButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <AntDesign name="arrowleft" size={25} color={'black'} />
        </Pressable>
        {/* <Image
          source={require('../../../assets/todaylogo.png')}
          style={styles.fastSearchModaltopimage}
        /> */}
        <Text style={styles.TitleText}>한잔할까</Text>
      </View>
      <FastSearch title={''} searchOptions={searchOptions} />
      <FlatList
        data={faststores}
        renderItem={renderStoreItem}
        keyExtractor={item => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.fastSearchModalScrollView}
        onEndReached={() => {
          if (hasMore && !loading && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1; // 다음 페이지 번호
              fastgetStores(nextPage); // 그 페이지 번호로 데이터 요청
              return nextPage; // 상태를 증가된 페이지 번호로 갱신
            });
          }
        }}
        initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
        onEndReachedThreshold={0.5} // 리스트 끝에 가까워지면 데이터를 추가로 가져옵니다.
        ListFooterComponent={renderFooter} // 로딩 인디케이터
        ListEmptyComponent={renderEmptyComponent}
      />
      <CategoryModal
        isModalVisible={isModalVisible}
        onPressCategory={(text, category) => onPressCategory(text, category)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fastSearchModalContainer: {
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModaltopview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  TitleText: {
    textAlign: 'center',
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 25,
    color: '#15B3FA',
  },
  fastSearchModalcloseButton: {
    alignItems: 'center',
    position: 'absolute',
    left: 25,
  },
  fastSearchModalScrollView: {
    marginTop: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default SearchFastScreen;
