import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Alert,
  Dimensions,
  View,
} from 'react-native';
import StoreSearchBar from '../../components/StoreSearch/StoreSearchBar';
import StoreResultList from '../../components/StoreSearch/StoreResultList';
import {useRoute} from '@react-navigation/native';
const {width} = Dimensions.get('window');

const StoreSearchScreen = ({navigation}) => {
  const route = useRoute();
  const {index} = route.params;
  const [searchStoreName, setSearchStoreName] = useState('');
  const [trimmedSearchWord, setTrimmedSearchWord] = useState('');

  // 검색 핸들러: 입력된 검색어가 있다면 공백 제거 후 결과 리스트에 전달
  const handleSearch = () => {
    const trimmed = searchStoreName.trim();
    if (trimmed === '') {
      Alert.alert('검색어를 입력해주세요.');
      setTrimmedSearchWord('');
    } else {
      setTrimmedSearchWord(trimmed);
    }
  };

  const handleStoreAdd = () => {
    navigation.navigate('StoreAddScreen');
  };

  // 헤더 오른쪽에 검색 버튼 추가
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSearch}>
          <Text style={styles.searchButton}>검색</Text>
        </Pressable>
      ),
    });
  }, [navigation, searchStoreName]);

  return (
    <SafeAreaView style={styles.container}>
      <StoreSearchBar
        value={searchStoreName}
        onChangeText={setSearchStoreName}
        placeholder="매장 이름을 입력해주세요."
        onPress={handleSearch}
      />
      <Text style={styles.infoText}>
        {index === 0
          ? '매장 등록 전 한잔할까에 등록된 매장인지 확인해보세요!'
          : '권한 신청 전 한잔할까에 등록된 매장인지 확인해보세요!'}
      </Text>

      {/* 검색어가 있을 때 결과 리스트 렌더링 */}
      {trimmedSearchWord !== '' && (
        <StoreResultList
          trimmedSearchWord={trimmedSearchWord}
          navigation={navigation}
          index={index}
        />
      )}
      {trimmedSearchWord !== '' ? (
        <View style={styles.storeAddTextview}>
          <Pressable
            style={styles.storeAddButtonsearch}
            onPress={handleStoreAdd}>
            <Text style={styles.storeAddText}>매장 등록</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.storeAddTextview1}>
          <Pressable style={styles.storeAddButton} onPress={handleStoreAdd}>
            <Text style={styles.storeAddText}>매장 등록</Text>
          </Pressable>
        </View>
      )}
      {/* <View style={styles.storeAddTextview}>
        <Pressable
          style={[
            trimmedSearchWord == '' && styles.storeAddButton,
            trimmedSearchWord !== '' && styles.storeAddButtonsearch,
          ]}
          onPress={handleStoreAdd}>
          <Text style={styles.storeAddText}>매장 등록</Text>
        </Pressable>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  searchButton: {
    marginRight: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#16BBFF',
  },
  infoText: {
    marginHorizontal: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginVertical: 5,
  },
  storeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  storeAddTextview1: {
    width: '100%',
    paddingHorizontal: 18,
    position: 'absolute',
    bottom: 10,
  },
  storeAddButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16BBFF',
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16BBFF',
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storeAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StoreSearchScreen;
